# Excel Mastery — Premium Course

A complete, self-paced Excel curriculum that takes you from spreadsheet basics to
building production-grade analytical models, dashboards and automations.

Twelve modules, 60+ lessons, 90+ graded exercises with worked solutions, practice
datasets you can open in Excel, and three capstone projects.

---

## Who this is for

| You are… | Start at |
|---|---|
| New to Excel, or self-taught with gaps | Module 1 |
| Comfortable with SUM/VLOOKUP, want real fluency | Module 4 |
| An analyst who lives in PivotTables, wants modelling power | Module 8 |
| Already strong, here for dashboards and automation | Module 10 |

**Prerequisites:** Excel 2021, Microsoft 365, or Excel for the web. Some lessons are
marked `[M365]` where they rely on dynamic arrays or newer functions, and every one
of those lessons includes a legacy-compatible alternative.

## How the course is structured

Each module folder contains:

- **Concepts** — the mental model first, the keystrokes second.
- **Worked examples** — every formula shown in full, with the exact cell references.
- **Exercises** — numbered tasks against the datasets in `datasets/`.
- **Solutions** — in `exercises/solutions/`, with an explanation of *why*, not just *what*.
- **Pitfalls** — the specific ways each technique breaks in real workbooks.

## The curriculum

| # | Module | Focus | Est. time |
|---|---|---|---|
| 1 | [Foundations & Workbook Architecture](course/01-foundations.md) | Navigation, data types, structure that scales | 3h |
| 2 | [The Formula Engine](course/02-formula-engine.md) | References, precedence, names, evaluation order | 4h |
| 3 | [The Core Function Library](course/03-core-functions.md) | Logical, text, date, math, statistics | 5h |
| 4 | [Lookup, Reference & Dynamic Arrays](course/04-lookup-and-arrays.md) | XLOOKUP, INDEX/MATCH, FILTER, spill ranges | 5h |
| 5 | [Data Cleaning & Transformation](course/05-data-cleaning.md) | Real-world messy data, repeatably fixed | 4h |
| 6 | [Tables, Validation & Conditional Formatting](course/06-tables-and-validation.md) | Structured references, data integrity | 3h |
| 7 | [PivotTables & PivotCharts](course/07-pivottables.md) | Aggregation, grouping, calculated fields | 4h |
| 8 | [Power Query & the M Language](course/08-power-query.md) | Repeatable ETL inside Excel | 6h |
| 9 | [Power Pivot & DAX](course/09-power-pivot-dax.md) | Data models, relationships, measures | 6h |
| 10 | [Charts & Dashboard Design](course/10-charts-and-dashboards.md) | Visual encoding, layout, interactivity | 5h |
| 11 | [Automation: Macros, VBA & Office Scripts](course/11-automation.md) | Recording, editing, writing from scratch | 5h |
| 12 | [Capstone Projects](course/12-capstone.md) | Three end-to-end builds | 10h |

**Total: ~60 hours** of deliberate practice.

## Reference material

- [Formula cheat sheet](resources/formula-cheatsheet.md) — every function taught, one page
- [Keyboard shortcuts](resources/shortcuts.md) — the ~70 that actually pay for themselves
- [Glossary](resources/glossary.md) — precise definitions of the terms used throughout
- [Troubleshooting guide](resources/troubleshooting.md) — every error value and what causes it

## Practice data

`datasets/` holds the CSV files used by the exercises. Regenerate or reshape them with:

```bash
python3 datasets/generate_datasets.py
```

The generator is seeded, so everyone gets identical data and the published solutions
match your numbers exactly.

| File | Rows | Used by |
|---|---|---|
| `sales_transactions.csv` | 5,000 | Modules 3, 4, 7, 8, 9, 10 |
| `products.csv` | 120 | Modules 4, 8, 9 |
| `employees.csv` | 250 | Modules 3, 4, 6, 7 |
| `messy_contacts.csv` | 417 | Module 5 |
| `daily_targets.csv` | 1,096 | Modules 9, 10 |
| `regions.csv` | 8 | Modules 8, 9 |

## How to actually learn this

Read a lesson, then immediately rebuild the worked example yourself from a blank
sheet. Do not copy and paste formulas — type them, so the argument order goes into
your fingers. Do the exercises before looking at solutions, and when you're wrong,
find out *why* before moving on. Two focused hours beat eight distracted ones.

## Licence

Course content is provided for individual study and internal team training.
