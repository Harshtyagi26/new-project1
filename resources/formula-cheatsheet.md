# Formula Cheat Sheet

Every function taught in this course, with its signature and the thing people
get wrong. `[M365]` marks functions unavailable in Excel 2019 and earlier.

## Logical

```
IF(test, if_true, if_false)
IFS(test1, val1, test2, val2, …, TRUE, default)     no built-in else — end with TRUE
SWITCH(expr, val1, res1, …, default)                exact match only
AND(…) OR(…) XOR(…) NOT(…)                          collapse arrays to one value
IFERROR(value, fallback)                            catches everything, including your bugs
IFNA(value, fallback)                               catches only #N/A — prefer this
```

## Aggregation

```
SUM  AVERAGE  MIN  MAX  COUNT  COUNTA  COUNTBLANK
MEDIAN  MODE.SNGL  STDEV.S  VAR.S
LARGE(range, k)   SMALL(range, k)
RANK.EQ(number, ref, [order])
PERCENTILE.INC(array, k)   QUARTILE.INC(array, quart)

SUMIF(range, criteria, [sum_range])             ← criteria range FIRST
SUMIFS(sum_range, crit_range1, crit1, …)        ← sum range FIRST
COUNTIFS / AVERAGEIFS / MAXIFS / MINIFS         ← same order as SUMIFS

SUBTOTAL(func_num, range)      9 = SUM; +100 ignores manually hidden rows
AGGREGATE(func, options, …)    option 6 = ignore errors
SUMPRODUCT(array1, [array2], …)  row-wise multiply then sum; `--` coerces booleans
```

Criteria are text: `">100"`, `">="&G1`, `"North*"`, `"<>"`. Case-insensitive.

## Lookup & reference

```
XLOOKUP(lookup, lookup_array, return_array, [if_not_found], [match_mode], [search_mode])  [M365]
XMATCH(lookup, array, [match_mode], [search_mode])                                        [M365]
INDEX(array, row_num, [col_num])
MATCH(lookup, array, [match_type])              ← always type the 0
VLOOKUP(lookup, table, col_index, [range])      ← never omit FALSE
HLOOKUP(lookup, table, row_index, [range])
LOOKUP(lookup, vector, [result])                ← the `LOOKUP(2,1/(cond),res)` idiom
OFFSET(ref, rows, cols, [h], [w])               volatile — prefer INDEX
INDIRECT(text)                                  volatile — prefer Tables
CHOOSE(index, val1, …)   ROW()   COLUMN()   ROWS()   COLUMNS()
```

## Dynamic arrays `[M365]`

```
FILTER(array, include, [if_empty])      * = AND, + = OR, same-height conditions
SORT(array, [index], [order], [by_col])
SORTBY(array, by_array1, [order1], …)
UNIQUE(array, [by_col], [exactly_once])
SEQUENCE(rows, [cols], [start], [step])
TAKE / DROP / CHOOSEROWS / CHOOSECOLS
HSTACK / VSTACK / TOCOL / TOROW / WRAPROWS / WRAPCOLS
GROUPBY(row_fields, values, function, …)   PIVOTBY(…)
LET(name1, value1, …, calculation)
LAMBDA(param1, …, calculation)             store in Name Manager
BYROW / BYCOL / MAP / REDUCE / SCAN        iterate a LAMBDA over an array
```

## Text

```
LEFT(t,n)  RIGHT(t,n)  MID(t,start,n)  LEN(t)
FIND(needle, hay, [start])        case-sensitive, no wildcards
SEARCH(needle, hay, [start])      case-insensitive, wildcards
SUBSTITUTE(t, old, new, [nth])    by content
REPLACE(t, start, n, new)         by position
TRIM(t)   CLEAN(t)                TRIM misses CHAR(160)
UPPER / LOWER / PROPER            PROPER mangles real names
TEXT(value, "format")   VALUE(t)   NUMBERVALUE(t, [dec], [group])
CONCAT(…)   TEXTJOIN(delim, ignore_empty, …)
EXACT(a,b)   REPT(t,n)   CHAR(n)   CODE(t)
TEXTBEFORE / TEXTAFTER / TEXTSPLIT                                        [M365]
```

Standard cleanse: `=TRIM(CLEAN(SUBSTITUTE(A2, CHAR(160), " ")))`

## Date & time

```
TODAY()   NOW()                          volatile
DATE(y,m,d)   TIME(h,m,s)
YEAR  MONTH  DAY  HOUR  MINUTE  SECOND
WEEKDAY(date, [type])                    type 2 → Monday = 1
WEEKNUM / ISOWEEKNUM
EOMONTH(start, months)                   EOMONTH(d,-1)+1 = first of month
EDATE(start, months)
DATEDIF(start, end, "y"|"m"|"d"|"ym"|"md"|"yd")     undocumented, works everywhere
NETWORKDAYS.INTL(start, end, [weekend], [holidays])
WORKDAY.INTL(start, days, [weekend], [holidays])
YEARFRAC(start, end, [basis])
DATEVALUE(text)   TIMEVALUE(text)        locale-dependent
```

## Math & rounding

```
ROUND(n,d)        half away from zero
ROUNDUP / ROUNDDOWN
MROUND(n, multiple)   CEILING.MATH   FLOOR.MATH
INT(n)            toward -infinity        TRUNC(n,[d])   toward zero
ABS  SIGN  MOD  QUOTIENT  POWER  SQRT  EXP  LN  LOG
RAND()  RANDBETWEEN(a,b)  RANDARRAY(…)   all volatile
```

`MOD` takes the divisor's sign. `0.1+0.2 <> 0.3` — round before comparing.

## Information

```
ISBLANK  ISTEXT  ISNUMBER  ISERROR  ISERR  ISNA  ISLOGICAL  ISFORMULA  ISREF
TYPE(value)      1 number, 2 text, 4 logical, 16 error, 64 array
N(value)  T(value)  NA()
CELL("format", ref)   INFO(…)                 volatile
```

## DAX quick reference

```dax
SUM / AVERAGE / MIN / MAX / COUNTROWS / DISTINCTCOUNT
DIVIDE(num, den, [alt])                     safe division
CALCULATE(expr, filter1, …)                 the only context modifier
ALL / ALLEXCEPT / ALLSELECTED / REMOVEFILTERS / KEEPFILTERS / VALUES
SUMX / AVERAGEX / MAXX / MINX / COUNTX      row-context iterators
VAR name = expr … RETURN expr               evaluated where defined
IF / SWITCH(TRUE(), cond, res, …) / BLANK() / ISBLANK / HASONEVALUE
TOTALYTD / TOTALQTD / SAMEPERIODLASTYEAR / PREVIOUSMONTH
DATESINPERIOD / DATESBETWEEN / DATEADD / PARALLELPERIOD
RANKX(table, expr) / TOPN(n, table, expr)
RELATED / RELATEDTABLE                      follow a relationship
```

## M (Power Query) quick reference

```m
let Step1 = …, Step2 = … in Step2           case-sensitive!
each [Column]                               _ is the implicit argument
try expr otherwise fallback                 M's IFERROR
null                                        propagates through arithmetic

Text.Trim  Text.Clean  Text.Upper  Text.Proper  Text.Contains  Text.Split
Text.Start  Text.End  Text.Middle  Text.Combine  Text.PadStart  Text.Replace
Number.From  Date.From  Date.Year  Date.StartOfMonth  Date.ToText  Duration.Days
List.Sum  List.Distinct  List.Count  List.Contains  List.Dates  List.Generate
Table.PromoteHeaders  Table.TransformColumnTypes  Table.SelectRows
Table.AddColumn  Table.Group  Table.Distinct  Table.NestedJoin
Table.ExpandTableColumn  Table.Buffer  Table.ColumnNames  Table.TransformColumns
```
