export function CalendarLinkPrompt({
  onRequestUpgrade,
}: {
  onRequestUpgrade: () => void;
}) {
  return (
    <p className="text-[13px] text-zinc-500">
      <button
        type="button"
        onClick={onRequestUpgrade}
        className="font-medium text-blue-600 transition-colors hover:text-blue-700"
      >
        Link your calendar
      </button>{" "}
      to get notifications for upcoming meetings.
    </p>
  );
}
