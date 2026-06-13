import { useEffect, type ReactNode } from "react";

export function SplitScreenShell({
  left,
  right,
  variant = "light",
  rightVariant = "default",
}: {
  left: ReactNode;
  right: ReactNode;
  variant?: "light" | "dark";
  rightVariant?: "default" | "grid";
}) {
  useEffect(() => {
    void window.ghost?.setDashboardLayout?.("onboarding");
  }, []);

  const isDark = variant === "dark";

  return (
    <div
      className={`flex h-screen max-h-screen w-full overflow-hidden ${isDark ? "bg-[#0a0a0a]" : "bg-white"}`}
    >
      <div className="flex h-full min-h-0 w-1/2 flex-col overflow-hidden">
        {left}
      </div>
      <div
        className={`flex h-full min-h-0 w-1/2 flex-col overflow-hidden ${
          rightVariant === "grid"
            ? "p-0"
            : `items-center justify-center px-10 py-8 ${
                isDark ? "bg-black" : "bg-[#f5f5f7]"
              }`
        }`}
      >
        {right}
      </div>
    </div>
  );
}
