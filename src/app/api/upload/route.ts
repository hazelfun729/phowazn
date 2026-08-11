import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/data-store';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '请上传 CSV 文件' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: '仅支持 CSV 格式文件' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const data = parseCSV(text);

    // 初始化 Supabase 客户端
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 准备插入数据（去重：同一分类 + 同一姓名跳过）
    const records: Array<{ name: string; category: string; death_date: string }> = [];
    const seen = new Set<string>();

    for (const item of data.deceased) {
      const key = `deceased:${item.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        records.push({ name: item.name, category: 'deceased', death_date: item.date });
      }
    }
    for (const item of data.infants) {
      const key = `infants:${item.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        records.push({ name: item.name, category: 'infants', death_date: item.date });
      }
    }
    for (const item of data.animals) {
      const key = `animals:${item.name}`;
      if (!seen.has(key)) {
        seen.add(key);
        records.push({ name: item.name, category: 'animals', death_date: item.date });
      }
    }

    // 获取现有数据
    const { data: existing } = await supabase
      .from('deceased_records')
      .select('name, category');

    const existingKeys = new Set(
      (existing || []).map((r: any) => `${r.category}:${r.name}`)
    );

    // 过滤掉已存在的
    const newRecords = records.filter(
      (r) => !existingKeys.has(`${r.category}:${r.name}`)
    );

    let insertedCount = 0;
    if (newRecords.length > 0) {
      const { data: inserted, error } = await supabase
        .from('deceased_records')
        .insert(newRecords)
        .select();

      if (error) {
        console.error('插入失败:', error);
        return NextResponse.json(
          { error: '插入数据失败' },
          { status: 500 }
        );
      }

      insertedCount = inserted?.length || 0;
    }

    return NextResponse.json({
      success: true,
      message: insertedCount > 0 ? '数据上传成功' : '所有数据已存在，无需插入',
      stats: {
        total: records.length,
        inserted: insertedCount,
        skipped: records.length - insertedCount,
        deceased: data.deceased.length,
        infants: data.infants.length,
        animals: data.animals.length,
      },
    });
  } catch (err) {
    console.error('上传错误:', err);
    return NextResponse.json(
      { error: '文件解析失败，请检查 CSV 格式' },
      { status: 500 }
    );
  }
}
