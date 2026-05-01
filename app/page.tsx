import { HomeClient } from "@/app/HomeClient";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ view?: string }>;
}) {
  const resolvedSearchParams =
    searchParams != null ? await searchParams : undefined;
  const viewParam =
    typeof resolvedSearchParams?.view === "string"
      ? resolvedSearchParams.view
      : undefined;
  const initialView: "landing" | "app" = viewParam === "app" ? "app" : "landing";
  return <HomeClient initialView={initialView} />;
}

