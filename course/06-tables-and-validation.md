# Module 6 — Tables, Validation & Conditional Formatting

> **Goal:** build ranges that grow by themselves, inputs that cannot be entered
> wrong, and formatting that carries information rather than decoration.
>
> **Time:** ~3 hours · **Prerequisites:** Modules 2–4 · **Data:** `employees.csv`

---

## 6.1 Excel Tables

`Ctrl`+`T` on any well-formed range. Then **immediately rename it** on the
Table Design tab — `Table1` tells a reader nothing; `Sales` tells them
everything.

What you get:

1. **Auto-expansion.** Type in the row beneath and the Table absorbs it, along
   with every formula, format, chart, PivotTable and named range that points at
   it. This one property removes an entire category of bug.
2. **Structured references.** `=SUM(Sales[NetRevenue])` instead of
   `=SUM(L2:L5001)`. Self-documenting and immune to column insertion.
3. **Calculated columns.** Type a formula in one cell of a new column and it
   fills the entire column, and keeps filling as rows are added.
4. **A totals row** (`Ctrl`+`Shift`+`T`) using `SUBTOTAL`, so it respects filters.
5. **Banded formatting, a filter row, and sticky headers** that replace the
   column letters when you scroll. No frozen panes needed.

### Structured reference syntax

```
Sales[NetRevenue]                one column, data only
Sales[[NetRevenue]:[COGS]]       a contiguous block of columns
Sales[#Headers]                  the header row
Sales[#Totals]                   the totals row
Sales[#All]                      headers + data + totals
Sales[@NetRevenue]               this row's value (inside the Table)
Sales[@[NetRevenue]:[COGS]]      this row, several columns
[@Quantity]*[@UnitPrice]         within the same Table, the name is optional
```

**The `[@...]` marker means "the current row".** It only works in a formula on
the same row as the data; outside the Table you must be explicit.

### When not to use a Table

- Data with merged cells or a non-rectangular shape (fix the shape instead).
- Sheets where you need `Ctrl`+arrow to stop at true blanks.
- Ranges you intend to reference with volatile `OFFSET` trickery — which you
  should not be doing anyway.
- Tables cannot contain array formulas that spill, and cannot be used on a
  shared/protected sheet in some configurations.

---

## 6.2 Data validation

**Data → Data Validation** (`Alt`,`A`,`V`,`V`). Constrain what a cell accepts.

| Allow | Use for |
|---|---|
| Whole number / Decimal | Ranges, minimums |
| List | Dropdowns — the workhorse |
| Date / Time | Period bounds |
| Text length | IDs, codes |
| Custom | A formula returning TRUE/FALSE — anything at all |

**Dropdown from a Table column** (so it grows automatically):

```
Source:  =INDIRECT("Regions[RegionCode]")
```

Validation's Source box historically refuses structured references directly,
hence `INDIRECT` — with the volatility cost. Cleaner modern option: define a
name that refers to the Table column, and use `=RegionList`. In current M365,
a spill reference works directly: `=$H$2#`.

**Useful custom rules:**

```
No duplicates in this column:  =COUNTIF($A$2:$A$500, A2)=1
Must be uppercase:             =EXACT(A2, UPPER(A2))
Must be a weekday:             =WEEKDAY(A2,2)<6
Must not exceed a budget:      =SUM($B$2:$B$100)<=Budget
Email-ish:                     =AND(ISNUMBER(SEARCH("@",A2)), ISNUMBER(SEARCH(".",A2)))
Dependent dropdown:            =INDIRECT(SUBSTITUTE($A2," ","_"))
```

**Dependent (cascading) dropdowns**: name each sub-list after its parent value,
then point the child validation at `=INDIRECT(parentCell)`. Names cannot contain
spaces, hence the `SUBSTITUTE`.

**Input and error messages.** Use the Input Message tab — a tooltip that appears
on selection is far more effective than an error after the fact. Set the error
Style deliberately: **Stop** forbids, **Warning** allows with confirmation,
**Information** just notifies.

**Validation's limits, stated plainly:** it checks values *typed* into a cell.
It does not check pasted values, values written by a macro, or values already
present when the rule was added. Find pre-existing violations with
**Data Validation → Circle Invalid Data**. For data you actually depend on, back
validation with a formula-based integrity check somewhere on the sheet.

---

## 6.3 Conditional formatting

Rules evaluate per cell, in priority order, over an "Applies to" range.

**Built-in rule types:** highlight cells, top/bottom, data bars, colour scales,
icon sets. Fast, and fine for exploration.

**Formula-based rules** are where the power is. Two things to get right:

1. Write the formula **as if for the top-left cell of the Applies-to range**.
   Excel offsets it for every other cell exactly like filling a formula.
2. **Anchor deliberately.** To highlight an entire row based on one column, lock
   the column: `=$G2="Returned"`. Forget the `$` and you highlight one cell.

```
Entire row where status is Returned:  =$N2="Returned"      applies to $A$2:$N$5001
Weekend rows:                          =WEEKDAY($B2,2)>5
Below target:                          =$D2 < $E2
Duplicate values:                      =COUNTIF($A$2:$A$500,$A2)>1
Top 10% in the column:                 =$D2>=PERCENTILE.INC($D$2:$D$500,0.9)
Blank-but-required:                    =AND($A2<>"", $C2="")
Cells changed since last refresh:      =$F2<>$G2
```

**Rule order and "Stop If True".** Rules apply top-down; later rules layer on
top unless an earlier one sets Stop If True. If a rule "isn't working", open
**Manage Rules**, set the scope to *this worksheet*, and check ordering and
Applies-to first — that is the fault 90% of the time.

**Performance.** Conditional formatting over whole columns (`$A:$N`) on a large
sheet is one of the few reliable ways to make Excel crawl. Scope to the actual
data. Watch out for rule *fragmentation*: copying and pasting rows splits one
rule into hundreds of tiny Applies-to ranges. Periodically delete all rules and
re-apply cleanly — check the count in Manage Rules.

**Design restraint.** Conditional formatting should encode one or two facts.
A sheet where every column is a different colour scale conveys nothing. Colour
must never be the only channel — a reader with colour-vision deficiency, or a
monochrome printout, needs the icon, the number, or the label too.

---

## 6.4 Protection and workbook integrity

Layered, and each layer is a different thing:

1. **Cell locking** — every cell is "locked" by default, but locking only takes
   effect when the sheet is protected. So: unlock the *input* cells (`Ctrl`+`1`
   → Protection → clear Locked), then protect the sheet.
2. **Protect Sheet** — choose exactly what users may still do (select unlocked
   cells, sort, use AutoFilter, use PivotTables). Getting these checkboxes wrong
   is what makes protected workbooks infuriating.
3. **Protect Workbook** — prevents adding, deleting, hiding or renaming sheets.
4. **File → Info → Encrypt with Password** — real encryption. The other layers
   are *not* security; they prevent accidents. Sheet protection passwords are
   trivially removable and should never guard anything confidential.

Combine with validation and a clear input/calculation/output colour convention
(Module 1) and a workbook can be handed to anyone.

---

## Exercises

Against `employees.csv`. Solutions:
[`exercises/solutions/06-tables-and-validation.md`](../exercises/solutions/06-tables-and-validation.md).

**6.1** Convert `employees.csv` to a Table named `Employees`. Add calculated
columns for `TotalComp` (salary × (1 + bonus)), `TenureYears`, and a `Band`
using the tenure bands from Module 3. Add a totals row showing headcount and
average total comp. Confirm all of it extends when you append a row.

**6.2** Write three summary formulas *outside* the Table using structured
references only — no A1-style ranges — for: total payroll, Engineering
headcount, and highest-paid non-manager.

**6.3** Build a data-entry sheet for adding an employee with: a Department
dropdown sourced from a Table so it grows automatically; a cascading JobTitle
dropdown filtered to the chosen department; an EmployeeID that must be unique
and match the pattern `EMP-####`; a HireDate that must be a weekday no more than
30 days in the future; and a salary that must fall inside that department's band.

**6.4** Demonstrate the limit of data validation: show a value entering a
validated cell without triggering the rule, then add a formula-based integrity
check that catches it anyway.

**6.5** Apply conditional formatting to `Employees`: highlight the entire row
for anyone with `LastReviewScore < 3`; a 3-colour scale on salary *within each
department* (not across all); an icon set flagging tenure bands; and a rule that
marks rows where `ManagerID` is blank. Then show how you would make all four
legible in greyscale.

**6.6** A colleague's workbook has 2,800 conditional formatting rules and takes
15 seconds per scroll. Explain how it got there and give the repair procedure.

**6.7** Lock the workbook down so a user can enter data only in the intended
cells, sort and filter the Table, but cannot alter formulas, delete sheets, or
see the calculation sheet. List every step and state which of them is *not*
actually security.

---

## Pitfalls recap

- Rename Tables immediately. `Table1` through `Table37` is not a data model.
- `[@Col]` only works within the Table's own rows.
- Conditional formatting formulas are written for the top-left cell and must be
  anchored with `$` on purpose.
- Validation ignores pasted and macro-written values.
- Whole-column conditional formatting and rule fragmentation kill performance.
- Sheet protection is an accident-prevention feature, not security.

**Next:** [Module 7 — PivotTables & PivotCharts](07-pivottables.md)
