import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置环境变量 COZE_SUPABASE_URL 和 COZE_SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// DELETE /api/records/[id] - 删除单条记录
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: idStr } = await context.params;
    const id = parseInt(idStr);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
    }

    const { error } = await supabase
      .from('deceased_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除失败:', error);
      return NextResponse.json({ error: '删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '删除成功' });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PUT /api/records/[id] - 修改单条记录
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // 兼容不同版本的 Next.js
    const params = await Promise.resolve(context.params);
    const idStr = params.id;
    
    if (!idStr) {
      console.error('ID 参数缺失, context.params:', context.params);
      return NextResponse.json({ error: '无效的 ID：参数缺失' }, { status: 400 });
    }
    
    const id = parseInt(idStr);
    if (isNaN(id)) {
      console.error('ID 解析失败, idStr:', idStr);
      return NextResponse.json({ error: '无效的 ID：解析失败' }, { status: 400 });
    }

    const body = await request.json();
    const { name, category, death_date } = body;

    if (!name || !category || !death_date) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('deceased_records')
      .update({ name, category, death_date })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新失败:', error);
      return NextResponse.json({ error: '更新失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
