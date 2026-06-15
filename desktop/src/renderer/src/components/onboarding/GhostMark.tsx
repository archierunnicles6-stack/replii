import ghostIcon from "../../assets/ghost-icon.png";

export function GhostMark() {
  return (
    <img
      src={ghostIcon}
      alt=""
      aria-hidden
      draggable={false}
      className="inline-block h-8 w-8 shrink-0 object-contain"
    />
  );
}
