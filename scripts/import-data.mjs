import Papa from 'papaparse';
import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const SUPABASE_URL = 'https://ekgbhbvbnxgqtnhjhqag.supabase.co';
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVrZ2JoYnZibnhncXRuaGpocWFnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjM5ODQ5NCwiZXhwIjoyMTAxOTc0NDk0fQ.-fTb0U0d8EMW_vu680licmOUjh0CFswMZ2HJjfIYfXI';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

function cleanName(name, category) {
  if (!name) return '';
  let cleaned = name.trim();
  cleaned = cleaned.replace(/[，。、；：！？""''【】《》\s]+/g, '');
  cleaned = cleaned.replace(/亡者/g, '');
  cleaned = cleaned.replace(/姓名/g, '');
  if (category !== 'infants') {
    cleaned = cleaned.replace(/旁生/g, '');
  }
  return cleaned;
}

function mapCategory(categoryStr) {
  if (!categoryStr) return null;
  const str = categoryStr.toString();
  if (str.includes('A.亡者')) return 'deceased';
  if (str.includes('B.堕胎婴灵')) return 'infants';
  if (str.includes('C.旁生')) return 'animals';
  return null;
}

async function importData() {
  let csvContent = fs.readFileSync('/workspace/projects/assets/25732762_202608110946304651.csv', 'utf-8');
  csvContent = csvContent.replace(/^\uFEFF/, '');
  
  const result = Papa.parse(csvContent, {
    header: true,
    skipEmptyLines: true
  });

  const records = [];
  const seen = new Set();

  for (const row of result.data) {
    const deathDate = row['1.往生日期'];
    const categoryStr = row['2.49日内回向名单'];
    const deceasedName = row['3.亡者姓名'];
    const infantName = row['4.堕胎婴灵姓名（若无名字，填写：父母之一姓名+"堕胎婴灵"）'];
    const animalName = row['5.旁生姓名（请填写具体昵称，勿填写如虫、鸟、猫、狗等泛称。）'];

    if (!deathDate || !categoryStr) continue;

    const category = mapCategory(categoryStr);
    if (!category) continue;

    let name = '';
    if (category === 'deceased') name = deceasedName;
    else if (category === 'infants') name = infantName;
    else if (category === 'animals') name = animalName;

    const cleanedName = cleanName(name, category);
    if (!cleanedName) continue;

    const key = `${category}-${cleanedName}`;
    if (seen.has(key)) continue;
    seen.add(key);

    records.push({
      death_date: deathDate,
      category: category,
      name: cleanedName
    });
  }

  console.log(`准备导入 ${records.length} 条记录`);

  const { data, error } = await supabase
    .from('deceased_records')
    .insert(records)
    .select();

  if (error) {
    console.error('导入失败:', error);
    return;
  }

  console.log(`成功导入 ${data.length} 条记录`);
}

importData();
