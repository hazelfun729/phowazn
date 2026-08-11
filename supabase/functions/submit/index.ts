import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('PROJECT_URL')!
const supabaseServiceKey = Deno.env.get('SERVICE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function cleanName(name: string, category: string): string {
  let cleaned = name.trim()
  cleaned = cleaned.replace(/[，。、；：！？""''【】《》\s]+/g, '')
  cleaned = cleaned.replace(/亡者/g, '')
  cleaned = cleaned.replace(/姓名/g, '')
  if (category !== 'infants') {
    cleaned = cleaned.replace(/旁生/g, '')
  }
  return cleaned
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    })
  }

  try {
    const body = await req.json()
    const { death_date, category, name } = body

    if (!death_date || !category || !name) {
      return new Response(JSON.stringify({ error: '缺少必要参数' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const cleanedName = cleanName(name, category)
    if (!cleanedName) {
      return new Response(JSON.stringify({ error: '姓名无效' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data: existing, error: queryError } = await supabase
      .from('deceased_records')
      .select('id')
      .eq('category', category)
      .eq('name', cleanedName)
      .limit(1)

    if (queryError) throw queryError

    if (existing && existing.length > 0) {
      return new Response(JSON.stringify({ 
        success: true, 
        message: '该姓名已存在，已自动去重',
        duplicate: true
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await supabase
      .from('deceased_records')
      .insert([{
        death_date: death_date,
        category: category,
        name: cleanedName
      }])
      .select()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      message: '提交成功',
      record: data[0]
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: '提交失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
