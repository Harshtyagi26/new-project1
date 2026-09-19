# Solutions — Module 5: Data Cleaning & Transformation

Exact counts depend on the seeded generator; regenerate with
`python3 datasets/generate_datasets.py` before comparing. The file has 417 rows
(400 base contacts plus seeded duplicates).

**5.1 — Diagnostic profile**

Build it once and keep it; run it again after cleaning as your regression test.

```
Rows:                =COUNTA(A2:A500)
Blank phones:        =COUNTBLANK(D2:D500)
Non-numeric spend:   =SUMPRODUCT(--NOT(ISNUMBER(F2:F500)))     → all of them
Names needing TRIM:  =SUMPRODUCT(--(B2:B500<>TRIM(B2:B500)))
Names with CHAR(160):=SUMPRODUCT(--ISNUMBER(SEARCH(CHAR(160),B2:B500)))
Names with a comma:  =SUMPRODUCT(--ISNUMBER(SEARCH(",",B2:B500)))
Distinct regions:    =COUNTA(UNIQUE(H2:H500))                  → 8 raw variants,
                                                                only 5 real codes
Duplicate IDs:       =SUMPRODUCT(--(COUNTIF(A2:A500,A2:A500)>1))
```

The point of the block is the *after* run: a cleaning step that does not move
one of these numbers did nothing.

**5.2 — Clean `FullName`**

```
=LET(
  raw,  TRIM(CLEAN(SUBSTITUTE(B2, CHAR(160), " "))),
  ord,  IF(ISNUMBER(SEARCH(",", raw)),
           TRIM(TEXTAFTER(raw,",")) & " " & TRIM(TEXTBEFORE(raw,",")),
           raw),
  PROPER(ord)
)
```

`TRIM` also collapses the internal double spaces, which handles the
`"First  Last"` variant for free.

Then fix `PROPER`'s failures by exception, because there is no rule that gets
`McDonald`, `O'Brien`, `van der Berg` and `III` all right:

```
Exceptions table:   Mcdonald → McDonald
                    O'brien  → O'Brien
                    Van      → van          (only when not the first word)
                    Iii      → III

=IFNA(XLOOKUP(name, Exceptions[Wrong], Exceptions[Right]), name)
```

Applying the exception list *after* `PROPER`, driven by a table a human can
extend, is the honest answer. Any formula claiming to case names correctly for
all inputs is wrong; the right design admits it and makes the exceptions
editable.

**5.3 — Phone normalisation**

Strip the known punctuation rather than trying to filter digits character by
character — it is shorter and it fails loudly on anything unexpected:

```
=LET(
  d, SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(
        D2,"(",""),")",""),"-","")," ",""),".",""),
  d2, IF(LEFT(d,2)="+1", MID(d,3,99), IF(LEFT(d,1)="1", MID(d,2,99), d)),
  IF(D2="", "MISSING", IF(AND(LEN(d2)=10, ISNUMBER(d2*1)), "+1"&d2, "UNPARSEABLE"))
)
```

`"MISSING"` and `"UNPARSEABLE"` must stay distinct: the first is an absent
value, the second is a data-quality defect someone has to look at. Collapsing
them to a blank hides work.

**5.4 — Three date formats, one column**

```
=LET(
  d, TRIM(E2),
  IF(d="", NA(),
    IFERROR(DATEVALUE(d),                                   -- d-mmm-yy and locale-native
      IFERROR(DATE(LEFT(d,4), MID(d,6,2), RIGHT(d,2)),      -- ISO
        IFERROR(DATE(RIGHT(d,4), LEFT(d,2), MID(d,4,2)),    -- US mm/dd/yyyy
          NA()))))
)
```

Count the failures: `=COUNTIF(range, NA())` won't work — use
`=SUMPRODUCT(--ISNA(range))`. The blanks are the expected failures; anything
else is a format you have not handled, and the correct response is to add a
branch rather than to widen the `IFERROR` net.

**Caution:** `DATEVALUE` and the `mm/dd/yyyy` branch are both locale-sensitive.
On a machine set to `dd/mm/yyyy`, `09/19/2026` fails and `03/04/2026` succeeds
*with the wrong meaning* — a silent error. This is the strongest possible
argument for doing date parsing in Power Query with **Change Type using
Locale**, where the assumed locale is explicit and travels with the file.

**5.5 — Currency to number**

```
=IFERROR(
   NUMBERVALUE(TRIM(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(F2,"$",""),",","")," USD",""))),
   NA())
```

`"n/a"` must become `NA()`, not `0`. With 400-odd rows and roughly a quarter
unparseable, mapping them to zero drags the mean down by about 25% — the average
changes from "the average spend of customers we have data for" to "the average
spend if we assume everyone we know nothing about spent nothing". Those are
different claims, and only one of them is defensible.

Report both numbers and the coverage. `AVERAGE` propagates `#N/A` rather than
ignoring it, so use `=AGGREGATE(1, 6, range)` to average over the parseable rows,
and state how many those are: `=SUMPRODUCT(--NOT(ISNA(range)))` out of 417.

**5.6 — Booleans**

```
=LET(
  v, LOWER(TRIM(G2)),
  IFS(OR(v="yes", v="y", v="true",  v="1"), TRUE,
      OR(v="no",  v="n", v="false", v="0"), FALSE,
      TRUE, NA())
)
```

Why unknown must not become `FALSE`: for a marketing opt-in flag, "no recorded
consent" and "explicitly declined" are different legal positions. Treating the
first as the second is merely conservative; treating an unknown as `TRUE` would
be a compliance breach, and treating a missing record as a decline destroys the
evidence that you never asked. Keep the third state and count it.

**5.7 — Duplicates**

Exact duplicate rows — build a full-row key and count:

```
=TEXTJOIN("|", FALSE, A2:H2)
=COUNTIF(KeyCol, Key) > 1
```

Near-duplicates (differ only in `ContactID` and case):

```
Match key: =LOWER(TRIM(SUBSTITUTE(B2," ",""))) & "|" & LOWER(TRIM(C2))
Collisions: =COUNTIF(MatchKeyCol, MatchKey) > 1
```

The generator seeds an exact duplicate every 37th row and an uppercased,
re-IDed near-duplicate every 53rd. On the seeded file that is 417 rows carrying
10 repeated `ContactID`s and 17 name+email key collisions in total — the 10
exact duplicates plus 7 near-duplicates that the `ContactID` check alone would
never have found. That gap between 10 and 17 is the whole reason for a match
key.

Choosing the key is the whole exercise: name+email is defensible; email alone
merges family members sharing an address; name alone merges every John Smith.
State the trade-off you chose and what it would wrongly merge.

**5.8 — The Power Query pipeline**

```m
let
    Source = Csv.Document(File.Contents(DataFolder & "\messy_contacts.csv"),
                          [Delimiter=",", Encoding=65001, QuoteStyle=QuoteStyle.Csv]),
    Headers = Table.PromoteHeaders(Source, [PromoteAllScalars=true]),

    NbspOut = Table.TransformColumns(Headers, {
        {"FullName", each Text.Trim(Text.Clean(
            Text.Replace(_ ?? "", Character.FromNumber(160), " "))), type text}}),

    EmailClean = Table.TransformColumns(NbspOut, {
        {"Email", each Text.Lower(Text.Trim(_ ?? "")), type text}}),

    HasComma = Table.AddColumn(EmailClean, "Reordered", each
        if Text.Contains([FullName], ",")
        then Text.Trim(Text.AfterDelimiter([FullName], ",")) & " " &
             Text.Trim(Text.BeforeDelimiter([FullName], ","))
        else [FullName], type text),

    Spend = Table.AddColumn(HasComma, "SpendNum", each
        try Number.From(Text.Remove([LifetimeSpend], {"$", ",", " ", "U","S","D"}))
        otherwise null, type number),

    OptIn = Table.AddColumn(Spend, "OptedInFlag", each
        let v = Text.Lower(Text.Trim([OptedIn] ?? "")) in
        if List.Contains({"yes","y","true","1"}, v) then true
        else if List.Contains({"no","n","false","0"}, v) then false
        else null, type logical),

    Region = Table.TransformColumns(OptIn, {
        {"Region", each Text.Upper(Text.Trim(_ ?? "")), type text}}),

    Deduped = Table.Distinct(Region, {"Reordered", "Email"}),
    Final = Table.SelectColumns(Deduped,
        {"ContactID","Reordered","Email","Phone","JoinDate","SpendNum",
         "OptedInFlag","Region"})
in
    Final
```

Append dirty rows to the CSV, hit Refresh, and every step re-runs. That is the
deliverable: not a clean sheet but a clean *process*. Note `_ ?? ""` guarding
against nulls — without it, a null cell makes `Text.Trim` throw and the whole
row errors.
