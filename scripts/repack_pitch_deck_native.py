from __future__ import annotations

import os
import zipfile
import xml.etree.ElementTree as ET


ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
SOURCE = os.path.join(ROOT, "搭把手_路演版_14页_2026-07-12.pptx")
TEMPLATE = "/Users/apple/Downloads/【汇报作业参考模板】工银瑞信-内训师模板/4.个人微课标准模板 2.0.pptx"
OUT = os.path.join(ROOT, "搭把手_路演版_14页_正式修复版_2026-07-12.pptx")

P_NS = "http://schemas.openxmlformats.org/presentationml/2006/main"
R_NS = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
PKG_NS = "http://schemas.openxmlformats.org/package/2006/relationships"
APP_NS = "http://schemas.openxmlformats.org/officeDocument/2006/extended-properties"
CP_NS = "http://schemas.openxmlformats.org/package/2006/metadata/core-properties"
DC_NS = "http://purl.org/dc/elements/1.1/"

ET.register_namespace("p", P_NS)
ET.register_namespace("r", R_NS)
ET.register_namespace("", PKG_NS)


def xml_bytes(element):
    return b'<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' + ET.tostring(element, encoding="utf-8")


def main():
    with zipfile.ZipFile(TEMPLATE) as template_zip, zipfile.ZipFile(SOURCE) as source_zip:
        files = {name: template_zip.read(name) for name in template_zip.namelist()}

        for index in range(1, 15):
            files[f"ppt/slides/slide{index}.xml"] = source_zip.read(f"ppt/slides/slide{index}.xml")

        presentation = ET.fromstring(files["ppt/presentation.xml"])
        slide_list = presentation.find(f"{{{P_NS}}}sldIdLst")
        slide_ids = list(slide_list)
        removed_rids = []
        for slide_id in slide_ids[14:]:
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

        core = ET.fromstring(files["docProps/core.xml"])
        title = core.find(f"{{{DC_NS}}}title")
        if title is not None:
            title.text = "搭把手路演版"
        subject = core.find(f"{{{DC_NS}}}subject")
        if subject is not None:
            subject.text = "全龄社区邻里服务数字平台"
        files["docProps/core.xml"] = xml_bytes(core)

        with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as output_zip:
            for name, payload in files.items():
                output_zip.writestr(name, payload)

    print(OUT)


if __name__ == "__main__":
    main()
