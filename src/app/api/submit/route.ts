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

    // 验证日期不能是未来（使用本地时区比较）
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // 将日期字符串解析为本地时间（避免时区问题）
    const [year, month, day] = death_date.split('-').map(Number);
    const deathDate = new Date(year, month - 1, day);
    if (deathDate > today) {
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
      return NextResponse.json(
        { error: '该姓名已存在，请勿重复填写' },
        { status: 409 }
      );
    }

    // 插入数据
    const { data, error } = await client
      .from('deceased_records')
      .insert({
        name,
        category,
        death_date,
        fill_date: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      throw new Error(`插入失败: ${error.message}`);
    }

    // 记录上传日志
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
