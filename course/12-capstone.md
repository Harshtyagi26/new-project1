# Module 12 — Capstone Projects

> **Goal:** build three complete, defensible deliverables end to end. This is
> where the course becomes a portfolio.
>
> **Time:** ~10 hours · **Prerequisites:** Modules 1–11

Each project has a brief, a specification, a rubric, and a set of stretch goals.
Build them the way you would for a real stakeholder: the workbook has to survive
being opened by someone else, on a different machine, next quarter.

---

## Capstone 1 — Sales Performance Dashboard

**Brief.** The VP of Sales wants one screen showing how each region is
performing against target, where revenue is coming from, and what changed since
last year. It must refresh from the source files with one click and must be
usable without training.

**Data.** `sales_transactions.csv`, `products.csv`, `regions.csv`,
`daily_targets.csv`.

**Specification**

1. **Ingestion (Module 8).** Power Query, staging/transform/load tiers, all
   queries connection-only, loaded to the Data Model. Types set explicitly.
   A `DataFolder` parameter so the workbook runs on any machine.
2. **Model (Module 9).** Star schema: `fct_Sales`, `dim_Product`, `dim_Region`,
   `dim_Date` (generated, marked as date table), `dim_Targets`. Keys hidden.
3. **Measures (Module 9).** At minimum: Total Revenue, Gross Profit, Margin %,
   Order Count, AOV, Active Reps (distinct), Target, Attainment %, Revenue PY,
   YoY Growth %, Rolling 3M, % of Super-Region.
4. **Dashboard (Module 10).** One visible sheet. KPI row of four tiles, each
   with a comparison. A revenue-vs-target trend line. Revenue by region, sorted.
   Top 10 SKUs. A region slicer and a date timeline driving everything.
5. **Robustness.** Graceful empty state. No `#N/A` or `#REF!` in any slicer
   combination. A visible "Data as of" stamp and a one-line refresh instruction.

**Rubric (100 points)**

| Area | Points | What earns them |
|---|---|---|
| Data pipeline | 20 | Refreshes cleanly from raw CSVs; tiered; parameterised; types explicit |
| Data model | 20 | Correct star schema; date table marked; no ambiguity; keys hidden |
| Measures | 20 | Correct under every slicer combination; `DIVIDE` used; PY/YoY guarded for the first period |
| Dashboard | 20 | Right chart per question; KPI comparisons present; one slicer set drives all; legible in greyscale |
| Robustness & docs | 20 | Empty state handled; refresh documented; opens clean on another machine |

**Stretch.** Add a what-if parameter for a target uplift %, and a small-multiple
view of the eight regions' trends on a shared axis.

---

## Capstone 2 — HR Analytics Workbook

**Brief.** The People team wants to understand compensation equity and
attrition risk. The output goes to a committee, so every number must be
traceable to its formula, and the salary detail must be protected.

**Data.** `employees.csv` (plus a `TerminationDate` column you will add — see
below).

**Setup.** Extend the dataset: add `TerminationDate`, populated for roughly 15%
of employees with dates spread across the last three years. Do it in Power
Query with a deterministic rule (for example, terminate employees whose
`EmployeeID` ends in 3 or 7, at `HireDate` + a number of days derived from the
ID) so your results are reproducible and reviewable.

**Specification**

1. **Cleaning (Module 5).** Standardise names and emails; validate every
   `RegionCode` against `regions.csv` with an anti-join; flag any orphan.
2. **Derived attributes (Modules 3, 6).** Tenure in years, tenure band, total
   compensation, compa-ratio against the department band midpoint, an
   `IsActive` flag, and a manager span-of-control count.
3. **Analysis.**
   - Headcount, average and **median** total comp by department and level.
     State in a note why the median is the honest statistic here.
   - Pay dispersion within each department-level cell: min, max, P25, P75, and
     the ratio of P90 to P10.
   - Annualised attrition by department and by tenure band, with the formula for
     your denominator stated explicitly (average headcount, not starting
     headcount).
   - A correlation between `LastReviewScore` and total comp, with a scatter and
     a written caveat about what it does and does not show.
4. **Presentation (Modules 6, 10).** A summary sheet with a clear layout, a
   conditional-formatting heat map of compa-ratio by department and level, and
   a department selector.
5. **Governance (Module 6.4).** Salary detail on a protected, hidden sheet;
   the summary sheet unprotected only where input is intended; a documented
   statement of what the protection does and does not guarantee.

**Rubric (100 points)**

| Area | Points | What earns them |
|---|---|---|
| Data quality | 20 | Cleaning is repeatable; orphans found and handled; derivation rule documented |
| Correct statistics | 25 | Median vs mean justified; percentiles correct; attrition denominator defensible |
| Analysis depth | 20 | Dispersion and attrition broken out meaningfully; findings stated, not just tabulated |
| Presentation | 20 | Readable summary; heat map informative; works in greyscale |
| Governance | 15 | Protection applied correctly and its limits stated honestly |

**Stretch.** Add a flight-risk score combining tenure band, time since last
promotion (derive it), review score and compa-ratio — and then write a paragraph
on why you would be careful about how such a score is used.

---

## Capstone 3 — Automated Monthly Reporting Pack

**Brief.** Finance produces the same twelve-page pack every month by hand. It
takes two days. Automate it so it takes ten minutes, and so that someone other
than you can run it.

**Data.** Split `sales_transactions.csv` into monthly files in a `monthly/`
folder. A small script or a Power Query Group-By + export will do it; document
the method.

**Specification**

1. **Consolidation (Module 8).** A **From Folder** query that picks up every
   file in `monthly/` automatically. Dropping a thirteenth file in must require
   no query edits. Prove it.
2. **Validation layer.** A checks sheet that runs before the pack is considered
   valid: row counts per file, sum reconciliation against a control total,
   duplicate order IDs, unmapped SKUs and regions, null dates, and negative
   quantities. Each check returns PASS/FAIL with the failing rows reachable.
   **The pack must refuse to be considered final if any check fails** — make
   that visible at the top of the summary.
3. **Report pages (Modules 7, 9, 10).** Executive summary; revenue by region;
   revenue by category; channel mix; top and bottom 10 SKUs; month-over-month
   bridge (waterfall); attainment vs target; a data-quality page.
4. **Automation (Module 11).** A single entry point — `RefreshPack` — that
   refreshes all queries, waits for completion, runs the validation checks,
   updates the "Data as of" stamp, and reports success or the first failure.
   Implement it in **both** VBA and Office Scripts, and write a short comparison
   of the two experiences.
5. **Handover.** A README sheet inside the workbook: what it does, what it needs,
   how to run it, what to do when each check fails, and who owns it.

**Rubric (100 points)**

| Area | Points | What earns them |
|---|---|---|
| Consolidation | 20 | New files picked up with zero edits; demonstrated, not claimed |
| Validation | 25 | Checks are meaningful, failures are actionable, final status is blocked on them |
| Report pages | 20 | Each page answers a question; charts chosen correctly |
| Automation | 20 | One entry point; idempotent; fails loudly and leaves Excel in a sane state |
| Handover | 15 | A competent colleague could run and fix it without you |

**Stretch.** Add a Power Automate flow that runs the Office Script on the first
working day of the month and emails the pack as a PDF to a distribution list.

---

## How to present a finished capstone

Whichever you build, deliver it the way a professional would:

1. **The workbook**, opening on the summary or dashboard sheet with the cursor
   in A1 and everything refreshed.
2. **A one-page written summary**: what question it answers, where the data
   comes from, what you assumed, what you found, and — the part people skip —
   what the analysis *cannot* tell you.
3. **A refresh runbook**: the steps, the expected duration, and the failure modes.
4. **A known-limitations list.** Every model has them. Stating them is what
   distinguishes an analyst from a spreadsheet operator.

---

## Self-assessment

You have completed this course when you can, without looking anything up:

- [ ] Explain why a number displays as 4 but sums as 3.5
- [ ] Anchor a formula correctly for a two-dimensional fill, first time
- [ ] Choose between `SUMIFS`, `SUMPRODUCT`, `FILTER` and a measure, and say why
- [ ] Write `INDEX`/`MATCH` and `XLOOKUP` for the same problem and state the trade-off
- [ ] Clean a file *once* such that next month's file needs no work
- [ ] Build a star schema and say what breaks without a marked date table
- [ ] Write a measure that is correct on both a row and a grand total
- [ ] Pick the right chart in one sentence, and defend removing the legend
- [ ] Know when the answer is "this should not be a macro"
- [ ] Hand a workbook to a colleague and have them run it without calling you

← [Back to the course index](../README.md)
