from __future__ import annotations

import os
import zipfile
import xml.etree.ElementTree as ET


ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
TEMPLATE = "/Users/apple/Downloads/【汇报作业参考模板】工银瑞信-内训师模板/4.个人微课标准模板 2.0.pptx"
IMAGE_DIR = os.path.join(ROOT, "搭把手_路演版_高清页面")
OUT = os.path.join(ROOT, "搭把手_路演版_14页_放映保底版_2026-07-12.pptx")

P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
CT_NS = "http://schemas.openxmlformats.org/package/2006/content-types"
APP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"

ET.register_namespace("p", P_NS)
ET.register_namespace("r", R_NS)
ET.register_namespace("", PKG_NS)


def xml_bytes(element):
    return b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + ET.tostring(element, encoding="utf-8")


def slide_xml(image_rid):
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr><p:pic><p:nvPicPr><p:cNvPr id="2" name="搭把手页面"/><p:cNvPicPr><a:picLocks noChangeAspect="1"/></p:cNvPicPr><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="{image_rid}"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="11887200" cy="4663440"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:ln><a:noFill/></a:ln></p:spPr></p:pic></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'''.encode("utf-8")


def main():
    with zipfile.ZipFile(TEMPLATE) as template_zip:
        files = {name: template_zip.read(name) for name in template_zip.namelist()}

    for index in range(1, 15):
        rel_name = f"ppt/slides/_rels/slide{index}.xml.rels"
        rel_root = ET.fromstring(files[rel_name])
        layout_relation = next(rel for rel in rel_root if rel.get("Type", "").endswith("/slideLayout"))
        layout_target = layout_relation.get("Target")
        image_name = f"dabashou-slide-{index:02d}.png"
        files[f"ppt/media/{image_name}"] = open(os.path.join(IMAGE_DIR, f"slide-{index:02d}.png"), "rb").read()
        files[f"ppt/slides/slide{index}.xml"] = slide_xml("rId2")
        files[rel_name] = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="{layout_target}"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/{image_name}"/></Relationships>'''.encode("utf-8")

    presentation = ET.fromstring(files["ppt/presentation.xml"])
    slide_list = presentation.find(f"{{{P_NS}}}sldIdLst")
    removed_rids = []
    for slide_id in list(slide_list)[14:]:
        removed_rids.append(slide_id.get(f"{{{R_NS}}}id"))
        slide_list.remove(slide_id)
    slide_size = presentation.find(f"{{{P_NS}}}sldSz")
    slide_size.set("cx", "11887200")
    slide_size.set("cy", "4663440")
    slide_size.set("type", "custom")
    files["ppt/presentation.xml"] = xml_bytes(presentation)

    rels = ET.fromstring(files["ppt/_rels/presentation.xml.rels"])
    for relation in list(rels):
        if relation.get("Id") in removed_rids:
            rels.remove(relation)
    files["ppt/_rels/presentation.xml.rels"] = xml_bytes(rels)

    app = ET.fromstring(files["docProps/app.xml"])
    slides = app.find(f"{{{APP_NS}}}Slides")
    if slides is not None:
        slides.text = "14"
    files["docProps/app.xml"] = xml_bytes(app)

    content_types = ET.fromstring(files["[Content_Types].xml"])
    if not any(item.get("Extension") == "png" for item in content_types):
        content_types.insert(0, ET.Element(f"{{{CT_NS}}}Default", Extension="png", ContentType="image/png"))
    files["[Content_Types].xml"] = xml_bytes(content_types)

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as output_zip:
        for name, payload in files.items():
            output_zip.writestr(name, payload)
    print(OUT)


if __name__ == "__main__":
    main()
