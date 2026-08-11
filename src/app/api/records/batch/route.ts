import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.COZE_SUPABASE_URL || '';
const supabaseKey = process.env.COZE_SUPABASE_SERVICE_ROLE_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('请设置环境变量 COZE_SUPABASE_URL 和 COZE_SUPABASE_SERVICE_ROLE_KEY');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// DELETE /api/records/batch - 批量删除
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请提供要删除的 ID 列表' }, { status: 400 });
    }

    const { error } = await supabase
      .from('deceased_records')
      .delete()
      .in('id', ids);

    if (error) {
      console.error('批量删除失败:', error);
      return NextResponse.json({ error: '批量删除失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `成功删除 ${ids.length} 条记录` });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}

// PUT /api/records/batch - 批量修改分类
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { ids, category } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: '请提供要修改的 ID 列表' }, { status: 400 });
    }

    if (!category) {
      return NextResponse.json({ error: '请提供目标分类' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('deceased_records')
      .update({ category })
      .in('id', ids)
      .select();

    if (error) {
      console.error('批量修改失败:', error);
      return NextResponse.json({ error: '批量修改失败' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `成功修改 ${ids.length} 条记录`, data });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
