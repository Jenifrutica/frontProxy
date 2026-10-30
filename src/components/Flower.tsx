export function Flower({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      aria-hidden="true"
      focusable="false"
    >
      <g fill="none" stroke="currentColor" strokeWidth="1.5">
        {[0, 72, 144, 216, 288].map((angle) => (
          <ellipse
            key={angle}
            cx="100"
            cy="56"
            rx="23"
            ry="42"
            transform={`rotate(${angle} 100 100)`}
          />
        ))}
        <circle cx="100" cy="100" r="7" fill="currentColor" stroke="none" />
      </g>
    </svg>
  );
}
