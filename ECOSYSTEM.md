# DataLund ecosystem — agent brief

Give this file to agents working on **Gantt**, **Resource Load**, **Task List**, or the **Website**.

**Mindset:** one ecosystem, modular visuals. Same field names, same density language, same starter model — each visual still does **one job** and ships as its own `.pbiviz`.

| Visual | One job |
| --- | --- |
| **Gantt** | *When* — tasks on a timeline |
| **Resource Load** | *Who is busy* — people on tasks over time |
| **Task List** | *What’s in the portfolio* — browse + select to cross-filter |

Do **not** merge visuals into one mega-visual. Do **not** invent parallel field names, density presets, or sample column headers.

---

## 1) Shared field roles (mandatory)

Stable `capabilities.json` **`name`** values. Display names may be friendlier; **never rename the role `name`**.

| Role `name` | Typical display | Kind | Notes |
| --- | --- | --- | --- |
| `task` | Task · **Project** (Task List) | Grouping | Row / bar identity |
| `startDate` | Start Date | GroupingOrMeasure | |
| `endDate` | End Date | GroupingOrMeasure | Prefer End Date for PM models |
| `duration` | Duration | Measure | Days; **optional alternative** to End Date |
| `progress` | Progress | Measure | Accept **0–1 or 0–100** |
| `group` | Group | Grouping | Phase / parent |
| `resource` | Resource · **Project lead** (Task List) | Grouping | Person / team |
| `tooltipFields` | Tooltips | Grouping | Extra detail; keep optional |
| `status` | **RAG** (Task List) | Grouping | Suite extension — Task List today |

### Display-name rules

- Timeline visuals (Gantt, Resource Load): use the suite defaults (**Task**, **Resource**, **Start Date**, …).
- Task List: Lists / PMO labels are OK (**Project**, **Project lead**, **RAG**) as long as role `name`s stay as above.
- Do not invent `Start` / `Estimated end` / `Assignee` as role names.

### Value shapes people already use

| Field | Accept |
| --- | --- |
| Progress | `0–1` **or** `0–100` (normalize in converter) |
| RAG / status | `Red` / `Amber` / `Green` and Norwegian `Rød` / `Gul` / `Grønn` |
| End vs Duration | End Date preferred; Duration only when End is absent |
| Milestone | Same Start Date and End Date (zero-length bar) |

### Capabilities binding lesson

For visuals that need **more than one** required well, prefer **max-only** conditions in `dataViewMappings` and enforce required fields in the **converter + landing page**. Dual `min:1` on multiple roles has blocked binding in Power BI (see Resource Load field-binding fix).

---

## 2) Starter model (PM-maintained columns only)

Project managers will only keep a short list of columns current. **Waste columns kill conversion.**

### In the starter Excel (Website)

**Projects** (Task List):

`Project · RAG · Group · Project lead · Progress · Start Date · End Date`

**Tasks** (Gantt + Resource Load):

`Task · Start Date · End Date · Progress · Group · Resource · Project`

### Not in starters (still supported by visuals)

- **Duration** — optional later if someone has days instead of End Date  
- **Tooltips** — optional later (milestones, obstacles, notes)  
- **RAG on Tasks** — RAG lives on Projects / Task List  

If you ship or sync sample data from a visual repo, **match this column set**. Do not reintroduce tooltip or Duration columns into the default starter.

Source of truth for generated files: `Datalundno/Website` → `scripts/generate-sample-data.py`.

---

## 3) Density presets (mandatory)

Format → **General → Density**. Same names and numbers everywhere.

| Preset | Intent | barHeight | rowGap | fontSize | labelWidth | cornerRadius |
| --- | --- | ---: | ---: | ---: | ---: | ---: |
| **Compact** | Many visuals on one page | 16 | 8 | 10 | 140 | 2 |
| **Comfortable** | Default | 28 | 12 | 12 | 200 | 4 |
| **Large** | Sparse / presenting | 36 | 16 | 14 | 240 | 6 |
| **Custom** | Use that visual’s own size sliders | — | — | — | — | — |

- Do **not** invent Small / Medium / Huge.
- List visuals map density to row height, font, padding, chip radius — keep **preset names** identical.
- Keep `src/suite/density.ts` in sync across repos until a shared package exists.

---

## 4) Format pane: Color by (mandatory for timeline visuals)

Gantt and Resource Load must use the **same control identity** so the suite feels one in Format → General.

| | Contract |
| --- | --- |
| Object | `general` |
| Property **`name`** | `colorBy` |
| Display name | **Color by** |
| Type | Enumeration (preferred) |

**Enum values may differ per visual** (different jobs), but do not invent a second property name (`colorMode`, `colorByResource`, etc.).

| Visual | Suggested values | Intent |
| --- | --- | --- |
| **Gantt** | `default` · `resource` · `group` · `task` | How bars pick their fill |
| **Resource Load** | `single` · `task` · `concurrency` | Single fill, by task name, or concurrency warn |

**Migration:** if the visual still has `colorByResource` (bool) or `colorMode`, rename to `colorBy` and map old persisted values in settings load so existing reports do not reset silently.

Task List does **not** need this control unless it gains bar coloring later. RAG chips stay status-driven, not a Color by enum.

---

## 5) Modular but “one”

### Do

- One job per visual; clear landing page when required fields are missing.
- Reuse chrome language with siblings (today line, weekend shading, bar corners, label pane) where it fits the job.
- Cross-filter / cross-highlight so Task List → Gantt → Resource Load feel like one page.
- Brand as **DataLund** (`datalund.no`); support → `support@datalund.no`.
- Ship website updates via `website-sync/` (or equivalent) with matching help Fields copy.

### Don’t

- Don’t rename suite roles to be “clearer” for one visual.
- Don’t add **RAG / `status`** to Gantt or Resource Load — that stays Task List only.
- Don’t invent alternate Format names for Color by (`colorMode`, `colorByResource`, …).
- Don’t add dashboard clutter (stats strips, multi-widgets) inside a single visual.
- Don’t fork sample column names per visual.
- Don’t change Density preset names or table values without updating **all** suite visuals + Website docs.

---

## 6) Per-visual checklist

Before opening a PR, confirm:

- [ ] Role `name`s match the table in §1  
- [ ] Progress accepts 0–1 and 0–100  
- [ ] Density presets match §3  
- [ ] Timeline visuals: Format → General → **Color by** uses property `colorBy` (§4); migrate old keys if needed  
- [ ] Landing / README bind steps use **Start Date** + **End Date** (Duration as optional later)  
- [ ] Sample / website-sync columns match §2 if you touch samples  
- [ ] Help copy (if synced) lists core fields first; Duration / Tooltips as “also supported later”  
- [ ] Focused PR for **this visual only** (Website sync can be a follow-up pack)

---

## 7) Website sync expectations

When behaviour or capabilities change:

1. Update the visual repo (capabilities, converter, README).  
2. Package branded `.pbiviz` (+ white-label if applicable).  
3. Refresh `website-sync/` help HTML + downloads to match **core fields** wording.  
4. Website agent regenerates starters from `scripts/generate-sample-data.py` if column contracts change (they should not change lightly).

Canonical product URLs:

- https://datalund.no/visuals/gantt/  
- https://datalund.no/visuals/resource-load/  
- https://datalund.no/visuals/task-list/  
- https://datalund.no/downloads/DatalundSuiteSample.xlsx  

---

## 8) Kickoff prompt (paste for visual agents)

> Follow `ECOSYSTEM.md` (DataLund). One job for this visual; stay modular. Do not rename suite field role names. Prefer End Date over Duration in docs and samples. Density = Compact / Comfortable / Large / Custom with the suite table. Timeline visuals: Format → General → Color by must use property `colorBy` (migrate `colorMode` / `colorByResource`). Do not add RAG/`status` outside Task List. Starter samples only include PM-maintained columns (no Tooltip / Duration columns by default). Progress accepts 0–1 or 0–100. Open a focused PR for this visual only; sync Website help/samples if field UX changes.

---

## Related docs

| Doc | Where | Role |
| --- | --- | --- |
| `SUITE.md` | GANTT repo | Original density + field-role seed |
| `ECOSYSTEM.md` | Website repo (this file) | Living ecosystem contract for all agents |
| `DOMAIN.md` | Website | Hosting, downloads, sample generation |
| `RESOURCE_LOAD.md` / `TASK_LIST.md` | Visual kickoffs | Per-visual scope (must not contradict this file) |

If a kickoff brief and this file disagree, **this file wins** for field names, density, Color by, and starter columns.
