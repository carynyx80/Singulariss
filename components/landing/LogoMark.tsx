import Image from "next/image";

export function LogoMark({ size = 36 }: { size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className="relative grid shrink-0 place-items-center overflow-hidden rounded-xl bg-black shadow-glow-sm ring-1 ring-[#10B981]/30"
    >
      <Image
        src="/logo.png"
        alt=""
        width={size}
        height={size}
        className="h-full w-full object-cover"
        priority
      />
    </span>
  );
}
