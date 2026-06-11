export default function Logo({ size = 32 }: { size?: number }) {
  return (
    <span
      className="flex items-center justify-center rounded-xl bg-zinc-900 shadow-sm"
      style={{ width: size, height: size }}
    >
      <svg
        width={size * 0.55}
        height={size * 0.55}
        viewBox="0 0 24 24"
        fill="none"
        stroke="white"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16l-6 7.5V18l-4 2.5V11.5L4 4z" />
      </svg>
    </span>
  );
}
