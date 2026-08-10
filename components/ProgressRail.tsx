interface ProgressRailProps {
  active: 1 | 2 | 3;
}

export function ProgressRail({ active }: ProgressRailProps) {
  return (
    <nav className="progress-rail" aria-label="Generator progress">
      {["FORMAT", "FACE", "YOU"].map((label, index) => (
        <span className={active === index + 1 ? "is-active" : active > index + 1 ? "is-done" : ""} key={label}>
          0{index + 1} {label}
        </span>
      ))}
    </nav>
  );
}
