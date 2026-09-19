# Solutions — Module 8: Power Query & the M Language

**8.1 — Typed import with a safe margin**

```m
let
    Source = Csv.Document(File.Contents(DataFolder & "\sales_transactions.csv"),
                          [Delimiter=",", Columns=14, Encoding=65001,
                           QuoteStyle=QuoteStyle.Csv]),
    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),
    Typed = Table.TransformColumnTypes(Headers, {
        {"OrderID", type text}, {"OrderDate", type date}, {"SKU", type text},
        {"Category", type text}, {"RegionCode", type text},
        {"Channel", type text}, {"Segment", type text}, {"SalesRep", type text},
        {"Quantity", Int64.Type}, {"UnitPrice", type number},
        {"Discount", type number}, {"NetRevenue", type number},
        {"COGS", type number}, {"OrderStatus", type text}}),
    Shipped = Table.SelectRows(Typed, each [OrderStatus] <> "Returned"),
    Margin = Table.AddColumn(Shipped, "Margin", each
        if [NetRevenue] = null or [NetRevenue] = 0 then null
        else ([NetRevenue] - [COGS]) / [NetRevenue], type number)
in
    Margin
```

Close & Load To → **Only Create Connection**. Filtering before adding the
column means the custom column is evaluated on fewer rows — the general rule of
filter-early applies even without folding.

**8.2 — Merge with products, and the anti-join**

Home → Merge Queries → `Sales` ← `Products` on `SKU`, **Left Outer**. Expand
`ProductName`, `Brand`, `UnitCost` (untick "use original column name as
prefix").

Products that never sold — Merge `Products` ← `Sales` on `SKU`, join kind
**Left Anti**, which keeps only the product rows with no match in sales:

```m
    Unsold = Table.NestedJoin(Products, {"SKU"}, Sales, {"SKU"},
                              "s", JoinKind.LeftAnti)
```

With 120 products and 5,000 orders drawn uniformly, expect few or none — which
is itself the finding, and worth stating rather than leaving the query silent.

**8.3 — Validating regions**

Merge `Sales` ← `Regions` on `RegionCode`, **Left Anti**. Zero rows means every
sales row maps to a known region.

If rows *did* appear, the pipeline — not a person — should handle it. Three
defensible designs, in increasing strictness:

1. Add a `RegionCode = "UNMAPPED"` bucket and load anyway, with a count surfaced
   on the validation sheet. Nothing is silently dropped.
2. Route the unmatched rows to a separate "rejects" query that loads to a sheet
   for someone to fix.
3. Fail the refresh deliberately with `error "Unmapped regions found"` so the
   pack cannot be published with bad data.

Which one is right depends on whether a wrong total or a late report is the
worse outcome. Say which you chose and why — that is the answer being marked.

**8.4 — The contacts pipeline**

See [solution 5.8](05-data-cleaning.md) for the full Advanced Editor listing.
After appending five dirty rows to the CSV, Data → Refresh All re-runs every
step against the new file. Nothing to edit: that is the entire value proposition
of Power Query over a column of formulas.

**8.5 — Group By, two ways**

Aggregates:

```m
Table.Group(Source, {"RegionCode", "Category"}, {
    {"Revenue",  each List.Sum([NetRevenue]), type number},
    {"Orders",   each Table.RowCount(_), Int64.Type},
    {"Reps",     each List.Count(List.Distinct([SalesRep])), Int64.Type}})
```

With **All Rows**, then extract each group's largest order:

```m
Grouped = Table.Group(Source, {"RegionCode", "Category"},
                      {{"Rows", each _, type table}}),
Biggest = Table.AddColumn(Grouped, "TopOrder", each
    Table.First(Table.Sort([Rows], {{"NetRevenue", Order.Descending}}))),
Expanded = Table.ExpandRecordColumn(Biggest, "TopOrder",
    {"OrderID", "OrderDate", "NetRevenue"},
    {"TopOrderID", "TopOrderDate", "TopOrderRevenue"})
```

The "All Rows" nested-table pattern is the door to anything per-group: top N,
running totals within a group, first/last by date.

**8.6 — Unpivot**

Select `Region` → right-click → **Unpivot Other Columns**. Result:

```
Region | Attribute | Value
NA-E   | Jan       | 118000
NA-E   | Feb       | 124000
…
```

Rename `Attribute` → `Month`, `Value` → `Revenue`, and convert the month name
to a real date if it will be used on a time axis.

Why "Unpivot Other Columns" and not "Unpivot Columns": the former records
"everything except Region", so a `May` column next month is unpivoted
automatically. The latter records the specific column names, and May would be
left as a stray column — or the step would error because a listed column is
missing. Same visible result today, completely different behaviour in
production. This is the single most useful habit in Power Query.

**8.7 — `fnCleanText` applied to every text column**

```m
// fnCleanText
(input as nullable text) as nullable text =>
    if input = null then null
    else Text.Trim(Text.Clean(Text.Replace(input, Character.FromNumber(160), " ")))
```

```m
// Applied to every text column in one step
TextCols = Table.ColumnNames(
    Table.SelectColumns(Source,
        List.Select(Table.ColumnNames(Source),
                    each Type.Is(Value.Type(Table.Column(Source, _){0}), type text)))),
Cleaned = Table.TransformColumns(Source,
    List.Transform(TextCols, each {_, fnCleanText, type text}))
```

Simpler and more robust when you know the columns are already typed — build the
transform list from the table's schema rather than sampling the first row:

```m
TextCols = Table.ColumnNames(Table.SelectColumns(Source,
    List.Select(Table.ColumnNames(Source),
                each Table.Schema(Source){[Name=_]}[TypeName] = "Text.Type"))),
Cleaned = Table.TransformColumns(Source,
    List.Transform(TextCols, each {_, fnCleanText, type text}))
```

**8.8 — The `DataFolder` parameter**

Home → Manage Parameters → New: Name `DataFolder`, Type Text, Current Value the
local path. Then replace every literal path:

```m
File.Contents(DataFolder & "\sales_transactions.csv")
```

A colleague changes exactly one thing: Data → Get Data → Query Options (or
Manage Parameters) → set `DataFolder` to their own path. Nothing else, and no M
editing. Document that single step on the README sheet.

**8.9 — Tiered restructure**

```
Group: 01 Staging (all connection-only, no transformations beyond import + type)
    stg_Sales, stg_Products, stg_Regions, stg_Targets
Group: 02 Transform (connection-only)
    dim_Product   = stg_Products, trimmed, deduped on SKU
    dim_Region    = stg_Regions
    dim_Date      = generated
    fct_Sales     = stg_Sales, filtered, merged to keys, typed
Group: 03 Load
    → Data Model
```

What breaks less when the CSV gains a column: only `stg_Sales` sees the raw
file, and it uses **Choose Columns** rather than Remove Columns, so a new source
column is simply not selected and nothing downstream notices. Without tiers, the
new column propagates into every query that touched the file, and any step
recorded as "Removed Columns" with an explicit list either errors or silently
lets the new column through into the model.
