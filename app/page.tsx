import { HomeClient } from "@/app/HomeClient";

export default function Home({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const viewParam = typeof searchParams?.view === "string" ? searchParams.view : undefined;
  const initialView: "landing" | "app" = viewParam === "app" ? "app" : "landing";
  return <HomeClient initialView={initialView} />;
}

