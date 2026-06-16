import { MAC_DOWNLOAD_FILENAME, MAC_DOWNLOAD_URL } from "@/lib/download";

const baseClassName =
  "inline-flex items-center rounded-full bg-[#4b8bf5] font-medium text-white shadow-[0_4px_14px_rgba(75,139,245,0.35)] transition-colors hover:bg-[#3d7de8]";

const sizeClassName = {
  default: "h-11 gap-2.5 px-6 text-[15px]",
  sm: "h-10 gap-2 px-4 text-[13px] sm:px-5 sm:text-[14px]",
};

function AppleIcon() {
  return (
    <svg className="h-[17px] w-[17px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z" />
    </svg>
  );
}

export function MacDownloadLink({
  className,
  size = "default",
  children = "Get for Mac",
}: {
  className?: string;
  size?: "default" | "sm";
  children?: React.ReactNode;
}) {
  const isLocal = MAC_DOWNLOAD_URL.startsWith("/");

  return (
    <a
      href={MAC_DOWNLOAD_URL}
      {...(isLocal ? { download: MAC_DOWNLOAD_FILENAME } : { target: "_blank", rel: "noopener noreferrer" })}
      className={className ?? `${baseClassName} ${sizeClassName[size]}`}
    >
      <AppleIcon />
      {children}
    </a>
  );
}
