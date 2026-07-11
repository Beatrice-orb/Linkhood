from __future__ import annotations

import os
import zipfile

import render_pptx_preview as renderer


ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
PPTX = os.path.join(ROOT, "搭把手_路演版_14页_2026-07-12.pptx")
OUT_DIR = os.path.join(ROOT, "搭把手_路演版_高清页面")


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    renderer.CANVAS_WIDTH = 2600
    renderer.SCALE = renderer.CANVAS_WIDTH / 11887200
    with zipfile.ZipFile(PPTX) as archive:
        for index in range(1, 15):
            image = renderer.render_slide(archive.read(f"ppt/slides/slide{index}.xml"))
            image.save(os.path.join(OUT_DIR, f"slide-{index:02d}.png"), optimize=True)
    print(OUT_DIR)


if __name__ == "__main__":
    main()
