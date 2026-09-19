# Solutions — Module 6: Tables, Validation & Conditional Formatting

**6.1 — The `Employees` Table**

`Ctrl`+`T`, then Table Design → Table Name: `Employees`. Calculated columns —
type the formula once in row 2 and the whole column fills:

```
TotalComp:   =[@AnnualSalary] * (1 + [@BonusPct])
TenureYears: =DATEDIF([@HireDate], TODAY(), "y")
Band:        =IFS([@TenureYears]<1, "<1yr", [@TenureYears]<3, "1-3yr",
                  [@TenureYears]<7, "3-7yr", TRUE, "7yr+")
```

Totals row (`Ctrl`+`Shift`+`T`): set EmployeeID → Count, TotalComp → Average.
It writes `=SUBTOTAL(103, …)` and `=SUBTOTAL(101, …)`, which respect filters —
that is the point of the totals row over a plain `COUNTA`.

Append a row below the Table: all three calculated columns extend, the totals
row moves down, and any Pivot or chart on `Employees` picks it up on refresh.

Note `TenureYears` uses `TODAY()`, which is volatile — acceptable in one column,
but if performance matters, put `TODAY()` in one cell and reference it.

**6.2 — Structured references only**

```
Total payroll:          =SUM(Employees[TotalComp])
Engineering headcount:  =COUNTIFS(Employees[Department], "Engineering")
Highest-paid non-manager:
  =MAX(FILTER(Employees[TotalComp],
              ISNUMBER(SEARCH("Manager", Employees[JobTitle])) = FALSE))
Legacy: {=MAX(IF(ISERROR(SEARCH("Manager", Employees[JobTitle])),
                 Employees[TotalComp]))}
```

**6.3 — The data-entry sheet**

| Field | Validation |
|---|---|
| Department | List, Source `=DeptList` (a name pointing at `Departments[Name]`) |
| JobTitle | List, Source `=INDIRECT(SUBSTITUTE($B$2," ","_"))` — one named range per department |
| EmployeeID | Custom: `=AND(COUNTIF(Employees[EmployeeID], B4)=0, LEFT(B4,4)="EMP-", LEN(B4)=8, ISNUMBER(VALUE(RIGHT(B4,4))))` |
| HireDate | Custom: `=AND(ISNUMBER(B5), WEEKDAY(B5,2)<6, B5<=TODAY()+30)` |
| Salary | Custom: `=AND(B6>=XLOOKUP($B$2, Bands[Dept], Bands[Min]), B6<=XLOOKUP($B$2, Bands[Dept], Bands[Max]))` |

The cascading dropdown needs one named range per department value, named exactly
after the value with spaces replaced by underscores — hence the `SUBSTITUTE`.
Set an Input Message on each field; the tooltip prevents more errors than the
error dialog corrects.

Note the ordering dependency: changing Department after entering JobTitle leaves
a now-invalid title in place, because validation only fires on entry. Add
`Circle Invalid Data` to your review routine, or clear the dependent cell with a
`Worksheet_Change` handler (Module 11.4).

**6.4 — Validation's limits, demonstrated**

Type an invalid value into a validated cell → blocked. Now copy any cell
containing an invalid value and paste it over the validated cell → accepted
silently, and the validation rule itself is overwritten by the pasted cell's
rules. (Paste Special → Values keeps the rule but still bypasses the check.)

The integrity check that catches it anyway:

```
=IF(COUNTIFS(Entry[Department], "<>"&"") <> SUMPRODUCT(--ISNUMBER(
      MATCH(Entry[Department], Departments[Name], 0))),
    "INVALID DEPARTMENT PRESENT", "OK")
```

Put a row of such checks at the top of the sheet, each returning `OK` or a
specific failure, and conditionally format any non-`OK` in red. Validation
prevents typos; the check catches everything else.

**6.5 — Conditional formatting**

All rules applied to `$A$2:$N$251`, formulas written for the top-left cell:

```
Low review score (whole row):   =$N2 < 3
Missing manager:                =$M2 = ""
```

Salary colour scale *within* department — a whole-range colour scale would
compare an L1 in Support with an L5 in Engineering, which is meaningless. Use a
helper column for the within-department percentile, then scale on that:

```
DeptPctile: =PERCENTRANK.INC(
               FILTER(Employees[AnnualSalary],
                      Employees[Department]=[@Department]),
               [@AnnualSalary])
```

then a 3-colour scale on `DeptPctile` (0 → 0.5 → 1 with fixed numeric endpoints,
not "lowest/highest value", so the colours mean the same thing on every refresh).

Icon set on `TenureYears` with fixed thresholds at 1, 3 and 7 — again, fixed
numbers rather than percentiles, so the icon means a tenure band rather than a
position in today's population.

Greyscale legibility: pair every colour with a second channel. Add the band text
next to the icon, use the icon set (shapes differ, not just colour), and for the
low-score rule use bold plus a left border rather than fill alone. Test by
printing to PDF in greyscale — it takes thirty seconds and settles the argument.

**6.6 — 2,800 conditional formatting rules**

How it happened: someone applied a rule to a few rows, then copied and pasted
those rows repeatedly. Every paste splits the Applies-to range, so one rule
becomes dozens of near-identical rules over one- and two-row ranges. Excel
re-evaluates every rule against every visible cell on every scroll.

Repair:

1. Home → Conditional Formatting → Manage Rules → scope **This Worksheet**, and
   note the count.
2. Export the intent first — screenshot or list the handful of distinct rules
   that actually exist.
3. Clear Rules → From Entire Sheet.
4. Re-apply each distinct rule once, with the Applies-to set to the Table
   reference (`=Employees[#All]` or the explicit data range) rather than whole
   columns.
5. Going forward, paste with **Paste Special → Values** so the pasted cells do
   not drag rule fragments with them.

**6.7 — Locking it down**

1. Select the intended input cells → `Ctrl`+`1` → Protection → **uncheck Locked**.
2. Right-click the calculation sheet → Hide. (For real concealment, set
   `xlSheetVeryHidden` in the VBA properties window — it will not appear in the
   Unhide dialog.)
3. Review → **Protect Sheet**. Tick: Select unlocked cells, Sort, Use AutoFilter,
   Use PivotTable reports. Untick: Select locked cells, Format cells, Insert/
   delete rows.
4. Review → **Protect Workbook** (Structure) to stop sheets being unhidden,
   added, renamed or deleted.
5. File → Info → **Encrypt with Password** if the contents are confidential.

Steps 1–4 are **not security** — sheet and workbook structure passwords are
trivially removed by any of several free tools, and a very hidden sheet is
visible to anyone who opens the VBA editor. They prevent accidents, which is a
real and worthwhile goal; say so honestly rather than implying protection the
file does not have. Only step 5 (AES encryption of the file) actually protects
the contents, and only while the password stays strong and unshared.
