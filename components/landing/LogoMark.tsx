export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="grid shrink-0 place-items-center rounded-xl bg-gradient-to-br from-[#10B981] to-[#065F46] shadow-glow-sm"
    >
      <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 24 24" fill="none">
        <path
          d="M12 2L21 12L12 22L3 12L12 2Z"
          stroke="#05281C"
          strokeWidth={2}
          strokeLinejoin="round"
        />
        <path d="M12 7.5L16.5 12L12 16.5L7.5 12L12 7.5Z" fill="#05281C" opacity={0.85} />
      </svg>
    </span>
  );
}
