import { NextRequest, NextResponse } from 'next/server';
import { parseCSV } from '@/lib/data-store';
import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'names.json');

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json(
        { error: '请上传CSV文件' },
        { status: 400 }
      );
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { error: '仅支持CSV格式文件' },
        { status: 400 }
      );
    }

    const text = await file.text();
    const data = parseCSV(text);

    // Ensure directory exists
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Write JSON data file
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');

    return NextResponse.json({
      success: true,
      message: '数据上传成功',
      stats: {
        deceased: data.deceased.length,
        infants: data.infants.length,
        animals: data.animals.length,
        updatedAt: data.updatedAt,
      },
    });
  } catch {
    return NextResponse.json(
      { error: '文件解析失败，请检查CSV格式' },
      { status: 500 }
    );
  }
}
