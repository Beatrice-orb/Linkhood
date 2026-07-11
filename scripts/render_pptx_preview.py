from __future__ import annotations

import os
import zipfile
import xml.etree.ElementTree as ET
from PIL import Image, ImageDraw, ImageFont


ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
PPTX = os.path.join(ROOT, "搭把手_路演版_14页_2026-07-12.pptx")
OUT = os.path.join(ROOT, "搭把手_路演版_联系表.png")

NS = {
    "a": "http://schemas.openxmlformats.org/drawingml/2006/main",
    "p": "http://schemas.openxmlformats.org/presentationml/2006/main",
}

CANVAS_WIDTH = 1300
SCALE = CANVAS_WIDTH / 11887200
FONT_PATHS = [
    "/System/Library/Fonts/PingFang.ttc",
    "/System/Library/Fonts/STHeiti Medium.ttc",
    "/System/Library/Fonts/Supplemental/Arial Unicode.ttf",
]
FONT_PATH = next((path for path in FONT_PATHS if os.path.exists(path)), None)


def font(size, bold=False):
    px = max(5, int(size * 100 / 72))
    if FONT_PATH:
        return ImageFont.truetype(FONT_PATH, px, index=2 if bold and FONT_PATH.endswith(".ttc") else 0)
    return ImageFont.load_default()


def color(node, default="#000000"):
    if node is None:
        return default
    srgb = node.find(".//a:srgbClr", NS)
    return f"#{srgb.get('val')}" if srgb is not None else default


def box_from_xfrm(xfrm):
    off = xfrm.find("a:off", NS)
    ext = xfrm.find("a:ext", NS)
    x = int(int(off.get("x")) * SCALE)
    y = int(int(off.get("y")) * SCALE)
    w = int(int(ext.get("cx")) * SCALE)
    h = int(int(ext.get("cy")) * SCALE)
    return x, y, x + w, y + h


def draw_text(draw, box, paragraphs, size, fill, bold=False, align="l"):
    x1, y1, x2, y2 = box
    fnt = font(size, bold)
    lines = []
    for paragraph in paragraphs:
        if not paragraph:
            lines.append("")
            continue
        max_width = max(8, x2 - x1 - 8)
        current = ""
        for char in paragraph:
            trial = current + char
            if draw.textbbox((0, 0), trial, font=fnt)[2] <= max_width or not current:
                current = trial
            else:
                lines.append(current)
                current = char
        lines.append(current)
    line_h = max(7, int(size * 100 / 72 * 1.25))
    total_h = line_h * len(lines)
    yy = y1 + max(2, min(8, (y2 - y1 - total_h) // 2))
    for line in lines:
        tw = draw.textbbox((0, 0), line, font=fnt)[2]
        if align == "ctr":
            xx = x1 + (x2 - x1 - tw) // 2
        elif align == "r":
            xx = x2 - tw - 4
        else:
            xx = x1 + 4
        draw.text((xx, yy), line, font=fnt, fill=fill)
        yy += line_h
        if yy > y2:
            break


def render_slide(xml_bytes):
    root = ET.fromstring(xml_bytes)
    image = Image.new("RGB", (CANVAS_WIDTH, int(CANVAS_WIDTH * 5.1 / 13)), "#F8F7F0")
    draw = ImageDraw.Draw(image)
    tree = root.find(".//p:spTree", NS)
    for child in list(tree):
        tag = child.tag.split("}")[-1]
        if tag == "sp":
            xfrm = child.find("p:spPr/a:xfrm", NS)
            if xfrm is None:
                continue
            box = box_from_xfrm(xfrm)
            fill_node = child.find("p:spPr/a:solidFill", NS)
            no_fill = child.find("p:spPr/a:noFill", NS) is not None
            geom = child.find("p:spPr/a:prstGeom", NS)
            radius = 10 if geom is not None and geom.get("prst") == "roundRect" else 0
            line_node = child.find("p:spPr/a:ln/a:solidFill", NS)
            outline = color(line_node, None) if line_node is not None else None
            if fill_node is not None and not no_fill:
                draw.rounded_rectangle(box, radius=radius, fill=color(fill_node, "#FFFFFF"), outline=outline, width=1)
            elif outline:
                draw.rounded_rectangle(box, radius=radius, outline=outline, width=1)
            tx = child.find("p:txBody", NS)
            if tx is not None:
                paragraphs = []
                for p in tx.findall("a:p", NS):
                    paragraphs.append("".join(t.text or "" for t in p.findall(".//a:t", NS)))
                rpr = tx.find(".//a:rPr", NS)
                size = int(rpr.get("sz", "1000")) / 100 if rpr is not None else 10
                bold = rpr is not None and rpr.get("b") == "1"
                fill = color(rpr.find("a:solidFill", NS) if rpr is not None else None, "#17313B")
                ppr = tx.find("a:p/a:pPr", NS)
                align = ppr.get("alg", "l") if ppr is not None else "l"
                draw_text(draw, box, paragraphs, size, fill, bold, align)
        elif tag == "cxnSp":
            xfrm = child.find("p:spPr/a:xfrm", NS)
            if xfrm is None:
                continue
            x1, y1, x2, y2 = box_from_xfrm(xfrm)
            ln = child.find("p:spPr/a:ln", NS)
            draw.line((x1, y1, x2, y2), fill=color(ln, "#E5E3DA"), width=1)
    return image


def main():
    slides = []
    with zipfile.ZipFile(PPTX) as z:
        index = 1
        while f"ppt/slides/slide{index}.xml" in z.namelist():
            slides.append(render_slide(z.read(f"ppt/slides/slide{index}.xml")))
            index += 1
    thumb_w, thumb_h = 650, 255
    sheet = Image.new("RGB", (thumb_w * 2, thumb_h * 7), "#D9DDD8")
    label_draw = ImageDraw.Draw(sheet)
    for i, slide in enumerate(slides):
        thumb = slide.resize((thumb_w, thumb_h), Image.LANCZOS)
        x = (i % 2) * thumb_w
        y = (i // 2) * thumb_h
        sheet.paste(thumb, (x, y))
        label_draw.rectangle((x + 8, y + 8, x + 40, y + 28), fill="#17313B")
        label_draw.text((x + 15, y + 10), str(i + 1), font=font(8, True), fill="#FFFFFF")
    sheet.save(OUT)
    print(OUT)


if __name__ == "__main__":
    main()
