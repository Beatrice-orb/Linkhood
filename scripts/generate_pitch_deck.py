from __future__ import annotations

import html
import os
import zipfile
from datetime import datetime, timezone


ROOT = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
OUT = os.path.join(ROOT, "搭把手_路演版_14页_2026-07-12.pptx")

W = 11887200  # 13 inches
H = 4663440   # 5.1 inches

COLORS = {
    "canvas": "F8F7F0",
    "surface": "FFFFFF",
    "ink": "17313B",
    "muted": "5A6E74",
    "subtle": "94A4A8",
    "jade": "2F6B5F",
    "jade2": "3D8274",
    "jade_light": "E8F2F3",
    "coral": "F06A4B",
    "coral_light": "FFF0EA",
    "amber": "E9A23B",
    "amber_light": "FDF5E6",
    "line": "E5E3DA",
    "blue_light": "E8EEF5",
    "blue": "506D91",
}

FONT = "PingFang SC"
NUM_FONT = "Avenir Next Condensed"


def esc(value: str) -> str:
    return html.escape(str(value), quote=False)


def emu(value: float) -> int:
    return int(value * 914400)


class Slide:
    def __init__(self, index: int, section: str, title: str, subtitle: str = ""):
        self.index = index
        self.items: list[str] = []
        self.shape_id = 2
        self.rect(0, 0, 13, 5.1, COLORS["canvas"], line=None, radius=False)
        if section:
            self.text(0.48, 0.23, 1.5, 0.22, section.upper(), 9, COLORS["jade"], bold=True)
        if title:
            self.text(0.48, 0.50, 11.7, 0.48, title, 25, COLORS["ink"], bold=True)
        if subtitle:
            self.text(0.50, 0.98, 11.5, 0.30, subtitle, 10.5, COLORS["muted"])

    def _id(self) -> int:
        value = self.shape_id
        self.shape_id += 1
        return value

    def rect(self, x, y, w, h, fill, line=COLORS["line"], radius=True, transparency=0):
        sid = self._id()
        geom = "roundRect" if radius else "rect"
        line_xml = '<a:ln><a:noFill/></a:ln>' if line is None else f'<a:ln w="9525"><a:solidFill><a:srgbClr val="{line}"/></a:solidFill></a:ln>'
        alpha = f'<a:alpha val="{100000-transparency*1000}"/>' if transparency else ""
        self.items.append(f'''<p:sp>
<p:nvSpPr><p:cNvPr id="{sid}" name="Shape {sid}"/><p:cNvSpPr/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm>
<a:prstGeom prst="{geom}"><a:avLst/></a:prstGeom><a:solidFill><a:srgbClr val="{fill}">{alpha}</a:srgbClr></a:solidFill>{line_xml}</p:spPr>
</p:sp>''')

    def line(self, x1, y1, x2, y2, color=COLORS["line"], width=1.5, dash=None):
        sid = self._id()
        dash_xml = f'<a:prstDash val="{dash}"/>' if dash else ""
        self.items.append(f'''<p:cxnSp><p:nvCxnSpPr><p:cNvPr id="{sid}" name="Line {sid}"/><p:cNvCxnSpPr/><p:nvPr/></p:nvCxnSpPr>
<p:spPr><a:xfrm><a:off x="{emu(x1)}" y="{emu(y1)}"/><a:ext cx="{emu(x2-x1)}" cy="{emu(y2-y1)}"/></a:xfrm><a:prstGeom prst="line"><a:avLst/></a:prstGeom>
<a:ln w="{int(width*12700)}"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill>{dash_xml}</a:ln></p:spPr></p:cxnSp>''')

    def text(self, x, y, w, h, text, size=12, color=COLORS["ink"], bold=False, align="l", valign="t", font=FONT, margin=0.03, fit=True):
        sid = self._id()
        paragraphs = str(text).split("\n")
        ps = []
        for paragraph in paragraphs:
            ps.append(f'''<a:p><a:pPr alg="{align}"/><a:r><a:rPr lang="zh-CN" sz="{int(size*100)}" b="{1 if bold else 0}" dirty="0"><a:solidFill><a:srgbClr val="{color}"/></a:solidFill><a:latin typeface="{esc(font)}"/><a:ea typeface="{esc(font)}"/></a:rPr><a:t>{esc(paragraph)}</a:t></a:r><a:endParaRPr lang="zh-CN" sz="{int(size*100)}"/></a:p>''')
        autofit = '<a:normAutofit fontScale="90000" lnSpcReduction="10000"/>' if fit else ""
        self.items.append(f'''<p:sp>
<p:nvSpPr><p:cNvPr id="{sid}" name="Text {sid}"/><p:cNvSpPr txBox="1"/><p:nvPr/></p:nvSpPr>
<p:spPr><a:xfrm><a:off x="{emu(x)}" y="{emu(y)}"/><a:ext cx="{emu(w)}" cy="{emu(h)}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom><a:noFill/><a:ln><a:noFill/></a:ln></p:spPr>
<p:txBody><a:bodyPr wrap="square" anchor="{valign}" lIns="{emu(margin)}" rIns="{emu(margin)}" tIns="{emu(margin)}" bIns="{emu(margin)}">{autofit}</a:bodyPr><a:lstStyle/>{''.join(ps)}</p:txBody></p:sp>''')

    def pill(self, x, y, w, text, fill=COLORS["jade_light"], color=COLORS["jade"]):
        self.rect(x, y, w, 0.30, fill, line=None, radius=True)
        self.text(x, y + 0.02, w, 0.24, text, 8.5, color, bold=True, align="ctr", valign="ctr")

    def metric(self, x, y, w, number, label, note="", accent=COLORS["jade"]):
        self.rect(x, y, w, 1.45, COLORS["surface"], COLORS["line"], radius=True)
        self.rect(x, y, 0.08, 1.45, accent, line=None, radius=False)
        self.text(x + 0.22, y + 0.18, w - 0.35, 0.50, number, 25, accent, bold=True, font=NUM_FONT)
        self.text(x + 0.23, y + 0.72, w - 0.38, 0.28, label, 11, COLORS["ink"], bold=True)
        if note:
            self.text(x + 0.23, y + 1.04, w - 0.38, 0.25, note, 7.5, COLORS["muted"])

    def card(self, x, y, w, h, title, body, accent=COLORS["jade"], icon=None, fill=COLORS["surface"]):
        self.rect(x, y, w, h, fill, COLORS["line"], radius=True)
        tx = x + 0.20
        if icon:
            self.rect(x + 0.18, y + 0.18, 0.36, 0.36, COLORS["jade_light"], line=None, radius=True)
            self.text(x + 0.18, y + 0.19, 0.36, 0.30, icon, 12, accent, bold=True, align="ctr", valign="ctr")
            tx = x + 0.65
        self.text(tx, y + 0.17, w - (tx - x) - 0.18, 0.30, title, 11, COLORS["ink"], bold=True)
        self.text(x + 0.20, y + 0.58, w - 0.40, h - 0.70, body, 8.4, COLORS["muted"])

    def footer(self, source="", page=True):
        self.line(0.48, 4.78, 12.52, 4.78, COLORS["line"], 0.7)
        if source:
            self.text(0.50, 4.83, 10.9, 0.17, source, 5.6, COLORS["subtle"], fit=False)
        if page:
            self.text(11.65, 4.82, 0.38, 0.18, f"{self.index:02d}", 7, COLORS["subtle"], bold=True, align="r")
            self.text(12.03, 4.82, 0.47, 0.18, "搭把手", 7, COLORS["jade"], bold=True, align="r")

    def phone(self, x, y, w, h, title, mode="resident"):
        self.rect(x, y, w, h, "17313B", line=None, radius=True)
        self.rect(x + 0.07, y + 0.08, w - 0.14, h - 0.16, "F7F8F4", line=None, radius=True)
        self.rect(x + w * 0.37, y + 0.03, w * 0.26, 0.08, "17313B", line=None, radius=True)
        self.text(x + 0.18, y + 0.18, w - 0.36, 0.24, title, 8.2, COLORS["ink"], bold=True)
        if mode == "resident":
            self.rect(x + 0.18, y + 0.52, w - 0.36, 0.78, "DFEEE8", line=None, radius=True)
            self.text(x + 0.30, y + 0.64, w - 0.60, 0.22, "今天需要哪方面的搭把手？", 8.5, COLORS["ink"], bold=True)
            self.rect(x + 0.29, y + 0.96, w - 0.58, 0.22, COLORS["surface"], COLORS["line"], radius=True)
            self.text(x + 0.38, y + 0.99, w - 0.76, 0.14, "搜索社区服务", 5.8, COLORS["subtle"])
            for i, (name, color) in enumerate([("公共服务", COLORS["jade_light"]), ("邻里互助", COLORS["coral_light"]), ("社区活动", COLORS["amber_light"])]):
                yy = y + 1.48 + i * 0.58
                self.rect(x + 0.18, yy, w - 0.36, 0.46, COLORS["surface"], COLORS["line"], radius=True)
                self.rect(x + 0.28, yy + 0.09, 0.28, 0.28, color, line=None, radius=True)
                self.text(x + 0.66, yy + 0.09, w - 0.96, 0.16, name, 7.2, COLORS["ink"], bold=True)
                self.text(x + 0.66, yy + 0.26, w - 0.96, 0.11, "查看附近可用信息与状态", 5.2, COLORS["muted"])
            self.rect(x + 0.18, y + h - 0.55, w - 0.36, 0.35, COLORS["surface"], COLORS["line"], radius=True)
            self.text(x + 0.22, y + h - 0.47, w - 0.44, 0.16, "地图        邻里圈        我的", 6.2, COLORS["jade"], bold=True, align="ctr")
        else:
            self.rect(x + 0.18, y + 0.55, w - 0.36, 0.64, COLORS["coral"], line=None, radius=True)
            self.text(x + 0.25, y + 0.73, w - 0.50, 0.25, "一键求助", 12, COLORS["surface"], bold=True, align="ctr")
            for i, label in enumerate(["报平安", "防诈骗", "用药提醒", "申请帮扶"]):
                col = i % 2
                row = i // 2
                xx = x + 0.18 + col * ((w - 0.28) / 2)
                yy = y + 1.42 + row * 0.76
                self.rect(xx, yy, (w - 0.46) / 2, 0.62, COLORS["surface"], COLORS["line"], radius=True)
                self.text(xx + 0.05, yy + 0.20, (w - 0.56) / 2, 0.22, label, 8.3, COLORS["ink"], bold=True, align="ctr")

    def desktop(self, x, y, w, h):
        self.rect(x, y, w, h, "17313B", line=None, radius=True)
        self.rect(x + 0.08, y + 0.09, w - 0.16, h - 0.22, "F7F8F4", line=None, radius=False)
        self.rect(x + 0.08, y + 0.09, 1.15, h - 0.22, "24483F", line=None, radius=False)
        self.text(x + 0.24, y + 0.28, 0.82, 0.22, "搭把手", 9, COLORS["surface"], bold=True)
        for i, label in enumerate(["今日工作台", "公共服务", "活动运营", "居民反馈"]):
            self.text(x + 0.20, y + 0.82 + i * 0.48, 0.92, 0.18, label, 6.3, "DDE8E4", bold=i == 0)
        self.text(x + 1.46, y + 0.26, w - 1.75, 0.25, "社区今日工作台", 10, COLORS["ink"], bold=True)
        for i, (num, label, fill) in enumerate([("3", "待核验供给", COLORS["amber_light"]), ("2", "今日活动", COLORS["jade_light"]), ("1", "居民跟进", COLORS["coral_light"])]):
            xx = x + 1.45 + i * 1.34
            self.rect(xx, y + 0.70, 1.14, 0.75, COLORS["surface"], COLORS["line"], radius=True)
            self.text(xx + 0.12, y + 0.82, 0.90, 0.27, num, 15, COLORS["jade"], bold=True, font=NUM_FONT)
            self.text(xx + 0.12, y + 1.15, 0.90, 0.13, label, 5.7, COLORS["muted"])
        self.rect(x + 1.45, y + 1.68, w - 1.75, 1.30, COLORS["surface"], COLORS["line"], radius=True)
        self.text(x + 1.64, y + 1.85, 1.9, 0.20, "真实供给审核队列", 8.2, COLORS["ink"], bold=True)
        for i, row in enumerate(["西红门医院三伏贴 · 3 项待核验", "暑期研学营 · 余量待确认", "7 月招聘活动 · 明细待拆分"]):
            yy = y + 2.18 + i * 0.23
            self.text(x + 1.65, yy, w - 2.15, 0.14, row, 5.8, COLORS["muted"])

    def xml(self) -> str:
        return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main">
<p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr>{''.join(self.items)}</p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sld>'''


def build_slides() -> list[Slide]:
    slides: list[Slide] = []

    s = Slide(1, "2026 西红门路演", "")
    s.text(0.62, 0.55, 5.3, 0.78, "搭把手", 40, COLORS["ink"], bold=True)
    s.text(0.66, 1.42, 5.5, 0.40, "邻里搭把手，服务家门口", 18, COLORS["jade"], bold=True)
    s.text(0.66, 2.02, 5.6, 0.60, "全龄友好的社区生活地图\n把居民互助、真实公共服务与社区运营连成闭环", 12.5, COLORS["muted"])
    s.pill(0.66, 3.04, 1.18, "居民端")
    s.pill(1.94, 3.04, 1.18, "社区端", COLORS["amber_light"], "A36E12")
    s.pill(3.22, 3.04, 1.18, "社工端", COLORS["coral_light"], COLORS["coral"])
    s.text(0.66, 3.62, 5.5, 0.28, "React + Express + SQLite 三端全栈 MVP", 10, COLORS["ink"], bold=True)
    # abstract community map
    s.rect(6.55, 0.42, 5.80, 3.95, COLORS["surface"], COLORS["line"], radius=True)
    s.text(6.94, 0.72, 4.9, 0.28, "一张可信的社区生活地图", 14, COLORS["ink"], bold=True)
    nodes = [(7.35, 1.55, "公共服务", COLORS["jade"]), (9.28, 1.25, "邻里互助", COLORS["coral"]), (10.92, 2.10, "社区活动", COLORS["amber"]), (8.88, 3.08, "社工跟进", COLORS["blue"]), (7.10, 2.90, "积分信用", COLORS["jade2"])]
    for i in range(len(nodes)):
        a = nodes[i]
        b = nodes[(i + 1) % len(nodes)]
        s.line(a[0] + 0.52, a[1] + 0.25, b[0] + 0.52, b[1] + 0.25, COLORS["line"], 1.3)
    for x, y, label, color in nodes:
        s.rect(x, y, 1.05, 0.52, color, line=None, radius=True)
        s.text(x, y + 0.14, 1.05, 0.20, label, 7.4, COLORS["surface"], bold=True, align="ctr")
    s.text(8.78, 2.17, 1.30, 0.50, "搭\n把\n手", 13, COLORS["jade"], bold=True, align="ctr")
    s.footer("公开服务数据快照：2026-07-11｜居民与运营数据为演示账户，不代表真实试点成效", page=False)
    slides.append(s)

    s = Slide(2, "01 / RESIDENT NEED", "居民不是没有互助意愿，而是缺少可信连接", "区域样本显示：想被帮助的人很多，愿意帮助的人也很多")
    s.metric(0.52, 1.46, 3.65, "95.52%", "遇到困难时，希望获得邻居支持", "成都 7 个社区，n=335，2024", COLORS["jade"])
    s.metric(4.34, 1.46, 3.65, "96.12%", "愿意在邻居遇到困难时提供帮助", "同一调查，不外推全国", COLORS["coral"])
    s.metric(8.16, 1.46, 3.65, "30.75%", "家庭过去三年实际经历过困境", "生病、意外、失业等现实事件", COLORS["amber"])
    s.rect(0.52, 3.18, 11.29, 1.10, COLORS["surface"], COLORS["line"], radius=True)
    s.text(0.78, 3.43, 2.2, 0.34, "高意愿，弱连接", 15, COLORS["ink"], bold=True)
    s.text(3.02, 3.30, 2.25, 0.25, "72%", 17, COLORS["jade"], bold=True, font=NUM_FONT)
    s.text(3.02, 3.67, 2.25, 0.20, "认为邻里关系重要", 8, COLORS["muted"])
    s.text(5.18, 3.30, 2.25, 0.25, "77%", 17, COLORS["coral"], bold=True, font=NUM_FONT)
    s.text(5.18, 3.67, 2.25, 0.20, "愿在紧急时援助邻居", 8, COLORS["muted"])
    s.text(7.36, 3.30, 2.25, 0.25, "2.7 / 5", 17, COLORS["amber"], bold=True, font=NUM_FONT)
    s.text(7.36, 3.67, 2.25, 0.20, "邻里熟悉度均分", 8, COLORS["muted"])
    s.text(9.66, 3.33, 1.78, 0.50, "意愿没有自动\n变成可执行互助", 9, COLORS["ink"], bold=True, align="ctr")
    s.footer("来源：益宝《社区互助调研报告（一）》2024.7-8，成都7社区，n=335；鄰舍輔導會《邻里关系调查》2023.7-8，n=1,277（香港样本）")
    slides.append(s)

    s = Slide(3, "02 / FULL-AGE SIGNAL", "搭把手不是老年应用，而是全年龄的小事互助入口", "人口结构说明服务规模，平台讨论说明议题热度，真实需求仍需本地试点验证")
    s.card(0.52, 1.42, 2.45, 1.28, "青年与新住民", "代取快递｜借工具｜拼单\n找活动搭子｜认识邻居", COLORS["jade"], "青")
    s.card(3.10, 1.42, 2.45, 1.28, "家庭与儿童", "临时照应｜闲置交换\n亲子活动｜托管信息", COLORS["coral"], "家")
    s.card(0.52, 2.88, 2.45, 1.28, "中年照护者", "帮助异地父母｜陪诊信息\n社区服务代查｜应急照应", COLORS["amber"], "护")
    s.card(3.10, 2.88, 2.45, 1.28, "老年居民", "数字协助｜助医代办\n陪伴活动｜关怀提醒", COLORS["blue"], "老")
    s.rect(5.86, 1.42, 2.63, 2.74, COLORS["jade"], line=None, radius=True)
    s.text(6.17, 1.79, 2.00, 0.58, "10.40 亿", 28, COLORS["surface"], bold=True, align="ctr", font=NUM_FONT)
    s.text(6.18, 2.48, 2.00, 0.34, "短视频用户", 13, COLORS["surface"], bold=True, align="ctr")
    s.text(6.20, 2.96, 1.96, 0.62, "使用率 93.8%\n大众平台是需求信号源\n不是全国意愿调查", 8.3, "E6F3EF", align="ctr")
    s.rect(8.80, 1.42, 3.02, 2.74, COLORS["surface"], COLORS["line"], radius=True)
    s.text(9.05, 1.68, 2.52, 0.28, "路演前 24 小时热度快照", 11, COLORS["ink"], bold=True)
    for i, (p, kws) in enumerate([("小红书", "互助父母｜搭子养老"), ("抖音", "邻里互助｜远亲近邻"), ("快手", "邻里帮忙｜志愿助老")]):
        yy = 2.12 + i * 0.57
        s.pill(9.05, yy, 0.72, p, COLORS["jade_light"] if i == 0 else COLORS["amber_light"], COLORS["jade"] if i == 0 else "9A6818")
        s.text(9.89, yy + 0.04, 1.63, 0.20, kws, 7.2, COLORS["muted"])
    s.text(9.05, 3.82, 2.50, 0.20, "只记录平台原页、指标与时间", 7.3, COLORS["coral"], bold=True)
    s.footer("来源：CNNIC 第55次《中国互联网络发展状况统计报告》；国家统计局2024年统计公报（60岁及以上人口3.1031亿，仅作老年子场景规模背景）")
    slides.append(s)

    s = Slide(4, "03 / COMMUNITY NEED", "社区不是没有服务，而是供给分散、状态难核验", "西红门真实公开信息扫描，把社区端的日常工作量变成可观察证据")
    # pipeline
    metrics = [("18", "公开来源节点"), ("16", "真实服务/活动"), ("11", "当前或待核验"), ("10/11", "仍有字段缺失")]
    for i, (n, lab) in enumerate(metrics):
        xx = 0.55 + i * 2.05
        s.rect(xx, 1.48, 1.70, 1.10, COLORS["surface"], COLORS["line"], radius=True)
        s.text(xx + 0.12, 1.65, 1.46, 0.38, n, 22, COLORS["jade"] if i < 3 else COLORS["coral"], bold=True, align="ctr", font=NUM_FONT)
        s.text(xx + 0.12, 2.14, 1.46, 0.20, lab, 8, COLORS["muted"], bold=True, align="ctr")
        if i < 3:
            s.text(xx + 1.76, 1.83, 0.25, 0.22, "→", 13, COLORS["subtle"], bold=True, align="ctr")
    s.rect(8.80, 1.48, 3.03, 2.78, COLORS["surface"], COLORS["line"], radius=True)
    s.text(9.05, 1.72, 2.55, 0.28, "社区每天要完成的四件事", 12, COLORS["ink"], bold=True)
    for i, (num, text_) in enumerate([("01", "找来源：官网、公众号、平台"), ("02", "核字段：时间、余量、费用、地址"), ("03", "审发布：明确未知与有效期"), ("04", "接反馈：居民意向、社工跟进")]):
        yy = 2.16 + i * 0.48
        s.text(9.06, yy, 0.40, 0.20, num, 8, COLORS["coral"], bold=True)
        s.text(9.54, yy, 2.06, 0.22, text_, 8.2, COLORS["muted"], bold=i == 3)
    s.rect(0.55, 2.92, 7.90, 1.34, COLORS["jade_light"], line=None, radius=True)
    s.text(0.82, 3.16, 1.78, 0.34, "缺的不是活动数量", 13, COLORS["ink"], bold=True)
    s.text(2.72, 3.10, 5.35, 0.68, "而是一个把来源、审核、发布、到期复核和居民反馈串起来的工作台。\n公开来源不等于合作，计划容量不等于实时余量。", 9.2, COLORS["muted"])
    s.footer("来源：项目《2026-07-11 西红门公共服务供给扫描》及 sources.v0.1.json / activities.v0.1.json；16条记录均保留原文链接与核验时间")
    slides.append(s)

    s = Slide(5, "04 / POLICY", "政策需要的不是再建一个群，而是服务可达、数据复用、基层减负", "按相关度优先、同等相关度下时间优先，十五五方向优先于十四五表述")
    policies = [
        ("2026", "十五五：基层治理与基本公共服务", "服务可达、可反馈、可评估", "统一入口｜居民意向｜闭环反馈", COLORS["jade"]),
        ("2026", "互助性养老与城乡三级养老网络", "社区发现需求、组织互助、专业转介", "关怀版｜低风险互助｜社工任务", COLORS["coral"]),
        ("2024", "加强社区工作者队伍建设", "原则上每万城镇常住人口 18 人", "角色权限｜工作台｜任务协同", COLORS["amber"]),
        ("2024", "整治形式主义为基层减负", "减少重复采集、多头报送与无效留痕", "一次采集｜多端复用｜自动报表", COLORS["blue"]),
    ]
    for i, (year, title, need, product, color) in enumerate(policies):
        yy = 1.38 + i * 0.76
        s.rect(0.55, yy, 11.27, 0.62, COLORS["surface"], COLORS["line"], radius=True)
        s.pill(0.72, yy + 0.15, 0.68, year, color if i < 2 else COLORS["amber_light"], COLORS["surface"] if i < 2 else "8B631C")
        s.text(1.58, yy + 0.14, 2.85, 0.25, title, 9.5, COLORS["ink"], bold=True)
        s.text(4.55, yy + 0.14, 3.15, 0.25, need, 8.2, COLORS["muted"])
        s.text(7.92, yy + 0.14, 3.56, 0.25, product, 8.4, color, bold=True)
    s.rect(0.55, 4.48, 11.27, 0.20, COLORS["coral_light"], line=None, radius=True)
    s.text(0.72, 4.49, 10.93, 0.16, "答辩边界：2026年政策的正式文号、条款与覆盖率指标须在提交版附官方原文截图；本页不把政策目标包装成项目既有成效。", 6.3, COLORS["coral"], bold=True, align="ctr")
    s.footer("优先来源：十五五正式纲要/权威发布、民政部互助性养老与三级网络文件；中办国办《关于加强社区工作者队伍建设的意见》《整治形式主义为基层减负若干规定》")
    slides.append(s)

    s = Slide(6, "05 / SOLUTION", "一个入口，把发现需求、建立信任、完成服务和运营反馈连成闭环", "搭把手 = 社区生活地图 + 邻里互助 + 即时沟通 + 积分信用 + 运营工作台")
    steps = [("发现", "找服务\n看活动"), ("发起", "喊一声\n说清时间"), ("匹配", "同社区\n看信任线索"), ("完成", "私聊协作\n双方确认"), ("沉淀", "积分信用\n运营反馈")]
    for i, (head, body) in enumerate(steps):
        xx = 0.58 + i * 2.12
        color = COLORS["coral"] if i == 2 else COLORS["jade"]
        s.rect(xx, 1.48, 1.65, 1.33, COLORS["surface"], COLORS["line"], radius=True)
        s.rect(xx + 0.57, 1.68, 0.50, 0.50, color, line=None, radius=True)
        s.text(xx + 0.57, 1.80, 0.50, 0.20, str(i + 1), 10, COLORS["surface"], bold=True, align="ctr")
        s.text(xx + 0.20, 2.24, 1.25, 0.22, head, 11, COLORS["ink"], bold=True, align="ctr")
        s.text(xx + 0.20, 2.52, 1.25, 0.30, body, 7, COLORS["muted"], align="ctr")
        if i < 4:
            s.text(xx + 1.73, 1.98, 0.30, 0.25, "→", 15, COLORS["subtle"], bold=True, align="ctr")
    s.rect(0.58, 3.18, 3.52, 1.05, COLORS["jade_light"], line=None, radius=True)
    s.text(0.83, 3.40, 0.78, 0.26, "居民端", 12, COLORS["jade"], bold=True)
    s.text(1.63, 3.35, 2.18, 0.38, "愿意打开\n关键操作 3 步内完成", 8.3, COLORS["muted"])
    s.rect(4.40, 3.18, 3.52, 1.05, COLORS["amber_light"], line=None, radius=True)
    s.text(4.65, 3.40, 0.78, 0.26, "社区端", 12, "9A6818", bold=True)
    s.text(5.45, 3.35, 2.18, 0.38, "不重复录入\n行为自动形成运营数据", 8.3, COLORS["muted"])
    s.rect(8.22, 3.18, 3.52, 1.05, COLORS["coral_light"], line=None, radius=True)
    s.text(8.47, 3.40, 0.78, 0.26, "社工端", 12, COLORS["coral"], bold=True)
    s.text(9.27, 3.35, 2.18, 0.38, "有任务边界\n事实记录、授权与审核", 8.3, COLORS["muted"])
    s.footer("当前MVP已实现：公共服务审核发布、居民意向、邻里互助、私聊、积分结算、活动报名、社工跟进与审计日志")
    slides.append(s)

    s = Slide(7, "06 / RESIDENT DEMO", "居民端：找得到、喊得出、信得过", "普通版覆盖高频社区生活，关怀版降低数字能力门槛")
    s.phone(0.62, 1.30, 2.25, 3.10, "搭把手 · 社区地图", "resident")
    s.phone(3.08, 1.30, 2.25, 3.10, "搭把手 · 关怀版", "care")
    s.card(5.70, 1.32, 2.74, 1.17, "01 找服务", "公共服务、空间、活动、公告\n按社区和状态统一呈现", COLORS["jade"], "找")
    s.card(8.66, 1.32, 2.74, 1.17, "02 喊一声", "代取、借物、照看、闲置\n写清时间与积分", COLORS["coral"], "喊")
    s.card(5.70, 2.70, 2.74, 1.17, "03 看信任", "社区身份、信用、帮助次数\n高风险需求转人工", COLORS["amber"], "信")
    s.card(8.66, 2.70, 2.74, 1.17, "04 完成闭环", "一键响应、私聊协作\n双方确认后积分结算", COLORS["blue"], "成")
    s.text(5.74, 4.18, 5.64, 0.22, "真实演示路由：#/resident  ·  #/resident/services", 7.2, COLORS["jade"], bold=True, align="ctr")
    s.footer("界面示意依据项目设计系统绘制；正式路演前替换为真实运行截图。关怀版不是简单放大字体，而是减少信息密度、强化操作动词和风险提示。")
    slides.append(s)

    s = Slide(8, "07 / COMMUNITY DEMO", "社区与社工端：把一次服务从发现办到有反馈", "真实公开供给先核验再发布，居民意向形成聚合信号，社工按授权跟进")
    s.desktop(0.58, 1.30, 6.15, 3.15)
    s.phone(6.98, 1.30, 2.05, 3.15, "社工今日任务", "care")
    s.rect(9.32, 1.30, 2.50, 3.15, COLORS["surface"], COLORS["line"], radius=True)
    s.text(9.58, 1.56, 2.02, 0.26, "公共服务闭环", 12, COLORS["ink"], bold=True)
    flow = [("1", "接入公开来源"), ("2", "核验未知字段"), ("3", "社区审核发布"), ("4", "居民表达意向"), ("5", "社工任务跟进")]
    for i, (num, lab) in enumerate(flow):
        yy = 2.02 + i * 0.43
        s.rect(9.58, yy, 0.30, 0.30, COLORS["jade"] if i < 3 else COLORS["coral"], line=None, radius=True)
        s.text(9.58, yy + 0.06, 0.30, 0.14, num, 6.5, COLORS["surface"], bold=True, align="ctr")
        s.text(10.02, yy + 0.05, 1.48, 0.17, lab, 7.4, COLORS["muted"], bold=i == 4)
    s.footer("真实演示路由：#/tog/desktop/services · #/tog/desktop/workbench · #/tog/desktop/insights · #/tog/mobile/workbench · #/tog/mobile/visit")
    slides.append(s)

    s = Slide(9, "08 / TRUST & TECH", "信任来自可解释的流程，技术围绕真实业务边界搭建", "不做黑箱分数，不把公开来源说成合作，不把居民意向说成官方报名")
    s.text(0.58, 1.33, 5.10, 0.25, "四层信任与风险边界", 12, COLORS["ink"], bold=True)
    trust = [("社区身份", "确认在同一社区，不默认公开精确门牌"), ("行为记录", "互助完成、守约、活动签到与评价可解释"), ("状态确认", "积分先托管，双方确认完成后结算"), ("风险转介", "急救、借贷、进门照护转物业/社工/专业机构")]
    for i, (head, body) in enumerate(trust):
        yy = 1.76 + i * 0.58
        s.rect(0.58, yy, 5.15, 0.46, COLORS["surface"], COLORS["line"], radius=True)
        s.text(0.78, yy + 0.11, 1.05, 0.18, head, 8.3, COLORS["jade"] if i < 2 else COLORS["coral"], bold=True)
        s.text(1.92, yy + 0.10, 3.55, 0.20, body, 7.3, COLORS["muted"])
    s.text(6.18, 1.33, 5.58, 0.25, "当前全栈 MVP", 12, COLORS["ink"], bold=True)
    layers = [("React 19 + TypeScript + Vite", "居民 / 社区电脑 / 社工手机"), ("Express API + RBAC", "身份认证、角色权限、审计日志"), ("SQLite + 领域状态", "服务、活动、互助、聊天、积分、任务"), ("真实来源种子数据", "18 来源、16 服务、链接与核验状态")]
    for i, (head, body) in enumerate(layers):
        yy = 1.76 + i * 0.58
        fill = COLORS["jade"] if i == 1 else COLORS["surface"]
        s.rect(6.18, yy, 5.60, 0.46, fill, COLORS["line"] if i != 1 else None, radius=True)
        s.text(6.40, yy + 0.09, 2.23, 0.20, head, 8.2, COLORS["surface"] if i == 1 else COLORS["ink"], bold=True)
        s.text(8.72, yy + 0.09, 2.78, 0.20, body, 7.2, "E6F3EF" if i == 1 else COLORS["muted"])
    s.rect(6.18, 4.10, 5.60, 0.24, COLORS["amber_light"], line=None, radius=True)
    s.text(6.36, 4.12, 5.24, 0.17, "上线仍需：微信认证、内容安全、隐私政策、备份监控、限流与生产部署", 6.7, "8B631C", bold=True, align="ctr")
    s.footer("边界：居民“我想办理”仅为意向；公开服务来源不代表机构合作；医疗急救、借贷、进门照护不进入普通邻里互助。")
    slides.append(s)

    s = Slide(10, "09 / VALUE & MODEL", "一次居民操作，同时完成一次服务交付和一次数据沉淀", "居民省心、社区减负、治理可见，价值来自同一条业务链")
    s.card(0.56, 1.43, 3.46, 1.86, "居民｜把小事办成", "一个入口找服务、报名、预约和互助\n同社区信任线索降低寻找成本\n普通版与关怀版覆盖不同数字能力", COLORS["jade"], "居")
    s.card(4.22, 1.43, 3.46, 1.86, "社区｜把重复工作交给系统", "来源、审核、报名和反馈结构化沉淀\n需求类型、完成率与待跟进自动汇总\n社工入口直达居民，不重复登记", COLORS["amber"], "社")
    s.card(7.88, 1.43, 3.46, 1.86, "治理｜把服务效果看见", "从“办了多少活动”到“解决什么需求”\n识别高频诉求、低触达群体和资源变化\n标准模型支持多社区配置复制", COLORS["coral"], "治")
    s.rect(0.56, 3.61, 10.78, 0.74, COLORS["ink"], line=None, radius=True)
    s.text(0.83, 3.82, 2.12, 0.26, "B2G2C 起步", 13, COLORS["surface"], bold=True)
    s.text(3.02, 3.76, 2.35, 0.38, "街道 / 社区运营方\n长租公寓 / 园区采购", 8, "DDE8E4")
    s.text(5.58, 3.76, 2.26, 0.38, "实施与年度服务\n标准化 SaaS 订阅", 8, "DDE8E4")
    s.text(8.04, 3.76, 2.92, 0.38, "居民基础功能免费\n试点后验证成本与续费", 8, "FFDCD3")
    s.footer("不把“响应缩短40%”“工作量减少50%”等目标包装为已有成绩；试点重点测量人工登记时长、互助响应、活动触达、满意度与续费意愿。")
    slides.append(s)

    s = Slide(11, "10 / PILOT", "先跑通一个社区，再复制", "把最关键的产品假设变成可测量、可复盘的试点指标")
    stages = [("现在", "三端全栈 MVP", "真实服务来源入库\n业务闭环可演示"), ("0-3月", "可上线小程序", "社区认证、订阅消息\n隐私与生产部署"), ("3-6月", "标杆社区验证", "需求、留存、减负\n活动与空间触达"), ("6-12月", "区域配置复制", "运营 SOP、报表\n权限和接口标准")]
    for i, (time, title, body) in enumerate(stages):
        xx = 0.58 + i * 2.80
        s.rect(xx, 1.47, 2.42, 1.44, COLORS["surface"] if i else COLORS["jade"], COLORS["line"] if i else None, radius=True)
        s.pill(xx + 0.18, 1.65, 0.72, time, COLORS["jade_light"] if i else COLORS["surface"], COLORS["jade"])
        s.text(xx + 0.18, 2.07, 2.05, 0.25, title, 10, COLORS["surface"] if i == 0 else COLORS["ink"], bold=True)
        s.text(xx + 0.18, 2.43, 2.05, 0.32, body, 7.2, "E1F0EB" if i == 0 else COLORS["muted"])
        if i < 3:
            s.text(xx + 2.46, 2.00, 0.26, 0.24, "→", 14, COLORS["subtle"], bold=True, align="ctr")
    s.text(0.58, 3.27, 3.20, 0.25, "首个试点只看 5 个指标", 12, COLORS["ink"], bold=True)
    kpis = ["实际需求发生率", "互助响应与完成", "7/30日留存", "社区人工时长", "居民满意与风险"]
    for i, label in enumerate(kpis):
        xx = 0.58 + i * 2.20
        s.rect(xx, 3.68, 1.92, 0.55, COLORS["jade_light"] if i < 3 else COLORS["amber_light"], line=None, radius=True)
        s.text(xx + 0.08, 3.83, 1.76, 0.20, label, 8, COLORS["jade"] if i < 3 else "8B631C", bold=True, align="ctr")
    s.footer("建议首轮西红门/大兴探索性问卷 n≥120，按18-34岁、35-59岁、60岁及以上分层；明确便利样本边界，不外推全区。")
    slides.append(s)

    s = Slide(12, "THANK YOU", "")
    s.text(0.62, 0.64, 5.4, 0.68, "搭把手", 38, COLORS["ink"], bold=True)
    s.text(0.66, 1.42, 6.20, 0.40, "让居民找得到、喊得出、信得过", 19, COLORS["jade"], bold=True)
    s.text(0.66, 2.18, 5.60, 0.34, "一个入口", 11, COLORS["coral"], bold=True)
    s.text(1.68, 2.18, 4.55, 0.34, "连接互助、公共服务、活动与社工", 11, COLORS["ink"], bold=True)
    s.text(0.66, 2.75, 5.60, 0.34, "三端闭环", 11, COLORS["coral"], bold=True)
    s.text(1.68, 2.75, 4.55, 0.34, "居民使用，社区运营，社工跟进", 11, COLORS["ink"], bold=True)
    s.text(0.66, 3.32, 5.60, 0.34, "真实边界", 11, COLORS["coral"], bold=True)
    s.text(1.68, 3.32, 4.55, 0.34, "来源可溯、未知可见、效果待验证", 11, COLORS["ink"], bold=True)
    s.rect(7.12, 0.62, 4.64, 3.54, COLORS["surface"], COLORS["line"], radius=True)
    s.text(7.52, 1.08, 3.82, 0.36, "现场演示", 18, COLORS["ink"], bold=True, align="ctr")
    s.rect(8.38, 1.68, 1.32, 1.32, COLORS["jade_light"], COLORS["jade"], radius=False)
    s.text(8.38, 2.14, 1.32, 0.28, "二维码\n占位", 9, COLORS["jade"], bold=True, align="ctr")
    s.text(7.62, 3.29, 3.62, 0.44, "http://localhost:3000/#/demo\n部署后替换为公开演示地址", 8.5, COLORS["muted"], align="ctr")
    s.text(7.50, 3.82, 3.86, 0.22, "谢谢大家，期待交流", 11, COLORS["jade"], bold=True, align="ctr")
    s.footer("GitHub: Beatrice-orb/Linkhood｜团队名称、路演人、联系方式与主办方Logo请在提交前替换", page=False)
    slides.append(s)

    s = Slide(13, "APPENDIX A", "居民需求证据：什么能证明，什么不能证明", "答辩时先说证据等级和适用边界，再说数字")
    rows = [
        ("A 国家统计", "3.1031亿60+人口；10.40亿短视频用户", "说明规模与渠道覆盖", "不能直接等同需求比例"),
        ("B 区域样本", "成都n=335；香港n=1,277", "说明互助意愿与连接缺口", "不能外推全国或西红门"),
        ("C 本地扫描", "18来源、16供给、10/11字段待核验", "说明社区供给承接问题", "不是居民问卷或合作数"),
        ("D 平台快照", "小红书/抖音/快手关键词页面", "说明议题讨论热度", "播放量不等于参与人数"),
    ]
    headers = ["证据等级", "当前证据", "可以证明", "不能证明"]
    widths = [1.75, 3.20, 3.10, 3.10]
    xx = 0.55
    for head, ww in zip(headers, widths):
        s.rect(xx, 1.39, ww, 0.42, COLORS["jade"], line=None, radius=False)
        s.text(xx + 0.05, 1.50, ww - 0.10, 0.18, head, 8, COLORS["surface"], bold=True, align="ctr")
        xx += ww
    for r, row in enumerate(rows):
        yy = 1.84 + r * 0.61
        xx = 0.55
        for c, (value, ww) in enumerate(zip(row, widths)):
            fill = COLORS["surface"] if r % 2 == 0 else "FBFAF7"
            s.rect(xx, yy, ww, 0.58, fill, COLORS["line"], radius=False)
            s.text(xx + 0.10, yy + 0.13, ww - 0.20, 0.27, value, 7.2, COLORS["ink"] if c == 0 else COLORS["muted"], bold=c == 0, align="ctr" if c == 0 else "l")
            xx += ww
    s.rect(0.55, 4.34, 11.15, 0.26, COLORS["coral_light"], line=None, radius=True)
    s.text(0.72, 4.37, 10.81, 0.17, "删除：独居老人1.2亿、双职工家庭82%、平台互动增长180%等缺少可靠原始口径的数据。", 7, COLORS["coral"], bold=True, align="ctr")
    s.footer("原始链接：益宝微信公众号调查；鄰舍輔導會官网PDF；国家统计局统计公报；CNNIC报告；项目本地公开服务JSON与研究文档。")
    slides.append(s)

    s = Slide(14, "APPENDIX B", "政策与数据提交前核验清单", "把正式文件截图和原始数据页带到答辩现场，比堆更多二手报道更有说服力")
    checks = [
        ("十五五", "正式纲要中基层治理、公共服务、养老、数字社会原文与页码"),
        ("互助养老", "民政部等部门正式文件、2030指标完整名称、分母与适用范围"),
        ("三级网络", "民函〔2026〕41号文号、发布日期、功能条款与官方页面"),
        ("社区队伍", "每万城镇常住人口18名社区工作者的正式政策原文"),
        ("基层减负", "减少重复填报、群组和报表的政策原文及北京地方案例口径"),
        ("平台热度", "路演前24小时原话题页截图、指标、时间、链接，不跨平台相加"),
    ]
    for i, (tag, body) in enumerate(checks):
        col = i % 2
        row = i // 2
        xx = 0.58 + col * 5.72
        yy = 1.42 + row * 0.93
        s.rect(xx, yy, 5.38, 0.74, COLORS["surface"], COLORS["line"], radius=True)
        s.pill(xx + 0.18, yy + 0.20, 0.88, tag, COLORS["jade_light"] if i < 3 else COLORS["amber_light"], COLORS["jade"] if i < 3 else "8B631C")
        s.text(xx + 1.22, yy + 0.16, 3.88, 0.38, body, 7.6, COLORS["muted"], bold=i == 0)
    s.rect(0.58, 4.36, 11.10, 0.25, COLORS["jade"], line=None, radius=True)
    s.text(0.78, 4.38, 10.70, 0.17, "路演原则：相关度第一，时间第二；正式政策优先，区域样本不外推，平台热度只作趋势，本地数据保留完整来源链。", 7, COLORS["surface"], bold=True, align="ctr")
    s.footer("建议材料包：政策原文PDF/截图、居民调研原文、平台快照、本地18来源与16条服务数据、产品演示备用录屏。")
    slides.append(s)

    return slides


def content_types(n: int) -> str:
    overrides = ''.join(f'<Override PartName="/ppt/slides/slide{i}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>' for i in range(1, n + 1))
    return f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>
<Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
<Override PartName="/ppt/slideMasters/slideMaster1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideMaster+xml"/>
<Override PartName="/ppt/slideLayouts/slideLayout1.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slideLayout+xml"/>
<Override PartName="/ppt/theme/theme1.xml" ContentType="application/vnd.openxmlformats-officedocument.theme+xml"/>
<Override PartName="/ppt/presProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presProps+xml"/>
<Override PartName="/ppt/viewProps.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.viewProps+xml"/>
<Override PartName="/ppt/tableStyles.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.tableStyles+xml"/>
<Override PartName="/docProps/core.xml" ContentType="application/vnd.openxmlformats-package.core-properties+xml"/>
<Override PartName="/docProps/app.xml" ContentType="application/vnd.openxmlformats-officedocument.extended-properties+xml"/>{overrides}</Types>'''


def write_pptx(slides: list[Slide]):
    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    now = datetime.now(timezone.utc).isoformat(timespec="seconds").replace("+00:00", "Z")
    slide_ids = ''.join(f'<p:sldId id="{255+i}" r:id="rId{2+i}"/>' for i in range(1, len(slides) + 1))
    rels = ['<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="slideMasters/slideMaster1.xml"/>']
    rels += [f'<Relationship Id="rId{2+i}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide{i}.xml"/>' for i in range(1, len(slides) + 1)]
    rels += [
        f'<Relationship Id="rId{len(slides)+3}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/presProps" Target="presProps.xml"/>',
        f'<Relationship Id="rId{len(slides)+4}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/viewProps" Target="viewProps.xml"/>',
        f'<Relationship Id="rId{len(slides)+5}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/tableStyles" Target="tableStyles.xml"/>',
    ]
    presentation = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:sldMasterIdLst><p:sldMasterId id="2147483648" r:id="rId1"/></p:sldMasterIdLst><p:sldIdLst>{slide_ids}</p:sldIdLst><p:sldSz cx="{W}" cy="{H}" type="custom"/><p:notesSz cx="6858000" cy="9144000"/><p:defaultTextStyle/></p:presentation>'''
    presentation_rels = f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">{''.join(rels)}</Relationships>'''
    theme = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:theme xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" name="搭把手"><a:themeElements><a:clrScheme name="搭把手"><a:dk1><a:srgbClr val="17313B"/></a:dk1><a:lt1><a:srgbClr val="FFFFFF"/></a:lt1><a:dk2><a:srgbClr val="2F6B5F"/></a:dk2><a:lt2><a:srgbClr val="F8F7F0"/></a:lt2><a:accent1><a:srgbClr val="2F6B5F"/></a:accent1><a:accent2><a:srgbClr val="F06A4B"/></a:accent2><a:accent3><a:srgbClr val="E9A23B"/></a:accent3><a:accent4><a:srgbClr val="506D91"/></a:accent4><a:accent5><a:srgbClr val="5A6E74"/></a:accent5><a:accent6><a:srgbClr val="94A4A8"/></a:accent6><a:hlink><a:srgbClr val="2F6B5F"/></a:hlink><a:folHlink><a:srgbClr val="3D8274"/></a:folHlink></a:clrScheme><a:fontScheme name="搭把手"><a:majorFont><a:latin typeface="Avenir Next"/><a:ea typeface="PingFang SC"/><a:cs typeface="Arial"/></a:majorFont><a:minorFont><a:latin typeface="Avenir Next"/><a:ea typeface="PingFang SC"/><a:cs typeface="Arial"/></a:minorFont></a:fontScheme><a:fmtScheme name="搭把手"><a:fillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:shade val="90000"/><a:satMod val="120000"/></a:schemeClr></a:solidFill></a:fillStyleLst><a:lnStyleLst><a:ln w="9525"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="25400"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln><a:ln w="38100"><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:prstDash val="solid"/></a:ln></a:lnStyleLst><a:effectStyleLst><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle><a:effectStyle><a:effectLst/></a:effectStyle></a:effectStyleLst><a:bgFillStyleLst><a:solidFill><a:schemeClr val="phClr"/></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:tint val="95000"/><a:satMod val="170000"/></a:schemeClr></a:solidFill><a:solidFill><a:schemeClr val="phClr"><a:shade val="90000"/><a:satMod val="120000"/></a:schemeClr></a:solidFill></a:bgFillStyleLst></a:fmtScheme></a:themeElements></a:theme>'''
    slide_master = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldMaster xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMap accent1="accent1" accent2="accent2" accent3="accent3" accent4="accent4" accent5="accent5" accent6="accent6" bg1="lt1" bg2="lt2" folHlink="folHlink" hlink="hlink" tx1="dk1" tx2="dk2"/><p:sldLayoutIdLst><p:sldLayoutId id="1" r:id="rId1"/></p:sldLayoutIdLst><p:txStyles><p:titleStyle/><p:bodyStyle/><p:otherStyle/></p:txStyles></p:sldMaster>'''
    slide_layout = '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sldLayout xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" type="blank"><p:cSld name="Blank"><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="0" cy="0"/><a:chOff x="0" y="0"/><a:chExt cx="0" cy="0"/></a:xfrm></p:grpSpPr></p:spTree></p:cSld><p:clrMapOvr><a:masterClrMapping/></p:clrMapOvr></p:sldLayout>'''

    with zipfile.ZipFile(OUT, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types(len(slides)))
        z.writestr("_rels/.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/package/2006/relationships/metadata/core-properties" Target="docProps/core.xml"/><Relationship Id="rId3" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/extended-properties" Target="docProps/app.xml"/></Relationships>''')
        z.writestr("docProps/core.xml", f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><cp:coreProperties xmlns:cp="http://schemas.openxmlformats.org/package/2006/metadata/core-properties" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:dcterms="http://purl.org/dc/terms/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"><dc:title>搭把手路演版</dc:title><dc:subject>社区邻里服务平台</dc:subject><dc:creator>Codex</dc:creator><cp:lastModifiedBy>Codex</cp:lastModifiedBy><dcterms:created xsi:type="dcterms:W3CDTF">{now}</dcterms:created><dcterms:modified xsi:type="dcterms:W3CDTF">{now}</dcterms:modified></cp:coreProperties>''')
        z.writestr("docProps/app.xml", f'''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Properties xmlns="http://schemas.openxmlformats.org/officeDocument/2006/extended-properties" xmlns:vt="http://schemas.openxmlformats.org/officeDocument/2006/docPropsVTypes"><Application>Microsoft PowerPoint</Application><PresentationFormat>Custom</PresentationFormat><Slides>{len(slides)}</Slides><Notes>0</Notes><HiddenSlides>0</HiddenSlides><Company>搭把手</Company><AppVersion>16.0000</AppVersion></Properties>''')
        z.writestr("ppt/presentation.xml", presentation)
        z.writestr("ppt/_rels/presentation.xml.rels", presentation_rels)
        z.writestr("ppt/theme/theme1.xml", theme)
        z.writestr("ppt/slideMasters/slideMaster1.xml", slide_master)
        z.writestr("ppt/slideMasters/_rels/slideMaster1.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/theme" Target="../theme/theme1.xml"/></Relationships>''')
        z.writestr("ppt/slideLayouts/slideLayout1.xml", slide_layout)
        z.writestr("ppt/slideLayouts/_rels/slideLayout1.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideMaster" Target="../slideMasters/slideMaster1.xml"/></Relationships>''')
        z.writestr("ppt/presProps.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentationPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main"/>''')
        z.writestr("ppt/viewProps.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:viewPr xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" lastView="slideView"><p:normalViewPr/><p:slideViewPr/><p:notesTextViewPr/></p:viewPr>''')
        z.writestr("ppt/tableStyles.xml", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><a:tblStyleLst xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" def="{5C22544A-7EE6-4342-B048-85BDC9FD1C3A}"/>''')
        for i, slide in enumerate(slides, 1):
            z.writestr(f"ppt/slides/slide{i}.xml", slide.xml())
            z.writestr(f"ppt/slides/_rels/slide{i}.xml.rels", '''<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slideLayout" Target="../slideLayouts/slideLayout1.xml"/></Relationships>''')


if __name__ == "__main__":
    deck = build_slides()
    write_pptx(deck)
    print(f"Generated {OUT} with {len(deck)} slides")
