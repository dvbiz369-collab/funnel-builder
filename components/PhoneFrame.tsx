export default function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative h-[700px] w-[346px] shrink-0 rounded-[44px] border-[10px] border-zinc-900 bg-zinc-900 shadow-[0_24px_60px_-20px_rgba(0,0,0,0.45)]">
      <div className="absolute left-1/2 top-2 z-10 h-[22px] w-[110px] -translate-x-1/2 rounded-full bg-zinc-900" />
      <div className="h-full w-full overflow-hidden rounded-[34px] bg-white">{children}</div>
    </div>
  );
}
