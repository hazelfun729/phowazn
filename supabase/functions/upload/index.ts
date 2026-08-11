import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CSVRecord {
  name: string;
  category: string;
  death_date: string;
}

function cleanName(name: string): string {
  if (!name) return '';
  let cleaned = name;
  cleaned = cleaned.replace(/亡者/g, '').replace(/姓名/g, '').replace(/旁生/g, '');
  cleaned = cleaned.replace(/[：:、,，\-—+.。]/g, '');
  cleaned = cleaned.replace(/父母之一/g, '').replace(/父母/g, '');
  return cleaned.trim();
}

function parseCSV(text: string): CSVRecord[] {
  const lines = text.split('\n');
  const records: CSVRecord[] = [];
  const seen = new Set<string>();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const columns = line.split(',');
    if (columns.length < 9) continue;

    const deathDate = columns[4]?.trim();
    const categoryRaw = columns[5]?.trim();
    const deceasedName = columns[6]?.trim();
    const infantName = columns[7]?.trim();
    const animalName = columns[8]?.trim();

    let category: string | null = null;
    let name: string | null = null;

    if (categoryRaw?.includes('A.亡者') && deceasedName) {
      category = 'deceased';
      name = cleanName(deceasedName);
    } else if (categoryRaw?.includes('B.堕胎婴灵') && infantName) {
      category = 'infants';
      name = cleanName(infantName);
    } else if (categoryRaw?.includes('C.旁生') && animalName) {
      category = 'animals';
      name = cleanName(animalName);
    }

    if (!category || !name) continue;

    const dedupKey = `${category}:${name}`;
    if (seen.has(dedupKey)) continue;
    seen.add(dedupKey);

    records.push({ name, category, death_date: deathDate });
  }

  return records;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file || !file.name.endsWith('.csv')) {
      return new Response(
        JSON.stringify({ error: '仅支持 CSV 格式文件' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const csvText = await file.text();
    const records = parseCSV(csvText);

    let inserted = 0;
    for (const record of records) {
      const { error } = await supabase
        .from('deceased_records')
        .insert({
          name: record.name,
          category: record.category,
          death_date: record.death_date,
        });

      if (!error) inserted++;
    }

    const now = new Date().toISOString();

    return new Response(
      JSON.stringify({
        success: true,
        message: `数据上传成功`,
        stats: {
          deceased: records.filter(r => r.category === 'deceased').length,
          infants: records.filter(r => r.category === 'infants').length,
          animals: records.filter(r => r.category === 'animals').length,
          updatedAt: now,
        },
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: '文件解析失败，请检查 CSV 格式' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
