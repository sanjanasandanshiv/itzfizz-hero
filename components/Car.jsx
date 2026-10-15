export default function Car() {
  return (
    <div className="relative">
      <svg viewBox="0 0 300 120" className="block h-auto w-full overflow-visible" aria-hidden="true">
        <path
          d="M10 80 Q10 62 30 58 L70 54 Q92 24 130 22 L190 22 Q222 24 240 52 L270 58 Q292 62 292 80 L292 92 L10 92 Z"
          fill="#ffc94a"
        />
        <line x1="18" y1="76" x2="284" y2="76" stroke="#ff8a3d" strokeWidth="4" strokeLinecap="round" />
        <path d="M100 52 Q112 30 132 30 L158 30 L158 52 Z" fill="#d8fff5" />
        <path d="M166 30 L188 30 Q208 32 222 52 L166 52 Z" fill="#d8fff5" />
        <circle cx="284" cy="70" r="6" fill="#fff6d6" />
        <rect x="10" y="64" width="6" height="12" rx="2" fill="#ff4d5e" />
        {/* wheel arches */}
        <circle cx="70" cy="92" r="28" fill="#061f1b" />
        <circle cx="228" cy="92" r="28" fill="#061f1b" />
      </svg>

      {/* wheels: separate HTML elements, so they spin around their own centre */}
      {["16%", "68.667%"].map((left) => (
        <div
          key={left}
          className="wheel absolute aspect-square w-[14.667%] will-change-transform"
          style={{ left, top: "58.333%" }}
        >
          <svg viewBox="0 0 44 44" className="block h-full w-full" aria-hidden="true">
            <circle cx="22" cy="22" r="22" fill="#04120f" />
            <circle cx="22" cy="22" r="9" fill="#ffe9a8" />
            <line x1="4" y1="22" x2="40" y2="22" stroke="#ffe9a8" strokeWidth="3" />
            <line x1="22" y1="4" x2="22" y2="40" stroke="#ffe9a8" strokeWidth="3" />
          </svg>
        </div>
      ))}
    </div>
  );
}