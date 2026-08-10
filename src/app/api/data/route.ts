import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import type { SiteData } from '@/lib/data-store';

const DATA_FILE = path.join(process.cwd(), 'public', 'data', 'names.json');

export async function GET() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      return NextResponse.json({
        updatedAt: null,
        deceased: [],
        infants: [],
        animals: [],
      });
    }

    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const data: SiteData = JSON.parse(raw);

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: '数据读取失败' },
      { status: 500 }
    );
  }
}
