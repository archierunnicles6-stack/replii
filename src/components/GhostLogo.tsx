import Image from "next/image";

const WORDMARK = { width: 1746, height: 458 } as const;
const MARK = { width: 490, height: 490 } as const;
const ICON = { width: 28, height: 28 } as const;

export function GhostLogo({
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
    const src = tone === "light" ? "/ghost-wordmark-light.png" : "/ghost-wordmark.png";
    return (
      <Image
        src={src}
        alt="Ghost"
        width={WORDMARK.width}
        height={WORDMARK.height}
        priority={priority}
        draggable={false}
        className={`inline-block shrink-0 object-contain ${className}`}
      />
    );
  }

  if (variant === "mark") {
    const src = tone === "light" ? "/ghost-mark.png" : "/ghost-logo.png";
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
      src="/app-icon.png"
      alt=""
      width={ICON.width}
      height={ICON.height}
      aria-hidden
      draggable={false}
      className={`inline-block shrink-0 object-contain ${className}`}
    />
  );
}
