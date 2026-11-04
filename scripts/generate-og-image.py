"""
Genera `public/og-image.png` (1200×630) para la vista previa de WhatsApp.

Uso:
    python scripts/generate-og-image.py

Tipografía: si existe `docs/assets/fonts/Sacramento-Regular.ttf` se usa; si no,
cae a Brush Script MT, que ya es el respaldo declarado de `--font-display`.
El texto pequeño usa la sans del sistema (Segoe UI) porque Montserrat no está
instalada; cuando exista el TTF de Montserrat, pásalo en SANS_FONT.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "og-image.png"
RABBITS = [ROOT / "public" / "assets" / "conejo-izq.png", ROOT / "public" / "assets" / "conejo-der.png"]

W, H = 1200, 630
PAPER = "#FFFFFF"
BLUE_INK = "#4F679C"
BLUE_DEEP = "#5A72A8"
GOLD = "#F2C46D"
GOLD_DEEP = "#B8862F"
BLUE = "#7190CF"
ROSE = "#D3786E"
ROSE_DEEP = "#B9645B"

FONT_CANDIDATES = {
    "script": [
        ROOT / "docs" / "assets" / "fonts" / "Sacramento-Regular.ttf",
        Path("C:/Windows/Fonts/BRUSHSCI.TTF"),
        Path("C:/Windows/Fonts/segoesc.ttf"),
    ],
    "sans": [
        Path("C:/Windows/Fonts/segoeui.ttf"),
        Path("C:/Windows/Fonts/arial.ttf"),
    ],
    "sans_bold": [
        Path("C:/Windows/Fonts/segoeuib.ttf"),
        Path("C:/Windows/Fonts/arialbd.ttf"),
    ],
}


def pick_font(kind: str) -> Path:
    for path in FONT_CANDIDATES[kind]:
        if path.exists():
            return path
    raise SystemExit(f"No encontré una tipografía para «{kind}».")


def load(path: Path, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(str(path), size)


def centered(draw: ImageDraw.ImageDraw, xy, text, font, fill) -> None:
    draw.text(xy, text, font=font, fill=fill, anchor="mm")


def main() -> None:
    script = load(pick_font("script"), 168)
    names = load(pick_font("script"), 128)
    sans = load(pick_font("sans"), 27)
    sans_bold = load(pick_font("sans_bold"), 32)

    canvas = Image.new("RGB", (W, H), PAPER)

    rabbit_h = 470
    for index, path in enumerate(RABBITS):
        rabbit = Image.open(path).convert("RGBA")
        ratio = rabbit_h / rabbit.height
        rabbit = rabbit.resize((round(rabbit.width * ratio), rabbit_h), Image.LANCZOS)
        x = 34 if index == 0 else W - 34 - rabbit.width
        canvas.paste(rabbit, (x, (H - rabbit_h) // 2 - 6), rabbit)

    draw = ImageDraw.Draw(canvas)

    centered(draw, (W / 2, 86), "Danna y Oscar", names, ROSE_DEEP)
    centered(draw, (W / 2, 218), "Niño", script, BLUE)

    # La conjunción que se asoma entre las dos voces, a la derecha y un poco baja.
    between = load(pick_font("script"), 70)
    centered(draw, (W / 2 + 60, 320), "o", between, GOLD_DEEP)

    centered(draw, (W / 2, 398), "Niña", script, ROSE)

    centered(draw, (W / 2, 506), "15 de noviembre de 2026", sans_bold, BLUE_INK)
    centered(draw, (W / 2, 552), "Revelación de género", sans, BLUE_DEEP)

    canvas.save(OUT, "PNG", optimize=True)
    print(f"{OUT} · {OUT.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
