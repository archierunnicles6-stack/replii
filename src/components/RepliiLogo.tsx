import Image from "next/image";

const MARK = { width: 490, height: 490 } as const;
const ICON = { width: 28, height: 28 } as const;

export function RepliiLogo({
  className = "h-7 w-7",
  variant = "icon",
  tone = "dark",
  priority = false,
}: {
  className?: string;
  variant?: "icon" | "mark" | "wordmark";
  tone?: "dark" | "light";
  priority?: boolean;
}) {
  if (variant === "wordmark") {
    return (
      <span
        className={`inline-block shrink-0 font-semibold tracking-[-0.04em] ${
          tone === "light" ? "text-white" : "text-zinc-900"
        } ${className || "text-[28px] leading-none"}`}
      >
        Replii
      </span>
    );
  }

  if (variant === "mark") {
    const src = tone === "light" ? "/replii-mark.png" : "/replii-logo.png";
    return (
      <Image
        src={src}
        alt=""
        width={MARK.width}
        height={MARK.height}
        aria-hidden
        draggable={false}
        className={`inline-block shrink-0 object-contain ${className}`}
      />
    );
  }

  return (
    <Image
      src={tone === "light" ? "/replii-mark.png" : "/replii-logo.png"}
      alt=""
      width={ICON.width}
      height={ICON.height}
      aria-hidden
      draggable={false}
      className={`inline-block shrink-0 object-contain ${className}`}
    />
  );
}
