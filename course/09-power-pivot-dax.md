# Module 9 — Power Pivot & DAX

> **Goal:** build a real star-schema data model with relationships and reusable
> measures, and understand filter context well enough to debug it.
>
> **Time:** ~6 hours · **Prerequisites:** Modules 7–8 · **Data:** all CSVs

---

## 9.1 Why a model beats a wide table

The lookup-everything-into-one-flat-table approach (Module 4) works until it
doesn't: 5,000 lookups recalculating, a file that has doubled in size, and a
`Category` column that now disagrees with the product master in three rows.

Power Pivot stores tables in a compressed columnar engine (VertiPaq), lets you
declare **relationships** between them, and lets you write **measures** that are
evaluated at query time in whatever context the PivotTable asks for.

Enable it: File → Options → Add-ins → COM Add-ins → **Microsoft Power Pivot for
Excel**. (Ticking "Add this data to the Data Model" on a Pivot or a Power Query
load does the same thing implicitly.)

### The star schema

```
                  ┌──────────────┐
                  │  dim_Date    │
                  │  DateKey (1) │
                  └──────┬───────┘
                         │ 1
                         │
                         ▼ *
  ┌────────────┐ 1   * ┌────────────────┐ *   1 ┌──────────────┐
  │ dim_Product├──────▶│   fct_Sales    │◀──────┤  dim_Region  │
  │ SKU        │       │ SKU, RegionCode│       │ RegionCode   │
  └────────────┘       │ DateKey, values│       └──────────────┘
                       └────────────────┘
```

One **fact** table of events (one row per order line), several **dimension**
tables of descriptive attributes, each joined on a single key. Dimensions are
short and wide; the fact table is long and narrow. Filters flow *from* the one
side *to* the many side.

Rules that keep a model healthy:

1. **Every dimension key must be unique** in its dimension table. That is what
   makes the relationship one-to-many.
2. **Never build relationships on composite text keys.** Create a single key
   column in Power Query if you need one.
3. **Always add a dedicated date table** and mark it as the date table
   (Design → Mark as Date Table). Time intelligence functions require it, and a
   date column on the fact table is not a substitute.
4. **Hide keys and technical columns** from client tools (right-click → Hide
   from Client Tools) so the field list shows only meaningful fields.
5. **Avoid bidirectional filters** unless you have a specific reason; they
   create ambiguity and slow queries.

### Building a date table

Add a Power Query blank query:

```m
let
    Start = #date(2023,1,1),
    End   = #date(2026,12,31),
    Days  = List.Dates(Start, Duration.Days(End - Start) + 1, #duration(1,0,0,0)),
    ToTable = Table.FromList(Days, Splitter.SplitByNothing(), {"Date"}),
    Typed = Table.TransformColumnTypes(ToTable, {{"Date", type date}}),
    Cols = Table.AddColumn(Typed, "Year", each Date.Year([Date]), Int64.Type),
    C2 = Table.AddColumn(Cols, "MonthNo", each Date.Month([Date]), Int64.Type),
    C3 = Table.AddColumn(C2, "MonthName", each Date.ToText([Date], "MMM"), type text),
    C4 = Table.AddColumn(C3, "Quarter", each "Q" & Text.From(Date.QuarterOfYear([Date])), type text),
    C5 = Table.AddColumn(C4, "YearMonth", each Date.ToText([Date], "yyyy-MM"), type text),
    C6 = Table.AddColumn(C5, "IsWeekend", each Date.DayOfWeek([Date], Day.Monday) >= 5, type logical)
in
    C6
```

Load to the Data Model, relate `fct_Sales[OrderDate]` → `dim_Date[Date]`, mark
as date table. Every time-intelligence function in 9.4 now works.

---

## 9.2 Calculated columns vs measures

This distinction is the whole of DAX, and getting it wrong is the most common
mistake.

| | Calculated column | Measure |
|---|---|---|
| Evaluated | At refresh, row by row | At query time, over the current filter |
| Stored | Yes — costs memory | No |
| Context | **Row context** | **Filter context** |
| Use for | Attributes to slice by; relationship keys | Anything aggregated |
| Example | `Year = YEAR(fct_Sales[OrderDate])` | `Total Revenue = SUM(fct_Sales[NetRevenue])` |

> **Default to measures.** A calculated column that aggregates is almost always
> wrong — it computes one answer at refresh time and cannot respond to slicers.
> Use a calculated column only when you need the value *as a field to group by*.

```dax
// Measures — put these in a dedicated "Measures" table
Total Revenue  = SUM(fct_Sales[NetRevenue])
Total Cost     = SUM(fct_Sales[COGS])
Gross Profit   = [Total Revenue] - [Total Cost]
Margin %       = DIVIDE([Gross Profit], [Total Revenue])
Order Count    = COUNTROWS(fct_Sales)
Active Reps    = DISTINCTCOUNT(fct_Sales[SalesRep])
Avg Order Value = DIVIDE([Total Revenue], [Order Count])
```

`DIVIDE(a, b, [alternate])` is the DAX way to divide — it returns blank (or your
alternate) instead of an error on a zero denominator, and it is faster than
`IF(b=0, …)`.

---

## 9.3 Filter context and CALCULATE

**Filter context** is the set of filters applied by the PivotTable: the row
label, the column label, the slicers, the report filters. A measure is evaluated
once per cell, under that cell's filter context.

`CALCULATE` is the only function that *modifies* filter context, and it is the
most important function in DAX.

```dax
CALCULATE(<expression>, <filter1>, <filter2>, …)
```

```dax
Revenue UKI      = CALCULATE([Total Revenue], dim_Region[RegionCode] = "UKI")
Revenue Laptops  = CALCULATE([Total Revenue], dim_Product[Category] = "Laptops")
Revenue Enterprise Direct =
    CALCULATE([Total Revenue],
        fct_Sales[Segment] = "Enterprise",
        fct_Sales[Channel] = "Direct")        -- multiple filters are ANDed
```

**Filter modifiers** — these are what make the pattern library work:

```dax
ALL(table_or_column)        remove filters entirely
ALLEXCEPT(table, cols…)     remove all filters except the listed columns
ALLSELECTED(…)              respect slicers, ignore row/column context
KEEPFILTERS(…)              intersect with the existing filter instead of replacing
REMOVEFILTERS(…)            the explicit, readable alias for ALL used as a modifier
VALUES(column)              the distinct values currently visible
```

**The percent-of-total pattern**, which you will write constantly:

```dax
% of Total Revenue =
DIVIDE(
    [Total Revenue],
    CALCULATE([Total Revenue], REMOVEFILTERS(dim_Region))
)
```

The numerator respects the current row (one region); the denominator removes the
region filter and so returns the all-regions total. Swap `REMOVEFILTERS` for
`ALLSELECTED` and the denominator respects the slicer selection instead — which
is usually what a dashboard user expects.

**A crucial subtlety:** a boolean filter argument like
`dim_Region[RegionCode] = "UKI"` is shorthand for
`FILTER(ALL(dim_Region[RegionCode]), dim_Region[RegionCode] = "UKI")` — it
*replaces* any existing filter on that column. Wrap it in `KEEPFILTERS` when you
want to intersect rather than override.

---

## 9.4 Time intelligence

All of these require a marked date table with contiguous dates.

```dax
Revenue YTD   = TOTALYTD([Total Revenue], dim_Date[Date])
Revenue QTD   = TOTALQTD([Total Revenue], dim_Date[Date])
Revenue PY    = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(dim_Date[Date]))
Revenue PM    = CALCULATE([Total Revenue], PREVIOUSMONTH(dim_Date[Date]))
YoY Growth    = DIVIDE([Total Revenue] - [Revenue PY], [Revenue PY])
Rolling 3M    =
    CALCULATE([Total Revenue],
        DATESINPERIOD(dim_Date[Date], MAX(dim_Date[Date]), -3, MONTH))
Rolling 12M   =
    CALCULATE([Total Revenue],
        DATESINPERIOD(dim_Date[Date], MAX(dim_Date[Date]), -12, MONTH))
```

`DATEADD`, `PARALLELPERIOD` and `DATESBETWEEN` cover the rest. If a time
intelligence measure returns blank everywhere, the cause is nearly always: no
marked date table, a date table with gaps, or the Pivot sliced by the fact
table's date column rather than the dimension's.

---

## 9.5 Iterators and variables

The `X` functions iterate row by row over a table, evaluating an expression in
row context, then aggregating:

```dax
Revenue Recalc = SUMX(fct_Sales, fct_Sales[Quantity] * fct_Sales[UnitPrice])
Max Order      = MAXX(fct_Sales, fct_Sales[NetRevenue])
Weighted Margin = DIVIDE(SUMX(fct_Sales, fct_Sales[NetRevenue] - fct_Sales[COGS]),
                         SUM(fct_Sales[NetRevenue]))
```

`SUMX` is how you do row-level arithmetic without storing a calculated column —
the correct answer to the Module 7 calculated-field trap.

**Variables** make DAX readable and each expression evaluated once:

```dax
YoY Growth % =
VAR Current = [Total Revenue]
VAR Prior   = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(dim_Date[Date]))
VAR Growth  = DIVIDE(Current - Prior, Prior)
RETURN
    IF(ISBLANK(Prior), BLANK(), Growth)
```

A `VAR` is evaluated in the filter context where it is *defined*, not where it
is used. That is a feature — it is how you capture "the value before I changed
the context" — and it is also the source of the classic "my variable ignores my
CALCULATE" confusion.

---

## 9.6 KPI and target patterns

With `daily_targets.csv` loaded and related to `dim_Date`:

```dax
Target          = SUM(dim_Targets[RevenueTarget])
Variance        = [Total Revenue] - [Target]
Attainment %    = DIVIDE([Total Revenue], [Target])
Status =
    SWITCH(TRUE(),
        ISBLANK([Target]),        "No target",
        [Attainment %] >= 1,      "On track",
        [Attainment %] >= 0.9,    "At risk",
                                  "Behind")
Rank of Region =
    IF(HASONEVALUE(dim_Region[RegionCode]),
       RANKX(ALL(dim_Region[RegionCode]), [Total Revenue]))
```

`SWITCH(TRUE(), …)` is the DAX idiom for a readable multi-branch conditional,
and `HASONEVALUE` is the standard guard against a measure producing nonsense on
a total row.

---

## Exercises

Solutions: [`exercises/solutions/09-power-pivot-dax.md`](../exercises/solutions/09-power-pivot-dax.md).

**9.1** Load `sales_transactions`, `products`, `regions` and `daily_targets` to
the Data Model via Power Query (connection-only). Build the date table from 9.1,
create all relationships, mark the date table, and hide every key column.
Submit a screenshot or description of the diagram view.

**9.2** Write the seven base measures from 9.2 in a dedicated Measures table.
Explain why `Margin %` must be a measure and not a calculated column, with a
concrete example where the calculated-column version gives the wrong number.

**9.3** Build `% of Total Revenue` three ways — with `ALL`, `ALLSELECTED` and
`ALLEXCEPT(dim_Region, dim_Region[SuperRegion])` — and describe exactly how the
three differ when a slicer is selecting four of the eight regions.

**9.4** Write `Revenue PY`, `YoY Growth %` and `Rolling 3M`. Confirm they return
blank rather than misleading values in the first period, and show the guard.

**9.5** Compute revenue for each region as a share of its super-region, so the
values within `Americas` sum to 100%. State which modifier you used and why.

**9.6** Reproduce `NetRevenue` with `SUMX` over `Quantity`, `UnitPrice` and
`Discount`, and reconcile it against `SUM(fct_Sales[NetRevenue])`. Where it does
not tie exactly, explain why (hint: rounding — Module 3).

**9.7** Build the attainment KPI set against `daily_targets`, including the
`Status` measure. Then break it deliberately by slicing on the fact table's date
column instead of the date dimension, and explain what happens and why.

**9.8** `DISTINCTCOUNT(fct_Sales[SalesRep])` on a grand total row gives a
different number than the sum of the per-region distinct counts. Explain this to
a stakeholder in two sentences without using the word "context".

**9.9** Write a measure returning the top 3 SKUs' combined revenue within the
current filter context. Use `TOPN` and explain what happens on the grand total.

---

## Pitfalls recap

- A calculated column that aggregates is almost certainly a mistake.
- Filters flow from the one side to the many side, not back, unless you say so.
- Time intelligence needs a marked, gap-free, dedicated date table.
- A boolean filter in `CALCULATE` replaces existing filters on that column —
  use `KEEPFILTERS` to intersect.
- `VAR` captures the context where it is defined.
- Distinct counts are not additive. Neither are ratios. Never sum a percentage.
- Relationships on non-unique keys will be rejected, and the fix is in Power
  Query, not in the model.

**Next:** [Module 10 — Charts & Dashboard Design](10-charts-and-dashboards.md)
