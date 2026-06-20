import { Outlet } from "react-router-dom";
import { RepliiLogo } from "../../components/ui";

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-zinc-50">
      <div className="hidden w-1/2 flex-col justify-between bg-zinc-900 p-12 lg:flex">
        <RepliiLogo variant="wordmark" tone="light" className="h-8 w-auto" />
        <div>
          <h2 className="text-3xl font-semibold leading-tight text-white">
            Live coaching for sales teams
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-zinc-400">
            Replii listens to your calls and gives you the exact words to say —
            in real time, with every session logged for your review.
          </p>
        </div>
        <p className="text-[12px] text-zinc-600">© Replii · Built for sales teams</p>
      </div>

      <div className="flex flex-1 items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 lg:hidden">
            <RepliiLogo variant="wordmark" className="h-8 w-auto" />
          </div>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
