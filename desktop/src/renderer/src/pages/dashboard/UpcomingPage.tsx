import { useOutletContext } from "react-router-dom";
import { useStartGhostSession } from "../../hooks/useStartGhostSession";
import { useAppStore } from "../../store/useAppStore";
import type { DashboardOutletContext } from "./DashboardLayout";

export function UpcomingPage() {
  const { searchQuery } = useOutletContext<DashboardOutletContext>();
  const upcoming = useAppStore((s) => s.upcoming);
  const { startSession, canStart } = useStartGhostSession();

  const filtered = upcoming.filter((call) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      call.title.toLowerCase().includes(q) ||
      call.company.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <div className="mb-6 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[13px] font-semibold text-zinc-900">
              Connect Google Calendar
            </p>
            <p className="mt-1 text-[12px] text-zinc-500">
              Auto-generate briefs for every upcoming sales call.
            </p>
          </div>
          <button
            type="button"
            className="shrink-0 rounded-full border border-zinc-200 px-4 py-2 text-[12px] font-medium text-zinc-700 transition-colors hover:bg-zinc-50"
          >
            Connect
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-200 bg-white p-12 text-center">
            <p className="text-[14px] font-medium text-zinc-700">
              {searchQuery.trim()
                ? `No upcoming calls matching "${searchQuery}"`
                : "No upcoming calls scheduled"}
            </p>
            <p className="mt-2 text-[13px] text-zinc-500">
              Link your calendar to see pre-call briefs here.
            </p>
          </div>
        ) : (
          filtered.map((call) => (
            <div
              key={call.id}
              className="rounded-2xl border border-zinc-200 bg-white p-6"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-[12px] font-medium text-blue-600">
                    {new Date(call.datetime).toLocaleString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </p>
                  <h3 className="mt-1 text-lg font-semibold text-zinc-900">
                    {call.title}
                  </h3>
                  <p className="text-[13px] text-zinc-500">{call.company}</p>
                </div>
                <button
                  type="button"
                  onClick={() => void startSession()}
                  disabled={!canStart}
                  className="rounded-full bg-gradient-to-b from-[#4d9cf8] to-[#3b82f6] px-4 py-2 text-[12px] font-medium text-white shadow-[0_2px_8px_rgba(59,130,246,0.35)] transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Start Ghost
                </button>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <section>
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                    Participants
                  </h4>
                  <div className="mt-2 space-y-2">
                    {call.participants.map((p) => (
                      <div
                        key={p.name}
                        className="rounded-xl border border-zinc-100 bg-zinc-50 p-3"
                      >
                        <p className="text-[13px] font-semibold text-zinc-900">
                          {p.name}
                        </p>
                        <p className="text-[11px] text-blue-600">{p.role}</p>
                        <p className="mt-1 text-[12px] leading-relaxed text-zinc-600">
                          {p.bio}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="space-y-4">
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Agenda
                    </h4>
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">
                      {call.agenda}
                    </p>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Talking points
                    </h4>
                    <ul className="mt-2 space-y-1">
                      {call.talkingPoints.map((t) => (
                        <li
                          key={t}
                          className="flex gap-2 text-[13px] text-zinc-600"
                        >
                          <span className="text-blue-500">•</span>
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Context
                    </h4>
                    <p className="mt-2 text-[13px] leading-relaxed text-zinc-600">
                      {call.previousContext}
                    </p>
                  </div>
                </section>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
