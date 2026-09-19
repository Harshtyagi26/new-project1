# Module 3 — The Core Function Library

> **Goal:** command the ~60 functions that cover 95% of real work — and know the
> argument order cold, so you stop guessing.
>
> **Time:** ~5 hours · **Prerequisites:** Module 2 · **Data:** `sales_transactions.csv`, `employees.csv`

---

## 3.1 Logical functions

```
=IF(logical_test, value_if_true, value_if_false)
```

Nested `IF`s are readable to about three levels. Past that, use `IFS`, `SWITCH`,
or a lookup table — a lookup table is almost always the right answer because it
puts the business rules in cells where a non-programmer can edit them.

```
=IFS(score>=90,"A", score>=80,"B", score>=70,"C", TRUE,"F")
=SWITCH(region, "NA-E","Americas", "UKI","EMEA", "Other")     exact match only
```

`IFS` has no built-in else — the `TRUE` condition at the end is the idiom, and
omitting it returns `#N/A`.

**Boolean logic:**

| Function | Returns TRUE when |
|---|---|
| `AND(a,b,…)` | all are TRUE |
| `OR(a,b,…)` | any is TRUE |
| `XOR(a,b,…)` | an odd number are TRUE |
| `NOT(a)` | a is FALSE |

`AND`/`OR` **collapse an array to a single value**, so they cannot be used for
row-by-row array logic. Use arithmetic instead — `*` is AND, `+` is OR:

```
{=SUM((Region="UKI")*(Amount>1000)*Amount)}    AND
{=SUM(((Region="UKI")+(Region="DACH"))>0)}     OR
```

**Error handling:**

```
=IFERROR(value, value_if_error)        catches every error type
=IFNA(value, value_if_na)              catches only #N/A — usually what you want
```

Prefer `IFNA`. `IFERROR` is a blanket that hides `#REF!`, `#VALUE!` and typos in
your own formula, which is how a broken model reports clean zeros for a year.

---

## 3.2 Aggregation and conditional aggregation

| Function | Counts / sums |
|---|---|
| `COUNT` | numeric cells only |
| `COUNTA` | non-empty cells (including `""` from formulas!) |
| `COUNTBLANK` | truly empty **and** `""` |
| `SUM` / `AVERAGE` / `MIN` / `MAX` | numbers, ignoring text and blanks |
| `MEDIAN` / `MODE.SNGL` / `STDEV.S` / `VAR.S` | sample statistics |
| `LARGE(range,k)` / `SMALL(range,k)` | k-th largest/smallest |
| `RANK.EQ` / `PERCENTILE.INC` / `QUARTILE.INC` | position statistics |

### The `*IF` / `*IFS` family

```
=SUMIF(range, criteria, [sum_range])            criteria range FIRST
=SUMIFS(sum_range, crit_range1, crit1, …)       sum range FIRST
```

**The argument order flips between them.** This is the single most common
formula error in professional use. Advice: use the `*IFS` forms exclusively,
even for one condition — consistent order, and you can add criteria later.

```
=SUMIFS(NetRevenue, RegionCode,"UKI", OrderDate,">="&DATE(2025,1,1))
=COUNTIFS(Category,"Laptops", OrderStatus,"<>Returned")
=AVERAGEIFS(NetRevenue, Channel,"Partner", Quantity,">2")
=MAXIFS(NetRevenue, Segment,"Enterprise")
=MINIFS(NetRevenue, Segment,"Enterprise")
```

Criteria rules that catch everyone:

- Comparisons are **text**: `">100"`, not `>100`.
- To compare against a cell, concatenate: `">="&G1`. Writing `">=G1"` compares
  against the literal letters `G1`.
- Wildcards work in criteria: `*` any run of characters, `?` one character,
  `~*` a literal asterisk. `"North*"` matches `North America East`.
- Criteria are **case-insensitive**. For case-sensitive counting you need
  `SUMPRODUCT(--EXACT(range,"Text"))`.
- Blank criteria: `"="` matches empty cells, `"<>"` matches non-empty.

### SUMPRODUCT — the pre-M365 workhorse

```
=SUMPRODUCT(Quantity, UnitPrice)                       row-wise multiply, then sum
=SUMPRODUCT((Region="UKI")*(Amount>1000), Amount)      conditional sum, any logic
=SUMPRODUCT(--(Category="Laptops"))                    conditional count
```

The `--` (double unary) coerces `TRUE`/`FALSE` into `1`/`0`. Multiplying does the
same thing. `SUMPRODUCT` handles array logic without CSE, works in every Excel
version, and is still the cleanest way to express multi-condition logic that
`SUMIFS` cannot (comparisons *between* two columns, for example):

```
=SUMPRODUCT((ShipDate>DueDate)*1)      count of late orders — SUMIFS cannot do this
```

### AGGREGATE and SUBTOTAL

```
=SUBTOTAL(109, B2:B5000)     SUM, ignoring rows hidden by a filter
=AGGREGATE(9, 6, B2:B5000)   SUM, ignoring errors too
```

`SUBTOTAL` function numbers: `1` AVERAGE, `9` SUM, `2` COUNT, `3` COUNTA,
`4` MAX, `5` MIN. Add 100 (→ `109`) to also ignore manually hidden rows.
`AGGREGATE` adds an options argument: `6` = ignore error values, which is how you
sum a column that contains `#N/A` without wrapping every cell in `IFERROR`.

---

## 3.3 Text functions

| Function | Does |
|---|---|
| `LEFT(t,n)` / `RIGHT(t,n)` / `MID(t,start,n)` | Extract by position (1-based) |
| `LEN(t)` | Length |
| `FIND(needle,hay,[start])` | Position, **case-sensitive**, no wildcards |
| `SEARCH(needle,hay,[start])` | Position, case-insensitive, wildcards allowed |
| `SUBSTITUTE(t,old,new,[n])` | Replace by content; `n` targets the nth occurrence |
| `REPLACE(t,start,n,new)` | Replace by position |
| `TRIM(t)` | Strip leading/trailing spaces, collapse internal runs to one |
| `CLEAN(t)` | Strip non-printing characters (CHAR 0–31) |
| `UPPER` / `LOWER` / `PROPER` | Case |
| `TEXT(value,format)` | Number → formatted text |
| `VALUE(t)` / `NUMBERVALUE(t,dec,group)` | Text → number |
| `CONCAT(...)` / `TEXTJOIN(delim,ignore_empty,...)` | Join |
| `EXACT(a,b)` | Case-sensitive comparison |
| `REPT(t,n)` | Repeat — used for in-cell bar charts |
| `TEXTBEFORE` / `TEXTAFTER` / `TEXTSPLIT` `[M365]` | Split without arithmetic |

### The classic split, three ways

Given `"Ferreira, Mateo"` in A2:

```
Legacy:  =TRIM(MID(A2, FIND(",",A2)+1, 99))          → "Mateo"
         =LEFT(A2, FIND(",",A2)-1)                    → "Ferreira"

M365:    =TEXTAFTER(A2, ", ")                         → "Mateo"
         =TEXTBEFORE(A2, ", ")                        → "Ferreira"
         =TEXTSPLIT(A2, ", ")                         → spills both
```

When the delimiter may be missing, `FIND` returns `#VALUE!` — wrap in `IFERROR`,
or use `TEXTBEFORE(A2, ", ", 1, 0, 0, A2)` whose last argument is the
if-not-found value.

### The invisible-character problem

`TRIM` does **not** remove non-breaking spaces (`CHAR(160)`), which is what you
get from every web and PDF paste. The full cleanse:

```
=TRIM(CLEAN(SUBSTITUTE(A2, CHAR(160), " ")))
```

Diagnose with `=LEN(A2)` vs `=LEN(TRIM(A2))`, and `=CODE(RIGHT(A2,1))` to
identify the offender. If a lookup "obviously matches" but returns `#N/A`, this
is the cause about half the time. (The other half is number-stored-as-text.)

---

## 3.4 Date and time functions

```
=TODAY()                    volatile, date only
=NOW()                      volatile, date and time
=DATE(y,m,d)                builds a date; handles overflow: DATE(2026,13,1)=2027-01-01
=YEAR / MONTH / DAY / HOUR / MINUTE / SECOND
=WEEKDAY(date,[type])       type 2 → Monday=1 (use it; the default is Sunday=1)
=WEEKNUM / ISOWEEKNUM       ISO is the one your European colleagues mean
=EOMONTH(start, months)     last day, n months out; EOMONTH(d,-1)+1 = first of month
=EDATE(start, months)       same day, n months out — handles month-length edges
=DATEDIF(start,end,"y")     whole years — "y","m","d","ym","md","yd"
=NETWORKDAYS.INTL(s,e,[weekend],[holidays])
=WORKDAY.INTL(s,days,[weekend],[holidays])
=YEARFRAC(start,end,[basis])
```

Notes that matter:

- `DATEDIF` is undocumented in the function list but present in every version.
  It is the correct way to compute age or tenure in whole years; a naive
  `(end-start)/365` drifts.
- `EOMONTH(date,0)` → last day of this month. `EOMONTH(date,-1)+1` → first day.
- `NETWORKDAYS.INTL`'s weekend argument takes `1`–`17` or a 7-character mask
  like `"0000011"` (Sat/Sun off), so it handles Fri/Sat weekends correctly.
- Time arithmetic beyond 24 hours needs the `[h]:mm` format, or Excel shows
  25:00 as 1:00.

**Worked example — tenure bands from `employees.csv`:**

```
Tenure years:  =DATEDIF([@HireDate], TODAY(), "y")
Band:          =IFS([@Tenure]<1,"<1yr", [@Tenure]<3,"1-3yr",
                    [@Tenure]<7,"3-7yr", TRUE,"7yr+")
Headcount:     =COUNTIFS(Band, "1-3yr", Department, "Engineering")
```

---

## 3.5 Rounding and number handling

| Function | Behaviour |
|---|---|
| `ROUND(n,d)` | Half away from zero (`ROUND(2.5,0)`=3, `ROUND(-2.5,0)`=-3) |
| `ROUNDUP` / `ROUNDDOWN` | Away from / toward zero |
| `MROUND(n,m)` | To the nearest multiple of m |
| `CEILING.MATH` / `FLOOR.MATH` | To a multiple, with control over negatives |
| `INT(n)` | Toward negative infinity (`INT(-2.5)` = -3) |
| `TRUNC(n,[d])` | Toward zero (`TRUNC(-2.5)` = -2) |
| `ABS` / `SIGN` / `MOD` / `QUOTIENT` | |

`MOD(n, d)` returns a result with the sign of the *divisor*, so `MOD(-1, 7)` = 6.
That is a feature: it makes day-of-week cycling work without special cases.

**Floating point.** `=0.1+0.2=0.3` returns `FALSE`. Excel stores IEEE 754
doubles, same as every other tool. Compare with a tolerance
(`=ABS(a-b)<0.000001`) or compare rounded values. Never test money for equality
without rounding first.

---

## 3.6 Information and coercion

```
=ISBLANK / ISTEXT / ISNUMBER / ISERROR / ISNA / ISLOGICAL / ISFORMULA
=N(value)      coerce to number      =T(value)  coerce to text
=TYPE(value)   1 number, 2 text, 4 logical, 16 error, 64 array
=NA()          deliberately return #N/A so a chart leaves a gap instead of plotting 0
```

`=ISNUMBER(A2)` on a column that should be numeric is the fastest way to find
the text-that-looks-like-a-number rows that are breaking your `SUM`.

---

## Exercises

Against `sales_transactions.csv` (load as a Table named `Sales`) and
`employees.csv` (Table `Employees`). Solutions:
[`exercises/solutions/03-core-functions.md`](../exercises/solutions/03-core-functions.md).

**3.1** Total `NetRevenue` for `Channel = "Partner"` in region `UKI`, excluding
`Returned` orders. Then add a date condition: 2025 only. Use `SUMIFS`.

**3.2** Count distinct `SalesRep` values who sold at least one `Laptops` order.
Give both an M365 answer and a legacy answer.

**3.3** Rewrite `=SUMIF(C:C,"UKI",L:L)` as `SUMIFS`, then explain the argument
order difference in one sentence you could tell a colleague.

**3.4** Write one formula returning total revenue where `Quantity` exceeds the
order's own `Discount`-adjusted threshold — specifically, where
`Quantity > 3` **and** `Discount >= 0.15`. Then do the same comparing two
columns (`NetRevenue > COGS * 1.5`) and explain why `SUMIFS` cannot do the second.

**3.5** From `employees.csv`, compute for each department: headcount, median
salary, the 90th-percentile salary, and the count of `L4`+ employees. Lay the
results out as a proper summary block.

**3.6** Build a full-name column from `employees.csv` in `Last, First` form,
then reverse it back to `First Last` with formulas only, tolerating a missing
comma and stray non-breaking spaces.

**3.7** Given a hire date, produce: tenure in whole years, tenure as
`"4y 7m"`, the next work anniversary date, and the number of working days
between hire date and today excluding a holiday list you define.

**3.8** Explain why `=COUNTA(A2:A100)` and `=COUNTBLANK(A2:A100)` can sum to
more than 99. Construct the case.

---

## Pitfalls recap

- `SUMIF` and `SUMIFS` take their ranges in opposite orders. Use `SUMIFS` always.
- Criteria comparisons are strings, and cell references must be concatenated.
- `IFERROR` hides your own bugs; reach for `IFNA` first.
- `TRIM` does not remove `CHAR(160)`.
- `AND`/`OR` cannot do row-wise array logic; use `*` and `+`.
- `0.1+0.2 <> 0.3`. Round before comparing money.

**Next:** [Module 4 — Lookup, Reference & Dynamic Arrays](04-lookup-and-arrays.md)
