# Solutions — Module 7: PivotTables & PivotCharts

**7.1 — Revenue by region × channel**

Insert → PivotTable on the `Sales` **Table** (not the range).
Rows: `RegionCode`. Columns: `Channel`. Values: `NetRevenue` → Sum.
Filters: `OrderStatus` = Shipped (or better, a slicer).

Number format: Value Field Settings → Number Format → Custom
`#,##0.0,,"m"` for millions or `#,##0.0,"k"` for thousands. Each comma before
the closing quote divides by a thousand. Set it here, not on the cells — cell
formatting is discarded on refresh.

Design → Report Layout → **Tabular Form**, Repeat All Item Labels, and
Subtotals → Do Not Show.

**7.2 — The same field three times**

Drag `NetRevenue` into Values three times:

1. Sum — Value Field Settings → Custom Name "Revenue".
2. Sum → Show Values As → **% of Column Total** — "Share of channel".
3. Sum → Show Values As → **% Difference From** → Base field `Year`, Base item
   `(previous)` — "YoY".

Reading APAC-S together: a small absolute number with a high share of one
channel and strong YoY growth is a different story from a small number that is
flat — the first is an emerging region concentrated in one route to market
(and therefore fragile), the second is a region that is simply small. Three
columns, one source field, and the interpretation changes completely.

**7.3 — Monthly trend with grouping**

Rows: `OrderDate` → right-click → Group → Years, Quarters, Months.
Values: `NetRevenue` three times — Sum, Running Total In `OrderDate`, and
% Running Total In `OrderDate`.

The month where the % running total first crosses 50% is the midpoint of the
year's revenue. With the Q4 seasonality seeded into the generator it lands later
than June — which is the analytic point: a business with a Q4 skew is not half
done at half time, and a straight-line forecast in July will understate the year.

**7.4 — Order size distribution**

Rows: `Quantity` → Group → Start 1, End 50, By 5. Values: Count of `OrderID`.

The generator draws quantities from a lognormal distribution, so the shape is a
sharp peak in the 1–5 bucket with a long right tail. What to check next: whether
the large-quantity tail is concentrated in a particular segment or channel
(Enterprise/Direct, most likely), and whether those orders carry systematically
higher discounts — the classic volume-discount question, and a cross-tab of
quantity bucket against average discount answers it directly.

**7.5 — Calculated field vs helper column**

PivotTable Analyze → Fields, Items & Sets → Calculated Field:

```
Profit     = NetRevenue - COGS
MarginPct  = (NetRevenue - COGS) / NetRevenue
```

Helper column in the source Table: `=([@NetRevenue]-[@COGS])/[@NetRevenue]`,
then added to the Pivot as **Average**.

They disagree whenever the group contains rows of different sizes. The
calculated field computes `(ΣRevenue − ΣCOGS) / ΣRevenue` — a
revenue-weighted margin. The helper column averaged gives the unweighted mean of
per-order margins, where a £20 accessory order counts as much as a £40,000
laptop order.

The weighted version is almost always the one the business means by "our
margin". State which you are showing; a great deal of reporting confusion comes
from two people computing "average margin" and getting different, individually
correct, answers.

**7.6 — Distinct reps per region per quarter**

Recreate the Pivot with **Add this data to the Data Model** ticked, then
`SalesRep` → Values → Summarize Values By → **Distinct Count**.

What else changes when you tick the box: you gain relationships across multiple
tables and DAX measures; you lose the ability to group some field types
(especially dates, in older builds), calculated items are unavailable,
calculated fields become DAX measures instead, and the source is now a model
rather than a range, so refresh behaviour changes. In practice, ticking it is
the right default for anything beyond a throwaway Pivot.

Also note: distinct counts are **not additive**. The grand total is the number of
distinct reps overall, which is less than the sum of the per-region counts
because reps who sell in two regions are counted once in the total and twice in
the rows. That is correct, and it will be questioned by someone every time.

**7.7 — Top 10, two ways**

Value Filters → Top 10 → Top / 10 / Items / by Sum of NetRevenue.

Rank version: add `NetRevenue` a second time → Show Values As → **Rank Largest
to Smallest**, base field `SKU`, then filter on the rank column.

The Value Filter updates correctly as the data grows — it re-evaluates the top
10 on every refresh. The rank version also updates, but if you filtered it by
typing a manual selection of SKUs rather than filtering on the rank column, that
selection is frozen. The failure mode to warn about is the third approach people
actually use: copying the top 10 out to cells beside the Pivot, which stops
being the top 10 the moment the data changes.

**7.8 — "The total is 400 instead of 4 million"**

1. **The value field is set to Count, not Sum.** ~5,000 rows would show as
   5,000, but on a filtered subset 400 is entirely plausible. Check Value Field
   Settings first — this is the cause in the large majority of cases, and it
   happens because one text value in the column made Excel choose Count.
   Find it: `=SUMPRODUCT(--NOT(ISNUMBER(Sales[NetRevenue])))`.
2. **A filter or slicer is active** that the person reading it cannot see —
   including a report filter set to a single item, or a slicer on another sheet.
3. **The source range excludes most of the data** — a Pivot built on a fixed
   range rather than a Table, so rows added since have never been included.
   Check PivotTable Analyze → Change Data Source.

**7.9 — Three Pivots, one slicer set**

Build all three from the same Pivot cache: create the first, then for the second
and third use **Copy the first Pivot and paste**, or create from the same Table
(Excel reuses the cache automatically when the source matches). Insert one
`RegionCode` slicer and one `OrderDate` timeline, then right-click each →
**Report Connections** → tick all three Pivots.

If a Pivot refuses to connect, it is on a different cache — usually because it
was created from a differently-specified source range, or one was created with
the Data Model and the others were not. Rebuild it from the same source. This
is exactly the trap that ruins dashboards, which is why Module 10 insists on one
connection for everything.
