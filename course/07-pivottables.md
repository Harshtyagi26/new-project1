# Module 7 — PivotTables & PivotCharts

> **Goal:** answer aggregate questions in seconds, and know precisely what the
> tool is doing — including the parts that mislead people.
>
> **Time:** ~4 hours · **Prerequisites:** Modules 1, 3, 6 · **Data:** `sales_transactions.csv`, `employees.csv`

---

## 7.1 The model

A PivotTable is a cross-tabulation engine over a flat table. Four drop zones:

```
                    ┌─────────── COLUMNS ────────────┐
                    │  Direct  Partner  Online  Retail│
      ┌── FILTERS ──┤                                 │
      │  Year: 2025 │                                 │
      └─────────────┤                                 │
    R   NA-E        │   118k     94k     146k    31k  │  ← VALUES
    O   UKI         │    72k     61k      88k    12k  │    (aggregated)
    W   DACH        │    58k     49k      70k     9k  │
    S   APAC-N      │    44k     38k      61k     7k  │
```

- **Rows / Columns** — the fields you group *by* (the dimensions).
- **Values** — what gets aggregated (the measures).
- **Filters** — a page-level slice.

**Always build a PivotTable on a Table, not a range.** A range-based Pivot
points at fixed addresses and silently omits rows added later; you will not be
told. A Table-based Pivot picks up new rows on refresh.

**PivotTables do not auto-refresh.** `Alt`+`F5` refreshes one, `Ctrl`+`Alt`+`F5`
refreshes all. Set PivotTable Options → Data → "Refresh data when opening the
file" for anything you hand to someone else.

---

## 7.2 Value field settings — read this section twice

Double-click a value field header (or right-click → Value Field Settings).

**Summarize Values By:** Sum, Count, Average, Max, Min, Product, StdDev, Var,
**Distinct Count** (Data Model only — see 7.6).

> **The Count vs Count Numbers trap.** Dropping a field into Values defaults to
> `Sum` if Excel judges the column numeric, and `Count` otherwise. A single
> text value — one `"n/a"` in 5,000 rows — flips your revenue Sum into a Count,
> and the number looks plausible. If a Pivot total looks wrong by an order of
> magnitude, check the aggregation before you check anything else.

**Show Values As** — the feature most people never find, and the one that turns
a table of numbers into an analysis:

| Option | Gives you |
|---|---|
| % of Grand Total | Share of everything |
| % of Column / Row Total | Share within the column/row |
| % of Parent Row Total | Share within the group — the right one for hierarchies |
| Difference From (Previous) | Period-over-period change |
| % Difference From (Previous) | Growth rate |
| Running Total In | Cumulative |
| % Running Total In | Cumulative share — Pareto analysis |
| Rank Largest to Smallest | Rank within a group |
| Index | Relative importance vs. the overall pattern |

Add the *same* field to Values three times and set each differently: absolute,
% of column total, and % difference from previous year. That is a complete
report from one source field.

---

## 7.3 Grouping

- **Dates** — right-click a date row label → Group → tick Years, Quarters,
  Months. Excel creates the hierarchy for you. Modern Excel auto-groups dates
  on drop; turn it off in Options if you find it presumptuous.
- **Numbers** — right-click → Group → set start, end, and interval. Instant
  histogram bins (order values in 500-unit buckets, for instance).
- **Text** — select several row labels → right-click → Group. Creates an ad-hoc
  grouping you can rename ("Tier 1 Regions"). Useful, but it lives in the Pivot
  and not in your data — if the grouping is a real business concept, put it in a
  lookup table instead so every report agrees.

**Grouping is workbook-wide per field.** Group dates by month in one Pivot and
every other Pivot on the same source gets the same grouping. This surprises
everyone once. The workaround is separate Data Model connections, or a proper
date table (Module 9) — which is the real answer.

---

## 7.4 Calculated fields and items

**Calculated Field** — a formula over *summed* fields, added as a new value:

```
Profit          = NetRevenue - COGS
MarginPct       = (NetRevenue - COGS) / NetRevenue
```

> **The averaging-of-ratios trap.** A calculated field is evaluated on the
> aggregated totals, so `MarginPct` above is computed as
> `SUM(Revenue) - SUM(COGS)) / SUM(Revenue)` — which is correct. But a
> calculated field computing `AVERAGE(price)*SUM(qty)` is not the sum of
> row-level products. Calculated fields cannot use other aggregations, cannot
> reference cells outside, and cannot do row-level logic. When you need row-level
> arithmetic, add a helper column to the source Table instead — or move to
> Power Pivot and write a DAX measure (Module 9), which is the grown-up answer.

**Calculated Item** — a formula creating a new member *within* a field
(e.g. a "Core Regions" item summing NA-E and NA-W). Avoid them: they are slow,
they interact badly with grand totals, and the same result is cleaner as a
grouping column in the source.

**`GETPIVOTDATA`** — when you click a Pivot cell from another formula, Excel
writes `GETPIVOTDATA` instead of a cell reference. That is correct behaviour:
it retrieves by *field and item*, so it keeps working when the Pivot's layout
changes, where a cell reference would silently point at the wrong number.

```
=GETPIVOTDATA("NetRevenue", $A$3, "RegionCode","UKI", "Year",2025)
```

Turn the auto-generation off (PivotTable Analyze → Options dropdown) only when
you are deliberately building a fixed grid.

---

## 7.5 Slicers and timelines

**Slicers** are visual filters (Insert → Slicer). Their real value is
**Report Connections**: one slicer driving five PivotTables and their charts —
the foundation of every dashboard in Module 10.

**Timelines** are the date-specific version, with a day/month/quarter/year
granularity switch. They only accept genuine date fields, which is one more
reason to fix your date types in Module 5.

Practical notes: slicers connected to Pivots built on *different source
connections* cannot be linked. Build every Pivot for a dashboard from the same
connection — ideally from the Data Model. Hide slicer headers, set the column
count, and size them properly; a default slicer looks like a default slicer.

---

## 7.6 Distinct Count and the Data Model

Standard PivotTables **cannot** count distinct values. "How many customers
bought something?" is unanswerable — unless you tick **"Add this data to the
Data Model"** when creating the Pivot. Then `Distinct Count` appears in
Summarize Values By.

That checkbox puts you in the Power Pivot engine: different capabilities
(distinct count, relationships between tables, DAX measures), and a few
restrictions (no grouping on some field types, no calculated items). Module 9
covers it properly. For now: if you need distinct count or you need to Pivot
across two related tables without a lookup column, tick the box.

---

## 7.7 Layout and presentation

Defaults that are worth changing every single time:

- **Design → Report Layout → Show in Tabular Form** and **Repeat All Item
  Labels.** The default "Compact Form" stacks all dimensions into one column,
  which is unusable as a data source and prints badly.
- **Design → Subtotals → Do Not Show Subtotals** unless you actually want them.
- **PivotTable Options → Layout & Format → "Preserve cell formatting on update"**
  on, and **"Autofit column widths on update"** off — otherwise your formatting
  is destroyed on every refresh.
- **Options → Display → "Show items with no data"** when you need a complete
  grid (all twelve months, even the empty ones).
- **Options → Data → "Number of items to retain per field: None"** clears the
  ghost items that linger in slicers and filter lists after the source changes.
- **Number formatting** belongs in Value Field Settings → Number Format, not
  applied to the cells — the cell formatting is lost on refresh.

---

## Exercises

Build on `sales_transactions.csv` as a Table named `Sales`. Solutions:
[`exercises/solutions/07-pivottables.md`](../exercises/solutions/07-pivottables.md).

**7.1** Revenue by region (rows) × channel (columns), filtered to shipped orders,
with a grand total and values formatted in thousands with one decimal.

**7.2** Add the same revenue field twice more: as % of column total and as %
difference from the previous year. Interpret what the three columns together
tell you about APAC-S.

**7.3** Monthly revenue trend by year with dates grouped Year → Quarter → Month.
Then add a running total and a % running total, and identify the month where
cumulative revenue passes 50% of the year.

**7.4** Group `Quantity` into buckets of 5 and produce an order-size
distribution. What does the shape tell you, and what would you check next?

**7.5** Build a `Profit` and a `MarginPct` calculated field. Then compute
margin a *second* way with a helper column in the source Table, and explain
precisely when the two disagree.

**7.6** Count the distinct sales reps active per region per quarter. Explain why
this requires the Data Model and what else changes when you tick that box.

**7.7** Build a top-10 SKUs Pivot using the Value Filters, then reproduce it
with a Rank field. State which one updates correctly when the underlying data
grows and why.

**7.8** A stakeholder says the Pivot total is "about 400 instead of 4 million".
Give the three most likely causes in order and the check for each.

**7.9** Build three Pivots from one connection, connect a single region slicer
and a timeline to all three, and confirm they move together. This is your
Module 10 starting point.

---

## Pitfalls recap

- Build on a Table, or new rows quietly go missing.
- Pivots do not refresh themselves.
- One stray text value turns Sum into Count.
- Date grouping is shared across every Pivot on the same source.
- Calculated fields work on aggregates, never row by row.
- Distinct Count requires the Data Model.
- Cell-applied formatting is lost on refresh; set it in Value Field Settings.

**Next:** [Module 8 — Power Query & the M Language](08-power-query.md)
