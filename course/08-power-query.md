# Module 8 — Power Query & the M Language

> **Goal:** replace the monthly copy-paste-clean ritual with a pipeline that
> runs on one click, every time, identically.
>
> **Time:** ~6 hours · **Prerequisites:** Module 5 · **Data:** all CSVs

---

## 8.1 What Power Query is

An ETL engine built into Excel (Data tab → Get & Transform) and into Power BI.
You point it at a source, click your way through transformations, and it records
each one as a step in the **M** language. Refresh re-runs every step against the
current source.

The mental shift: **you are not editing data, you are writing a recipe.** The
output is disposable; the query is the asset.

```
Source ──▶ Step 1 ──▶ Step 2 ──▶ … ──▶ Step n ──▶ Load
  │                                                 │
  CSV / Excel / folder / web / DB                   Table, PivotTable,
  SharePoint / JSON / another query                 Connection-only, Data Model
```

**Load destinations** (Close & Load To…):

| Destination | Use when |
|---|---|
| Table on a worksheet | You need to see or reference the rows |
| PivotTable Report | The output is only ever aggregated |
| Only Create Connection | It is an intermediate query, or feeds the model |
| + Add to Data Model | It participates in relationships / DAX (Module 9) |

Excel's grid caps at 1,048,576 rows. The Data Model does not — connection-only +
Data Model handles multi-million-row sources that cannot be loaded to a sheet
at all.

---

## 8.2 The transformations you will use constantly

**Shaping**

| Transform | Notes |
|---|---|
| Use First Row as Headers | Almost always step 2 |
| Remove Columns / Choose Columns | Prefer **Choose** — it survives new source columns |
| Remove Top/Bottom Rows | For the junk above real headers |
| Remove Blank Rows, Remove Errors | |
| Change Type | Set it explicitly and **last**, after cleaning |
| Split Column (delimiter / positions / by example) | |
| Merge Columns | |
| Replace Values / Replace Errors | Replace Errors is how you handle bad rows gracefully |
| Trim / Clean / Format Case | Transform → Format |
| Fill Down / Fill Up | Fixes the "value only on the first row of a group" layout |
| Add Column From Examples | Infers the transformation; excellent for dates |
| Conditional Column | Visual IF, no code |
| Index Column | 0- or 1-based row numbers |

**Reshaping — the two that matter most**

- **Unpivot Columns** turns a wide crosstab into a flat table. This is the
  single most valuable button in Power Query. Select the columns that should
  stay, then right-click → **Unpivot Other Columns** — that variant keeps
  working when next month's file has a thirteenth month column.
- **Pivot Column** goes the other way, when you genuinely need a crosstab.

**Combining**

- **Append** stacks tables with matching columns (union). Append a *folder* of
  files and you have consolidated 200 monthly exports with one query.
- **Merge** joins on key columns (SQL join). Join kinds: Left Outer (default,
  the one you usually want), Right Outer, Full Outer, Inner, Left Anti, Right
  Anti. **The Anti joins are your data-quality tool** — a Left Anti merge
  answers "which sales rows have a SKU that is not in the product table?"
  instantly.
- **Group By** aggregates: sum, count, distinct count, min, max, and "All Rows"
  (which nests the group's rows as a table in a column — the door to
  per-group operations).

**The From Folder pattern**, worth learning on its own: point at a folder,
Power Query builds a sample query plus a function plus a combine step, and
every file dropped in that folder from then on is included on refresh. That is
a whole reporting process, retired.

---

## 8.3 Reading M

Every click writes M. View → **Advanced Editor** shows the whole query.

```m
let
    Source = Csv.Document(
        File.Contents("C:\course\sales_transactions.csv"),
        [Delimiter = ",", Columns = 14, Encoding = 65001, QuoteStyle = QuoteStyle.Csv]),
    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars = true]),
    Typed = Table.TransformColumnTypes(Headers, {
        {"OrderID", type text}, {"OrderDate", type date},
        {"Quantity", Int64.Type}, {"NetRevenue", type number}}),
    Shipped = Table.SelectRows(Typed, each [OrderStatus] <> "Returned"),
    WithMargin = Table.AddColumn(Shipped, "Margin",
        each if [NetRevenue] = 0 then null else ([NetRevenue] - [COGS]) / [NetRevenue],
        type number)
in
    WithMargin
```

What to know:

- `let … in` — a list of named steps, then the one that is returned. Each step
  usually refers to the previous one, which is why renaming a step in the UI
  safely rewrites the references.
- **Step names with spaces** appear as `#"Removed Columns"`. That is quoting,
  not magic.
- `each` introduces a function whose argument is `_`; `[Column]` is shorthand
  for `_[Column]`.
- **M is case-sensitive.** `Text.Upper` works; `text.upper` does not. This is
  the number-one beginner error, and the error message is unhelpful.
- Types: `type text`, `type number`, `Int64.Type`, `type date`, `type datetime`,
  `type logical`, `type any`.
- `null` is M's empty. `null + 1` is `null` — nulls propagate silently through
  arithmetic, which is how a total comes out empty.

**Useful functions to hand-write:**

```m
Text.Trim, Text.Clean, Text.Upper, Text.Proper, Text.Contains,
Text.Start, Text.End, Text.Middle, Text.Split, Text.Combine, Text.PadStart
Date.Year, Date.Month, Date.StartOfMonth, Date.EndOfMonth, Date.AddDays,
Date.From, Date.ToText, Duration.Days
List.Sum, List.Max, List.Distinct, List.Count, List.Contains, List.Generate
Table.SelectRows, Table.AddColumn, Table.Group, Table.Sort, Table.Distinct,
Table.NestedJoin, Table.ExpandTableColumn, Table.Buffer
try … otherwise                       ← M's IFERROR
```

```m
// A safe numeric parse, the M way
each try Number.From(Text.Remove([Spend], {"$", ",", " ", "U", "S", "D"}))
     otherwise null
```

---

## 8.4 Parameters and reusable functions

**Parameters** (Home → Manage Parameters) externalise the things that change:
a file path, a cut-off date, an environment name. Then the query is portable —
nobody has to edit M to point it at their own copy of the file.

```m
Source = Csv.Document(File.Contents(DataFolder & "\sales_transactions.csv"), …)
```

**Custom functions**: right-click a query → Create Function, or write one:

```m
// fnCleanText — the standard string cleanse as a reusable function
(input as nullable text) as nullable text =>
    if input = null then null
    else Text.Trim(Text.Clean(Text.Replace(input, Character.FromNumber(160), " ")))
```

Invoke it on any column with **Add Column → Invoke Custom Function**. One
definition, used by every query in the workbook.

---

## 8.5 Performance: query folding

When the source is a database, Power Query tries to translate your steps into a
single SQL statement and let the server do the work. This is **query folding**,
and it is the difference between a 3-second refresh and a 20-minute one.

- Right-click a step → **View Native Query**. Greyed out = folding has stopped
  at that step.
- Folding-friendly, keep these early: filter rows, remove/choose columns, rename,
  group by, joins on indexed keys, change type.
- **Folding breakers**, push these as late as possible: `Table.Buffer`, adding a
  custom column with an M-only function, Index columns, Keep Duplicates,
  merging with a query from a different source type.
- **Filter and remove columns first, always.** Every later step then processes
  less data, folding or not.
- CSV and Excel sources do not fold at all — there is no server. There, the
  rules are simpler: reduce rows and columns as early as possible, avoid
  referencing one query many times (each reference re-evaluates it — this is
  what `Table.Buffer` is for), and prefer Data Model loading over sheet loading
  for large results.

**Privacy levels** can force Power Query to buffer entire sources rather than
combining them (the "Formula.Firewall" error). Data source settings → set
consistent privacy levels, or disable the check per workbook once you have
understood what it protects against.

---

## 8.6 The recommended pipeline shape

For anything beyond a one-off, structure your queries in three tiers — the same
input/calculation/output idea as Module 1:

```
Staging (connection-only)     Transform (connection-only)     Load
──────────────────────────    ───────────────────────────     ────────────────
stg_Sales    ← raw CSV        dim_Product  ← stg_Products     → Data Model
stg_Products                  dim_Region   ← stg_Regions      → Data Model
stg_Regions                   fct_Sales    ← stg_Sales +      → Data Model
                                             merges, typing
```

Put staging queries in a group, keep every raw source untouched in tier 1, and
do all the shaping in tier 2. When the source format changes, you fix one
staging query rather than six tangled ones.

---

## Exercises

Solutions: [`exercises/solutions/08-power-query.md`](../exercises/solutions/08-power-query.md).

**8.1** Import `sales_transactions.csv`. Set every column's type explicitly,
filter out `Returned` orders, and add a `Margin` column that returns `null`
rather than an error when revenue is zero. Load as a connection only.

**8.2** Merge `Sales` with `Products` on `SKU` (Left Outer) and expand
`ProductName`, `Brand` and `UnitCost`. Then run a **Left Anti** merge in the
other direction and report which products never sold.

**8.3** Merge `Sales` with `Regions` on `RegionCode`, then use an Anti join to
prove no sales row has an unmapped region. Describe what you would do in the
pipeline if one did.

**8.4** Build the full `messy_contacts.csv` cleaning pipeline from Module 5.6.
Append five new dirty rows to the CSV, refresh, and confirm they come through
clean. Paste your Advanced Editor output as the answer.

**8.5** Group `Sales` by `RegionCode` and `Category`, producing sum of revenue,
count of orders, and distinct count of sales reps. Then do it again with
"All Rows" and extract each group's single largest order.

**8.6** Take the wide layout below, paste it into Excel, and unpivot it into a
flat table. Use **Unpivot Other Columns** and explain why that choice matters
when a `May` column appears next month.

```
Region   Jan     Feb     Mar     Apr
NA-E     118000  124000  131000  127000
UKI       72000   69000   77000   81000
```

**8.7** Write `fnCleanText` from 8.4 and apply it to every text column of
`messy_contacts` in a single step (hint: `Table.TransformColumns` with a list
built from `Table.ColumnNames`).

**8.8** Create a `DataFolder` parameter, repoint all queries at it, and describe
what a colleague must change to run the workbook on their own machine.

**8.9** Restructure everything from this module into the staging / transform /
load tiers of 8.6. Explain what breaks less when the CSV gains a column.

---

## Pitfalls recap

- M is case-sensitive. `Text.Trim`, not `text.trim`.
- `null` propagates through arithmetic without complaint.
- Set types explicitly, and set them last.
- "Remove Columns" breaks when the source gains a column; "Choose Columns" does not.
- Filter early — before folding stops, and before the expensive steps.
- Every reference to a query re-evaluates it.
- Locale matters: a query that parses dates on your machine may fail on a
  colleague's. Set the type with `using Locale` when the source is ambiguous.

**Next:** [Module 9 — Power Pivot & DAX](09-power-pivot-dax.md)
