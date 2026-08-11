import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET() {
  try {
    const client = getSupabaseClient();

    // 计算49天前的日期
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const fortyNineDaysAgo = new Date(today);
    fortyNineDaysAgo.setDate(fortyNineDaysAgo.getDate() - 49);
    const fortyNineDaysAgoStr = fortyNineDaysAgo.toISOString().split('T')[0];

    // 计算90天前的日期（用于清理）
    const ninetyDaysAgo = new Date(today);
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    // 查询49天内的数据
    const { data, error } = await client
      .from('deceased_records')
      .select('id, name, category, death_date, created_at')
      .gte('death_date', fortyNineDaysAgoStr)
      .order('death_date', { ascending: false });

    if (error) {
      throw new Error(`查询失败: ${error.message}`);
    }

    // 按分类分组
    const deceased = (data || [])
      .filter(r => r.category === 'deceased')
      .map(r => ({ name: r.name, date: r.death_date }));

    const infants = (data || [])
      .filter(r => r.category === 'infants')
      .map(r => ({ name: r.name, date: r.death_date }));

    const animals = (data || [])
      .filter(r => r.category === 'animals')
      .map(r => ({ name: r.name, date: r.death_date }));

    return NextResponse.json({
      updatedAt: new Date().toISOString(),
      deceased,
      infants,
      animals,
    });
  } catch (error) {
    console.error('查询失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '查询失败' },
      { status: 500 }
    );
  }
}
