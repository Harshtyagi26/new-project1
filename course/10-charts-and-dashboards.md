# Module 10 — Charts & Dashboard Design

> **Goal:** choose the right chart for the question, build it cleanly, and
> assemble an interactive dashboard that a stakeholder can use unaided.
>
> **Time:** ~5 hours · **Prerequisites:** Modules 6–9 · **Data:** `sales_transactions.csv`, `daily_targets.csv`

---

## 10.1 Choosing the chart

Start from the question, never from the chart menu.

| The question is about… | Use | Avoid |
|---|---|---|
| Change over time | Line (continuous), column (few discrete periods) | Pie of any kind |
| Comparing categories | Horizontal bar, sorted by value | 3-D anything |
| Part of a whole, 2–3 parts | Stacked bar, or just state the number | Pie beyond 3 slices |
| Part of a whole, many parts | Sorted bar + a "% of total" column | Pie, donut |
| Relationship between two measures | Scatter | Line with two unrelated axes |
| Distribution | Histogram, box plot | Averages alone |
| Contribution to a change | Waterfall | Stacked column |
| Progress to target | Bullet-style bar, or a bar with a target line | Gauge/speedometer |
| Rank, top N | Sorted horizontal bar | Everything else |

Three rules that resolve most arguments:

1. **Sort bars by value**, not alphabetically, unless the category has an
   inherent order (months, sizes, stages).
2. **Bar and column charts must start at zero.** Truncating the axis
   misrepresents the ratio the bar's length is supposed to encode. Line charts
   need not — they encode change, not magnitude.
3. **A dual axis is almost always a mistake.** The crossing point is arbitrary
   and can be manipulated to say anything. Use two small charts side by side, or
   index both series to 100 at the start.

---

## 10.2 Building a chart properly

Select the data → `Alt`+`F1` (chart on the sheet) or `F11` (chart sheet). Then
strip it back:

**Delete by default:** gridlines (or fade them to a very light grey), the chart
border, the legend when there is one series, the axis line, tick marks, and any
3-D or shadow effect. Every one of these is ink that carries no information.

**Add deliberately:** a title that states the finding, not the field names
("Partner revenue fell 18% in Q4", not "Revenue by Channel"); data labels
instead of a y-axis where there are few bars; and direct labels at the end of
lines instead of a legend the reader has to cross-reference.

**Colour with intent.** One accent colour for the series that matters, grey for
everything else. A dashboard in six colours conveys less than a dashboard in
grey with one blue. Ensure the contrast survives greyscale printing and
colour-vision deficiency — never encode meaning in red-vs-green alone; pair
colour with a label, shape, or position.

**Techniques worth knowing:**

- **Combo charts** (Insert → Combo) — e.g. revenue as columns, margin % as a
  line on a secondary axis. The one legitimate use of a secondary axis is a
  measure and its own rate.
- **Target lines** — add the target as a second series, change its type to
  Line, set no marker and a dashed grey stroke.
- **Gaps vs zeros** — Select Data → Hidden and Empty Cells. `NA()` in a formula
  leaves a genuine gap; `0` plots a false drop to the floor. Use `NA()`.
- **Sparklines** (Insert → Sparklines) — one-cell trend lines beside a table.
  Excellent density-per-pixel; set a shared axis minimum across the group or the
  comparison is meaningless.
- **In-cell bars** — `=REPT("|", value/100)` or a data-bar conditional format.
  Lighter than a chart and refreshes instantly.
- **Dynamic chart titles** — link the title to a cell: select the title, type
  `=` in the formula bar, click the cell. Now the title updates with the slicer.

---

## 10.3 Dashboard architecture

A dashboard is a *product*. Build it in three sheets, echoing Module 1:

```
DATA (hidden)        CALC (hidden)            DASHBOARD (the only visible sheet)
─────────────        ─────────────            ────────────────────────────────
Power Query loads    Pivots, measures,        Charts, KPI tiles, slicers
Data Model           helper ranges            No raw data, no stray cells
```

**Layout.** Readers scan top-left to bottom-right, so the most important number
goes top-left. A working default:

```
┌──────────────────────────────────────────────────────────┐
│  Title                              [Region ▾] [Timeline]│  ← filters, top right
├──────────┬──────────┬──────────┬─────────────────────────┤
│ Revenue  │ Margin % │ Orders   │ Attainment              │  ← KPI row: 4 numbers,
│ £4.21m   │ 31.4%    │ 5,000    │ 96% ▼                   │    each with its
│ ▲ 8.2%   │ ▼ 1.1pt  │ ▲ 3.0%   │                         │    comparison
├──────────┴──────────┴──────────┴─────────────────────────┤
│  Revenue trend vs target (line + dashed target)          │  ← the primary chart,
│                                                          │    widest space
├───────────────────────────┬──────────────────────────────┤
│  Revenue by region (bar)  │  Top 10 SKUs (bar)           │  ← supporting detail
└───────────────────────────┴──────────────────────────────┘
```

**A KPI tile is a number, a label, and a comparison.** A number without a
comparison — against target, against last period, against another segment — is
not information. Every tile on this dashboard carries one.

**Mechanics that make it feel built rather than assembled:**

- Set every Pivot and chart to one shared connection so a single set of slicers
  drives everything (Module 7.5).
- View → uncheck Gridlines, Headings, Formula Bar on the dashboard sheet.
- Align and distribute objects (Shape Format → Align); snap to grid with `Alt`
  held while dragging.
- Chart properties → **Don't move or size with cells**, so a filter change
  cannot reflow your layout.
- Set the print area and page setup even for a screen dashboard — someone will
  print it.
- Test it at 1366×768. Most corporate laptops are not your monitor.

**Interactivity without VBA:** slicers and timelines, `FILTER`/`SORT` spill
ranges driven by a validation dropdown, form controls (Developer → Insert →
Combo Box / Option Button) bound to a cell, and hyperlinks between views.
Reserve VBA (Module 11) for things genuinely impossible otherwise.

---

## 10.4 Performance and robustness

- Load large sources to the **Data Model**, not to sheets.
- Fewer, larger Pivots beat many small ones over the same data.
- Avoid volatile functions and whole-column conditional formatting (Modules 2, 6).
- Turn off "Autofit column widths on update" on every Pivot.
- Before shipping: refresh everything, check for `#REF!`/`#N/A` on every view,
  select each slicer item in turn and confirm nothing breaks, and check the
  empty-selection state — an empty filter result should say "No data for this
  selection", not show a broken chart.
- Document the refresh procedure **on the dashboard**, in a small grey line:
  who owns it, what the source is, when it was last refreshed
  (`=TEXT(NOW(),"yyyy-mm-dd hh:mm")` set at refresh time via a query, or a
  visible "Data as of" cell). Every dashboard that outlives its author needs this.

---

## Exercises

Solutions: [`exercises/solutions/10-charts-and-dashboards.md`](../exercises/solutions/10-charts-and-dashboards.md).

**10.1** For each question, name the chart and justify it in one sentence:
(a) Is revenue growing? (b) Which region is largest? (c) Do bigger orders get
bigger discounts? (d) How is the £4.2m split across four channels? (e) What
drove the change from Q3 to Q4? (f) How are order sizes distributed?

**10.2** Build a monthly revenue line chart with a dashed target line from
`daily_targets`, a title linked to the active region slicer, and genuine gaps
(not zeros) for months with no data.

**10.3** Take a default Excel column chart and remove every element that carries
no information. List what you deleted and what you added, and explain each.

**10.4** Build a KPI tile row: revenue, margin %, order count and attainment,
each with a period-over-period comparison and a direction indicator that is
legible in greyscale.

**10.5** Build the full dashboard from 10.3 on the Module 9 data model: three
sheets, one connection, region slicer plus timeline driving every visual.

**10.6** Deliberately break it — select a slicer combination with no data — and
then fix the empty state so the dashboard degrades gracefully.

**10.7** Someone presents a dual-axis chart showing revenue and headcount
"clearly correlated". Explain in three sentences why the chart cannot support
that claim, and produce the two-chart version.

**10.8** Your dashboard takes 25 seconds to respond to a slicer click. Give the
diagnostic order you would follow and the likely fix at each step.

---

## Pitfalls recap

- Bars must start at zero. Lines need not.
- Sort by value unless the category has a natural order.
- Dual axes imply a relationship you have not demonstrated.
- `0` and "no data" are different; use `NA()` for gaps.
- A number without a comparison is not a KPI.
- Never rely on colour alone to carry meaning.
- Undocumented dashboards rot the day their author leaves.

**Next:** [Module 11 — Automation: Macros, VBA & Office Scripts](11-automation.md)
