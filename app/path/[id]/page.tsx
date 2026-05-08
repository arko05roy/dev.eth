import { notFound } from "next/navigation";
import { ACTS } from "@/lib/acts";
import ActPage from "@/components/ActPage";

export function generateStaticParams() {
  return ACTS.map((a) => ({ id: a.id.toLowerCase() }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const act = ACTS.find((a) => a.id.toLowerCase() === id.toLowerCase());
  if (!act) return { title: "Not found" };
  return { title: `${act.title} · Act ${act.id} · dev.eth` };
}

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const act = ACTS.find((a) => a.id.toLowerCase() === id.toLowerCase());
  if (!act) notFound();
  return <ActPage act={act} />;
}
