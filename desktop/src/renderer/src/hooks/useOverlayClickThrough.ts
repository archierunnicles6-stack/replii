import { useEffect, type RefObject } from "react";

/** Click-through overlay: pass clicks to apps below, except over UI zones. */
export function useOverlayClickThrough(
  active: boolean,
  topPanelRef: RefObject<HTMLElement | null>,
  controlBarRef: RefObject<HTMLElement | null>,
  topPanelHidden: boolean,
) {
  useEffect(() => {
    if (!active) {
      void window.ghost?.setIgnoreMouseEvents?.(false);
      return;
    }

    void window.ghost?.setIgnoreMouseEvents?.(true, { forward: true });

    const isOverZone = (x: number, y: number) => {
      const zones = topPanelHidden ? [controlBarRef] : [topPanelRef, controlBarRef];
      return zones.some((ref) => {
        const el = ref.current;
        if (!el) return false;
        const rect = el.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
      });
    };

    let overZone = false;

    const update = (x: number, y: number) => {
      const next = isOverZone(x, y);
      if (next === overZone) return;
      overZone = next;
      void window.ghost?.setIgnoreMouseEvents?.(!next, { forward: true });
    };

    const onMove = (e: MouseEvent) => update(e.clientX, e.clientY);
    const onLeave = () => {
      overZone = false;
      void window.ghost?.setIgnoreMouseEvents?.(true, { forward: true });
    };

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseleave", onLeave);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      void window.ghost?.setIgnoreMouseEvents?.(false);
    };
  }, [active, topPanelHidden, topPanelRef, controlBarRef]);
}
