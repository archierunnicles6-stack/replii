#!/usr/bin/env python3
"""Generate macOS Dock/Launchpad icons with inset squircle (matches Discord etc.)."""

from __future__ import annotations

import os
from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "build" / "icon-source.png"
ICON_OUT = ROOT / "build" / "icon.png"
ASSETS = ROOT / "src" / "renderer" / "src" / "assets"
PUBLIC = ROOT.parent / "public"

CANVAS = 1024
# Native macOS electron apps (Discord, etc.) inset ~100px on a 1024 canvas.
SHAPE = 824
PADDING = (CANVAS - SHAPE) // 2
CORNER_RADIUS = int(SHAPE * 0.223)  # ~184px, matches common macOS template


def make_macos_icon(src: Image.Image) -> Image.Image:
    content = src.convert("RGB").resize((SHAPE, SHAPE), Image.Resampling.LANCZOS)

    mask = Image.new("L", (SHAPE, SHAPE), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        (0, 0, SHAPE, SHAPE), radius=CORNER_RADIUS, fill=255
    )

    shaped = Image.new("RGBA", (SHAPE, SHAPE), (0, 0, 0, 0))
    shaped.paste(content, (0, 0), mask)

    # Subtle drop shadow like native app icons
    shadow = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    shadow_mask = Image.new("L", (SHAPE, SHAPE), 0)
    ImageDraw.Draw(shadow_mask).rounded_rectangle(
        (0, 0, SHAPE, SHAPE), radius=CORNER_RADIUS, fill=255
    )
    shadow_layer = Image.new("RGBA", (SHAPE, SHAPE), (0, 0, 0, 110))
    shadow_layer.putalpha(shadow_mask.filter(ImageFilter.GaussianBlur(radius=6)))
    shadow.alpha_composite(shadow_layer, (PADDING, PADDING + 8))

    canvas = Image.new("RGBA", (CANVAS, CANVAS), (0, 0, 0, 0))
    canvas.alpha_composite(shadow)
    canvas.alpha_composite(shaped, (PADDING, PADDING))
    return canvas


def main() -> None:
    source_candidates = [
        SRC,
        Path(
            os.environ.get(
                "GHOST_ICON_SOURCE",
                "/Users/runny1/.cursor/projects/Users-runny1-Desktop-Ghost/assets/image-b2470f99-cddf-48b5-93d6-5447e81b48f1.png",
            )
        ),
        ICON_OUT,
    ]

    source = next((p for p in source_candidates if p.exists()), None)
    if source is None:
        raise SystemExit("No icon source image found")

    raw = Image.open(source).convert("RGB")
    if raw.width != 1024 or raw.height != 1024:
        raw = raw.resize((1024, 1024), Image.Resampling.LANCZOS)

    if source != SRC:
        raw.save(SRC, "PNG", optimize=True)

    icon = make_macos_icon(raw)

    icon.save(ICON_OUT, "PNG", optimize=True)
    icon.save(ASSETS / "ghost-icon.png", "PNG", optimize=True)
    icon.save(PUBLIC / "app-icon.png", "PNG", optimize=True)
    icon.save(PUBLIC / "apple-touch-icon.png", "PNG", optimize=True)

    print(f"[ghost] Generated macOS squircle icon from {source}")
    print(f"  canvas={CANVAS} shape={SHAPE} padding={PADDING} radius={CORNER_RADIUS}")


if __name__ == "__main__":
    main()
