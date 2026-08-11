import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const supabaseUrl = Deno.env.get('PROJECT_URL')!
const supabaseAnonKey = Deno.env.get('ANON_KEY')!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

Deno.serve(async (req) => {
  try {
    const today = new Date()
    const fortyNineDaysAgo = new Date(today)
    fortyNineDaysAgo.setDate(today.getDate() - 49)
    const fortyNineDaysAgoStr = fortyNineDaysAgo.toISOString().split('T')[0]

    const { data, error } = await supabase
      .from('deceased_records')
      .select('*')
      .gte('death_date', fortyNineDaysAgoStr)
      .order('death_date', { ascending: false })

    if (error) throw error

    const deceased = data.filter(r => r.category === 'deceased').map(r => ({ name: r.name, date: r.death_date }))
    const infants = data.filter(r => r.category === 'infants').map(r => ({ name: r.name, date: r.death_date }))
    const animals = data.filter(r => r.category === 'animals').map(r => ({ name: r.name, date: r.death_date }))

    const seen = new Set()
    const uniqueDeceased = deceased.filter(r => { const key = r.name; if (seen.has(key)) return false; seen.add(key); return true })
    seen.clear()
    const uniqueInfants = infants.filter(r => { const key = r.name; if (seen.has(key)) return false; seen.add(key); return true })
    seen.clear()
    const uniqueAnimals = animals.filter(r => { const key = r.name; if (seen.has(key)) return false; seen.add(key); return true })

    return new Response(JSON.stringify({
      updatedAt: new Date().toISOString(),
      deceased: uniqueDeceased,
      infants: uniqueInfants,
      animals: uniqueAnimals
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: '获取数据失败' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
