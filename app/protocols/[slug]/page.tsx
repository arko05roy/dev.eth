import { notFound } from "next/navigation";
import { PROTOCOLS, buildRoadmap } from "@/lib/protocols";
import ProtocolRoadmapView from "@/components/ProtocolRoadmap";

export function generateStaticParams() {
  return PROTOCOLS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roadmap = buildRoadmap(slug);
  if (!roadmap) return { title: "Not found" };
  return { title: `${roadmap.brand.name} · Guild Roadmap · dev.eth` };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const roadmap = buildRoadmap(slug);
  if (!roadmap) notFound();
  return <ProtocolRoadmapView roadmap={roadmap} />;
}
