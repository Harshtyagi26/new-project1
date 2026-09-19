# Module 5 — Data Cleaning & Transformation

> **Goal:** take genuinely filthy data and make it analysable — repeatably, so
> next month's file takes thirty seconds instead of an afternoon.
>
> **Time:** ~4 hours · **Prerequisites:** Modules 3–4 · **Data:** `messy_contacts.csv`

---

## 5.1 Diagnose before you touch anything

Open `messy_contacts.csv` and profile it before cleaning. Build a diagnostic
block beside the data — this is a habit worth more than any individual technique.

```
Row count:            =COUNTA(A2:A500)
Blank emails:         =COUNTBLANK(C2:C500)
Text-not-number:      =SUMPRODUCT(--NOT(ISNUMBER(F2:F500)))
Has leading/trailing: =SUMPRODUCT(--(B2:B500<>TRIM(B2:B500)))
Has CHAR(160):        =SUMPRODUCT(--ISNUMBER(SEARCH(CHAR(160), B2:B500)))
Distinct regions:     =COUNTA(UNIQUE(H2:H500))
Exact duplicate rows: =COUNTA(A2:A500)-COUNTA(UNIQUE(A2:A500))
Longest value:        =MAX(LEN(B2:B500))     (CSE in legacy)
```

In Power Query, **View → Column quality / Column distribution / Column profile**
gives all of this visually in one click, over the whole column rather than the
first 1,000 rows if you switch the status-bar setting. Use it.

The eight defects in `messy_contacts.csv`, all deliberate and all common:

| # | Defect | Column |
|---|---|---|
| 1 | Inconsistent name order (`First Last` vs `Last, First`) | FullName |
| 2 | Case chaos and stray/non-breaking spaces | FullName, Email |
| 3 | Five phone formats, plus blanks | Phone |
| 4 | Three date formats, plus blanks, some stored as text | JoinDate |
| 5 | Currency as text: `$1,234.00`, `1234.00`, `1234 USD`, `n/a` | LifetimeSpend |
| 6 | Booleans as `yes/Yes/Y/no/No/N/TRUE/FALSE/""` | OptedIn |
| 7 | Region codes with case and whitespace variants, plus `?` | Region |
| 8 | Exact duplicate rows *and* near-duplicates with a different ID | whole row |

---

## 5.2 Text normalisation

**The standard cleanse**, applied to every text column on import:

```
=TRIM(CLEAN(SUBSTITUTE(A2, CHAR(160), " ")))
```

Order matters: substitute the non-breaking spaces into real spaces *first*, so
`TRIM` can collapse them. `CLEAN` removes control characters (line feeds from
pasted data, most often).

**Case:** `PROPER` is tempting and wrong for real names — it produces `Mcdonald`,
`O'brien`, `Iii`. For matching purposes normalise to `LOWER` and compare; for
display, fix by exception with a small correction table.

**Name reordering** — handle both directions in one formula:

```
=IF(ISNUMBER(SEARCH(",", n)),
    TRIM(TEXTAFTER(n,","))&" "&TRIM(TEXTBEFORE(n,",")),
    n)
```
where `n` is the cleansed name. Legacy: swap `TEXTAFTER`/`TEXTBEFORE` for
`MID`/`FIND` per Module 3.

---

## 5.3 Type coercion

**Text that should be a number.** Symptoms: left-aligned, `SUM` = 0, a green
triangle in the corner.

```
=NUMBERVALUE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(F2,"$",""),",","")," USD",""))
```

Wrap in `IFERROR(..., "")` for the `n/a` rows — and decide deliberately whether
unparseable means blank, zero, or a flagged exception. **They are not the same
thing**, and choosing zero silently is how averages end up wrong.

Bulk fixes that need no formula:

- Select the column → the warning triangle → **Convert to Number**.
- **Data → Text to Columns → Finish** on a single column: forces re-parsing of
  the entire column with current settings. The fastest fix in Excel, and almost
  nobody knows it.
- Copy an empty cell → select the range → **Paste Special → Add**. Coerces text
  numbers by arithmetic.

**Text that should be a date.** `DATEVALUE` handles the locale-native format
only. For mixed formats, parse explicitly:

```
ISO   2026-09-19   =DATE(LEFT(d,4), MID(d,6,2), RIGHT(d,2))
US    09/19/2026   =DATE(RIGHT(d,4), LEFT(d,2), MID(d,4,2))
d-mmm-yy 19-Sep-26 =DATEVALUE(d)          usually parses
```

Then combine with `IFERROR` chaining, or — far better — do it in Power Query
with **Column From Examples**, which infers the parse and applies it to all
formats at once.

**Booleans.** Never leave `yes/Y/TRUE` mixed. Map through a lookup table, not a
nested IF, so the mapping is data:

```
=IFNA(XLOOKUP(LOWER(TRIM(G2)), {"yes";"y";"true";"1"}, {TRUE;TRUE;TRUE;TRUE}),
      IFNA(XLOOKUP(LOWER(TRIM(G2)), {"no";"n";"false";"0"}, {FALSE;FALSE;FALSE;FALSE}),
           NA()))
```
Unknown → `#N/A`, deliberately: unparseable is not `FALSE`.

---

## 5.4 Duplicates

Three different operations that people conflate:

| Want | Tool |
|---|---|
| See which rows repeat | Conditional Formatting → Highlight → Duplicate Values |
| Count occurrences | `=COUNTIFS($A$2:$A$500, A2)` |
| Physically remove | Data → **Remove Duplicates** (destructive, on selected columns) |
| Get a distinct list, non-destructively | `UNIQUE()`, or PQ → Remove Duplicates |
| Flag *near*-duplicates | A normalised match key |

**Remove Duplicates keeps the first occurrence** in current sort order and
deletes the rest, with no undo trail beyond `Ctrl`+`Z`. Always do it on a copy,
and always check which columns you ticked — ticking only `Email` when two people
share a family address deletes a real customer.

**Near-duplicates** need a **match key**: a normalised concatenation you
construct, then compare.

```
=LOWER(TRIM(SUBSTITUTE(FullName," ","")))
  & "|" & LOWER(TRIM(Email))
```

Then `COUNTIFS` on the key finds collisions across rows that look different but
are the same person. This is the core of every deduplication project, and the
whole art is choosing which fields go into the key.

---

## 5.5 Splitting and combining

| Method | Repeatable? | Use when |
|---|---|---|
| **Text to Columns** | No (one-shot) | Quick fixed-delimiter split |
| **Flash Fill** (`Ctrl`+`E`) | No (static values) | Irregular pattern, one-off |
| **Formulas** | Yes (live) | The split must update with the source |
| **Power Query** | Yes (refreshable) | It happens every month — the right answer |

Flash Fill deserves a warning: it infers from your examples and silently gets it
wrong on the rows you did not check. It is excellent for exploration and unsafe
for production. If the file will ever arrive again, use Power Query.

---

## 5.6 Do it properly: the Power Query cleaning pipeline

Everything above, done once, then refreshed forever. Full treatment in
[Module 8](08-power-query.md); here is the shape of the solution for
`messy_contacts.csv`:

```
1.  Data → Get Data → From Text/CSV → Transform Data
2.  Use First Row as Headers
3.  Trim + Clean + Lowercase on Email          (Transform → Format)
4.  Replace Values: CHAR(160) → space, then Trim on FullName
5.  Conditional Column → NameHasComma
6.  Split Column by Delimiter (comma) → conditionally recombine
7.  Column From Examples on JoinDate → typed Date
8.  Replace "$", ",", " USD" → Change Type to Decimal, errors → null
9.  Replace Values on OptedIn → Change Type to Logical
10. Trim + Uppercase Region, then Merge with the Regions table to validate
11. Remove Duplicates on the normalised match key
12. Close & Load To → Table (or Connection Only + Data Model)
```

Every step is recorded in **Applied Steps** and re-runs on the next file with
one click of Refresh. That is the actual deliverable of this module: not a clean
sheet, but a clean *process*.

---

## Exercises

All against `messy_contacts.csv`. Solutions:
[`exercises/solutions/05-data-cleaning.md`](../exercises/solutions/05-data-cleaning.md).

**5.1** Build the diagnostic profile block described in 5.1 and record the
counts. You will use these as your before/after test.

**5.2** Produce a clean `FullName` column in consistent `First Last` form,
with no double spaces, no non-breaking spaces, and correct casing for names
containing `Mc`, `O'` and `van`. State how you handled the exceptions.

**5.3** Normalise `Phone` to `+1XXXXXXXXXX` for all parseable values, leaving
unparseable values flagged distinctly from missing ones.

**5.4** Convert all three `JoinDate` formats to real dates in one formula
column. Report how many rows failed and why.

**5.5** Convert `LifetimeSpend` to a number. Justify your treatment of `"n/a"`
and show how the choice changes the column's mean.

**5.6** Convert `OptedIn` to real booleans with unknown values distinguishable
from `FALSE`. Explain the legal/analytical reason this distinction matters for
an opt-in flag.

**5.7** Find every duplicate: exact duplicate rows, and near-duplicates that
differ only in `ContactID` and casing. Report both counts and explain your
match key.

**5.8** Rebuild the whole clean-up as a Power Query pipeline. Then append a
handful of new dirty rows to the CSV, refresh, and confirm they are cleaned
without touching a formula. Submit the list of Applied Steps.

---

## Pitfalls recap

- `TRIM` misses `CHAR(160)`. Always substitute it first.
- `PROPER` mangles real names.
- Remove Duplicates is destructive and obeys the columns you tick, nothing more.
- Flash Fill produces static values and fails silently on unchecked rows.
- Unparseable is not zero and not FALSE — keep it distinguishable.
- If the file will arrive again, a formula cleanse is the wrong answer.

**Next:** [Module 6 — Tables, Validation & Conditional Formatting](06-tables-and-validation.md)
