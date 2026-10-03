from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json

ROOT = Path(__file__).resolve().parents[1]
ASSETS = ROOT / "assets"
ASSETS.mkdir(exist_ok=True)

C = {
    "paper": "#f2e8cc", "paper2": "#fff8e8", "ink": "#1e1a18",
    "muted": "#6d635b", "hot": "#e54f33", "gold": "#d89b2d",
    "blue": "#4f78da", "pink": "#d25d83", "green": "#2f916d",
    "orange": "#e58b2d", "purple": "#8a63bf", "panel": "#f7efd7",
    "shadow": "#c9b98d",
}

FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FONT_R = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

def font(size, bold=True):
    return ImageFont.truetype(FONT_B if bold else FONT_R, size)

def pawn(draw, cx, cy, scale, fill, width=3):
    r = 0.34 * scale
    hy = cy - 0.72 * scale
    draw.ellipse([cx-r, hy-r, cx+r, hy+r], fill=fill, outline=C["ink"], width=max(1, int(width)))
    pts = [
        (cx-0.27*scale, cy-0.35*scale), (cx+0.27*scale, cy-0.35*scale),
        (cx+0.40*scale, cy+0.36*scale), (cx+0.78*scale, cy+0.60*scale),
        (cx+0.78*scale, cy+0.88*scale), (cx-0.78*scale, cy+0.88*scale),
        (cx-0.78*scale, cy+0.60*scale), (cx-0.40*scale, cy+0.36*scale),
    ]
    draw.polygon(pts, fill=fill)
    draw.line(pts + [pts[0]], fill=C["ink"], width=max(1, int(width)), joint="curve")
    hr = 0.10 * scale
    draw.ellipse([cx-0.12*scale, hy-0.16*scale, cx-0.12*scale+2*hr, hy-0.16*scale+2*hr], fill="#ffffff")

def crown(draw, cx, cy, w, width=4):
    h = w * 0.58
    pts = [
        (cx-w/2, cy+h/2), (cx-w*0.46, cy-h*0.1), (cx-w*0.22, cy+h*0.08),
        (cx, cy-h/2), (cx+w*0.22, cy+h*0.08), (cx+w*0.46, cy-h*0.1),
        (cx+w/2, cy+h/2),
    ]
    draw.polygon(pts, fill=C["gold"])
    draw.line(pts + [pts[0]], fill=C["ink"], width=width, joint="curve")

# --- Square identity icon master ---
S = 2048
im = Image.new("RGB", (S, S), C["paper"])
d = ImageDraw.Draw(im)
for y in range(90, S, 120):
    for x in range(90, S, 120):
        d.ellipse([x-4, y-4, x+4, y+4], fill="#d8caa5")
margin = 110
d.rounded_rectangle([margin, margin, S-margin, S-margin], radius=330, fill=C["paper2"], outline=C["ink"], width=52)
d.rounded_rectangle([margin+55, margin+55, S-margin-55, S-margin-55], radius=280, outline=C["shadow"], width=18)
pawn(d, S/2, S/2+90, 620, C["hot"], width=42)
crown(d, 1500, 515, 250, width=28)
for x, y, color in [(370, 410, C["blue"]), (410, 410, C["green"]), (450, 410, C["orange"])]:
    d.rectangle([x-18, y-18, x+18, y+18], fill=color, outline=C["ink"], width=8)
master = im.resize((1024, 1024), Image.Resampling.LANCZOS)
for n, name in [(512, "icon-512.png"), (192, "icon-192.png"), (180, "apple-touch-icon.png"), (48, "favicon-48x48.png"), (32, "favicon-32x32.png"), (16, "favicon-16x16.png")]:
    master.resize((n, n), Image.Resampling.LANCZOS).save(ASSETS / name, optimize=True)
master.save(ROOT / "favicon.ico", format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])

# --- 1200 x 630 social / Messages preview ---
W, H = 2400, 1260
og = Image.new("RGB", (W, H), C["paper"])
d = ImageDraw.Draw(og)
d.ellipse([1770, -250, 2650, 630], fill="#f6d57d")
d.ellipse([-420, 730, 480, 1630], fill="#c7d9ff")
for y in range(54, H, 54):
    for x in range(54, W, 54):
        d.ellipse([x-2, y-2, x+2, y+2], fill="#d7c9a5")
x0, y0, x1, y1 = 90, 80, W-90, H-80
d.rounded_rectangle([x0+20, y0+25, x1+20, y1+25], radius=48, fill=C["ink"])
d.rounded_rectangle([x0, y0, x1, y1], radius=48, fill=C["panel"], outline=C["ink"], width=8)
bar_h = 110
d.rounded_rectangle([x0, y0, x1, y0+bar_h], radius=48, fill=C["paper2"], outline=C["ink"], width=8)
d.rectangle([x0, y0+bar_h-48, x1, y0+bar_h], fill=C["paper2"])
d.line([x0, y0+bar_h, x1, y0+bar_h], fill=C["ink"], width=8)
for yy in range(y0+16, y0+bar_h-14, 14):
    d.line([x0+95, yy, x1-95, yy], fill="#d9ccb0", width=5)
chip = (760, y0+14, 1640, y0+96)
d.rounded_rectangle(chip, radius=12, fill=C["paper2"], outline=C["ink"], width=6)
txt = "FAMILY COMPUTER · PARCHEESI.EXE"
bb = d.textbbox((0, 0), txt, font=font(34))
d.text(((chip[0]+chip[2]-bb[2])/2, (chip[1]+chip[3]-bb[3])/2-2), txt, font=font(34), fill=C["ink"])
for xx in [x0+48, x1-48]:
    d.rectangle([xx-16, y0+38, xx+16, y0+70], fill=C["paper2"], outline=C["ink"], width=6)
left = 185
d.text((left, 260), "FAMILY", font=font(118), fill=C["ink"])
d.text((left, 390), "PARCHEESI", font=font(170), fill=C["hot"], stroke_width=6, stroke_fill=C["ink"])
d.text((left, 590), "2026 CHAMPIONSHIP", font=font(54), fill=C["muted"])
d.text((left, 670), "Five players. One tiny crown.", font=font(48), fill=C["ink"])
d.text((left, 728), "An entire year of bragging rights.", font=font(42, False), fill=C["muted"])
rx0, ry0, rx1, ry1 = 1505, 265, 2180, 760
d.rounded_rectangle([rx0+14, ry0+16, rx1+14, ry1+16], radius=38, fill=C["ink"])
d.rounded_rectangle([rx0, ry0, rx1, ry1], radius=38, fill=C["paper2"], outline=C["ink"], width=7)
d.text((rx0+46, ry0+44), "THE GREAT", font=font(36), fill=C["muted"])
d.text((rx0+46, ry0+92), "TITLE RACE", font=font(66), fill=C["ink"])
crown(d, (rx0+rx1)/2, ry0+250, 170, width=16)
d.text((rx0+46, ry0+360), "STATS • STREAKS • GLORY", font=font(28), fill=C["muted"])
by0, cell = 865, 78
for row in range(4):
    for col in range(26):
        fill = C["paper2"] if (row+col) % 2 == 0 else "#eadfbf"
        d.rectangle([x0+8+col*cell, by0+row*cell, min(x1-8, x0+8+(col+1)*cell), by0+(row+1)*cell], fill=fill)
for yy in range(by0, y1-8, cell):
    d.line([x0+8, yy, x1-8, yy], fill="#b7a785", width=3)
for xx in range(x0+8, x1-8, cell):
    d.line([xx, by0, xx, y1-8], fill="#b7a785", width=3)
players = [("BEN", C["blue"]), ("MOM", C["pink"]), ("DAD", C["green"]), ("ANDREW", C["orange"]), ("NATHAN", C["purple"])]
for (name, color), px in zip(players, [430, 800, 1200, 1590, 1980]):
    pawn(d, px, by0+145, 115, color, width=12)
    bb = d.textbbox((0, 0), name, font=font(26))
    d.rounded_rectangle([px-bb[2]/2-18, by0+275, px+bb[2]/2+18, by0+320], radius=15, fill=C["paper2"], outline=C["ink"], width=4)
    d.text((px-bb[2]/2, by0+282), name, font=font(26), fill=C["ink"])
og.resize((1200, 630), Image.Resampling.LANCZOS).save(ASSETS / "og-share.png", optimize=True)

(ASSETS / "safari-pinned-tab.svg").write_text('''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M32 7a10 10 0 1 1 0 20 10 10 0 0 1 0-20Zm-8 22h16l4 14 9 5v9H11v-9l9-5 4-14Z"/></svg>\n''')
manifest = {
    "name": "Family Parcheesi · 2026 Championship",
    "short_name": "Parcheesi",
    "description": "The family Parcheesi championship: standings, streaks, stats, and the great 2026 race.",
    "start_url": "./", "scope": "./", "display": "standalone",
    "background_color": C["paper"], "theme_color": C["hot"],
    "icons": [
        {"src": "./assets/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
        {"src": "./assets/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
    ],
}
(ROOT / "site.webmanifest").write_text(json.dumps(manifest, indent=2) + "\n")
