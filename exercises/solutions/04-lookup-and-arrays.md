# Solutions — Module 4: Lookup, Reference & Dynamic Arrays

**4.1 — Three ways to enrich the sales rows**

```
VLOOKUP (defensive):
  =VLOOKUP($C2, Products!$A$2:$H$121, MATCH(O$1, Products!$A$1:$H$1, 0), FALSE)

INDEX/MATCH:
  =INDEX(Products[ProductName], MATCH([@SKU], Products[SKU], 0))

XLOOKUP, spilling all three fields at once:
  =XLOOKUP([@SKU], Products[SKU],
           CHOOSECOLS(Products[#Data], 2, 4, 5), "Not found")
```

Relative cost over 5,000 rows: the XLOOKUP performs one search and returns three
values; the INDEX/MATCH trio performs three searches; the VLOOKUP trio performs
three searches *and* three `MATCH`es on the header row, and reads an 8-column
range each time. Measure it with a `Timer`-wrapped macro (Module 11) or simply
by watching the status bar on a full recalculation — the ordering is consistent.

The real answer for 5,000 rows × 3 columns is a Power Query merge (Module 8):
it is a hash join, done once, with nothing left recalculating afterwards.

**4.2 — Someone inserts a column in `Products`**

| Formula | Outcome |
|---|---|
| Naive `VLOOKUP(…, 6, FALSE)` | **Silently wrong.** Column 6 is now a different field. No error, plausible values, undetectable by inspection. |
| `VLOOKUP(…, MATCH(header,…), FALSE)` | Fine. `MATCH` re-finds the column by name. |
| `INDEX(Products[Brand], MATCH(…))` | Fine. The structured reference tracks the column by name. |
| `XLOOKUP` with `CHOOSECOLS(…, 2,4,5)` | **Silently wrong** — positional, same failure as the naive VLOOKUP. Name the columns instead: `HSTACK(Products[ProductName], Products[Brand], Products[UnitCost])`. |

The lesson is not "VLOOKUP bad": it is **never address a column by position**.
Any function can be made fragile this way, and `CHOOSECOLS` is the modern trap.

**4.3 — Join to the region table**

```
=XLOOKUP([@RegionCode], Regions[RegionCode], Regions[RegionName], "UNMAPPED")
=XLOOKUP([@RegionCode], Regions[RegionCode], Regions[RegionalDirector], "UNMAPPED")
```

Legacy:

```
=IFNA(INDEX(Regions[RegionName], MATCH([@RegionCode], Regions[RegionCode], 0)),
      "UNMAPPED")
```

Use `IFNA`, not `IFERROR`: if the region table is deleted you want to see
`#REF!`, not the word `UNMAPPED` quietly appearing on every row.

Then count the failures explicitly — a lookup with a fallback is only safe if
someone is watching the fallback:

```
=COUNTIF(P2:P5001, "UNMAPPED")
```

**4.4 — Each rep's largest order**

M365, multi-criteria against the rep's own maximum:

```
Max amount:  =MAXIFS(Sales[NetRevenue], Sales[SalesRep], $H2)
Order ID:    =XLOOKUP(1, (Sales[SalesRep]=$H2) * (Sales[NetRevenue]=$I2),
                      Sales[OrderID], "None", 0)
Order date:  =XLOOKUP(1, (Sales[SalesRep]=$H2) * (Sales[NetRevenue]=$I2),
                      Sales[OrderDate], "None", 0)
```

Legacy:

```
=INDEX(Sales[OrderID],
       MATCH(1, (Sales[SalesRep]=$H2) * (Sales[NetRevenue]=$I2), 0))   (CSE)
```

Note the tie case: if a rep has two orders at exactly the same maximum amount,
both formulas return the first. Decide deliberately — add `search_mode` `-1` for
the last, or aggregate instead of looking up.

**4.5 — Commission tiers**

```
        A         B
1       0         0.02
2       50000     0.04
3       150000    0.07
4       500000    0.10

Rep revenue: =SUMIFS(Sales[NetRevenue], Sales[SalesRep], $H2,
                     Sales[OrderDate], ">="&DATE(2025,1,1),
                     Sales[OrderDate], "<="&DATE(2025,12,31))
Rate:        =INDEX($B$1:$B$4, MATCH(I2, $A$1:$A$4, 1))
Commission:  =I2 * J2
```

Why not nested `IF`s: the tiers are *data*, and they change. A finance manager
can edit the table; nobody outside your team will edit a five-level nested `IF`
correctly. The lookup version also extends to twelve tiers with no formula
change at all.

If the scheme is genuinely marginal (each band's rate applies only to the
portion of revenue within it), the lookup above is wrong and you need a
cumulative-base column — state which scheme you implemented.

**4.6 — Live top-10 SKUs, three formulas**

```
H2: =TAKE(SORTBY(UNIQUE(Sales[SKU]),
                 SUMIFS(Sales[NetRevenue], Sales[SKU], UNIQUE(Sales[SKU])), -1), 10)
I2: =XLOOKUP(H2#, Products[SKU], Products[ProductName], "?")
J2: =SUMIFS(Sales[Quantity], Sales[SKU], H2#)
K2: =SUMIFS(Sales[NetRevenue], Sales[SKU], H2#)
```

Each of I, J and K is one formula operating on the spill range `H2#`, so the
block resizes itself as the Table grows. (Four formulas rather than three if you
want the name column — the SKU, units and revenue trio is achievable in three.)

`GROUPBY` collapses it further where available:

```
=TAKE(GROUPBY(Sales[SKU], Sales[NetRevenue], SUM, 0, 0, -2), 10)
```

**4.7 — The `LOOKUP(2, 1/(…))` idiom**

*"`1/(Sales[SKU]=G1)` gives 1 for every matching row and `#DIV/0!` for the rest.
`LOOKUP` is searching for 2, which it never finds, so by its rules it falls back
to the last numeric position — which is the last matching row. So the formula
returns the order date of the most recent row for that SKU."*

Where it beats XLOOKUP: it works in every version of Excel back to the 1990s,
it is non-volatile, and it needs no CSE entry. In a workbook that must open on
Excel 2016 on a colleague's machine, it is still the cleanest last-match
available. In M365, `XLOOKUP(…, 0, -1)` says the same thing legibly.

**4.8 — XLOOKUP returning #N/A on a visible match**

In order of likelihood:

1. **Trailing or leading whitespace.** `=LEN(A2)&" / "&LEN(B2)`, and
   `=EXACT(TRIM(A2),TRIM(B2))`.
2. **Non-breaking space `CHAR(160)`** from a web/PDF paste. `=CODE(RIGHT(A2,1))`
   → 160. Fix with `SUBSTITUTE(A2, CHAR(160), " ")`.
3. **Type mismatch** — one side is the number 1001, the other the text "1001".
   `=ISNUMBER(A2)` on both. Text to Columns → Finish coerces a whole column.
4. **Lookup and return arrays of different heights.** XLOOKUP requires them to
   match; a mismatch gives `#VALUE!`, but a *mis-aligned* pair (one includes the
   header, the other doesn't) gives silently shifted results.
5. **Invisible characters or homoglyphs** — a Cyrillic `А` in an otherwise Latin
   code, or a soft hyphen. `=CODE(MID(A2,n,1))` character by character, or
   compare `=LEN(A2)` against what you expect.

Worth adding: if the match is case-different, XLOOKUP still matches (it is
case-insensitive) — so a case difference is *not* the cause, and that rules one
suspect out immediately.
