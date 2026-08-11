// Supabase Edge Function: submit
// 处理表单提交，将数据写入数据库

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.95.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // 处理 CORS 预检请求
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const body = await req.json()
    const { name, category, death_date } = body

    // 验证必填字段
    if (!name || !category || !death_date) {
      return new Response(
        JSON.stringify({ error: '缺少必填字段' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 验证分类
    const validCategories = ['deceased', 'infants', 'animals']
    if (!validCategories.includes(category)) {
      return new Response(
        JSON.stringify({ error: '无效的分类' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 验证日期格式
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/
    if (!dateRegex.test(death_date)) {
      return new Response(
        JSON.stringify({ error: '日期格式错误，应为 YYYY-MM-DD' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 验证日期不能是未来时间
    const deathDate = new Date(death_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (deathDate > today) {
      return new Response(
        JSON.stringify({ error: '往生日期不能是未来时间' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 创建 Supabase 客户端
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 检查是否已存在（去重）
    const { data: existing } = await supabase
      .from('deceased_records')
      .select('id')
      .eq('name', name)
      .eq('category', category)
      .eq('death_date', death_date)
      .single()

    if (existing) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: '该记录已存在，无需重复提交',
          duplicate: true 
        }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 插入数据
    const { data, error } = await supabase
      .from('deceased_records')
      .insert([{ name, category, death_date }])
      .select()
      .single()

    if (error) {
      console.error('Insert error:', error)
      return new Response(
        JSON.stringify({ error: '提交失败，请稍后重试' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: '提交成功',
        data 
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ error: '服务器错误' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
