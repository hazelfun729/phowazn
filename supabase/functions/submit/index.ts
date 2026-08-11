import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

function cleanName(name: string): string {
  if (!name) return ''
  let cleaned = name
  cleaned = cleaned.replace(/亡者 | 姓名 | 旁生/g, '')
  cleaned = cleaned.replace(/[：:、,，\-—+.。]/g, '')
  cleaned = cleaned.replace(/父母之一 | 父母/g, '')
  return cleaned.trim()
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
    const { name, category, death_date } = body

    if (!name || !category || !death_date) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const cleanedName = cleanName(name)
    if (!cleanedName) {
      return new Response(JSON.stringify({ error: 'Invalid name' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const deathDate = new Date(death_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (deathDate > today) {
      return new Response(JSON.stringify({ error: '往生日期不能是未来时间' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data: existing, error: checkError } = await supabase
      .from('deceased_records')
      .select('id')
      .eq('name', cleanedName)
      .eq('category', category)
      .single()

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError
    }

    if (existing) {
      return new Response(JSON.stringify({ 
        success: false, 
        message: '该姓名已存在，请勿重复填写' 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const { data, error } = await supabase
      .from('deceased_records')
      .insert({
        name: cleanedName,
        category,
        death_date,
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return new Response(JSON.stringify({ 
      success: true, 
      message: '提交成功',
      data 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ 
      error: '提交失败，请稍后重试' 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
