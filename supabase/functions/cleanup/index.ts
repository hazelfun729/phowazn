import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('PROJECT_URL')!
const supabaseServiceKey = Deno.env.get('SERVICE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const today = new Date()
    const ninetyDaysAgo = new Date(today)
    ninetyDaysAgo.setDate(today.getDate() - 90)
    const ninetyDaysAgoStr = ninetyDaysAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('deceased_records')
      .delete()
      .lt('created_at', ninetyDaysAgoStr)
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      message: `已清理 ${data?.length || 0} 条过期数据` 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: '清理失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
