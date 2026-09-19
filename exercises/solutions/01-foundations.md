# Solutions — Module 1: Foundations & Workbook Architecture

**1.1 — Value vs format**

```
A1: 3.5              format: Number, 0 decimals  → displays 4
B1: =ROUND(A1,0)     → stores 4, displays 4
```

The number format changes only the rendering; `A1` still *contains* 3.5, so
`=A1*2` gives 7. `ROUND` changes the stored value, so `=B1*2` gives 8. They are
not interchangeable because one is a presentation choice and the other is a data
transformation. Use formatting for reports, `ROUND` when the rounded figure is
the number you intend to carry forward — for example, an invoice line that must
tie to a cent.

**1.2 — Leading zeros and long IDs**

`00456`: format the cell as Text *before* typing (`Ctrl`+`1` → Text), or type
`'00456` with a leading apostrophe. Excel otherwise parses it as the number 456
and the zeros are not stored at all.

`1234567890123456`: must be Text. Excel stores numbers as IEEE 754 doubles with
15 significant decimal digits, so the 16th digit is lost — you get
`1234567890123450`, permanently. This is data destruction, not a display
problem, and there is no way to recover the digit afterwards. For imported data,
set the column to Text in the Power Query import or in the Text Import wizard.

**1.3 — Date formulas** (date in `D1`)

```
Serial number:      =N(D1)            or  =D1 formatted as General
Day name:           =TEXT(D1,"dddd")
First of month:     =EOMONTH(D1,-1)+1     or  =DATE(YEAR(D1),MONTH(D1),1)
Last of month:      =EOMONTH(D1,0)
```

`EOMONTH(D1,-1)+1` is preferred over `DATE(...,1)` because it stays correct
inside longer expressions and handles year boundaries without special cases.

**1.4 — Keyboard navigation of the sales file**

```
Ctrl+End                    → last cell, A5001 area → 5,000 data rows
Ctrl+Home, then navigate to L1, then Ctrl+Shift+↓   → selects L2:L5001
Read the Sum from the status bar (right-click the status bar to add Sum,
Average and Count if they are not shown).
Earliest date: the data is sorted by OrderDate, so Ctrl+↓ from B1 lands on
the first row; otherwise =MIN(B2:B5001).
```

Reading aggregates off the status bar rather than writing a formula is the point
of the exercise: for a one-off question, do not build anything.

**1.5 — Layout violations**

| Violation | Why it matters |
|---|---|
| Merged title across A1:E1 | Breaks column selection, sorting and structured references |
| Months as columns (Jan/Feb/Mar) | Adding April means editing every formula and chart |
| `TOTAL` column inside the data | Gets aggregated along with the months — double counting |
| `TOTAL` row inside the data | Same, on the other axis |
| Blank row 6 | Truncates `Ctrl`+arrow, Table detection and Pivot source ranges |
| `---` for missing data | Turns the column to text; `SUM` returns 0 |
| A footnote in row 8 inside the data block | Gets swept into any range selection |

Corrected flat table — one row per region-month observation:

```
Region | Month      | Amount
North  | 2026-01-01 | 1200
North  | 2026-02-01 | 1400
North  | 2026-03-01 | 1100
South  | 2026-01-01 | 900
South  | 2026-02-01 |            ← genuinely empty, not "---"
South  | 2026-03-01 | 950
```

Totals come from a PivotTable or `SUMIFS`, outside the data. A real date column
rather than a month name means it sorts and groups correctly.

**1.6 — Ten-minute audit checklist**

1. `Ctrl`+`` ` `` — show all formulas. Reveals hard-coded constants and formulas
   that differ across a row that should be uniform.
2. `F5` → Special → **Constants**, with a formula column selected. Reveals
   numbers typed over formulas — the classic source of a wrong margin.
3. `F5` → Special → **Formulas → Errors**. Any `#N/A` feeding an aggregate?
4. Trace Precedents on the margin cell itself, then walk up the chain one level
   at a time. Most wrong numbers are two hops away, not in the cell you were
   shown.
5. Check the aggregation method of any PivotTable involved — Count instead of
   Sum is the single most common cause of an order-of-magnitude error.
6. Data → Edit Links: does it depend on a file someone moved?
7. Right-click a sheet tab → Unhide: is there a hidden sheet with an override?
8. Formulas → Calculation Options: is it on Manual, showing stale values?
9. Check for a filter (`Ctrl`+`Shift`+`L` state) — an aggregate written with
   `SUM` rather than `SUBTOTAL` over filtered data misleads everyone.
10. Compare the margin formula's denominator against the definition the business
    actually uses. Half of all "wrong" numbers are correct arithmetic on a
    different definition.
