#!/usr/bin/env python3
"""Generate DataLund suite + per-visual sample workbooks from one source of truth.

Outputs (Website repo):
  public/downloads/DatalundSuiteSample.xlsx   — Projects + Tasks (suite demo)
  public/downloads/GanttSampleData.xlsx       — Tasks extract for Gantt
  public/downloads/ResourceLoadSampleData.xlsx
  public/downloads/TaskListSampleData.xlsx

Run from Website repo root:
  python3 scripts/generate-sample-data.py
"""

from __future__ import annotations

from datetime import date
from pathlib import Path

from openpyxl import Workbook
from openpyxl.styles import Font
from openpyxl.utils import get_column_letter

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "public" / "downloads"

# Shared portfolio story — Aug 2026 window works with "time window from today".
PROJECTS = [
    # Project, RAG, Phase, Project lead, Progress (0-100), Start, End, Next milestone, Obstacles, Notes
    ("North Sea Hub", "Green", "Delivery", "Ada Ng", 72, date(2026, 6, 11), date(2026, 9, 19), "FAT complete", "", "On track for Q3"),
    ("Arctic Link", "Amber", "Delivery", "Bo Berg", 45, date(2026, 5, 12), date(2026, 8, 30), "Cable pull", "Weather window", "Watch supplier lead time"),
    ("Yard Retrofit", "Red", "Initiation", "Cara Diaz", 18, date(2026, 7, 11), date(2026, 8, 20), "Scope freeze", "Budget overrun", "Critical path slip"),
    ("Digital Twin v2", "Green", "Build", "Dan Okonkwo", 88, date(2026, 4, 12), date(2026, 8, 25), "UAT", "", "Near release"),
    ("HSEQ Pulse", "Amber", "Operate", "Eva Holm", 55, date(2026, 1, 22), date(2026, 8, 15), "Audit prep", "Missing evidence", ""),
    ("Port Expansion", "Red", "Plan", "Finn Olsen", 12, date(2026, 8, 15), date(2027, 2, 6), "Permits", "", "Not started"),
    ("Crew Roster", "Green", "Operate", "Ada Ng", 100, date(2025, 7, 6), date(2026, 7, 31), "Closed", "", "Complete"),
    ("Spare Parts AI", "Amber", "Build", "Bo Berg", 33, date(2026, 6, 26), date(2026, 11, 8), "Model v1", "Data quality", ""),
]

# Task / assignment grain for Gantt + Resource Load.
# Task, Start, End, Duration (days or None), Progress (0-1), Group(=Phase), Resource, Project, RAG
TASKS = [
    ("Requirements", date(2026, 6, 11), date(2026, 6, 25), None, 1.00, "Delivery", "Ada Ng", "North Sea Hub", "Green"),
    ("Wireframes", date(2026, 6, 20), date(2026, 7, 5), None, 0.90, "Delivery", "Jordan Lee", "North Sea Hub", "Green"),
    ("API design", date(2026, 7, 1), date(2026, 7, 20), None, 0.75, "Delivery", "Sam Ortiz", "North Sea Hub", "Green"),
    ("FAT prep", date(2026, 8, 20), date(2026, 9, 5), None, 0.20, "Delivery", "Ada Ng", "North Sea Hub", "Amber"),
    ("Cable survey", date(2026, 5, 12), date(2026, 6, 15), None, 1.00, "Delivery", "Bo Berg", "Arctic Link", "Green"),
    ("Cable pull", date(2026, 7, 1), date(2026, 8, 20), None, 0.40, "Delivery", "Bo Berg", "Arctic Link", "Amber"),
    ("Weather hold", date(2026, 8, 10), date(2026, 8, 18), None, 0.00, "Delivery", "Riley Chen", "Arctic Link", "Red"),
    ("Scope workshop", date(2026, 7, 11), date(2026, 7, 25), None, 0.50, "Initiation", "Cara Diaz", "Yard Retrofit", "Amber"),
    ("Budget review", date(2026, 7, 20), date(2026, 8, 5), None, 0.15, "Initiation", "Finn Olsen", "Yard Retrofit", "Red"),
    ("Scope freeze", date(2026, 8, 12), date(2026, 8, 12), None, 0.00, "Initiation", "Cara Diaz", "Yard Retrofit", "Red"),
    ("Model training", date(2026, 4, 12), date(2026, 6, 30), None, 1.00, "Build", "Dan Okonkwo", "Digital Twin v2", "Green"),
    ("Integration", date(2026, 7, 1), date(2026, 8, 10), None, 0.85, "Build", "Sam Ortiz", "Digital Twin v2", "Green"),
    ("UAT", date(2026, 8, 11), date(2026, 8, 25), None, 0.30, "Build", "Ada Ng", "Digital Twin v2", "Amber"),
    ("Evidence gather", date(2026, 6, 1), date(2026, 7, 31), None, 0.70, "Operate", "Eva Holm", "HSEQ Pulse", "Amber"),
    ("Audit prep", date(2026, 8, 1), date(2026, 8, 15), None, 0.25, "Operate", "Eva Holm", "HSEQ Pulse", "Amber"),
    ("Permit draft", date(2026, 8, 15), date(2026, 10, 1), None, 0.10, "Plan", "Finn Olsen", "Port Expansion", "Red"),
    ("Stakeholder map", date(2026, 8, 20), date(2026, 9, 15), None, 0.05, "Plan", "Jordan Lee", "Port Expansion", "Green"),
    ("Roster closeout", date(2026, 7, 1), date(2026, 7, 31), None, 1.00, "Operate", "Ada Ng", "Crew Roster", "Green"),
    ("Data cleanse", date(2026, 6, 26), date(2026, 8, 15), None, 0.55, "Build", "Bo Berg", "Spare Parts AI", "Amber"),
    ("Model v1", date(2026, 8, 16), date(2026, 10, 1), None, 0.15, "Build", "Dan Okonkwo", "Spare Parts AI", "Amber"),
    # Duration-only row (no End) for Gantt duration path
    ("QA soak", date(2026, 8, 20), None, 14.0, 0.10, "Build", "Riley Chen", "Digital Twin v2", "Green"),
    # Overlap-heavy person for Resource Load swimlanes
    ("On-call week", date(2026, 8, 18), date(2026, 8, 24), None, 0.00, "Operate", "Bo Berg", "Arctic Link", "Red"),
    ("Vendor RFP", date(2026, 8, 12), date(2026, 9, 1), None, 0.15, "Plan", "Eva Holm", "Port Expansion", "Green"),
]


def autosize(ws, max_width: int = 42) -> None:
    for idx, col in enumerate(ws.columns, start=1):
        length = 0
        for cell in col:
            if cell.value is None:
                continue
            length = max(length, len(str(cell.value)))
        ws.column_dimensions[get_column_letter(idx)].width = min(max(length + 2, 12), max_width)


def style_header(ws) -> None:
    bold = Font(bold=True)
    for cell in ws[1]:
        cell.font = bold


def write_sheet(ws, headers: list[str], rows: list[tuple]) -> None:
    ws.append(headers)
    for row in rows:
        ws.append(list(row))
    style_header(ws)
    autosize(ws)


def add_howto(ws, lines: list[str]) -> None:
    for line in lines:
        ws.append([line])
    autosize(ws, max_width=90)


def build_suite() -> Path:
    wb = Workbook()

    ws_p = wb.active
    ws_p.title = "Projects"
    write_sheet(
        ws_p,
        [
            "Project",
            "RAG",
            "Phase",
            "Project lead",
            "Progress",
            "Start date",
            "Estimated end",
            "Next milestone",
            "Obstacles",
            "Notes",
        ],
        PROJECTS,
    )

    ws_t = wb.create_sheet("Tasks")
    write_sheet(
        ws_t,
        [
            "Task",
            "Start",
            "End",
            "Duration",
            "Progress",
            "Group",
            "Resource",
            "Project",
            "RAG",
        ],
        TASKS,
    )

    ws_h = wb.create_sheet("How to use")
    add_howto(
        ws_h,
        [
            "DataLund suite sample — one workbook for Gantt, Resource Load, and Task List",
            "",
            "1. Power BI Desktop → Get data → Excel workbook → this file.",
            "2. Load both Projects and Tasks. Relate Tasks[Project] → Projects[Project] (many-to-one).",
            "3. Import each .pbiviz (Visualizations … → Import a visual from a file).",
            "",
            "DataLund Task List (Projects sheet)",
            "  Project → Project | RAG → RAG | Group → Phase | Project lead → Project lead",
            "  Progress → Progress | Start Date → Start date | End Date → Estimated end",
            "  Tooltips → Next milestone, Obstacles, Notes",
            "",
            "DataLund Gantt chart (Tasks sheet)",
            "  Task → Task | Start Date → Start | End Date → End | Duration → Duration",
            "  Progress → Progress | Group → Group | Resource → Resource",
            "",
            "DataLund Resource Load (Tasks sheet)",
            "  Resource → Resource | Task → Task | Start Date → Start | End Date → End",
            "  Progress → Progress | Group → Group",
            "",
            "Tip: put Task List on the page and cross-filter Gantt + Resource Load from selected projects.",
            "Scope freeze is a zero-duration milestone. QA soak uses Duration instead of End.",
        ],
    )

    path = OUT / "DatalundSuiteSample.xlsx"
    wb.save(path)
    return path


def build_gantt() -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = "Tasks"
    # Per-visual extract: classic Gantt columns only
    rows = [(t[0], t[1], t[2], t[3], t[4], t[5], t[6]) for t in TASKS]
    write_sheet(ws, ["Task", "Start", "End", "Duration", "Progress", "Group", "Resource"], rows)
    ws_h = wb.create_sheet("How to use")
    add_howto(
        ws_h,
        [
            "Power BI Desktop test data for DataLund Gantt chart",
            "",
            "1. Home → Get data → Excel workbook → select this file → load Tasks.",
            "2. Import ganttChart.pbiviz (Visualizations … → Import a visual from a file).",
            "3. Bind: Task→Task, Start Date→Start, End Date→End, Duration→Duration (optional: Progress, Group, Resource).",
            "Scope freeze is a zero-duration milestone. QA soak uses Duration instead of End.",
            "",
            "For the full suite (Task List + Resource Load on one page), use DatalundSuiteSample.xlsx.",
        ],
    )
    path = OUT / "GanttSampleData.xlsx"
    wb.save(path)
    return path


def build_resource_load() -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = "Assignments"
    rows = [(t[6], t[0], t[1], t[2], t[4], t[5], t[8]) for t in TASKS if t[2] is not None]
    write_sheet(
        ws,
        ["Resource", "Task", "Start Date", "End Date", "Progress", "Group", "RAG"],
        rows,
    )
    path = OUT / "ResourceLoadSampleData.xlsx"
    wb.save(path)
    return path


def build_task_list() -> Path:
    wb = Workbook()
    ws = wb.active
    ws.title = "Projects"
    write_sheet(
        ws,
        [
            "Project",
            "RAG",
            "Phase",
            "Project lead",
            "Progress",
            "Start date",
            "Estimated end",
            "Next milestone",
            "Obstacles",
            "Notes",
        ],
        PROJECTS,
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
