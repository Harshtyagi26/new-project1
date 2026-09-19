# Module 11 — Automation: Macros, VBA & Office Scripts

> **Goal:** automate the repetitive parts safely — and know when *not* to,
> because Power Query has already solved most of what people write VBA for.
>
> **Time:** ~5 hours · **Prerequisites:** Modules 6–8

---

## 11.1 Decide before you code

Ask in this order:

1. **Is it data transformation?** → Power Query. Refreshable, no macro security
   warnings, readable by your successor. Most "I need a macro" requests are this.
2. **Is it aggregation or a calculation?** → Formulas, measures, PivotTables.
3. **Is it formatting or layout?** → Cell styles, conditional formatting, templates.
4. **Does it need to react to a user, touch other files, talk to another
   application, or do something Excel's UI cannot?** → Now write code.

VBA costs you: a macro-enabled file type, security prompts, no version control
worth the name, and a component that only you can maintain. It is the right tool
often enough — just not as often as it is used.

---

## 11.2 Recording, and then reading

**Developer tab** (File → Options → Customize Ribbon → tick Developer) →
Record Macro. Do the thing. Stop. Then `Alt`+`F11` and *read what it wrote*.

Recorded code is verbose and fragile because the recorder captures your
*navigation*, not your *intent*:

```vba
' What the recorder produces
Sub Macro1()
    Range("A1").Select
    Selection.Copy
    Range("C1").Select
    ActiveSheet.Paste
    Range("C1").Select
    Selection.Font.Bold = True
End Sub

' What it should be
Sub CopyAndBold()
    With ThisWorkbook.Worksheets("Data")
        .Range("A1").Copy Destination:=.Range("C1")
        .Range("C1").Font.Bold = True
    End With
End Sub
```

**Never `.Select`.** Selecting is how a human navigates; code addresses objects
directly. Selection-based code breaks the moment the wrong sheet is active, and
it is roughly an order of magnitude slower.

Use the recorder as a **reference lookup** — record an action to find out which
object and property it uses, then write the real code yourself.

---

## 11.3 VBA essentials

```vba
Option Explicit          ' At the top of EVERY module. Non-negotiable.
                         ' Tools → Options → Require Variable Declaration
                         ' Without it, a typo creates a new empty variable silently.

Sub ProcessSales()
    Dim ws As Worksheet
    Dim lastRow As Long              ' Long, not Integer — Integer overflows at 32,767
    Dim i As Long
    Dim total As Double

    Set ws = ThisWorkbook.Worksheets("Sales")   ' ThisWorkbook, not ActiveWorkbook
    lastRow = ws.Cells(ws.Rows.Count, "A").End(xlUp).Row

    For i = 2 To lastRow
        total = total + ws.Cells(i, "L").Value
    Next i

    MsgBox Format(total, "#,##0.00")
End Sub
```

**The object model**, top down:

```
Application → Workbooks → Worksheets → Range → Cells / Rows / Columns
                        → Names, Connections, Queries
            → Charts, PivotTables, ListObjects (Tables)
```

Key idioms:

```vba
ThisWorkbook                          ' the workbook holding the code — prefer this
ActiveWorkbook / ActiveSheet          ' whatever the user is looking at — avoid
ws.Cells(ws.Rows.Count, 1).End(xlUp).Row     ' last used row in column A
ws.Range("A1").CurrentRegion                 ' the contiguous block around A1
ws.ListObjects("Sales").DataBodyRange        ' a Table's data, excluding headers
Application.WorksheetFunction.Sum(rng)       ' call an Excel function
Set rng = ws.Range("A1:A100")
For Each cell In rng: … : Next cell
```

**Arrays are the performance secret.** Reading and writing the grid cell by cell
is thousands of times slower than moving the whole block into a VBA array:

```vba
Dim data As Variant
data = ws.Range("A2:N5001").Value       ' one read, 2-D array, 1-based
For i = 1 To UBound(data, 1)
    data(i, 14) = data(i, 12) - data(i, 13)
Next i
ws.Range("A2:N5001").Value = data       ' one write
```

**The standard performance wrapper**, with the error handler that makes it safe:

```vba
Sub FastRoutine()
    Dim calcMode As XlCalculation
    On Error GoTo Cleanup

    calcMode = Application.Calculation
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual

    ' … the actual work …

Cleanup:
    Application.Calculation = calcMode
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    If Err.Number <> 0 Then MsgBox "Failed: " & Err.Description, vbExclamation
End Sub
```

Without the `On Error GoTo Cleanup`, a mid-routine error leaves Excel with
events off and calculation manual, and the user spends the afternoon wondering
why nothing updates. That is the single most common VBA support ticket.

**Error handling generally:**

```vba
On Error Resume Next        ' Suppresses errors. Use for exactly one statement,
Set ws = Sheets("Maybe")    ' then restore immediately.
On Error GoTo 0
If ws Is Nothing Then …
```

`On Error Resume Next` left on across a whole procedure is how VBA silently
corrupts data.

---

## 11.4 Events

Code in a **worksheet** module (right-click the tab → View Code) or
`ThisWorkbook` runs on triggers:

```vba
Private Sub Worksheet_Change(ByVal Target As Range)
    ' Fires on every user edit to this sheet
    If Intersect(Target, Me.Range("B2:B100")) Is Nothing Then Exit Sub
    Application.EnableEvents = False          ' or your write re-triggers this
    Me.Range("C" & Target.Row).Value = Now
    Application.EnableEvents = True
End Sub

Private Sub Workbook_Open()
    ThisWorkbook.RefreshAll
End Sub

Private Sub Worksheet_SelectionChange(ByVal Target As Range)
Private Sub Workbook_BeforeSave(ByVal SaveAsUI As Boolean, Cancel As Boolean)
```

Two rules: **guard with `Intersect`** so you only react to the range you care
about, and **disable events before writing** from inside an event handler or you
will recurse until the stack gives out.

---

## 11.5 User-defined functions

A `Function` in a standard module becomes available in the grid:

```vba
Public Function SafeDivide(numerator As Double, denominator As Double) As Variant
    If denominator = 0 Then
        SafeDivide = ""
    Else
        SafeDivide = numerator / denominator
    End If
End Function
```

UDF constraints: they can only return a value, cannot alter other cells or
formatting, and are slower than native functions — noticeably so over thousands
of cells. Before writing one, check whether `LAMBDA` (Module 2.6) can do it:
`LAMBDA` needs no macro-enabled workbook and no security prompt, which usually
settles the argument.

---

## 11.6 Security and distribution

- Macro-enabled files are `.xlsm` (or `.xlsb` binary, smaller and faster for
  very large workbooks). Saving an `.xlsm` as `.xlsx` **deletes all the code**,
  with a warning nobody reads.
- Files downloaded from the internet or email arrive with **Mark of the Web**
  and macros are blocked outright, not merely prompted. The fix is for the
  recipient to right-click → Properties → Unblock, or for the file to live in a
  Trust Center trusted location. Plan distribution around this.
- **Never store credentials in VBA.** VBA project passwords are trivially
  bypassed; treat the code as public.
- Signing a project with a code-signing certificate is the supported way to ship
  macros in a managed environment.
- **Personal Macro Workbook** (`PERSONAL.XLSB`) holds your own utility macros
  across every workbook you open. Record a macro with "Store macro in: Personal
  Macro Workbook" once and it is created for you.

---

## 11.7 Office Scripts — the modern alternative

Excel for the web and the Windows desktop app support **Office Scripts**:
TypeScript, recorded or written in a browser editor, run in the cloud, and —
critically — callable from **Power Automate**, so a script can run on a
schedule, on a form submission, or on a new email attachment.

```typescript
function main(workbook: ExcelScript.Workbook) {
  const sheet = workbook.getWorksheet("Sales");
  const table = sheet.getTable("Sales");
  const rows = table.getRangeBetweenHeaderAndTotal().getValues();

  const total = rows.reduce((sum, row) => sum + (row[11] as number), 0);
  workbook.getWorksheet("Summary").getRange("B2").setValue(total);
}
```

| | VBA | Office Scripts |
|---|---|---|
| Runs on | Windows/Mac desktop | Web + desktop, and in the cloud |
| Language | VBA | TypeScript |
| Triggers | Workbook events | Power Automate flows |
| File type | `.xlsm` | Ordinary `.xlsx` |
| Reaches other apps | COM (Outlook, Word, filesystem) | Only what the API and Flow expose |
| Versioning | Painful | Text, diffable |

**Choose Office Scripts for new automation** unless you need COM access to the
local machine or you are targeting an environment without Microsoft 365. Choose
VBA when you need to drive Outlook, touch the file system, or support an
offline desktop-only workflow.

---

## Exercises

Solutions: [`exercises/solutions/11-automation.md`](../exercises/solutions/11-automation.md).

**11.1** Record a macro that formats a range as a report (headers bold, borders,
number format, autofit). Then rewrite it by hand with no `.Select`, no
`ActiveSheet`, and proper variable declarations. Compare line counts and
run times.

**11.2** Write `ImportAndClean` that takes the path of a CSV, imports it,
applies the Module 5 text cleanse, and writes the result to a new sheet named
after the file. Handle: file not found, a sheet of that name already existing,
and an empty file. State what your routine does in each case.

**11.3** Rewrite a cell-by-cell loop over all 5,000 sales rows as an array
operation. Time both with `Timer` and report the ratio.

**11.4** Add the performance wrapper with the `Cleanup` error handler. Then
force an error in the middle deliberately and prove Excel is left in a sane
state.

**11.5** Write a `Worksheet_Change` handler that timestamps column C whenever
column B changes, only for rows 2–100. Demonstrate what happens without the
`Intersect` guard and without `EnableEvents = False`.

**11.6** Write a `SafeDivide` UDF, then the equivalent `LAMBDA`. Compare
recalculation time over 50,000 cells and state which you would ship.

**11.7** Port 11.2 to an Office Script. List everything that had to change and
one thing the TypeScript version cannot do.

**11.8** A colleague's macro "sometimes doesn't work". You find
`On Error Resume Next` at the top and no matching `On Error GoTo 0`. Explain the
failure mode and rewrite the error handling properly.

---

## Pitfalls recap

- If Power Query can do it, do not write a macro.
- `Option Explicit` at the top of every module.
- Never `.Select`; address objects directly.
- `Integer` overflows at 32,767 — use `Long` for row counts.
- Always restore `ScreenUpdating`, `EnableEvents` and `Calculation` in a
  `Cleanup` label.
- Disable events before writing from inside an event handler.
- Saving `.xlsm` as `.xlsx` destroys all code.
- VBA project passwords are not security.

**Next:** [Module 12 — Capstone Projects](12-capstone.md)
