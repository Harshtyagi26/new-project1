#!/usr/bin/env python3
"""Generate the seeded practice datasets used throughout the Excel Mastery course.

Everything is deterministic (seed 20260919), so the numbers in the published
solutions match what you get locally. Run from anywhere:

    python3 datasets/generate_datasets.py
"""

import csv
import datetime as dt
import os
import random

SEED = 20260919
HERE = os.path.dirname(os.path.abspath(__file__))

REGIONS = [
    ("NA-E", "North America East", "Americas", "Dana Whitfield", 0.24),
    ("NA-W", "North America West", "Americas", "Priya Raman", 0.21),
    ("LATAM", "Latin America", "Americas", "Mateo Ferreira", 0.09),
    ("UKI", "UK & Ireland", "EMEA", "Owen Blackwood", 0.13),
    ("DACH", "Germany Austria Switzerland", "EMEA", "Lena Brandt", 0.11),
    ("NORDIC", "Nordics", "EMEA", "Sofia Lindqvist", 0.06),
    ("APAC-N", "Asia Pacific North", "APAC", "Kenji Morita", 0.10),
    ("APAC-S", "Asia Pacific South", "APAC", "Aarav Deshmukh", 0.06),
]

CATEGORIES = {
    "Laptops": (899, 2499, 0.31),
    "Monitors": (189, 899, 0.34),
    "Peripherals": (19, 249, 0.46),
    "Networking": (79, 1299, 0.38),
    "Storage": (49, 799, 0.29),
    "Accessories": (7, 99, 0.55),
}

CHANNELS = [("Direct", 0.34), ("Partner", 0.28), ("Online", 0.30), ("Retail", 0.08)]
SEGMENTS = [("Enterprise", 0.22), ("Mid-Market", 0.31), ("SMB", 0.34), ("Consumer", 0.13)]

FIRST = """Ada Amara Aria Bao Bianca Caleb Chen Daniela Darius Elena Emeka Fatima
Felix Greta Hana Hugo Ines Ivan Jonas Julia Kwame Lara Liam Lucia Malik Mei Nadia
Nikolai Olga Omar Paulo Petra Rania Ravi Rosa Samir Sana Tariq Thea Tomas Uma Viktor
Wei Yara Yusuf Zara Zoe Adaeze Bruno Camila""".split()

LAST = """Abara Alvarez Andersen Bakker Bennett Carvalho Chen Costa Dahl Delgado
Eriksen Fontaine Garcia Haddad Hoffmann Ibrahim Iversen Jensen Kaur Khan Kowalski
Laurent Lindqvist Marchetti Mbeki Moreau Nakamura Novak Okafor Oyelaran Petrov
Quintero Rossi Sandoval Singh Sorensen Tanaka Toure Vargas Vogel Wang Weber
Yilmaz Zhang Zimmerman""".split()

DEPARTMENTS = [
    ("Sales", ["Account Executive", "Sales Engineer", "Sales Manager", "SDR"]),
    ("Engineering", ["Software Engineer", "QA Engineer", "Engineering Manager", "SRE"]),
    ("Marketing", ["Content Strategist", "Demand Gen Manager", "Brand Designer"]),
    ("Finance", ["Financial Analyst", "Controller", "AP Specialist"]),
    ("Operations", ["Operations Analyst", "Logistics Coordinator", "Ops Manager"]),
    ("Support", ["Support Specialist", "Support Lead", "Technical Account Manager"]),
    ("People", ["Recruiter", "HR Business Partner", "People Ops Coordinator"]),
]

SALARY_BAND = {
    "Sales": (58000, 165000), "Engineering": (82000, 215000),
    "Marketing": (54000, 142000), "Finance": (61000, 158000),
    "Operations": (48000, 126000), "Support": (42000, 108000),
    "People": (52000, 134000),
}


def weighted(rng, pairs):
    return rng.choices([p[0] for p in pairs], weights=[p[1] for p in pairs])[0]


def write(name, header, rows):
    path = os.path.join(HERE, name)
    with open(path, "w", newline="", encoding="utf-8") as fh:
        w = csv.writer(fh)
        w.writerow(header)
        w.writerows(rows)
    print(f"  {name:<28} {len(rows):>6,} rows")


def gen_regions():
    write(
        "regions.csv",
        ["RegionCode", "RegionName", "SuperRegion", "RegionalDirector", "QuotaShare"],
        [[c, n, s, d, q] for c, n, s, d, q in REGIONS],
    )


def gen_products(rng):
    rows = []
    adjectives = ["Pro", "Air", "Max", "Lite", "Ultra", "Core", "Edge", "Prime"]
    series = ["X", "V", "Z", "T", "N"]
    pid = 1000
    for category, (lo, hi, margin) in CATEGORIES.items():
        for _ in range(20):
            pid += 1
            name = f"{category[:-1] if category.endswith('s') else category} " \
                   f"{rng.choice(series)}{rng.randrange(100, 990)} {rng.choice(adjectives)}"
            cost = round(rng.uniform(lo, hi), 2)
            price = round(cost / (1 - margin + rng.uniform(-0.05, 0.05)), 2)
            rows.append([
                f"SKU-{pid}", name, category,
                rng.choice(["Aster", "Boreal", "Cygnus", "Delta Works", "Everline"]),
                cost, price,
                rng.choice(["Active", "Active", "Active", "End of Life", "Preorder"]),
                (dt.date(2021, 1, 1) + dt.timedelta(days=rng.randrange(0, 1500))).isoformat(),
            ])
    write("products.csv",
          ["SKU", "ProductName", "Category", "Brand", "UnitCost", "ListPrice",
           "Status", "LaunchDate"], rows)
    return rows


def gen_sales(rng, products):
    start = dt.date(2023, 1, 1)
    rows = []
    reps = [f"{rng.choice(FIRST)} {rng.choice(LAST)}" for _ in range(46)]
    for i in range(1, 5001):
        day = start + dt.timedelta(days=rng.randrange(0, 1095))
        # Seasonality: Q4 lift, weekend dip.
        if day.month in (11, 12) and rng.random() < 0.35:
            day = day.replace(day=min(day.day, 28))
        product = rng.choice(products)
        sku, _, category, _, cost, price, status, _ = product
        qty = max(1, int(rng.lognormvariate(1.1, 0.8)))
        discount = rng.choice([0, 0, 0, 0.05, 0.05, 0.1, 0.15, 0.2, 0.25])
        region = weighted(rng, [(r[0], r[4]) for r in REGIONS])
        rows.append([
            f"ORD-{100000 + i}", day.isoformat(), sku, category, region,
            weighted(rng, CHANNELS), weighted(rng, SEGMENTS), rng.choice(reps),
            qty, price, discount,
            round(qty * price * (1 - discount), 2),
            round(qty * cost, 2),
            rng.choice(["Shipped", "Shipped", "Shipped", "Shipped", "Returned", "Pending"]),
        ])
    rows.sort(key=lambda r: r[1])
    write("sales_transactions.csv",
          ["OrderID", "OrderDate", "SKU", "Category", "RegionCode", "Channel",
           "Segment", "SalesRep", "Quantity", "UnitPrice", "Discount", "NetRevenue",
           "COGS", "OrderStatus"], rows)


def gen_employees(rng):
    rows = []
    for i in range(1, 251):
        dept, titles = rng.choice(DEPARTMENTS)
        lo, hi = SALARY_BAND[dept]
        hire = dt.date(2014, 1, 1) + dt.timedelta(days=rng.randrange(0, 4200))
        first, last = rng.choice(FIRST), rng.choice(LAST)
        level = rng.choices([1, 2, 3, 4, 5], weights=[0.28, 0.3, 0.22, 0.14, 0.06])[0]
        salary = round(lo + (hi - lo) * (level - 1) / 4 * rng.uniform(0.88, 1.12), -2)
        rows.append([
            f"EMP-{2000 + i}", first, last,
            f"{first.lower()}.{last.lower()}@northwind-analytics.example",
            dept, rng.choice(titles), f"L{level}",
            rng.choice([r[0] for r in REGIONS]),
            hire.isoformat(), int(salary),
            round(rng.uniform(0, 0.25), 3),
            rng.choice(["Onsite", "Hybrid", "Remote", "Hybrid"]),
            rng.choice([f"EMP-{2000 + rng.randrange(1, 40)}", ""]),
            round(rng.uniform(2.1, 5.0), 1),
        ])
    write("employees.csv",
          ["EmployeeID", "FirstName", "LastName", "Email", "Department", "JobTitle",
           "Level", "RegionCode", "HireDate", "AnnualSalary", "BonusPct",
           "WorkMode", "ManagerID", "LastReviewScore"], rows)


def gen_messy_contacts(rng):
    """Deliberately dirty: the Module 5 cleaning lab depends on every defect here."""
    rows = []
    domains = ["gmail.com", "Outlook.COM", "yahoo.co.uk", "corp.example", "proton.me"]
    for i in range(1, 401):
        first, last = rng.choice(FIRST), rng.choice(LAST)
        name = rng.choice([
            f"{first} {last}", f"{last}, {first}", f"  {first.upper()} {last.upper()} ",
            f"{first}  {last}", f"{first} {last} ",
        ])
        phone = rng.choice([
            f"({rng.randrange(200,999)}) {rng.randrange(200,999)}-{rng.randrange(1000,9999)}",
            f"{rng.randrange(200,999)}.{rng.randrange(200,999)}.{rng.randrange(1000,9999)}",
            f"+1-{rng.randrange(200,999)}-{rng.randrange(200,999)}-{rng.randrange(1000,9999)}",
            f"{rng.randrange(2000000000,9999999999)}",
            "",
        ])
        joined = rng.choice([
            (dt.date(2022, 1, 1) + dt.timedelta(days=rng.randrange(0, 1300))).isoformat(),
            (dt.date(2022, 1, 1) + dt.timedelta(days=rng.randrange(0, 1300))).strftime("%m/%d/%Y"),
            (dt.date(2022, 1, 1) + dt.timedelta(days=rng.randrange(0, 1300))).strftime("%d-%b-%y"),
            "",
        ])
        spend = rng.choice([
            f"${rng.randrange(0, 50000):,}.{rng.randrange(0,99):02d}",
            f"{rng.uniform(0, 50000):.2f}",
            f"{rng.randrange(0, 50000)} USD",
            "n/a",
        ])
        rows.append([
            f"C{i:04d}", name,
            f"{first}.{last}{rng.randrange(1,99)}@{rng.choice(domains)}",
            phone, joined, spend,
            rng.choice(["yes", "Yes", "Y", "no", "No", "N", "TRUE", "FALSE", ""]),
            rng.choice(["NA-E", "na-e", " NA-W", "UKI", "uki", "APAC-N", "DACH", "?"]),
        ])
        # Seed exact and near-duplicates for the dedupe exercise.
        if i % 37 == 0:
            rows.append(list(rows[-1]))
        if i % 53 == 0:
            dup = list(rows[-1])
            dup[0] = f"C{i:04d}X"
            dup[1] = dup[1].upper()
            rows.append(dup)
    write("messy_contacts.csv",
          ["ContactID", "FullName", "Email", "Phone", "JoinDate", "LifetimeSpend",
           "OptedIn", "Region"], rows)


def gen_targets(rng):
    rows = []
    day = dt.date(2023, 1, 1)
    while day < dt.date(2026, 1, 1):
        base = 42000 * (1 + 0.0004 * (day - dt.date(2023, 1, 1)).days)
        if day.month in (11, 12):
            base *= 1.28
        if day.weekday() >= 5:
            base *= 0.45
        rows.append([day.isoformat(), day.year, f"Q{(day.month - 1) // 3 + 1}",
                     day.strftime("%b"), round(base * rng.uniform(0.94, 1.06), 2)])
        day += dt.timedelta(days=1)
    write("daily_targets.csv",
          ["Date", "Year", "Quarter", "MonthName", "RevenueTarget"], rows)


def main():
    rng = random.Random(SEED)
    print("Generating course datasets…")
    gen_regions()
    products = gen_products(rng)
    gen_sales(rng, products)
    gen_employees(rng)
    gen_messy_contacts(rng)
    gen_targets(rng)
    print("Done. Open them in Excel with Data > From Text/CSV so types are set on import.")


if __name__ == "__main__":
    main()
