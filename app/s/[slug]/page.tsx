import { notFound } from "next/navigation";
import { TALKS_BY_SPEAKER, SPEAKERS, TALKS } from "@/lib/talks";
import SpeakerView from "@/components/SpeakerView";
import type { Speaker } from "@/lib/types";

export function generateStaticParams() {
  return Object.keys(TALKS_BY_SPEAKER).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const talks = TALKS_BY_SPEAKER[slug] || [];
  if (talks.length === 0) return { title: "Not found" };
  const name = talks[0].speakers.find(
    (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
  ) || slug;
  return { title: `${name} · dev.eth` };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const talks = TALKS_BY_SPEAKER[slug];
  if (!talks || talks.length === 0) notFound();

  const speakerName = talks[0].speakers.find(
    (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") === slug
  ) || slug;

  // Try to find speaker bio info from SPEAKERS index by name match
  let speakerInfo: Speaker | undefined;
  for (const sp of Object.values(SPEAKERS)) {
    if (sp.name === speakerName) { speakerInfo = sp; break; }
  }

  return <SpeakerView name={speakerName} talks={talks} info={speakerInfo} />;
}
