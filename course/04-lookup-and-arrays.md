# Module 4 — Lookup, Reference & Dynamic Arrays

> **Goal:** retrieve any value from any table, in any direction, and know which
> tool to reach for — including the ones that still matter in Excel 2019.
>
> **Time:** ~5 hours · **Prerequisites:** Modules 2–3 · **Data:** `sales_transactions.csv`, `products.csv`, `regions.csv`

---

## 4.1 Why VLOOKUP is taught last here

`VLOOKUP(lookup_value, table_array, col_index_num, [range_lookup])` has four
defects, and you need to recognise all of them in inherited workbooks:

1. **It cannot look left.** The key must be the first column of the range.
2. **`col_index_num` is a hard-coded integer.** Insert a column in the source and
   every VLOOKUP silently returns the wrong field. Silently. This is the most
   expensive bug in spreadsheet history.
3. **The fourth argument defaults to TRUE** (approximate match) if omitted —
   which on unsorted data returns plausible nonsense rather than an error.
4. **It reads the whole table range**, so `VLOOKUP` over `A:Z` is far slower
   than an `INDEX`/`MATCH` reading two columns.

You will still write it, because it is everywhere. Write it like this, always:

```
=VLOOKUP($A2, Products!$A$2:$H$121, 6, FALSE)
        │      │                      │  └─ FALSE: exact. NEVER omit.
        │      └─ absolute, so filling down doesn't slide the table
        └─ column-locked, so filling right keeps the key
```

Make `col_index_num` robust with `MATCH` on the header row:

```
=VLOOKUP($A2, Products!$A$2:$H$121, MATCH(B$1, Products!$A$1:$H$1, 0), FALSE)
```

At which point you have written INDEX/MATCH the hard way — so write INDEX/MATCH.

---

## 4.2 INDEX + MATCH — the universal answer

```
=INDEX(return_range, MATCH(lookup_value, lookup_range, 0))
```

`MATCH` finds the *position*; `INDEX` returns the value at that position.
They are independent, so the lookup column and the return column can be
anywhere, in any order.

```
=INDEX(Products[ProductName], MATCH([@SKU], Products[SKU], 0))
```

**Two-dimensional lookup** — row key and column key:

```
=INDEX(Matrix, MATCH(rowKey, RowHeaders, 0), MATCH(colKey, ColHeaders, 0))
```

**MATCH's third argument:**

| `match_type` | Finds | Requires |
|---|---|---|
| `0` | Exact match. Supports wildcards. | Nothing — **use this** |
| `1` (default!) | Largest value ≤ lookup | Ascending sort |
| `-1` | Smallest value ≥ lookup | Descending sort |

Omitting it defaults to `1`, which on unsorted data returns a wrong answer
rather than `#N/A`. Type the `0`.

**Approximate match done right** — the band lookup. This is the one case where
`1` is correct, and it is genuinely useful:

```
Commission tiers (sorted ascending, lower bound only):
     A          B
1    0          2%
2    50000      4%
3    150000     7%
4    500000     10%

=INDEX($B$1:$B$4, MATCH(salesTotal, $A$1:$A$4, 1))
```

`INDEX` also has a second, stranger power: `INDEX(A:A, 0)` returns the whole
column as a reference, and `INDEX` returns a *reference*, not a value, so
`SUM(INDEX(...):INDEX(...))` builds a dynamic range with no volatility — the
non-volatile replacement for `OFFSET`.

---

## 4.3 XLOOKUP `[M365]`

```
=XLOOKUP(lookup_value, lookup_array, return_array,
         [if_not_found], [match_mode], [search_mode])
```

Everything INDEX/MATCH does, in one call, plus:

- **Built-in not-found value** — no `IFNA` wrapper: `=XLOOKUP(A2, Keys, Vals, "Unknown")`
- **Defaults to exact match.** Finally.
- **Searches in either direction**: `search_mode` `-1` finds the *last* match,
  which is how you get "most recent record for this customer" from a
  chronologically sorted log.
- **Returns arrays, not just cells**: give it a multi-column `return_array` and
  it returns the whole row, spilling.
- **Wildcard mode** (`match_mode` 2) and **approximate modes** (`-1` next
  smaller, `1` next larger).

```
=XLOOKUP([@SKU], Products[SKU], Products[[ProductName]:[ListPrice]], "Not found")
        → spills ProductName, Category, Brand, UnitCost, ListPrice in one go

=XLOOKUP(1, (Sales[SKU]=G1)*(Sales[RegionCode]=G2), Sales[NetRevenue], "None", 0, -1)
        → multi-criteria, last match wins
```

That last pattern — look up the value `1` in an array of multiplied boolean
conditions — is the general multi-criteria lookup, and it replaces the old CSE
`INDEX/MATCH` trick.

**`XMATCH`** is `MATCH` with the same modern defaults and a `search_mode`,
including binary search modes (`2`/`-2`) for large sorted data.

---

## 4.4 The dynamic array functions `[M365]`

| Function | Returns |
|---|---|
| `FILTER(array, include, [if_empty])` | Rows where `include` is TRUE |
| `SORT(array, [index], [order], [by_col])` | Sorted |
| `SORTBY(array, by_array1, order1, …)` | Sorted by a key not in the output |
| `UNIQUE(array, [by_col], [exactly_once])` | Distinct values |
| `SEQUENCE(rows,[cols],[start],[step])` | A generated series |
| `TAKE` / `DROP` / `CHOOSEROWS` / `CHOOSECOLS` | Sub-setting |
| `HSTACK` / `VSTACK` | Combining arrays |
| `TOCOL` / `TOROW` / `WRAPROWS` / `WRAPCOLS` | Reshaping |
| `GROUPBY` / `PIVOTBY` | Formula-driven aggregation |

**The report-in-one-formula pattern:**

```
=SORT(
   FILTER(Sales[[OrderDate]:[NetRevenue]],
          (Sales[RegionCode]="UKI") * (Sales[NetRevenue]>5000),
          "No matching orders"),
   1, -1)
```

Multiple conditions: `*` for AND, `+` for OR, each condition in its own
parentheses. All condition arrays must be the same height.

**Top-N:**
```
=TAKE(SORT(FILTER(Sales[[SalesRep]:[NetRevenue]], Sales[Category]="Laptops"), 2, -1), 10)
```

**A distinct-value driven summary — the two-formula report:**
```
E2: =SORT(UNIQUE(Sales[RegionCode]))
F2: =SUMIFS(Sales[NetRevenue], Sales[RegionCode], E2#)
```
`E2#` is the spill reference: F2 produces one result per region and resizes
itself automatically when a new region appears in the data. Two cells, a live
report.

**`GROUPBY`** collapses that further:
```
=GROUPBY(Sales[RegionCode], Sales[NetRevenue], SUM, 3, 0, -2)
        → region column + sum, header row, sorted descending by value
```

---

## 4.5 Legacy equivalents — you will need these

| Modern | Excel 2019 and earlier |
|---|---|
| `XLOOKUP(a,b,c,"x")` | `IFNA(INDEX(c,MATCH(a,b,0)),"x")` |
| `XLOOKUP` last-match | `LOOKUP(2,1/(b=a),c)` |
| `UNIQUE(range)` | Remove Duplicates on a copy, or a PivotTable |
| `FILTER(...)` | AutoFilter, Advanced Filter, or a helper column + sort |
| `SORT(...)` | The Sort dialog, or `LARGE`/`SMALL` with `ROW()` |
| `TEXTJOIN` with a condition | CSE `TEXTJOIN(",",TRUE,IF(cond,range,""))` |

The `LOOKUP(2, 1/(condition), result)` idiom deserves an explanation because it
is all over older workbooks: `1/(condition)` gives `1` where TRUE and `#DIV/0!`
where FALSE; `LOOKUP` searching for `2` never finds it, so it falls back to the
last non-error position. Result: the last row matching the condition. Ugly,
non-volatile, and works everywhere.

---

## 4.6 Choosing the right tool

```
Need one value from a key?
├── Have M365? ─────────────────→ XLOOKUP
└── Need 2019 compatibility? ───→ INDEX + MATCH(...,0)

Need many rows back?
├── M365 ────────────────────────→ FILTER
└── Legacy ──────────────────────→ AutoFilter / Advanced Filter / PivotTable

Need an aggregate, not a row? ───→ SUMIFS / COUNTIFS  (not a lookup at all)

Key is not unique?
└── Decide explicitly: first match, last match, or aggregate.
    A lookup on a non-unique key is a bug waiting for a second row.

Looking up in a band/tier? ──────→ MATCH(...,1) on a sorted lower-bound table
```

**Performance:** on 100k+ rows, `XLOOKUP`/`MATCH` over a *sorted* key with
binary search (`XMATCH` mode 2) is orders of magnitude faster than linear search.
Better still, if you are doing thousands of lookups to build one flat table, do
it in Power Query with a Merge (Module 8) — it is a hash join and it will finish
before Excel has finished redrawing.

---

## Exercises

Solutions: [`exercises/solutions/04-lookup-and-arrays.md`](../exercises/solutions/04-lookup-and-arrays.md).

**4.1** Add `ProductName`, `Brand` and `UnitCost` to each row of `Sales` from
`Products`. Do it three ways: VLOOKUP (written defensively), INDEX/MATCH, and a
single spilling XLOOKUP. Time the recalculation of each over all 5,000 rows.

**4.2** Someone inserts a column into `Products` between `Category` and `Brand`.
Which of your three formulas break, which silently return wrong data, and which
are unaffected? Explain the mechanism for each.

**4.3** Return the region *name* and *director* for each sale by joining through
`RegionCode` to `regions.csv`. Handle the case of a code that is not in the
region table with the text `"UNMAPPED"`.

**4.4** For each sales rep, find their single largest order: the order ID, date,
and amount. Do it with a multi-criteria XLOOKUP, and again with legacy functions.

**4.5** Build a commission table with tiers at 0 / 50,000 / 150,000 / 500,000
paying 2 / 4 / 7 / 10 percent, then compute each rep's commission on their 2025
revenue. Use approximate-match lookup, not nested IFs, and justify why.

**4.6** Using only dynamic arrays, produce a live top-10 SKUs by net revenue
report that shows SKU, product name, units sold and revenue, sorted descending,
and updates when the source Table grows. Maximum three formulas.

**4.7** Explain `=LOOKUP(2, 1/(Sales[SKU]=G1), Sales[OrderDate])` to a colleague
in three sentences, then state one situation where it beats XLOOKUP.

**4.8** Your XLOOKUP returns `#N/A` for rows you can see match by eye. Give five
causes in order of likelihood and the diagnostic formula for each.

---

## Pitfalls recap

- Never omit VLOOKUP's fourth argument, or MATCH's third.
- Hard-coded `col_index_num` is a time bomb; `MATCH` the header instead.
- A lookup on a non-unique key silently picks one row — decide which, explicitly.
- `#N/A` with a visible match usually means trailing spaces, `CHAR(160)`, or
  number-stored-as-text. Test with `=EXACT(TRIM(A2),TRIM(B2))` and `=ISNUMBER()`.
- `#SPILL!` means something is blocking the output range, including a stray
  space typed into a cell three rows down.
- Tens of thousands of lookups is a join. Use Power Query.

**Next:** [Module 5 — Data Cleaning & Transformation](05-data-cleaning.md)
