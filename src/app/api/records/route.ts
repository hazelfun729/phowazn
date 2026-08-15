import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function GET(request: Request) {
  try {
    const client = getSupabaseClient();

    // 统一使用北京时间（UTC+8）
    const getBeijingDate = () => {
      const now = new Date();
      const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
      return {
        today: beijingTime.toISOString().split('T')[0],
        cutoff: (() => {
          const d = new Date(beijingTime);
          d.setDate(d.getDate() - 49);
          return d.toISOString().split('T')[0];
        })(),
      };
    };

    // 优先使用前端传入的日期（用户本地时间），否则使用北京时间
    const { searchParams } = new URL(request.url);
    const todayStr = searchParams.get('today');
    const fortyNineDaysAgoStr = searchParams.get('fortyNineDaysAgo');

    let cutoffDateStr: string;
    if (todayStr && fortyNineDaysAgoStr) {
      cutoffDateStr = fortyNineDaysAgoStr;
    } else {
      cutoffDateStr = getBeijingDate().cutoff;
    }

    // 查询49天内的数据
    const { data, error } = await client
      .from('deceased_records')
      .select('id, name, category, death_date, created_at')
      .gte('death_date', cutoffDateStr)
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

    // 使用北京时间（UTC+8）
    const now = new Date();
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const updatedAt = beijingTime.toISOString().replace('T', ' ').substring(0, 16);

    return NextResponse.json({
      updatedAt,
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
