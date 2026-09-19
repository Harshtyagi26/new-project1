# Module 2 — The Formula Engine

> **Goal:** understand *how* Excel evaluates a formula, so you can write one
> formula and fill it across 10,000 cells without it breaking.
>
> **Time:** ~4 hours · **Prerequisites:** Module 1

---

## 2.1 Anatomy of a formula

```
=IF(SUM(Sales[Amount]) > Threshold, "Over", "Under")
│ │  │   │              │  │          │
│ │  │   │              │  │          └─ literal text argument
│ │  │   │              │  └─ defined name
│ │  │   │              └─ comparison operator
│ │  │   └─ structured reference (Module 6)
│ │  └─ nested function call
│ └─ function name
└─ every formula starts with =
```

**Operator precedence**, highest to lowest:

| Order | Operators | Note |
|---|---|---|
| 1 | `:` `,` (space) | Reference operators — range, union, intersection |
| 2 | `-` (negation) | `-2^2` = 4, because negation beats `^` |
| 3 | `%` | |
| 4 | `^` | Right-associative: `2^3^2` = 512 |
| 5 | `*` `/` | |
| 6 | `+` `-` | |
| 7 | `&` | Concatenation is *lower* than arithmetic |
| 8 | `=` `<>` `<` `>` `<=` `>=` | Comparison is lowest of all |

Two consequences worth memorising:

```
=1+2&"x"        → "3x"     arithmetic binds tighter than &
=2+3=5          → TRUE     comparison binds loosest
=-2^2           → 4        NOT -4
```

When in doubt, parenthesise. Parentheses cost nothing and prevent the class of
bug nobody ever finds by reading.

---

## 2.2 References: the thing to actually master

A reference is *relative* by default. When you copy a formula, relative parts
shift by the distance moved; absolute parts (prefixed `$`) do not.

| Written | Copied right | Copied down | Name |
|---|---|---|---|
| `A1` | `B1` | `A2` | Relative |
| `$A$1` | `$A$1` | `$A$1` | Absolute |
| `A$1` | `B$1` | `A$1` | Row-locked (mixed) |
| `$A1` | `$A1` | `$A2` | Column-locked (mixed) |

`F4` cycles through all four while the cursor is on the reference.

### The mixed-reference multiplication table

This is *the* exercise that makes anchoring click. One formula, filled in two
dimensions:

```
      A     B     C     D     E
1           1     2     3     4
2     1
3     2
4     3
```

In B2, enter `=$A2*B$1` and fill right and down across B2:E4.

- `$A2` — column A is locked (always read the row header), row floats.
- `B$1` — row 1 is locked (always read the column header), column floats.

Every cell in the block is that same formula. If you find yourself writing a
different formula per column, you have anchored wrong.

### Reference operators

```
=SUM(A1:A10)          range
=SUM(A1:A10,C1:C10)   union (comma)
=SUM(A1:C5 B1:B10)    intersection (space) → B1:B5
=SUM(A:A)             whole column — fine in a formula, fatal in an array formula
=SUM(Sheet2!A1:A10)   3-D across sheets: =SUM(Jan:Dec!B2)
```

### The `#REF!` cascade

Deleting a row that a formula points at converts the reference to `#REF!`
permanently — undo is the only fix. Formulas that reference *ranges* (`A1:A10`)
survive deletion of an interior row; formulas that reference a *single deleted
cell* do not. Tables (Module 6) are immune to most of this, which is one of the
main reasons to use them.

---

## 2.3 Defined names

A name is a label bound to a reference, a constant, or a formula. Names turn
`=B2*$H$1` into `=Revenue*TaxRate`, which is self-documenting and survives
someone inserting a column.

**Create:** select a cell → type in the Name Box → Enter. Or
**Formulas → Name Manager** (`Ctrl`+`F3`) for full control.

```
TaxRate          =Config!$B$2          a constant input
SalesData        =Sales!$A$1:$N$5001   a fixed range
LatestSales      =OFFSET(...)          a dynamic range (legacy; prefer Tables)
Threshold        =25000                a name bound to a literal, no cell at all
```

Rules and gotchas:

- Names cannot contain spaces, cannot look like a cell reference (`Q1` is
  illegal; `Q_1` is fine), and are case-insensitive.
- **Scope matters.** A workbook-scoped name is visible everywhere; a
  sheet-scoped name only on its sheet, and it *shadows* a workbook name of the
  same name. Ambiguous scope is a common source of "it works on one sheet".
- Names in a name's definition use absolute references unless you deliberately
  want the relative-name trick (a name defined relative to the active cell —
  powerful, and a maintenance hazard).
- Copying a sheet between workbooks drags its names along, which is how
  workbooks end up with 400 broken names pointing at a file nobody has. Clean
  them with Name Manager → filter → "Names with Errors".

---

## 2.4 The calculation model

Excel builds a **dependency graph** of cells, topologically sorts it, and
evaluates in dependency order — not row order, not sheet order. Consequences:

- Changing one input recalculates only its dependents ("smart recalculation").
- `F9` recalculates dirty cells; `Ctrl`+`Alt`+`F9` forces a full recalculation;
  `Ctrl`+`Alt`+`Shift`+`F9` rebuilds the dependency graph too (use when a
  workbook shows stale values).
- **Volatile functions** — `NOW`, `TODAY`, `RAND`, `RANDBETWEEN`, `OFFSET`,
  `INDIRECT`, `CELL`, `INFO` — recalculate on *every* change anywhere in the
  workbook, and drag their entire dependency chain with them. A few are fine;
  a thousand `OFFSET`s will make a workbook unusable. Prefer `INDEX` over
  `OFFSET` and Tables over `INDIRECT`.
- **Manual calculation mode** (Formulas → Calculation Options) stops recalculation
  entirely. It is the right answer for a genuinely heavy model, and a trap
  otherwise: the status bar says "Calculate" and every number you are reading is
  a lie until you press `F9`.

### Circular references

`A1: =B1+1`, `B1: =A1+1` — Excel warns once, then displays `0`. Fix the design.
The only legitimate use is **iterative calculation** (File → Options → Formulas
→ Enable iterative calculation), for genuine converging problems such as
interest-on-interest in a debt schedule. Turning it on globally to silence a
warning means your workbook now silently returns half-converged numbers.

---

## 2.5 Array semantics and spilling `[M365]`

Modern Excel evaluates formulas over arrays natively. A formula that returns
more than one value **spills** into the neighbouring cells; the spill range is
referenced with `#`.

```
D2: =SORT(UNIQUE(A2:A5000))    spills down as many rows as there are uniques
F2: =COUNTIF(A2:A5000, D2#)    one formula, results for every spilled value
```

- The spill range resizes automatically as the source grows. This replaces the
  entire `OFFSET`/`INDIRECT` dynamic-range tradition.
- `#SPILL!` means something is in the way. Select the cell, use the warning
  menu → "Select Obstructing Cells".
- **Implicit intersection** (`@`) is Excel narrowing an array to one value. If
  you open an old workbook and see `=@INDEX(...)`, Excel inserted `@` to preserve
  legacy behaviour. Remove it only when you *want* the spill.

**Legacy Excel (2019 and earlier):** the same logic requires
`Ctrl`+`Shift`+`Enter` (CSE) array formulas, shown in the formula bar wrapped in
`{ }` that you must not type. Every `[M365]` lesson in this course gives the CSE
or helper-column equivalent.

```
M365:    =SUM(FILTER(Amount, Region="UKI"))
Legacy:  =SUMIF(RegionCol, "UKI", Amount)              ← usually better anyway
Legacy:  {=SUM(IF(RegionCol="UKI", Amount))}           ← CSE, when the criteria are complex
```

---

## 2.6 LET and LAMBDA `[M365]`

`LET` names intermediate results inside a single formula: it reads better *and*
computes each named value once.

```
=LET(
    rev,   SUM(Sales[NetRevenue]),
    cost,  SUM(Sales[COGS]),
    margin, (rev - cost) / rev,
    IF(margin > 0.3, "Healthy", "Review")
)
```

Name/value pairs, then a final expression. Without `LET`, `rev` would be
computed twice.

`LAMBDA` turns a formula into a reusable function. Write and debug it in a cell,
then move the working formula into Name Manager under a name:

```
Name:    MarginPct
Refers to: =LAMBDA(revenue, cost, IF(revenue=0, "", (revenue-cost)/revenue))

Usage:   =MarginPct(D2, E2)
```

This is how you eliminate the copy-pasted 200-character formula that appears in
nine places and is subtly different in one of them.

---

## Exercises

Solutions: [`exercises/solutions/02-formula-engine.md`](../exercises/solutions/02-formula-engine.md).

**2.1** Without running them, state the result and explain the precedence:
`=10-2^2`, `=-3^2`, `=2^3^2`, `="Total: "&5*3`, `=1+1=2`, `=TRUE+TRUE`.

**2.2** Build the 1–12 multiplication table in B2:M13 using a single formula
filled in both directions. State the anchoring and why each `$` is where it is.

**2.3** A price list is in `B2:B50`. A tax rate lives in `H1`. Write the formula
for `C2` (tax-inclusive price) that survives being filled to `C50` *and* being
copied to column `E`. Then rewrite it using a defined name and explain which
version you would ship and why.

**2.4** Explain why `=SUM(A:A)` inside a cell is harmless but is a serious
problem inside a legacy CSE array formula. What is the modern equivalent that
avoids the issue entirely?

**2.5** Rewrite this with `LET`, computing each sub-expression once:
```
=IF((SUM(B2:B100)-SUM(C2:C100))/SUM(B2:B100)>0.25,
    (SUM(B2:B100)-SUM(C2:C100))/SUM(B2:B100),
    0)
```

**2.6** Write a `LAMBDA` named `SafeDivide(numerator, denominator)` that returns
an empty string rather than `#DIV/0!`, and returns `#VALUE!` unchanged if either
argument is text. Show the Name Manager definition and three test cases.

**2.7** A colleague's workbook takes 40 seconds to recalculate on every
keystroke. Give five specific things you would look for, in the order you would
check them, and the fix for each.

---

## Pitfalls recap

- `-2^2` is `4`. Parenthesise anything you would have to think about twice.
- `&` binds looser than `*`, `=` looser than everything.
- Fill a formula in two directions before you trust your anchoring.
- Volatile functions (`OFFSET`, `INDIRECT`, `TODAY`, `RAND`) recalculate always.
- Sheet-scoped names silently shadow workbook-scoped ones.
- Manual calculation mode makes every displayed number potentially stale.

**Next:** [Module 3 — The Core Function Library](03-core-functions.md)
