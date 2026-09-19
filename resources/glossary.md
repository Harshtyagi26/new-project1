# Glossary

**Absolute reference** — a reference fixed with `$` so it does not shift when
the formula is copied: `$A$1`.

**AutoFilter** — the dropdown filter row on a range or Table.

**Calculated column (Power Pivot)** — a column computed at refresh, stored in
the model, evaluated in row context. Use for attributes you group by.

**Calculated field (PivotTable)** — a formula evaluated over *aggregated* values
within a Pivot. Cannot do row-level arithmetic.

**CSE formula** — a legacy array formula committed with
`Ctrl`+`Shift`+`Enter`, shown wrapped in `{ }`.

**DAX** — Data Analysis Expressions; the formula language of Power Pivot, Power
BI and Analysis Services.

**Data Model** — the in-memory columnar database (VertiPaq) behind Power Pivot,
holding tables, relationships and measures.

**Dimension table** — a table of descriptive attributes with one row per entity
(product, region, date), joined to a fact table on a unique key.

**Dynamic array** — a formula returning multiple values that spill into
neighbouring cells. Referenced with the `#` operator.

**Fact table** — a long, narrow table of events or transactions, one row per
measured occurrence, carrying foreign keys to dimensions.

**Filter context** — in DAX, the set of filters applied to a measure by the
report: row labels, column labels, slicers and filters.

**Flash Fill** — pattern inference from examples (`Ctrl`+`E`). Produces static
values, not formulas.

**Implicit intersection** — Excel reducing an array to the single value on the
current row; marked with `@` in modern Excel.

**LAMBDA** — a named, reusable custom function written in Excel's own formula
language and stored in Name Manager.

**M** — the Power Query formula language. Case-sensitive, functional, with
`let … in` step lists.

**Measure** — a DAX formula evaluated at query time under the current filter
context. Not stored.

**Mixed reference** — a reference with exactly one of row or column anchored:
`A$1` or `$A1`.

**Named range / defined name** — a label bound to a reference, constant or
formula. Workbook- or sheet-scoped.

**Query folding** — Power Query translating steps into a native source query
(usually SQL) so the server does the work.

**Row context** — in DAX, evaluation "for the current row", created by
calculated columns and by iterator (`X`) functions.

**Serial number** — Excel's internal representation of a date: days since
1899-12-31, with time as the fraction.

**Slicer** — a visual filter control that can drive multiple PivotTables and
charts sharing a connection.

**Spill range** — the cells a dynamic array formula writes into. Referenced as
`D2#`.

**Star schema** — a model of one fact table surrounded by dimension tables,
each joined on a single key. The target shape for any Power Pivot model.

**Structured reference** — a Table-based reference such as
`Sales[NetRevenue]` or `[@Quantity]`.

**Table (ListObject)** — a named, auto-expanding range created with `Ctrl`+`T`.

**Time intelligence** — DAX functions computing period-based comparisons
(`TOTALYTD`, `SAMEPERIODLASTYEAR`), requiring a marked date table.

**Volatile function** — a function that recalculates on every workbook change:
`NOW`, `TODAY`, `RAND`, `RANDBETWEEN`, `OFFSET`, `INDIRECT`, `CELL`, `INFO`.

**VertiPaq** — the compressed columnar storage engine behind the Data Model.
