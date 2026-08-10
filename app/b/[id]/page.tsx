import type { Metadata } from "next";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";
import { readShareRecord } from "@/lib/share-store";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function origin() {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = headerList.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${protocol}://${host}`;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const record = await readShareRecord(id);
  if (!record) return { title: "Builder signal not found — HH Goa" };
  const base = await origin();
  const pageUrl = `${base}/b/${record.id}`;
  const imageUrl = `${base}${record.imageUrl}`;
  const title = `${record.builderClass} reporting from Goa`;
  const description = `${record.name} is locked in for HH Goa 2026. Less noise. More signal. #FrameInGoa`;
  return {
    title,
    description,
    alternates: { canonical: pageUrl },
    openGraph: { title, description, url: pageUrl, type: "website", images: [{ url: imageUrl, alt: `${record.name}'s HH Goa artwork` }] },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default async function PublicBuilderPage({ params }: PageProps) {
  const { id } = await params;
  const record = await readShareRecord(id);
  if (!record) notFound();
  const pageUrl = `${await origin()}/b/${record.id}`;
  const shareText = `${record.builderClass} reporting from Goa 🌴\n\nBuilding. Shipping. Probably debugging by the beach.\n\n#FrameInGoa\n\n${pageUrl}`;

  return (
    <main className="public-result-page">
      <div className="poster-frame" aria-hidden="true" />
      <div className="public-result-inner">
        {/* The API route serves this exact user-generated PNG and is also used by OG/Twitter metadata. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img className="public-result-art" src={record.imageUrl} alt={`${record.name}'s generated HH Goa ${record.format === "builder" ? "Builder ID" : "PFP"}`} />
        <section className="public-result-copy">
          <p>HH GOA 2026 / BUILDER SIGNAL</p>
          <h1>BUILDER<br /><em>DETECTED.</em></h1>
          <p><strong>{record.name}</strong><br />{record.builderClass} · {record.builderId}</p>
          <a
            className="primary-button"
            href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`}
            target="_blank"
            rel="noreferrer"
          >
            𝕏 SHARE TO X
          </a>
          <Link className="text-button" href="/">MAKE YOURS ↗</Link>
        </section>
      </div>
    </main>
  );
}
