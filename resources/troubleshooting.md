# Troubleshooting Guide

## Error values

| Error | Means | Usual cause | Fix |
|---|---|---|---|
| `#DIV/0!` | Division by zero or blank | Denominator is empty or 0 | `IFERROR`, or guard the denominator; in DAX use `DIVIDE` |
| `#N/A` | Value not available | A lookup found nothing | `IFNA`; check for trailing spaces, `CHAR(160)`, text-vs-number |
| `#VALUE!` | Wrong argument type | Text where a number is expected; a date stored as text | `ISNUMBER` the inputs; check for blanks that are actually `" "` |
| `#REF!` | Invalid reference | A referenced row/column/sheet was deleted | Undo immediately, or rewrite the formula — the original address is gone |
| `#NAME?` | Unrecognised name | Misspelled function, missing quotes around text, a name that no longer exists, or a function your Excel version lacks | Check spelling; check Name Manager; check `[M365]` availability |
| `#NUM!` | Invalid number | Result too large, a negative square root, `IRR`/`RATE` not converging | Check inputs and seed values |
| `#NULL!` | Empty intersection | A space typed between two ranges that don't overlap | Usually a missing comma: `SUM(A1:A5 B1:B5)` → `SUM(A1:A5,B1:B5)` |
| `#SPILL!` | Spill range blocked | Something in the output cells, or a Table cannot spill | Clear the obstruction (use the warning menu → Select Obstructing Cells) |
| `#CALC!` | Unresolvable calculation | An empty array, or nested arrays | Check the `FILTER` `if_empty` argument |
| `#GETTING_DATA` | Not an error | A query or cube is still loading | Wait |

Track an error to its source with **Formulas → Error Checking → Trace Error**,
which selects the cell that first produced it.

## Symptom → cause

**"My SUM returns 0."**
The numbers are text. Check alignment (left = text), then
`=SUMPRODUCT(--NOT(ISNUMBER(range)))` to count the offenders. Fix with
Text to Columns → Finish on the column, or Paste Special → Add from an empty cell.

**"My lookup says #N/A but I can see the match."**
In order of likelihood: trailing/leading spaces; a non-breaking space
(`CHAR(160)`) from a web or PDF paste; one side is text and the other a number;
a different Unicode character that looks identical; `MATCH`'s third argument
omitted. Diagnose with `=EXACT(A2,B2)`, `=LEN(A2)&"/"&LEN(B2)`, `=ISNUMBER(A2)`.

**"The formula shows as text instead of calculating."**
The cell is formatted as Text. Set it to General, then `F2` + `Enter` to
re-enter. If the whole column is affected, Text to Columns → Finish. Also check
Show Formulas (`Ctrl`+`` ` ``) is not on, and that there is no leading
apostrophe or space before the `=`.

**"Numbers don't update when I change inputs."**
Calculation is set to Manual (Formulas → Calculation Options). The status bar
says "Calculate". `F9` to recalculate, then set it back to Automatic. If it was
a macro that set it, the macro is missing its `Cleanup` handler (Module 11).

**"The file is 80MB and takes two minutes to open."**
In order: `Ctrl`+`End` lands far beyond your data (delete the empty rows and
columns, then save); conditional formatting rule count in the thousands
(Manage Rules); whole-column array formulas or volatile functions; embedded
images; a Data Model you forgot is there; unused styles accumulated from years
of pasting. Saving as `.xlsb` often halves the size.

**"My PivotTable total is far too small."**
The value field is set to Count, not Sum, because the source column contains at
least one text value. Check Value Field Settings, then find the text with
`=SUMPRODUCT(--NOT(ISNUMBER(range)))`.

**"New rows are not appearing in my PivotTable."**
The Pivot is built on a fixed range, not a Table. Change the source to a Table
(PivotTable Analyze → Change Data Source), and refresh — Pivots never refresh
themselves.

**"Dates are showing as five-digit numbers."**
The format got reset to General. Apply a date format (`Ctrl`+`Shift`+`3`). The
underlying value is fine.

**"Dates imported as text."**
The file's date format does not match your locale. Fix it in Power Query with
Change Type **Using Locale**, not with formulas — otherwise it will break again
on the next import or on a colleague's machine.

**"A macro left Excel behaving strangely."**
It errored out with `ScreenUpdating`/`EnableEvents`/`Calculation` still turned
off. Run a reset macro or restart Excel; then add the `Cleanup` error handler
from Module 11.3.

**"Circular reference warning."**
A formula depends on itself, directly or through a chain. Formulas → Error
Checking → Circular References lists them. Fix the design; do not enable
iterative calculation to silence it unless the problem is genuinely iterative.

**"The workbook shows #REF! everywhere after opening."**
Links to an external workbook that has moved. Data → Queries & Connections →
Edit Links → Change Source, or Break Links to freeze the values.

**"Power Query: Formula.Firewall — query references other queries or steps."**
Privacy levels conflict between sources. Set consistent privacy levels in Data
Source Settings, or restructure so the combination happens in one query.

**"My DAX measure is blank on totals."**
The measure depends on a single value being selected (for example `VALUES` or a
lookup). Guard it with `HASONEVALUE` or rewrite it to aggregate properly —
a total is not the sum of the rows for distinct counts and ratios.
