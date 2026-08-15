import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

interface SubmitRequest {
  name: string;
  category: 'deceased' | 'infants' | 'animals';
  death_date: string;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, category, death_date } = body as SubmitRequest;

    // 获取客户端信息
    const ipAddress = request.headers.get('x-forwarded-for') || 
                      request.headers.get('x-real-ip') || 
                      'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';

    // 验证必填字段
    if (!name || !category || !death_date) {
      return NextResponse.json(
        { error: '缺少必填字段' },
        { status: 400 }
      );
    }

    // 验证分类
    if (!['deceased', 'infants', 'animals'].includes(category)) {
      return NextResponse.json(
        { error: '无效的分类' },
        { status: 400 }
      );
    }

    // 验证日期不能是未来（统一使用北京时间 UTC+8）
    const now = new Date();
    const beijingTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
    const todayStr = beijingTime.toISOString().split('T')[0];
    if (death_date > todayStr) {
      return NextResponse.json(
        { error: '往生日期不能是未来时间' },
        { status: 400 }
      );
    }

    // 验证姓名长度
    if (name.length > 12) {
      return NextResponse.json(
        { error: '姓名不能超过12个字' },
        { status: 400 }
      );
    }

    const client = getSupabaseClient();

    // 检查是否已存在（同一分类 + 同一姓名 + 同一往生日期）
    // 如果已存在，直接返回成功，不提示用户（后台智能提取时去重）
    const { data: existing, error: checkError } = await client
      .from('deceased_records')
      .select('id')
      .eq('name', name)
      .eq('category', category)
      .eq('death_date', death_date)
      .limit(1);

    if (checkError) {
      throw new Error(`查询失败: ${checkError.message}`);
    }

    if (existing && existing.length > 0) {
      // 已存在，记录上传日志（标记为重复）
      await client.from('upload_logs').insert({
        ip_address: ipAddress,
        user_agent: userAgent,
        file_name: `表单提交: ${name} (重复)`,
        record_count: 0,
        source: 'form',
      });

      // 直接返回成功，不提示重复
      return NextResponse.json({
        success: true,
        message: '提交成功',
        duplicate: true,
      });
    }

    // 插入数据
    const { data, error } = await client
      .from('deceased_records')
      .insert({
        name,
        category,
        death_date,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`插入失败: ${error.message}`);
    }

    // 记录上传日志（新提交）
    await client.from('upload_logs').insert({
      ip_address: ipAddress,
      user_agent: userAgent,
      file_name: `表单提交: ${name}`,
      record_count: 1,
      source: 'form',
    });

    return NextResponse.json({
      success: true,
      message: '提交成功',
      data,
    });
  } catch (error) {
    console.error('提交失败:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '提交失败' },
      { status: 500 }
    );
  }
}
