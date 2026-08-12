import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseClient } from '@/storage/database/supabase-client';

// DELETE /api/records/[id] - 删除单条记录
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const client = getSupabaseClient();
    
    // 兼容不同版本的 Next.js 和 Netlify
    const params = await Promise.resolve(context.params);
    
    // 尝试多种方式获取 ID
    let idStr: string | undefined;
    
    if (typeof params === 'string') {
      idStr = params;
    } else if (params && typeof params === 'object') {
      if ('id' in params) {
        const idVal = (params as Record<string, unknown>).id;
        idStr = typeof idVal === 'string' ? idVal : String(idVal);
      }
    }
    
    if (!idStr) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/');
      idStr = parts[parts.length - 1];
    }
    
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: '无效的 ID' }, { status: 400 });
    }

    const { error } = await client
      .from('deceased_records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('删除失败:', error);
      return NextResponse.json({ error: `删除失败: ${error.message}` }, { status: 500 });
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
    const client = getSupabaseClient();
    
    // 兼容不同版本的 Next.js 和 Netlify
    const params = await Promise.resolve(context.params);
    
    // 尝试多种方式获取 ID
    let idStr: string | undefined;
    
    if (typeof params === 'string') {
      idStr = params;
    } else if (params && typeof params === 'object') {
      if ('id' in params) {
        const idVal = (params as Record<string, unknown>).id;
        idStr = typeof idVal === 'string' ? idVal : String(idVal);
      }
    }
    
    // 如果还是获取不到，尝试从 URL 中提取
    if (!idStr) {
      const url = new URL(request.url);
      const parts = url.pathname.split('/');
      idStr = parts[parts.length - 1];
    }
    
    console.log('PUT 请求 - URL:', request.url, 'params:', JSON.stringify(params), 'idStr:', idStr);
    
    if (!idStr) {
      return NextResponse.json({ error: '无效的 ID：参数缺失' }, { status: 400 });
    }
    
    const id = parseInt(idStr, 10);
    if (isNaN(id)) {
      return NextResponse.json({ error: `无效的 ID：解析失败 (idStr="${idStr}")` }, { status: 400 });
    }

    const body = await request.json();
    const { name, category, death_date } = body;

    if (!name || !category || !death_date) {
      return NextResponse.json({ error: '缺少必要字段' }, { status: 400 });
    }

    const { data, error } = await client
      .from('deceased_records')
      .update({ name, category, death_date })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('更新失败:', error);
      return NextResponse.json({ error: `更新失败: ${error.message}` }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('服务器错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
