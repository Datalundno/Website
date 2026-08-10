#!/usr/bin/env python3
"""Generate branded DataLund starter sample workbooks.

Only the columns a project manager keeps up to date — shared suite field
names, a short Start here sheet, and enough rows to see the visuals work.

Outputs (Website repo):
  public/downloads/DatalundSuiteSample.xlsx
  public/downloads/GanttSampleData.xlsx
  public/downloads/ResourceLoadSampleData.xlsx
  public/downloads/TaskListSampleData.xlsx

Run from Website repo root:
  python3 scripts/generate-sample-data.py
"""

from __future__ import annotations

from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Alignment, Border, Font, PatternFill, Side
from openpyxl.utils import get_column_letter
from openpyxl.worksheet.worksheet import Worksheet

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "downloads"

# Brand tokens (match datalund.no)
INK = "0F3D36"
ACCENT = "1A6B5C"
MINT = "2DD4BF"
PAPER = "E8F2EE"
MUTED = "3D5A54"
LINE = "C5D9D2"
RAG_GREEN = "1B7F5A"
RAG_AMBER = "B86E00"
RAG_RED = "B42318"
RAG_GREEN_BG = "D8F3E7"
RAG_AMBER_BG = "FCEFC7"
RAG_RED_BG = "F9D8D5"

FILL_INK = PatternFill("solid", fgColor=INK)
FILL_PAPER = PatternFill("solid", fgColor=PAPER)
FILL_HEADER = PatternFill("solid", fgColor=ACCENT)
FILL_ALT = PatternFill("solid", fgColor="F3FAF7")

FONT_BRAND = Font(name="Calibri", size=22, bold=True, color="FFFFFF")
FONT_TITLE = Font(name="Calibri", size=14, bold=True, color=INK)
FONT_BODY = Font(name="Calibri", size=11, color=INK)
FONT_MUTED = Font(name="Calibri", size=11, color=MUTED)
FONT_STEP = Font(name="Calibri", size=11, bold=True, color=ACCENT)
FONT_HEADER = Font(name="Calibri", size=11, bold=True, color="FFFFFF")
FONT_LINK = Font(name="Calibri", size=11, color=ACCENT, underline="single")

THIN = Border(
    left=Side(style="thin", color=LINE),
    right=Side(style="thin", color=LINE),
    top=Side(style="thin", color=LINE),
    bottom=Side(style="thin", color=LINE),
)

# Two grains, no duplicated attributes.
# Projects = portfolio row (Task List). Tasks = assignment row (Gantt / Resource Load).
# Project on Tasks is only the link key (relate Tasks[Project] → Projects[Project]).
# Project lead (portfolio owner) ≠ Resource (task assignee).
# Group lives on Tasks only in this starter (Gantt collapse) — do not copy it onto Projects.
PROJECT_HEADERS = [
    "Project",
    "RAG",
    "Project lead",
    "Progress",
    "Start Date",
    "End Date",
]

TASK_HEADERS = [
    "Task",
    "Start Date",
    "End Date",
    "Progress",
    "Group",
    "Resource",
    "Project",
]

# Small starter portfolio. Progress is 0–100. Dates around Aug 2026.
PROJECTS = [
    # Project, RAG, Project lead, Progress, Start Date, End Date
    ("North Sea Hub", "Green", "Ada Ng", 72, date(2026, 6, 11), date(2026, 9, 19)),
    ("Arctic Link", "Amber", "Bo Berg", 45, date(2026, 5, 12), date(2026, 8, 30)),
    ("Yard Retrofit", "Red", "Cara Diaz", 18, date(2026, 7, 11), date(2026, 8, 20)),
    ("Digital Twin v2", "Green", "Dan Okonkwo", 88, date(2026, 4, 12), date(2026, 8, 25)),
    ("Port Expansion", "Amber", "Finn Olsen", 12, date(2026, 8, 15), date(2027, 2, 6)),
]

TASKS = [
    # Task, Start Date, End Date, Progress, Group, Resource, Project
    ("Requirements", date(2026, 6, 11), date(2026, 6, 25), 100, "Delivery", "Ada Ng", "North Sea Hub"),
    ("API design", date(2026, 7, 1), date(2026, 7, 20), 75, "Delivery", "Sam Ortiz", "North Sea Hub"),
    ("FAT prep", date(2026, 8, 20), date(2026, 9, 5), 20, "Delivery", "Ada Ng", "North Sea Hub"),
    ("Cable pull", date(2026, 7, 1), date(2026, 8, 20), 40, "Delivery", "Bo Berg", "Arctic Link"),
    ("Weather hold", date(2026, 8, 10), date(2026, 8, 18), 0, "Delivery", "Riley Chen", "Arctic Link"),
    ("On-call week", date(2026, 8, 18), date(2026, 8, 24), 0, "Delivery", "Bo Berg", "Arctic Link"),
    ("Scope workshop", date(2026, 7, 11), date(2026, 7, 25), 50, "Initiation", "Cara Diaz", "Yard Retrofit"),
    ("Scope freeze", date(2026, 8, 12), date(2026, 8, 12), 0, "Initiation", "Cara Diaz", "Yard Retrofit"),
    ("Integration", date(2026, 7, 1), date(2026, 8, 10), 85, "Build", "Sam Ortiz", "Digital Twin v2"),
    ("UAT", date(2026, 8, 11), date(2026, 8, 25), 30, "Build", "Ada Ng", "Digital Twin v2"),
    ("Permit draft", date(2026, 8, 15), date(2026, 10, 1), 10, "Plan", "Finn Olsen", "Port Expansion"),
    ("Stakeholder map", date(2026, 8, 20), date(2026, 9, 15), 5, "Plan", "Jordan Lee", "Port Expansion"),
]


def set_col_widths(ws: Worksheet, widths: list[float]) -> None:
    for i, width in enumerate(widths, start=1):
        ws.column_dimensions[get_column_letter(i)].width = width


def paint_banner(ws: Worksheet, title: str, subtitle: str, cols: int = 5) -> None:
    ws.merge_cells(start_row=1, start_column=1, end_row=1, end_column=cols)
    ws.merge_cells(start_row=2, start_column=1, end_row=2, end_column=cols)
    c1 = ws.cell(1, 1, title)
    c1.font = FONT_BRAND
    c1.fill = FILL_INK
    c1.alignment = Alignment(vertical="center", horizontal="left", indent=1)
    ws.row_dimensions[1].height = 36
    c2 = ws.cell(2, 1, subtitle)
    c2.font = Font(name="Calibri", size=11, color=INK)
    c2.fill = FILL_PAPER
    c2.alignment = Alignment(vertical="center", horizontal="left", indent=1)
    ws.row_dimensions[2].height = 22
    for col in range(1, cols + 1):
        ws.cell(1, col).fill = FILL_INK
        ws.cell(2, col).fill = FILL_PAPER


def write_start_block(ws: Worksheet, lines: list[tuple[str, str]]) -> None:
    row = 4
    for style, text in lines:
        cell = ws.cell(row, 1, text if text else None)
        if style == "title":
            cell.font = FONT_TITLE
            ws.row_dimensions[row].height = 20
        elif style == "step":
            cell.font = FONT_STEP
        elif style == "muted":
            cell.font = FONT_MUTED
        elif style == "link":
            cell.font = FONT_LINK
            if text.startswith("http"):
                cell.hyperlink = text
        elif style == "blank":
            cell.value = None
        else:
            cell.font = FONT_BODY
        row += 1


def style_table(
    ws: Worksheet,
    headers: list[str],
    n_rows: int,
    date_cols: set[int],
    progress_cols: set[int],
    rag_cols: set[int],
) -> None:
    for col, name in enumerate(headers, start=1):
        cell = ws.cell(1, col, name)
        cell.font = FONT_HEADER
        cell.fill = FILL_HEADER
        cell.alignment = Alignment(horizontal="left", vertical="center")
        cell.border = THIN
    ws.row_dimensions[1].height = 20
    ws.auto_filter.ref = f"A1:{get_column_letter(len(headers))}{n_rows + 1}"
    ws.freeze_panes = "A2"

    for r in range(2, n_rows + 2):
        for c in range(1, len(headers) + 1):
            cell = ws.cell(r, c)
            cell.border = THIN
            cell.font = FONT_BODY
            if r % 2 == 0:
                cell.fill = FILL_ALT
            if c in date_cols and cell.value is not None:
                cell.number_format = "YYYY-MM-DD"
            if c in progress_cols and isinstance(cell.value, (int, float)):
                cell.number_format = '0"%"'
                cell.alignment = Alignment(horizontal="right")
            if c in rag_cols and isinstance(cell.value, str):
                rag = cell.value.strip().lower()
                if rag in {"green", "grønn", "gronn"}:
                    cell.fill = PatternFill("solid", fgColor=RAG_GREEN_BG)
                    cell.font = Font(name="Calibri", size=11, bold=True, color=RAG_GREEN)
                elif rag in {"amber", "gul", "yellow"}:
                    cell.fill = PatternFill("solid", fgColor=RAG_AMBER_BG)
                    cell.font = Font(name="Calibri", size=11, bold=True, color=RAG_AMBER)
                elif rag in {"red", "rød", "rod"}:
                    cell.fill = PatternFill("solid", fgColor=RAG_RED_BG)
                    cell.font = Font(name="Calibri", size=11, bold=True, color=RAG_RED)


def write_data_sheet(ws: Worksheet, headers: list[str], rows: list[tuple], widths: list[float]) -> None:
    ws.append(headers)
    for row in rows:
        ws.append(list(row))
    date_cols = {i for i, h in enumerate(headers, start=1) if h in {"Start Date", "End Date"}}
    progress_cols = {i for i, h in enumerate(headers, start=1) if h == "Progress"}
    rag_cols = {i for i, h in enumerate(headers, start=1) if h == "RAG"}
    style_table(ws, headers, len(rows), date_cols, progress_cols, rag_cols)
    set_col_widths(ws, widths)


def add_data_sheet(
    wb: Workbook,
    title: str,
    headers: list[str],
    rows: list[tuple],
    widths: list[float],
    tab_color: str = ACCENT,
) -> Worksheet:
    ws = wb.create_sheet(title)
    ws.sheet_properties.tabColor = tab_color
    write_data_sheet(ws, headers, rows, widths)
    return ws


def build_suite_start(ws: Worksheet) -> None:
    ws.sheet_properties.tabColor = INK
    paint_banner(
        ws,
        "DataLund suite sample",
        "Two grains — portfolio vs assignments. Each attribute lives on one sheet.",
        cols=5,
    )
    write_start_block(
        ws,
        [
            ("title", "Quick start"),
            ("step", "1. Import the three .pbiviz files from datalund.no"),
            ("step", "2. Load Projects and Tasks — relate Tasks[Project] → Projects[Project]"),
            ("step", "3. Bind from the sheet that owns the column (see below)"),
            ("blank", ""),
            ("title", "What to maintain (no duplicates)"),
            ("body", "Projects (Task List): Project · RAG · Project lead · Progress · Start Date · End Date"),
            ("body", "Tasks (Gantt + Resource Load): Task · Start Date · End Date · Progress · Group · Resource · Project"),
            ("blank", ""),
            ("title", "How the sheets connect"),
            ("body", "Tasks[Project] is only the link to Projects — not a second project name to redesign."),
            ("body", "Project lead = who owns the project. Resource = who does the task. Different people, different wells."),
            ("body", "Group lives on Tasks (Gantt sections). Do not copy Group onto Projects in this starter."),
            ("muted", "Gantt Resource well → Tasks[Resource]. Never put Project in the Resource well."),
            ("muted", "Progress is 0–100. RAG is Red / Amber / Green (or Rød / Gul / Grønn)."),
            ("blank", ""),
            ("body", "Put Task List on the page, click a project — Gantt and Resource Load follow."),
            ("blank", ""),
            ("link", "https://datalund.no"),
            ("muted", "Free Power BI visuals · support@datalund.no"),
        ],
    )
    set_col_widths(ws, [92, 12, 12, 12, 12])


def build_visual_start(ws: Worksheet, visual: str, subtitle: str, steps: list[tuple[str, str]]) -> None:
    ws.sheet_properties.tabColor = INK
    paint_banner(ws, f"DataLund {visual}", subtitle, cols=4)
    write_start_block(ws, steps)
    set_col_widths(ws, [82, 12, 12, 12])


def build_suite() -> Path:
    wb = Workbook()
    ws0 = wb.active
    ws0.title = "Start here"
    build_suite_start(ws0)

    add_data_sheet(
        wb,
        "Projects",
        PROJECT_HEADERS,
        PROJECTS,
        widths=[18, 10, 14, 10, 12, 12],
        tab_color=MINT,
    )
    add_data_sheet(
        wb,
        "Tasks",
        TASK_HEADERS,
        TASKS,
        widths=[16, 12, 12, 10, 12, 14, 16],
        tab_color=ACCENT,
    )

    path = OUT / "DatalundSuiteSample.xlsx"
    wb.save(path)
    return path


def build_gantt() -> Path:
    wb = Workbook()
    ws0 = wb.active
    ws0.title = "Start here"
    build_visual_start(
        ws0,
        "Gantt chart",
        "Core task columns only — swap in your own rows",
        [
            ("title", "Quick start"),
            ("step", "1. Import ganttChart.pbiviz"),
            ("step", "2. Load Tasks"),
            ("step", "3. Bind Task, Start Date, End Date — then Progress, Group, Resource"),
            ("muted", "Resource well → Resource (assignee). Do not put Project in Resource."),
            ("blank", ""),
            ("muted", "Same columns as Resource Load. Full suite page → DatalundSuiteSample.xlsx"),
            ("blank", ""),
            ("link", "https://datalund.no/visuals/gantt/"),
        ],
    )
    rows = [(t[0], t[1], t[2], t[3], t[4], t[5]) for t in TASKS]
    add_data_sheet(
        wb,
        "Tasks",
        ["Task", "Start Date", "End Date", "Progress", "Group", "Resource"],
        rows,
        widths=[16, 12, 12, 10, 12, 14],
    )
    path = OUT / "GanttSampleData.xlsx"
    wb.save(path)
    return path


def build_resource_load() -> Path:
    wb = Workbook()
    ws0 = wb.active
    ws0.title = "Start here"
    build_visual_start(
        ws0,
        "Resource Load",
        "Core assignment columns only — swap in your own rows",
        [
            ("title", "Quick start"),
            ("step", "1. Import resourceLoad.pbiviz"),
            ("step", "2. Load Assignments"),
            ("step", "3. Bind Resource, Task, Start Date, End Date — then Progress, Group"),
            ("blank", ""),
            ("muted", "Same columns as Gantt. Full suite page → DatalundSuiteSample.xlsx"),
            ("blank", ""),
            ("link", "https://datalund.no/visuals/resource-load/"),
        ],
    )
    rows = [(t[5], t[0], t[1], t[2], t[3], t[4]) for t in TASKS]
    add_data_sheet(
        wb,
        "Assignments",
        ["Resource", "Task", "Start Date", "End Date", "Progress", "Group"],
        rows,
        widths=[14, 16, 12, 12, 10, 12],
    )
    path = OUT / "ResourceLoadSampleData.xlsx"
    wb.save(path)
    return path


def build_task_list() -> Path:
    wb = Workbook()
    ws0 = wb.active
    ws0.title = "Start here"
    build_visual_start(
        ws0,
        "Task List",
        "Portfolio columns only — swap in your own rows",
        [
            ("title", "Quick start"),
            ("step", "1. Import taskList.pbiviz"),
            ("step", "2. Load Projects"),
            ("step", "3. Bind Project, RAG, Project lead, Progress, Start Date, End Date"),
            ("blank", ""),
            ("muted", "Project = Task well · Project lead = Resource well."),
            ("muted", "Group is optional later (phase sections). Full suite → DatalundSuiteSample.xlsx"),
            ("blank", ""),
            ("link", "https://datalund.no/visuals/task-list/"),
        ],
    )
    add_data_sheet(
        wb,
        "Projects",
        PROJECT_HEADERS,
        PROJECTS,
        widths=[18, 10, 14, 10, 12, 12],
        tab_color=MINT,
    )
    path = OUT / "TaskListSampleData.xlsx"
    wb.save(path)
    return path


def main() -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    paths = [build_suite(), build_gantt(), build_resource_load(), build_task_list()]
    for p in paths:
        print(f"wrote {p.relative_to(ROOT)} ({p.stat().st_size} bytes)")


if __name__ == "__main__":
    main()
