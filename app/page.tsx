import { createServerClient } from '@/lib/supabase/server'

export default async function Home() {
  const supabase = createServerClient()
  const { data, error } = await supabase.from('goods').select('name').limit(5)

  return (
    <main className="p-10">
      <h1 className="text-2xl font-bold mb-4">
        {error ? `에러: ${error.message}` : 'Supabase 연결됨'}
      </h1>
      <ul>{data?.map((g) => <li key={g.name}>{g.name}</li>)}</ul>
    </main>
  )
}
