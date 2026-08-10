import Image from "next/image";

interface HHGoaShellProps {
  children: React.ReactNode;
  compact?: boolean;
  onExit?: () => void;
}

export function HHGoaShell({ children, compact = false, onExit }: HHGoaShellProps) {
  return (
    <main className={`hh-shell ${compact ? "hh-shell--compact" : ""}`}>
      <div className="poster-frame" aria-hidden="true" />
      <header className="site-rail">
        <Image className="studio-mark" src="/brand/studio.svg" width={88} height={54} alt="2:47 PM Studio" priority />
        <div className="rail-line" aria-hidden="true"><span>✦</span><i /><span>✦</span></div>
        {onExit ? (
          <button className="text-button rail-exit" type="button" onClick={onExit}>EXIT ×</button>
        ) : (
          <span className="rail-tag">#FrameInGoa</span>
        )}
      </header>
      {children}
    </main>
  );
}
