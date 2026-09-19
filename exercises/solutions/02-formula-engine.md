# Solutions — Module 2: The Formula Engine

**2.1 — Precedence**

| Formula | Result | Why |
|---|---|---|
| `=10-2^2` | `6` | `^` before `-`: 10 − 4 |
| `=-3^2` | `9` | Unary negation binds *tighter* than `^`: (−3)² |
| `=2^3^2` | `512` | `^` is right-associative: 2^(3²) = 2⁹ |
| `="Total: "&5*3` | `Total: 15` | `*` before `&` |
| `=1+1=2` | `TRUE` | Comparison is the lowest precedence: (1+1) = 2 |
| `=TRUE+TRUE` | `2` | Booleans coerce to 1/0 under arithmetic |

The `-3^2` case is worth remembering because it differs from most programming
languages and from mathematical convention.

**2.2 — Multiplication table**

Headers: `1..12` in `B1:M1` and in `A2:A13`.

```
B2: =$A2*B$1        then fill B2:M13
```

`$A2` — column locked so every cell reads its row header from column A; row
relative so it advances down. `B$1` — row locked so every cell reads its column
header from row 1; column relative so it advances right. The test of correct
anchoring is that one formula, filled both ways, works everywhere.

**2.3 — Tax-inclusive price**

```
C2: =B2*(1+$H$1)         fill to C50 ✓ ; copy to E2 → still reads $H$1 ✓
```

`B2` relative so it tracks the row; `$H$1` fully absolute so both the fill down
and the copy across keep pointing at the rate.

With a name:

```
Name: TaxRate  refers to  =Sheet1!$H$1
C2: =B2*(1+TaxRate)
```

Ship the named version. It is self-documenting, it survives someone inserting a
row above H1 (the name's definition updates), and a reviewer can see what the
formula means without navigating to H1 to find out what lives there.

**2.4 — `SUM(A:A)` in a CSE array formula**

In an ordinary `SUM`, Excel optimises whole-column references down to the used
range, so `=SUM(A:A)` is cheap. Inside a legacy CSE array formula there is no
such optimisation: the expression is evaluated element-wise across all 1,048,576
rows, for every array in the formula. A handful of such formulas will make a
workbook unusable, and `{=SUM(IF(A:A="x",B:B))}` can hang Excel outright.

The modern equivalent that avoids the issue: a **Table**. `=SUM(Sales[Amount])`
references exactly the rows that exist, grows automatically, and needs no array
entry at all. That is the answer to give — the fix is structural, not a smaller
range.

**2.5 — LET**

```
=LET(
    total,  SUM(B2:B100),
    cost,   SUM(C2:C100),
    margin, IF(total = 0, 0, (total - cost) / total),
    IF(margin > 0.25, margin, 0)
)
```

The original computes `SUM(B2:B100)` three times and `SUM(C2:C100)` twice. The
`LET` version computes each once. It also gained a zero-denominator guard that
the original silently lacked — which is typical: rewriting with `LET` tends to
expose the missing edge case.

**2.6 — `SafeDivide` LAMBDA**

Name Manager → New:

```
Name:       SafeDivide
Refers to:  =LAMBDA(numerator, denominator,
                IF(OR(ISTEXT(numerator), ISTEXT(denominator)), #VALUE!,
                   IF(denominator = 0, "", numerator / denominator)))
```

Tests:

| Call | Result |
|---|---|
| `=SafeDivide(10, 4)` | `2.5` |
| `=SafeDivide(10, 0)` | `""` (empty-looking cell) |
| `=SafeDivide("a", 2)` | `#VALUE!` |

Develop it as a normal formula in a cell first, with the arguments as cell
references, and only convert to `LAMBDA` once it is right — debugging inside
Name Manager is miserable.

**2.7 — The 40-second recalculation**

In the order I would check:

1. **Volatile functions.** Search the workbook for `OFFSET(`, `INDIRECT(`,
   `TODAY(`, `NOW(`, `RAND`. Every one forces a full recalculation on every
   edit. Replace `OFFSET` with `INDEX`, `INDIRECT` with Tables, and `TODAY()`
   with a single cell that everything else references.
2. **Whole-column formulas.** `=SUMIFS(A:A, B:B, …)` repeated 20,000 times is
   20,000 × 1,048,576 comparisons. Point them at Table columns.
3. **Repeated identical subexpressions.** Wrap in `LET`, or compute once in a
   helper column and reference it.
4. **Conditional formatting rule count.** Manage Rules; thousands of fragmented
   rules is a common cause, and the symptom is slowness on *scrolling* as well
   as on edit.
5. **Array formulas over large ranges**, and long lookup chains
   (A → B → C → D). Flatten the chain, or move the whole join into Power Query
   and stop recalculating it at all.

Then check `Ctrl`+`End` for a bloated used range, and consider `.xlsb`.
