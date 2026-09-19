# Solutions — Module 3: The Core Function Library

Assumes `sales_transactions.csv` is a Table named `Sales` and `employees.csv`
a Table named `Employees`.

**3.1 — Conditional totals**

```
=SUMIFS(Sales[NetRevenue],
        Sales[Channel],     "Partner",
        Sales[RegionCode],  "UKI",
        Sales[OrderStatus], "<>Returned")
```

With the year condition added — note that you cannot write `"2025"` against a
date column; use a bounded range:

```
=SUMIFS(Sales[NetRevenue],
        Sales[Channel],     "Partner",
        Sales[RegionCode],  "UKI",
        Sales[OrderStatus], "<>Returned",
        Sales[OrderDate],   ">="&DATE(2025,1,1),
        Sales[OrderDate],   "<="&DATE(2025,12,31))
```

Two criteria on the same column is how you express a range. The `&`
concatenation is mandatory — `">=DATE(2025,1,1)"` compares against that literal
text and matches nothing.

**3.2 — Distinct reps selling laptops**

M365:

```
=COUNTA(UNIQUE(FILTER(Sales[SalesRep], Sales[Category]="Laptops")))
```

Legacy — the reciprocal-count idiom, entered with `Ctrl`+`Shift`+`Enter`:

```
{=SUM(IF(Sales[Category]="Laptops", 1/COUNTIFS(Sales[Category],"Laptops",
                                               Sales[SalesRep],Sales[SalesRep])))}
```

Each of a rep's *n* laptop rows contributes `1/n`, so each distinct rep sums to
exactly 1. It is slow on 5,000 rows and unreadable; in practice, on legacy Excel
you would use a PivotTable with the Data Model instead (Module 7.6).

**3.3 — SUMIF → SUMIFS**

```
=SUMIF(C:C, "UKI", L:L)      →      =SUMIFS(L:L, C:C, "UKI")
```

The sentence for a colleague: *"`SUMIF` asks where to look first and what to add
last; `SUMIFS` asks what to add first and where to look after. Use `SUMIFS`
everywhere so you only have to remember one of them."*

(Also replace the whole-column references with Table columns.)

**3.4 — Multi-condition and column-vs-column**

```
=SUMIFS(Sales[NetRevenue], Sales[Quantity], ">3", Sales[Discount], ">=0.15")
```

Comparing two columns:

```
=SUMPRODUCT((Sales[NetRevenue] > Sales[COGS] * 1.5) * Sales[NetRevenue])
```

`SUMIFS` cannot do the second because its criteria compare a range against a
*constant* expression evaluated once. There is no way to express "this row's
value versus this row's other value" in a criteria string. `SUMPRODUCT` (or
`SUM(FILTER(...))` in M365) evaluates the comparison row by row and produces an
array of TRUE/FALSE, which is exactly what is needed.

M365 equivalent:

```
=SUM(FILTER(Sales[NetRevenue], Sales[NetRevenue] > Sales[COGS] * 1.5, 0))
```

**3.5 — Department summary**

With departments listed in `H2:H8`:

```
Headcount:   =COUNTIFS(Employees[Department], $H2)
Median:      =MEDIAN(IF(Employees[Department]=$H2, Employees[AnnualSalary]))   (CSE)
             =MEDIAN(FILTER(Employees[AnnualSalary], Employees[Department]=$H2))  [M365]
P90:         =PERCENTILE.INC(FILTER(Employees[AnnualSalary],
                                    Employees[Department]=$H2), 0.9)
L4+ count:   =SUMPRODUCT((Employees[Department]=$H2) *
                         (VALUE(MID(Employees[Level],2,1)) >= 4))
```

`MEDIAN` and `PERCENTILE.INC` have no `*IFS` variants, which is why they need
`FILTER` or a CSE `IF`. Anchor `$H2` column-absolute so the block fills right
across the four metrics.

**3.6 — Name round-trip**

To `Last, First`:

```
=[@LastName] & ", " & [@FirstName]
```

Back to `First Last`, tolerating a missing comma and stray `CHAR(160)`:

```
=LET(
   n, TRIM(CLEAN(SUBSTITUTE(A2, CHAR(160), " "))),
   IF(ISNUMBER(SEARCH(",", n)),
      TRIM(TEXTAFTER(n, ",")) & " " & TRIM(TEXTBEFORE(n, ",")),
      n)
)
```

Legacy version of the split:

```
=IF(ISERROR(FIND(",",n)), n,
    TRIM(MID(n, FIND(",",n)+1, 255)) & " " & TRIM(LEFT(n, FIND(",",n)-1)))
```

Use `SEARCH`/`FIND` inside `ISNUMBER`/`ISERROR` rather than assuming the comma
is there — one row without it returns `#VALUE!` and poisons any aggregate below.

**3.7 — Tenure**

```
Whole years:    =DATEDIF([@HireDate], TODAY(), "y")
"4y 7m":        =DATEDIF([@HireDate],TODAY(),"y") & "y " &
                 DATEDIF([@HireDate],TODAY(),"ym") & "m"
Next anniversary:
  =LET(h, [@HireDate], t, TODAY(),
       a, DATE(YEAR(t), MONTH(h), DAY(h)),
       IF(a < t, EDATE(a, 12), a))
Working days:   =NETWORKDAYS.INTL([@HireDate], TODAY(), 1, Holidays)
```

`EDATE(a,12)` rather than `DATE(YEAR(t)+1,…)` so a 29 February hire date lands
on a valid day. Define `Holidays` as a named range of dates on a config sheet —
hard-coding them in the formula is the mistake this exercise is really testing.

**3.8 — COUNTA + COUNTBLANK > 99**

`COUNTA` counts cells that are not empty, and a formula returning `""` is not
empty — it contains a formula producing a zero-length string. `COUNTBLANK`
counts cells that are empty **or** contain `""`. So a cell holding `=IF(x,1,"")`
that evaluates to `""` is counted by *both*.

Construct it: put `=IF(TRUE,"","")` in A2:A10 and values in A11:A100.
`COUNTA(A2:A100)` = 99, `COUNTBLANK(A2:A100)` = 9, total 108 over a 99-cell
range. This is the practical reason to prefer `NA()` or a genuine blank over
`""` as a formula's "nothing" result.
