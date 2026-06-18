import ghostMark from "../../assets/ghost-mark.png";

export function GhostMark() {
  return (
    <img
      src={ghostMark}
      alt=""
      aria-hidden
      draggable={false}
      className="inline-block h-8 w-8 shrink-0 object-contain"
    />
  );
}
