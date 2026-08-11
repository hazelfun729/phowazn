import { NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

export async function POST() {
  try {
    const client = getSupabaseClient();

    // 计算90天前的日期
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0];

    // 删除90天前的数据
    const { data, error } = await client
      .from('deceased_records')
      .delete()
      .lt('created_at', ninetyDaysAgoStr)
      .select('id');

    if (error) {
      throw new Error(`删除失败: ${error.message}`);
    }

    return NextResponse.json({
      success: true,
      message: `清理完成，删除了 ${data?.length || 0} 条记录`,
      deletedCount: data?.length || 0,
    });
  } catch (error) {
    console.error('清理失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '清理失败' },
      { status: 500 }
    );
  }
}
