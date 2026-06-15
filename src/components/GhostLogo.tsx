import Image from "next/image";

export function GhostLogo({
  className = "h-7 w-7",
  variant = "icon",
}: {
  className?: string;
  variant?: "icon" | "mark";
}) {
  const src = variant === "mark" ? "/ghost-logo.png" : "/app-icon.png";
  return (
    <Image
      src={src}
      alt=""
      width={28}
      height={28}
      aria-hidden
      draggable={false}
      className={`inline-block shrink-0 object-contain ${className}`}
    />
  );
}
