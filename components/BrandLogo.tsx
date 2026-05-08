"use client";
import { BRANDS } from "@/lib/talks";
import { useState } from "react";

interface Props {
  slug: string;
  size?: number;
}

export default function BrandLogo({ slug, size = 16 }: Props) {
  const brand = BRANDS[slug];
  const [errored, setErrored] = useState(false);
  if (!brand) return null;
  // Google's favicon CDN — works for any domain, no API key.
  const url = `https://www.google.com/s2/favicons?domain=${brand.domain}&sz=${size * 2}`;

  if (errored) {
    return (
      <span
        className="inline-flex items-center justify-center font-mono text-[8px] tracking-widest text-parch-faint border border-[var(--hairline)] px-1"
        style={{ height: size, lineHeight: `${size}px` }}
        title={`${brand.name} (${brand.kind})`}
      >
        {brand.name.toUpperCase().slice(0, 5)}
      </span>
    );
  }

  return (
    <img
      src={url}
      alt={brand.name}
      title={`${brand.name} · ${brand.kind}`}
      width={size}
      height={size}
      className="inline-block align-text-bottom"
      style={{ filter: "saturate(0.85) brightness(0.95)" }}
      onError={() => setErrored(true)}
    />
  );
}
