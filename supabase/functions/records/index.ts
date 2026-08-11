// Supabase Edge Function: records
// 查询 49 天内的名单数据

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
    // 创建 Supabase 客户端
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 计算 49 天前的日期
    const today = new Date()
    const fortyNineDaysAgo = new Date(today)
    fortyNineDaysAgo.setDate(today.getDate() - 49)
    const dateStr = fortyNineDaysAgo.toISOString().split('T')[0]

    // 查询 49 天内的数据
    const { data: records, error } = await supabase
      .from('deceased_records')
      .select('*')
      .gte('death_date', dateStr)
      .order('death_date', { ascending: false })

    if (error) {
      console.error('Query error:', error)
      return new Response(
        JSON.stringify({ error: '查询失败' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // 按分类整理数据
    const deceased: { name: string; date: string }[] = []
    const infants: { name: string; date: string }[] = []
    const animals: { name: string; date: string }[] = []

    const seen = new Set<string>()

    for (const record of records || []) {
      const key = `${record.category}:${record.name}`
      if (seen.has(key)) continue
      seen.add(key)

      const item = { name: record.name, date: record.death_date }
      
      if (record.category === 'deceased') {
        deceased.push(item)
      } else if (record.category === 'infants') {
        infants.push(item)
      } else if (record.category === 'animals') {
        animals.push(item)
      }
    }

    // 获取最新更新时间
    const { data: latestRecord } = await supabase
      .from('deceased_records')
      .select('created_at')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return new Response(
      JSON.stringify({
        updatedAt: latestRecord?.created_at || null,
        deceased,
        infants,
        animals,
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
