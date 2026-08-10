import Link from "next/link";

export default function NotFound() {
  return (
    <main className="public-result-page">
      <div className="poster-frame" aria-hidden="true" />
      <section className="public-result-copy" style={{ maxWidth: 760, margin: "15vh auto" }}>
        <p>404 / SIGNAL LOST</p>
        <h1>NOISE<br /><em>DETECTED.</em></h1>
        <p>This builder link never landed—or it has left the beach.</p>
        <Link className="primary-button" href="/">MAKE YOURS ↗</Link>
      </section>
    </main>
  );
}
