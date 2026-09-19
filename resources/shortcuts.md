# Keyboard Shortcuts That Pay for Themselves

Windows shortcuts; the Mac equivalent is usually `Cmd` for `Ctrl`, with the
notable exceptions marked. Learn them five at a time, not all at once.

## Navigation

| Keys | Action |
|---|---|
| `Ctrl` + arrow | Jump to the edge of the current data block |
| `Ctrl` + `Home` / `End` | First cell / last used cell of the sheet |
| `Ctrl` + `Page Up` / `Page Down` | Previous / next worksheet |
| `F5` then a reference | Go to any cell, range or name |
| `Ctrl` + `G` | Go To dialog (same as F5) |
| `Ctrl` + `[` | Jump to the precedents of the current formula |
| `Alt` + `F1` | Chart the selection on this sheet |
| `Ctrl` + `Backspace` | Scroll back to the active cell |

## Selection

| Keys | Action |
|---|---|
| `Ctrl` + `Shift` + arrow | Extend selection to the data edge |
| `Ctrl` + `Space` / `Shift` + `Space` | Select column / row |
| `Ctrl` + `A` | Select the current region, then the whole sheet |
| `Ctrl` + `Shift` + `End` | Extend to the last used cell |
| `Shift` + click | Extend to the clicked cell |
| `Ctrl` + click | Add to the selection |
| `F8` | Extend-selection mode (no keys held) |
| `Ctrl` + `Shift` + `8` | Select the current region (Mac-friendly) |

## Editing

| Keys | Action |
|---|---|
| `F2` | Edit the active cell |
| `Ctrl` + `Enter` | Confirm and stay; fills the whole selection |
| `Alt` + `Enter` | Line break inside a cell |
| `Ctrl` + `D` / `Ctrl` + `R` | Fill down / fill right |
| `Ctrl` + `;` / `Ctrl` + `Shift` + `;` | Insert static date / time |
| `Ctrl` + `'` | Copy the formula from the cell above |
| `Ctrl` + `Shift` + `'` | Copy the *value* from the cell above |
| `Ctrl` + `-` / `Ctrl` + `Shift` + `+` | Delete / insert cells |
| `Ctrl` + `Z` / `Ctrl` + `Y` | Undo / redo |
| `Ctrl` + `Alt` + `V` | Paste Special — then `V` values, `T` formats, `E` transpose |

## Formulas

| Keys | Action |
|---|---|
| `=` | Start a formula |
| `F4` | Cycle `A1` → `$A$1` → `A$1` → `$A1` (Mac: `Cmd`+`T`) |
| `F4` (outside edit mode) | Repeat the last action |
| `F9` | Recalculate; **on a selected fragment, show its result** |
| `Ctrl` + `Alt` + `F9` | Force full recalculation |
| `Ctrl` + `` ` `` | Toggle Show Formulas |
| `Alt` + `=` | AutoSum |
| `F3` | Paste a defined name into the formula |
| `Ctrl` + `F3` | Name Manager |
| `Ctrl` + `Shift` + `Enter` | Legacy array formula (CSE) |
| `Ctrl` + `Shift` + `A` | Insert the argument names of the current function |

> **`F9` on a fragment is the debugger.** Select part of a formula in the
> formula bar, press `F9`, and Excel replaces it with its value so you can see
> what that piece actually returns. Press `Esc` — never `Enter` — to restore it.

## Formatting

| Keys | Action |
|---|---|
| `Ctrl` + `1` | Format Cells |
| `Ctrl` + `B` / `I` / `U` | Bold / italic / underline |
| `Ctrl` + `Shift` + `1` | Number, two decimals, thousands separator |
| `Ctrl` + `Shift` + `2` / `3` / `4` / `5` | Time / date / currency / percentage |
| `Ctrl` + `Shift` + `~` | General format |
| `Ctrl` + `Shift` + `&` / `_` | Add / remove outline border |
| `Alt` + `H`, `O`, `I` | Autofit column width |

## Data

| Keys | Action |
|---|---|
| `Ctrl` + `T` | Create a Table |
| `Ctrl` + `Shift` + `L` | Toggle AutoFilter |
| `Alt` + `↓` (in a filtered header) | Open the filter dropdown |
| `Alt` + `;` | Select visible cells only — **essential before copying filtered data** |
| `Ctrl` + `E` | Flash Fill |
| `Alt`, `A`, `V`, `V` | Data Validation |
| `Alt`, `N`, `V`, `T` | Insert PivotTable |
| `Ctrl` + `Alt` + `F5` | Refresh all queries and Pivots |
| `Alt` + `F5` | Refresh the current Pivot/query |

## Workbook

| Keys | Action |
|---|---|
| `Ctrl` + `N` / `O` / `S` / `W` | New / open / save / close |
| `F12` | Save As |
| `Shift` + `F11` | Insert a worksheet |
| `Ctrl` + `F1` | Collapse the ribbon (reclaim screen space) |
| `Alt` + `F11` | VBA editor |
| `Alt` + `F8` | Macro list |
| `Ctrl` + `F` / `H` | Find / replace |
| `Ctrl` + `P` | Print preview |

## The Alt key is the whole ribbon

Press `Alt` alone and every ribbon tab shows its key. `Alt`, `H`, `O`, `I` is
"Home → Format → autofit column width". Any command you use more than twice a
day has a discoverable three-keystroke path, and the sequence is stable across
versions.
