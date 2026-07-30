import { createServerClient } from "@/lib/supabase/server";

/**
 * Supabase 연결 실험 페이지 — 원래 홈(/)에 임시로 있던 테스트를 이 경로로 옮겼습니다.
 * 요청 시점에만 실행되며(빌드 시 프리렌더 안 함), 키가 없으면 안내만 표시합니다.
 */
export const dynamic = "force-dynamic";

export default async function SupabaseTestPage() {
  const supabase = createServerClient();

  if (!supabase) {
    return (
      <main className="p-10">
        <h1 className="mb-4 text-2xl font-bold">Supabase 미설정</h1>
        <p>NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY 환경변수를 설정하면 연결을 테스트합니다.</p>
      </main>
    );
  }

  const { data, error } = await supabase.from("goods").select("name").limit(5);

  return (
    <main className="p-10">
      <h1 className="mb-4 text-2xl font-bold">{error ? `에러: ${error.message}` : "Supabase 연결됨"}</h1>
      <ul>{data?.map((g) => <li key={g.name}>{g.name}</li>)}</ul>
    </main>
  );
}
