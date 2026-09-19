# Solutions — Module 9: Power Pivot & DAX

**9.1 — The model**

Relationships (all single-direction, one-to-many, from dimension to fact):

```
dim_Date[Date]        1 → *  fct_Sales[OrderDate]
dim_Product[SKU]      1 → *  fct_Sales[SKU]
dim_Region[RegionCode]1 → *  fct_Sales[RegionCode]
dim_Date[Date]        1 → *  dim_Targets[Date]
```

Design → **Mark as Date Table** on `dim_Date`, date column `Date`. Hide every
key column from client tools, plus any staging column nobody should slice by.

Note `dim_Targets` is a second fact table, not a dimension — it joins to
`dim_Date` only. That is correct and normal: two fact tables sharing a
conformed date dimension is how you compare actuals to targets.

**9.2 — Base measures, and why `Margin %` must be a measure**

```dax
Total Revenue   = SUM(fct_Sales[NetRevenue])
Total Cost      = SUM(fct_Sales[COGS])
Gross Profit    = [Total Revenue] - [Total Cost]
Margin %        = DIVIDE([Gross Profit], [Total Revenue])
Order Count     = COUNTROWS(fct_Sales)
Avg Order Value = DIVIDE([Total Revenue], [Order Count])
Active Reps     = DISTINCTCOUNT(fct_Sales[SalesRep])
```

A calculated column `Margin = (NetRevenue - COGS) / NetRevenue` computes a
margin **per order line**. Put it in a Pivot and you must choose an aggregation:
`SUM` is meaningless (adding percentages), and `AVERAGE` gives the unweighted
mean of per-order margins.

Concrete case: two orders, one at £100 revenue / £90 cost (10% margin) and one
at £10,000 revenue / £6,000 cost (40% margin). The averaged calculated column
says 25%. The measure says (10,100 − 6,090) / 10,100 = **39.7%**. The business
made 39.7 pence on every pound. The 25% figure describes nothing that exists.

**9.3 — Three denominators**

```dax
% of All        = DIVIDE([Total Revenue],
                         CALCULATE([Total Revenue], REMOVEFILTERS(dim_Region)))
% of Selected   = DIVIDE([Total Revenue],
                         CALCULATE([Total Revenue], ALLSELECTED(dim_Region)))
% of Super      = DIVIDE([Total Revenue],
                         CALCULATE([Total Revenue],
                                   ALLEXCEPT(dim_Region, dim_Region[SuperRegion])))
```

With a slicer selecting four of eight regions:

| Measure | Denominator | Column sums to |
|---|---|---|
| `% of All` | All eight regions | less than 100% |
| `% of Selected` | The four selected | exactly 100% |
| `% of Super` | The selected region's super-region (respecting the slicer) | 100% within each super-region group |

`% of Selected` is what a dashboard user almost always expects: "share of what I
am looking at". `% of All` is what they want when the point is *how much* of the
business they have filtered down to.

**9.4 — Prior year and rolling**

```dax
Revenue PY =
VAR Prior = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(dim_Date[Date]))
RETURN IF(NOT ISBLANK([Total Revenue]) || NOT ISBLANK(Prior), Prior)

YoY Growth % =
VAR Curr  = [Total Revenue]
VAR Prior = CALCULATE([Total Revenue], SAMEPERIODLASTYEAR(dim_Date[Date]))
RETURN IF(ISBLANK(Prior) || Prior = 0, BLANK(), DIVIDE(Curr - Prior, Prior))

Rolling 3M =
CALCULATE([Total Revenue],
    DATESINPERIOD(dim_Date[Date], MAX(dim_Date[Date]), -3, MONTH))
```

The guard matters: without it, 2023 (the first year in the data) shows a growth
rate computed against a blank prior year. DAX treats blank as zero in
arithmetic, so `(Curr − 0) / 0` yields blank via `DIVIDE`, but any variant
using `/` gives infinity or a misleading 100%. Returning `BLANK()` makes the
chart leave a gap, which is the truthful rendering.

`Rolling 3M` is also incomplete for the first two months of the data — say so in
a footnote rather than letting a partial window look like a decline.

**9.5 — Share of super-region**

```dax
% of Super-Region =
DIVIDE([Total Revenue],
       CALCULATE([Total Revenue],
                 ALLEXCEPT(dim_Region, dim_Region[SuperRegion])))
```

`ALLEXCEPT` removes every filter on `dim_Region` *except* `SuperRegion`, so the
denominator is the whole of Americas while the numerator stays on NA-E. Within
Americas the values sum to 100%.

Using `ALL(dim_Region[RegionCode])` instead would give the same numbers only by
coincidence of this model's shape; `ALLEXCEPT` states the intent, which is what
the next person reading it needs.

**9.6 — Reconciling with SUMX**

```dax
Revenue Recalc =
SUMX(fct_Sales, fct_Sales[Quantity] * fct_Sales[UnitPrice] * (1 - fct_Sales[Discount]))

Reconciliation Diff = [Revenue Recalc] - [Total Revenue]
```

The difference is small and non-zero. The generator computes `NetRevenue` with
`round(qty * price * (1 - discount), 2)` — rounded to the cent per row. `SUMX`
recomputes the unrounded product and sums that. On the seeded data the totals
are 14,146,957.03 stored against 14,146,957.24 recomputed: a difference of about
21 pence across 5,000 rows, because per-row rounding errors are signed and
mostly cancel. On a dataset where rounding is systematically one-directional —
prices always rounded up, say — the gap grows with row count instead.

Neither is "wrong". The stored column is what was invoiced; the recomputed
figure is the arithmetic ideal. Which one belongs in a report depends on whether
the number has to tie to the ledger — and it usually does, so use the stored
column and know why they differ.

**9.7 — Attainment KPIs, and the date-table trap**

```dax
Target       = SUM(dim_Targets[RevenueTarget])
Variance     = [Total Revenue] - [Target]
Attainment % = DIVIDE([Total Revenue], [Target])
Status =
    SWITCH(TRUE(),
        ISBLANK([Target]),     "No target",
        [Attainment %] >= 1,   "On track",
        [Attainment %] >= 0.9, "At risk",
                               "Behind")
```

Now slice by `fct_Sales[OrderDate]` instead of `dim_Date[Date]`. Revenue filters
correctly, because the filter is on the fact table's own column. `Target`
does **not**: `dim_Targets` has no relationship to `fct_Sales`, so nothing
filters it, and every row shows the *entire* period's target. Attainment
collapses to a few percent everywhere and the dashboard is nonsense.

This is the whole argument for a conformed date dimension in one screenshot:
slicing on a fact table's own column filters that table and nothing else.

**9.8 — Explaining non-additive distinct counts**

*"Several reps sell into more than one region. The total counts each person
once, but the regional rows each count them again, so the rows add up to more
than the total. The total is the right answer to 'how many people sold anything',
and the rows are the right answer to 'how many people sold into this region' —
they are different questions, so they don't add up."*

**9.9 — Top 3 SKUs' combined revenue**

```dax
Top 3 SKU Revenue =
CALCULATE([Total Revenue],
    TOPN(3, ALL(dim_Product[SKU]), [Total Revenue], DESC))
```

On a grand total row this returns the combined revenue of the three biggest SKUs
overall — which is usually what is wanted. But note two behaviours to state
explicitly: `TOPN` does **not** break ties, so a tie at third place returns four
SKUs and a number larger than "top 3" implies; and if the Pivot already has
`SKU` on rows, `ALL` overrides that filter, so every row shows the same
top-3 total. Add `VALUES(dim_Product[SKU])` or use `ALLSELECTED` if you want it
to respect the user's slicer.
