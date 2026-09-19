# Module 1 — Foundations & Workbook Architecture

> **Goal:** stop fighting Excel. By the end you will navigate without the mouse,
> know exactly what Excel stores in a cell, and lay out workbooks that survive
> being handed to someone else.
>
> **Time:** ~3 hours · **Prerequisites:** none

---

## 1.1 What a cell actually contains

Every cell holds four independent things. Confusing them is the root of most
beginner bugs.

| Layer | What it is | Where you change it |
|---|---|---|
| **Value** | The stored data: a number, text, boolean, or error | Typing, or a formula's result |
| **Formula** | The instruction that produced the value (optional) | The formula bar |
| **Format** | How the value is *displayed* | Ctrl+1 |
| **Style/border/fill** | Cosmetics | Home ribbon |

The critical consequence: **formatting never changes the stored value.** A cell
showing `4` may contain `3.5` displayed with zero decimals. `=A1+A1` will show
`7`, not `8`, and you will be told your spreadsheet is broken.

```
A1: 3.5   formatted as "0"     → displays 4
B1: =A1+A1                     → 7, displayed as 7
```

Use `ROUND` when you need the *value* rounded, and formatting only when you need
the *display* rounded. Never enable the workbook-level "Set precision as
displayed" option — it permanently destroys your data.

### Excel's five data types

1. **Number** — right-aligned by default. Dates, times, currency and percentages
   are all numbers wearing a format.
2. **Text** — left-aligned by default. Also called a string.
3. **Boolean** — `TRUE` / `FALSE`, centred, uppercase.
4. **Error** — `#DIV/0!`, `#N/A`, `#VALUE!`, `#REF!`, `#NAME?`, `#NUM!`,
   `#NULL!`, `#SPILL!`, `#CALC!`. See the
   [troubleshooting guide](../resources/troubleshooting.md).
5. **Empty** — genuinely nothing. Different from `""` (an empty string), which
   is text. `ISBLANK("")` is `FALSE` — this trips up more people than any other
   single fact in Excel.

**Alignment is your free type check.** If a column of numbers is left-aligned,
those are text, and every `SUM` over them will return `0`.

### Dates are serial numbers

Excel stores a date as the number of days since 1899-12-31 (day 1 = 1900-01-01).
Times are the fractional part.

```
2026-09-19  →  46280
12:00:00    →  0.5
2026-09-19 18:00  →  46280.75
```

This is why date arithmetic just works: `=B2-A2` gives days between dates.
It is also why a date can suddenly appear as `46280` — someone applied the
General format.

> **Known quirk:** Excel believes 1900 was a leap year. Date serials before
> 1900-03-01 are off by one. This is a deliberate 40-year-old compatibility bug.
> It never matters unless you are doing historical work.

---

## 1.2 Moving without the mouse

The single highest-return skill in this course. Learn these ten before anything
else; the full list is in [shortcuts.md](../resources/shortcuts.md).

| Keys | Action | Why it matters |
|---|---|---|
| `Ctrl` + arrow | Jump to the edge of the current data block | Navigate 100k rows instantly |
| `Ctrl`+`Shift`+ arrow | Select to that edge | Select a whole column of data, no mouse |
| `Ctrl`+`Shift`+`L` | Toggle filters | |
| `Ctrl`+`T` | Convert range to Table | Module 6 |
| `F2` | Edit the active cell | Cursor lands at the end of the formula |
| `F4` | Cycle reference anchoring (`A1`→`$A$1`→`A$1`→`$A1`) | Module 2 |
| `Ctrl`+`Enter` | Confirm, staying on the cell | Fill a selection at once |
| `Alt`+`=` | Insert SUM over the guessed range | |
| `Ctrl`+`1` | Format Cells dialog | |
| `Ctrl`+`` ` `` | Show formulas instead of values | Audit a whole sheet in one keystroke |

**Drill (do it now, 5 minutes):** open `sales_transactions.csv`, put the cursor
in A1, and using only the keyboard: jump to the last row, select the entire
NetRevenue column, and read its sum off the status bar.

---

## 1.3 The one rule of data layout

> **Raw data goes in a flat, rectangular table: one row per observation, one
> column per attribute, one header row, no blanks, no merged cells, no totals
> inside the data.**

This is the format every downstream tool — PivotTables, Power Query, Power Pivot,
every lookup function — expects. Data laid out for *reading* cannot be analysed;
data laid out for *analysis* can always be reshaped into something readable.

### What breaks the rule

| Anti-pattern | Why it hurts | Fix |
|---|---|---|
| Merged cells | Break sorting, selection, and every structured reference | "Center Across Selection" (Ctrl+1 → Alignment) |
| Months as columns (`Jan`, `Feb`, …) | Adding a month means rebuilding every formula | Unpivot (Module 8) |
| A blank row "for spacing" | Truncates `Ctrl`+arrow, Tables, and PivotTable ranges | Row height instead |
| A `TOTAL` row inside the data | Gets swept into aggregations, double-counting | Totals live outside, or in the Table's total row |
| Units in the cell (`"12 kg"`) | Turns the column into text | Number in the cell, unit in the header |
| Colour as the only meaning | Invisible to formulas | A real status column, then conditional formatting |

### The three-layer workbook

Every workbook you build in this course has the same architecture:

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│    INPUT     │ → │  CALCULATION │ → │    OUTPUT    │
│              │   │              │   │              │
│ Raw imports  │   │ Helper cols  │   │ Dashboards   │
│ Parameters   │   │ Lookups      │   │ Reports      │
│ Never edited │   │ Intermediate │   │ Never a      │
│ by formula   │   │ aggregates   │   │ source       │
└──────────────┘   └──────────────┘   └──────────────┘
```

Rules that follow from it:

1. **A cell holds a value or a formula, never both intents.** No hard-coded
   numbers buried inside formulas — `=B2*0.075` becomes `=B2*TaxRate`, with
   `TaxRate` a named input cell (Module 2).
2. **Data flows one direction.** If Output feeds Calculation, you have a
   circular design and eventually a circular reference.
3. **Colour-code by role, consistently.** The convention used throughout this
   course: blue font = hard-coded input, black = formula, green = link to
   another sheet. Adopted from financial modelling; universally understood.
4. **One sheet per layer per subject**, named in `PascalCase` with no spaces —
   spaces force `'Sheet Name'!A1` quoting everywhere.

---

## 1.4 Entering data accurately

- **Type dates unambiguously.** `2026-09-19` is read correctly under every
  regional setting. `9/19/26` is not — it is invalid in most of the world and
  will be stored as text. `Ctrl`+`;` inserts today's date as a static value.
- **Leading zeros and long IDs.** `00123` becomes `123`, and a 16-digit account
  number becomes `1.23457E+15` and silently loses its last digits — Excel only
  keeps 15 significant figures. Format the column as Text *before* typing, or
  import via Power Query with an explicit text type (Module 8). This is a data
  destruction bug, not a display bug: the digits are gone.
- **Fill handle and Flash Fill.** Drag the small square at a selection's
  corner to extend a series; double-click it to fill down to the neighbouring
  column's extent. `Ctrl`+`E` (Flash Fill) infers a pattern from your example —
  excellent for a one-off split, but it produces static values, so never use it
  in a workbook that refreshes.
- **Paste Special** (`Ctrl`+`Alt`+`V`): `V` values, `T` formats, `E` transpose.
  Pasting values over formulas is how you freeze a snapshot.

---

## 1.5 Auditing a workbook you did not write

You will inherit spreadsheets. This is the 10-minute triage:

1. `Ctrl`+`` ` `` — see every formula at once. Look for hard-coded constants and
   inconsistent formulas across a row.
2. **Formulas → Show Formulas / Trace Precedents / Trace Dependents** — arrows
   showing what feeds a cell and what it feeds.
3. `F5` → **Special** → **Constants** in a formula column — reveals numbers
   somebody typed over a formula. This is where wrong answers hide.
4. `F5` → **Special** → **Formulas** → **Errors** — selects every error cell.
5. **Formulas → Error Checking** — flags inconsistent formulas and text-as-number.
6. Check for **external links** (Data → Queries & Connections → Edit Links) and
   hidden sheets (right-click any tab → Unhide; note that `xlSheetVeryHidden`
   sheets only appear in the VBA editor — Module 11).

---

## Exercises

Work in a new workbook, `module01.xlsx`. Solutions:
[`exercises/solutions/01-foundations.md`](../exercises/solutions/01-foundations.md).

**1.1** Enter `3.5` in A1 and format it to show zero decimals. In B1 write a
formula that displays `4` *and* returns 4 when referenced. Explain in a comment
why `=ROUND(A1,0)` and the number format are not interchangeable.

**1.2** In C1 enter the text `00456` so it keeps its leading zeros, and in C2 a
16-digit number `1234567890123456` with all digits intact. State which technique
you used for each and why the naive approach fails.

**1.3** Given a date in D1, write formulas that return: the date's serial number,
the day of the week as text, the first day of that month, and the last day of
that month. (You may need `TEXT`, `EOMONTH` — look them up; Module 3 covers them.)

**1.4** Open `datasets/sales_transactions.csv`. Using only the keyboard, report:
the number of data rows, the sum of `NetRevenue`, and the earliest `OrderDate`.
List the exact keystrokes you used.

**1.5** The sheet below is a real anti-pattern. List every layout rule it breaks
and describe the corrected flat table (columns and row meaning).

```
        A          B        C        D        E
1   Q1 SALES REPORT  (merged A1:E1)
2
3   Region      Jan      Feb      Mar     TOTAL
4   North       1,200    1,400    1,100   3,700
5   South         900      ---      950   1,850
6
7   TOTAL       2,100    1,400    2,050   5,550
8   * Feb South data missing
```

**1.6** You are handed a 40-sheet workbook and told "the margin number is wrong".
Write the ordered checklist you would run in the first ten minutes, and say what
each step would reveal.

---

## Pitfalls recap

- Formatting ≠ value. `ROUND` changes data; number format changes pixels.
- `""` is not blank. `ISBLANK` is stricter than `=""`.
- Left-aligned numbers are text and will not sum.
- Merged cells break everything downstream — use Center Across Selection.
- Long numeric IDs lose precision past 15 digits, irreversibly.
- A blank row inside your data truncates every range Excel guesses for you.

**Next:** [Module 2 — The Formula Engine](02-formula-engine.md)
