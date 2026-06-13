import { Outlet } from "react-router-dom";
import { GhostLogo } from "../../components/ui";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 lg:flex">
        <div className="flex items-center gap-3">
          <GhostLogo />
          <span className="text-lg font-semibold text-white">Ghost</span>
        </div>
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-white">
            #1 invisible AI for sales calls
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
            Ghost listens to your calls and gives you the exact words to say —
            in real time, completely invisible on screen share.
          </p>
        </div>
        <p className="text-[12px] text-zinc-600">© Ghost · Built for sales teams</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <GhostLogo />
            <span className="text-lg font-semibold">Ghost</span>
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
