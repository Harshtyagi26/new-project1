# Solutions — Module 10: Charts & Dashboard Design

**10.1 — Chart selection**

| Question | Chart | Why |
|---|---|---|
| (a) Is revenue growing? | Line, monthly, over ≥ 2 years | Time is continuous; the eye reads slope as rate of change |
| (b) Which region is largest? | Horizontal bar, sorted descending | Ranking is a length comparison, and horizontal fits the labels |
| (c) Do bigger orders get bigger discounts? | Scatter, quantity vs discount | Two continuous measures, one relationship |
| (d) £4.2m split across four channels | Stacked bar (single bar) or a small sorted bar chart with labels | Four parts of a whole; a pie forces angle comparison, which people do badly |
| (e) What drove Q3 → Q4? | Waterfall | It decomposes a *change* into contributions |
| (f) Order size distribution | Histogram (grouped column) | Shape and spread, not a central value |

For (d), the honest alternative is often a sentence: "Online is 35% of revenue,
Direct 32%, Partner 25%, Retail 8%." Four numbers do not need a picture.

**10.2 — Trend with a target line**

Two series against the same monthly axis: actual revenue from the Pivot,
`RevenueTarget` from `dim_Targets`. Select the target series → Format Data
Series → Line → dashed, mid-grey, no marker, thinner than the actual. The
actual series gets the one accent colour.

Dynamic title: put `="Revenue vs target — "&IF(COUNTA(SelectedRegions)=8,
"all regions", TEXTJOIN(", ", TRUE, SelectedRegions))` in a cell, select the
chart title, type `=` in the formula bar and click that cell. (A cube formula or
a helper Pivot gives you the slicer selection.)

Gaps: Select Data → Hidden and Empty Cells → **Show empty cells as: Gaps**, and
make sure the source produces genuine blanks or `NA()`, not zeros. A month with
no data plotted as zero reads as a collapse in revenue, which is a lie the chart
tells without anyone intending it.

**10.3 — Stripping a default chart**

Deleted: gridlines, chart border, legend (single series), vertical axis line,
tick marks, the automatic "Series 1" title, and any gradient or shadow.

Added: a title stating the finding; direct data labels on the final point of the
line (or on every bar, if few); a light grey baseline at zero; and the units in
the title or subtitle rather than repeated on every label.

The reasoning for each deletion is the same: it costs ink and attention without
adding information. The reasoning for each addition is that it removes a lookup
the reader would otherwise have to perform — cross-referencing a legend, or
mentally reading a value off an axis.

**10.4 — KPI tiles**

Each tile is a small range, not a chart: a label in a small grey font, the value
in a large bold font, and a comparison line beneath.

```
Revenue:    =TEXT([Total Revenue], "£#,##0,,.0""m""")
Comparison: =TEXT([YoY Growth %], "+0.0%;-0.0%") & " vs LY"
Indicator:  =IF([YoY Growth %]>=0, "▲", "▼")
```

Greyscale legibility: the arrow glyph carries the direction, so colour is
redundant rather than load-bearing. Use a dark colour for the arrow and value
in both cases, or a single accent for positive and grey for negative. Never
red/green alone — around 8% of men have a red-green deficiency, and the printout
has none at all.

Attainment tile: value `=TEXT([Attainment %],"0%")`, comparison
`=TEXT([Variance],"£#,##0;(£#,##0)")&" vs target"`. Every tile carries a
comparison; a bare number is not a KPI.

**10.5 — The dashboard**

Sheets: `Data` (hidden, queries only), `Calc` (hidden, Pivots and helper
ranges), `Dashboard` (visible).

- Build every Pivot from the Data Model so they share one connection.
- Insert one `RegionCode` slicer and one date timeline on `Dashboard`; Report
  Connections → tick all Pivots.
- Move the Pivots to `Calc` and point the charts at them, so the dashboard shows
  only visuals. Chart → Format → Properties → **Don't move or size with cells**.
- `View` → uncheck Gridlines, Headings, Formula Bar on `Dashboard` only.
- Align objects with Shape Format → Align → Align Left / Distribute Vertically.
- Freeze the layout by setting a print area and testing at 1366×768.

**10.6 — The empty state**

Select a slicer combination with no rows: charts go blank, KPI tiles show
`#DIV/0!` or a bare 0, and the dashboard looks broken rather than empty.

Fix each surface:

```
Tile:   =IF([Order Count]=0, "—", TEXT([Total Revenue], "£#,##0,,.0""m"""))
Note:   =IF([Order Count]=0, "No orders match the current selection", "")
```

Place the note in a cell over the chart area, formatted in grey and shown only
when the count is zero. In DAX, ensure every ratio uses `DIVIDE` so an empty
selection yields `BLANK()` rather than an error.

Graceful degradation is not cosmetic. A dashboard that looks broken gets
reported as broken, and you spend the afternoon explaining that the filter
simply matched nothing.

**10.7 — The dual-axis correlation claim**

*"The two series are on independent axes, and the scale and baseline of each
were chosen by the charting tool or by whoever made it. Shifting either axis
moves the lines together or apart without changing a single data point, so the
apparent tracking is a property of the axes, not of the data. If you want to
claim a relationship, show a scatter of the two measures and quote the
correlation — and remember that both series trending upward over time produces
a strong correlation between almost any pair of growing quantities."*

Replacement: two small charts stacked with a shared time axis, or both series
indexed to 100 at the first period so they share one axis honestly. The indexed
version is usually the most persuasive, because it shows relative growth on
comparable terms.

**10.8 — 25-second slicer response**

1. **Check the source.** Is the Pivot reading the Data Model or a sheet range of
   500,000 rows? Move large sources to the model.
2. **Count the Pivots on the slicer's connections.** Every connected Pivot
   re-queries on every click. Consolidate: one Pivot serving several charts beats
   six near-identical Pivots.
3. **Look for formulas that reference Pivot output** — `GETPIVOTDATA` across
   hundreds of cells, or `SUMIFS` over a full sheet, all recalculating after
   each refresh.
4. **Volatile functions and whole-column conditional formatting** (Modules 2, 6).
5. **Check the DAX.** A measure using `FILTER` over a whole fact table where a
   simple boolean filter would do can be orders of magnitude slower. Rewrite
   `CALCULATE([X], FILTER(fct_Sales, fct_Sales[Channel]="Direct"))` as
   `CALCULATE([X], fct_Sales[Channel]="Direct")`.
6. **Finally, cardinality**: a relationship on a high-cardinality text key
   (`OrderID`) is far more expensive than on an integer surrogate. Fix it in
   Power Query.
