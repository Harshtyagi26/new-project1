# Solutions — Module 11: Automation

**11.1 — Recorded vs written**

Recorded output is typically 20–40 lines of `.Select` / `Selection.` pairs. The
rewrite:

```vba
Option Explicit

Sub FormatReport(ByVal target As Range)
    With target
        .Rows(1).Font.Bold = True
        .Borders(xlInsideHorizontal).LineStyle = xlContinuous
        .Borders(xlInsideVertical).LineStyle = xlContinuous
        .BorderAround xlContinuous, xlMedium
        .Columns.AutoFit
    End With
    With target.Offset(1).Resize(target.Rows.Count - 1)
        .NumberFormat = "#,##0.00"
    End With
End Sub
```

Roughly a third of the lines, and it takes the range as an argument instead of
depending on what happens to be selected — so it is reusable and testable.
On a large range the written version is typically an order of magnitude faster,
because each `.Select` forces a screen update and a selection-change event.

**11.2 — `ImportAndClean`**

```vba
Option Explicit

Public Sub ImportAndClean(ByVal filePath As String)
    Dim wb As Workbook, src As Worksheet, dest As Worksheet
    Dim sheetName As String, data As Variant
    Dim r As Long, c As Long

    If Dir(filePath) = vbNullString Then
        MsgBox "File not found: " & filePath, vbExclamation
        Exit Sub
    End If

    sheetName = Left$(FileBaseName(filePath), 31)

    On Error Resume Next
    Set dest = ThisWorkbook.Worksheets(sheetName)
    On Error GoTo 0
    If Not dest Is Nothing Then
        If MsgBox("Sheet '" & sheetName & "' exists. Replace it?", _
                  vbYesNo + vbQuestion) <> vbYes Then Exit Sub
        Application.DisplayAlerts = False
        dest.Delete
        Application.DisplayAlerts = True
    End If

    Set wb = Workbooks.Open(filePath, ReadOnly:=True)
    Set src = wb.Worksheets(1)

    If Application.WorksheetFunction.CountA(src.UsedRange) = 0 Then
        wb.Close SaveChanges:=False
        MsgBox "File is empty: " & filePath, vbExclamation
        Exit Sub
    End If

    data = src.UsedRange.Value
    wb.Close SaveChanges:=False

    For r = LBound(data, 1) To UBound(data, 1)
        For c = LBound(data, 2) To UBound(data, 2)
            If VarType(data(r, c)) = vbString Then
                data(r, c) = Application.Trim( _
                    Application.Clean(Replace(data(r, c), Chr$(160), " ")))
            End If
        Next c
    Next r

    Set dest = ThisWorkbook.Worksheets.Add( _
        After:=ThisWorkbook.Worksheets(ThisWorkbook.Worksheets.Count))
    dest.Name = sheetName
    dest.Range("A1").Resize(UBound(data, 1), UBound(data, 2)).Value = data
End Sub

Private Function FileBaseName(ByVal p As String) As String
    Dim f As String
    f = Mid$(p, InStrRev(p, "\") + 1)
    If InStrRev(f, ".") > 0 Then f = Left$(f, InStrRev(f, ".") - 1)
    FileBaseName = f
End Function
```

Behaviour in each case: **file not found** → message, no side effects.
**Sheet exists** → asks before destroying anything, and does nothing on "No".
**Empty file** → closes the source and reports, rather than creating a blank
sheet that looks like a successful import. Note the `On Error Resume Next` is
scoped to exactly one statement and immediately cancelled with `On Error GoTo 0`.

**11.3 — Loop vs array**

```vba
Sub CompareTiming()
    Dim t As Double, i As Long, ws As Worksheet, data As Variant
    Set ws = ThisWorkbook.Worksheets("Sales")

    t = Timer
    For i = 2 To 5001
        ws.Cells(i, 15).Value = ws.Cells(i, 12).Value - ws.Cells(i, 13).Value
    Next i
    Debug.Print "Cell by cell: " & Format(Timer - t, "0.000") & "s"

    t = Timer
    data = ws.Range("L2:M5001").Value
    Dim out() As Variant
    ReDim out(1 To UBound(data, 1), 1 To 1)
    For i = 1 To UBound(data, 1)
        out(i, 1) = data(i, 1) - data(i, 2)
    Next i
    ws.Range("O2:O5001").Value = out
    Debug.Print "Array: " & Format(Timer - t, "0.000") & "s"
End Sub
```

Expect roughly 50–200× on 5,000 rows, and the gap widens with row count: the
cell-by-cell version pays the COM boundary cost 10,000 times (5,000 reads,
5,000 writes), the array version pays it twice.

**11.4 — The performance wrapper**

```vba
Sub SafeRoutine()
    Dim calcMode As XlCalculation
    On Error GoTo Cleanup

    calcMode = Application.Calculation
    Application.ScreenUpdating = False
    Application.EnableEvents = False
    Application.Calculation = xlCalculationManual

    Err.Raise 5, , "Deliberate failure for testing"   ' <- force an error

Cleanup:
    Application.Calculation = calcMode
    Application.EnableEvents = True
    Application.ScreenUpdating = True
    If Err.Number <> 0 Then
        MsgBox "Failed: " & Err.Description, vbExclamation
        Err.Clear
    End If
End Sub
```

After running it, confirm in the Immediate window:
`?Application.EnableEvents` → `True`, `?Application.Calculation` →
`-4105` (`xlCalculationAutomatic`). Without the handler, both stay off and the
user's Excel silently stops recalculating for the rest of the session.

**11.5 — The timestamp handler**

```vba
Private Sub Worksheet_Change(ByVal Target As Range)
    If Intersect(Target, Me.Range("B2:B100")) Is Nothing Then Exit Sub

    On Error GoTo Cleanup
    Application.EnableEvents = False

    Dim cell As Range
    For Each cell In Intersect(Target, Me.Range("B2:B100"))
        Me.Cells(cell.Row, "C").Value = Now
    Next cell

Cleanup:
    Application.EnableEvents = True
End Sub
```

Without `Intersect`: every edit anywhere on the sheet stamps column C, including
edits to column C itself.

Without `EnableEvents = False`: writing to C fires `Worksheet_Change` again,
which writes to C again… VBA does not detect this as recursion until the stack
overflows, and on the way it can write hundreds of times. The `Cleanup` label is
essential here too — an error mid-loop with events left off means the sheet's
handlers stop working entirely and nobody knows why.

**11.6 — UDF vs LAMBDA**

```vba
Public Function SafeDivide(n As Double, d As Double) As Variant
    If d = 0 Then SafeDivide = "" Else SafeDivide = n / d
End Function
```

```
LAMBDA: =LAMBDA(n, d, IF(d=0, "", n/d))    stored in Name Manager as SafeDivide
```

Over 50,000 cells the `LAMBDA` is typically several times faster — the VBA UDF
crosses the COM boundary on every single evaluation, and UDFs are not
multi-threaded in the way native calculation is.

Ship the `LAMBDA`: it needs no `.xlsm`, triggers no macro security prompt,
survives a recipient's macro policy, and works in Excel for the web. Use the UDF
only if the workbook must run on Excel 2019 or earlier, where `LAMBDA` does not
exist.

**11.7 — The Office Script port**

```typescript
function main(workbook: ExcelScript.Workbook, sheetName: string) {
  const sheet = workbook.getWorksheet(sheetName);
  if (!sheet) throw new Error(`Sheet not found: ${sheetName}`);

  const range = sheet.getUsedRange();
  if (!range) throw new Error("Sheet is empty");

  const values = range.getValues();
  const cleaned = values.map(row =>
    row.map(v => typeof v === "string"
      ? v.replace(/ /g, " ").replace(/\s+/g, " ").trim()
      : v));
  range.setValues(cleaned);
}
```

What had to change: no `Workbooks.Open` — a script cannot open an arbitrary file
from the local disk, so the CSV must already be in the workbook or be fetched by
a Power Automate step that hands the script its contents. `MsgBox` becomes
`throw` (a script has no UI), `Dir` has no equivalent, and the sheet-exists
check returns `undefined` rather than raising.

What the TypeScript version cannot do: reach outside Excel. No filesystem
access, no COM, so no "then email it through Outlook" or "then write a CSV to
the network share" inside the script itself. Power Automate supplies those steps
around the script — which is arguably a better architecture, but it is a
different one.

**11.8 — `On Error Resume Next` with no `GoTo 0`**

Failure mode: every error from that point to the end of the procedure is
swallowed. A failed `Set` leaves an object `Nothing`, the next line silently
does nothing, and the macro reports success. Worse, a partial write — half the
rows updated before the failure — leaves the workbook in a state nobody can
distinguish from a complete run. "Sometimes doesn't work" is exactly what this
looks like from the outside.

Rewrite:

```vba
Sub Process()
    Dim ws As Worksheet
    On Error GoTo Fail

    On Error Resume Next                ' scoped to one statement only
    Set ws = ThisWorkbook.Worksheets("Data")
    On Error GoTo Fail

    If ws Is Nothing Then
        Err.Raise vbObjectError + 1, , "Worksheet 'Data' not found"
    End If

    ' … work …

    Exit Sub
Fail:
    MsgBox "Process failed: " & Err.Description, vbCritical
End Sub
```

The rule: suppress errors for exactly the statement where an error is an
expected outcome, test for it immediately, and restore the handler on the next
line.
