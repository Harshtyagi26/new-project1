import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
const HOUSE = readFileSync(join(dirname(fileURLToPath(import.meta.url)), "../assets/styles/house.css"),"utf8")
  .replace(/\.\.\/fonts\//g, "assets/fonts/");
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "compositions/frames");
mkdirSync(OUT, { recursive: true });

const TICKS = Array.from({ length: 22 }, () => "<i></i>").join("");
const tickwrap = `<div class="tickwrap"><div class="tickline"></div><div class="ticks">${TICKS}</div></div>`;

const star = (c) => `<svg class="star" viewBox="0 0 48 48" aria-hidden="true"><path fill="${c}" d="M24 2.5l6.18 14.02 15.24 1.4-11.5 10.1 3.4 14.93L24 35.2 10.68 42.95l3.4-14.93-11.5-10.1 15.24-1.4z"/></svg>`;

const logo = (light) =>
  `<div class="logo${light ? " light" : ""}">${star("#C1272D")}<div class="bar"></div>` +
  `<div class="txt"><div class="wm">STARSHIELD</div><div class="sub">Smart Paints &amp; Coatings</div></div></div>`;

const ground = (vars, matte) =>
  `<div class="ground-wrap" data-layout-allow-overflow><div class="ground${matte ? " matte" : ""}" style="${vars}">` +
  `<div class="backdrop"></div><div class="haze"></div><div class="floor" data-layout-allow-overflow></div>` +
  `<div class="sheen"></div><div class="horizon"></div><div class="grain"></div></div></div>`;

const ICO = {
  flask: `<svg class="ico" viewBox="0 0 48 48" fill="none" stroke="#E5484D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M19 5v13.2L8.6 36.4A5 5 0 0 0 12.9 44h22.2a5 5 0 0 0 4.3-7.6L29 18.2V5"/><path d="M16 5h16"/><path d="M13.4 31h21.2"/></svg>`,
  layers: `<svg class="ico" viewBox="0 0 48 48" fill="none" stroke="#E5484D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 5L5 15l19 10 19-10z"/><path d="M5 24.5L24 34.5l19-10"/><path d="M5 33.5L24 43.5l19-10"/></svg>`,
  link: `<svg class="ico" viewBox="0 0 48 48" fill="none" stroke="#E5484D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20.5 27.5a7.5 7.5 0 0 0 11.3.8l6-6a7.5 7.5 0 0 0-10.6-10.6l-3.4 3.4"/><path d="M27.5 20.5a7.5 7.5 0 0 0-11.3-.8l-6 6a7.5 7.5 0 0 0 10.6 10.6l3.4-3.4"/></svg>`,
  drop: `<svg class="ico" viewBox="0 0 48 48" fill="none" stroke="#E5484D" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M24 4.5s13 13.8 13 22.3A13 13 0 0 1 11 26.8C11 18.3 24 4.5 24 4.5z"/><path d="M18.2 29.4a6 6 0 0 0 5.8 5.2"/></svg>`,
};

function page({ id, body, js }) {
  const rootId = "hf-" + id + "-root";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>${id}</title>
  </head>
  <body>
    <template>
      <style>
${HOUSE}
        #${rootId} { position: absolute; inset: 0; }
      </style>
      <div id="${rootId}" data-composition-id="${id}" data-width="1920" data-height="1080">
${body}
      </div>
      <script>
        (function () {
          var R = document.getElementById("${rootId}");
          var q = function (s) { return R.querySelector(s); };
          var qa = function (s) { return Array.prototype.slice.call(R.querySelectorAll(s)); };
          var tl = gsap.timeline({ paused: true });
${js}
          window.__timelines["${id}"] = tl;
        })();
      </script>
    </template>
  </body>
</html>
`;
}

/* shared opening moves: ground drift + eyebrow + headline + rule + support + ticks */
const openers = (dur, opts = {}) => {
  const head = opts.headSel || ".hl-line";
  return `
          tl.fromTo(q(".ground-wrap"), { scale: 1 }, { scale: 1.08, duration: ${dur}, ease: "none" }, 0);
          tl.fromTo(q(".stage"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
          tl.fromTo(q(".eyebrow"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
          tl.fromTo(qa("${head}"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.09 }, 0.35);
          tl.fromTo(q(".rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 0.8);
          tl.fromTo(q(".support"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.9);
          tl.fromTo(q(".tickline"), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, 1.25);
          tl.fromTo(qa(".ticks i"), { opacity: 0, y: 10 }, { opacity: 0.55, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.018 }, 1.4);
          tl.fromTo(q(".logo"), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.45);`;
};

/* ---------------- Frame 1 — Hero ---------------- */
writeFileSync(`${OUT}/01-hero.html`, page({
  id: "01-hero",
  body: `        <div class="stage">
          ${ground("--horizon:56%;--bloom-x:66%;--bloom-y:52%;--sheen:.62;--tint:#252120")}
          <div class="scrim"></div>
          ${logo(false)}
          <div class="product" style="height:660px;">
            <img src="assets/cut/pack-flooring.png" alt="Star Epoxy Flooring Part A and Part B" />
            <div class="reflect" data-layout-allow-overflow style="background-image:url('assets/cut/pack-flooring.png');"></div>
          </div>
          <div class="col">
            <div class="eyebrow">Industrial Epoxy Flooring</div>
            <h1 style="margin-top:26px;">
              <span class="hl-line" style="display:block;">Star</span>
              <span class="hl-line" style="display:block;"><span class="hl">Epoxy</span></span>
              <span class="hl-line" style="display:block;">Flooring</span>
            </h1>
            <div class="rule" style="margin-top:34px;"></div>
            <p class="support" style="margin-top:30px;max-width:720px;">A two-component nanotech epoxy system engineered for industrial, commercial and residential floors.</p>
          </div>
          ${tickwrap}
        </div>`,
  js: `${openers(5)}
          tl.fromTo(q(".product"), { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 0.3);`,
}));

/* ---------------- Frame 2 — Why it matters ---------------- */
writeFileSync(`${OUT}/02-problem.html`, page({
  id: "02-problem",
  body: `        <div class="stage">
          ${ground("--horizon:52%;--bloom-x:72%;--bloom-y:46%;", true)}
          <div class="scrim"></div>
          ${logo(false)}
          <div class="col" style="width:1180px;max-width:1180px;">
            <div class="eyebrow">The Problem</div>
            <h2 style="margin-top:26px;">
              <span class="hl-line" style="display:block;">Industrial Floors</span>
              <span class="hl-line" style="display:block;"><span class="hl">Fail</span> From The</span>
              <span class="hl-line" style="display:block;">Surface Down</span>
            </h2>
            <div class="rule" style="margin-top:32px;"></div>
            <p class="support" style="margin-top:28px;max-width:900px;">Oils, acids and solvents degrade the slab, heavy traffic cracks it, and porous surfaces harbour the bacteria that fail a compliance audit.</p>
            <div class="marks" style="margin-top:34px;">
              <div class="mark"><div class="mn">01</div><div class="mt">Chemical corrosion</div></div>
              <div class="mark"><div class="mn">02</div><div class="mt">Heavy load damage</div></div>
              <div class="mark"><div class="mn">03</div><div class="mt">Contamination risk</div></div>
            </div>
          </div>
          ${tickwrap}
        </div>`,
  js: `${openers(5)}
          tl.fromTo(qa(".mark"), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.14 }, 1.5);`,
}));

/* ---------------- Frame 3 — Big stat ---------------- */
writeFileSync(`${OUT}/03-stat.html`, page({
  id: "03-stat",
  body: `        <div class="stage">
          ${ground("--horizon:58%;--bloom-x:60%;--bloom-y:56%;--sheen:.72;--tint:#272220")}
          <div class="scrim"></div>
          ${logo(false)}
          <div class="product" style="height:600px;right:132px;bottom:186px;">
            <img src="assets/cut/pack-topcoat.png" alt="Star Epoxy Shield Top Coat" />
            <div class="reflect" data-layout-allow-overflow style="background-image:url('assets/cut/pack-topcoat.png');"></div>
          </div>
          <div class="col">
            <div class="eyebrow">Tested Performance</div>
            <div class="statrow" style="margin-top:38px;">
              <span class="statnum">82.5</span>
              <span class="statunit">N/mm&sup2;</span>
            </div>
            <div class="statlabel" style="margin-top:30px;">Compressive Strength &mdash; IS 9162-1979 Part 8</div>
            <div class="rule" style="margin-top:28px;"></div>
            <p class="support" style="margin-top:26px;max-width:700px;">With 21 N/mm&sup2; flexural and 19 N/mm&sup2; tensile strength behind it.</p>
          </div>
          ${tickwrap}
        </div>`,
  js: `
          tl.fromTo(q(".ground-wrap"), { scale: 1 }, { scale: 1.08, duration: 5, ease: "none" }, 0);
          tl.fromTo(q(".stage"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
          tl.fromTo(q(".eyebrow"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
          tl.fromTo(q(".statnum"), { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 0.7, ease: "back.out(1.4)" }, 0.35);
          tl.fromTo(q(".statunit"), { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out" }, 0.55);
          tl.fromTo(q(".product"), { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out" }, 0.3);
          tl.fromTo(q(".rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 0.8);
          tl.fromTo(q(".statlabel"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.95);
          tl.fromTo(q(".support"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.1);
          tl.fromTo(q(".tickline"), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, 1.25);
          tl.fromTo(qa(".ticks i"), { opacity: 0, y: 10 }, { opacity: 0.55, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.018 }, 1.4);
          tl.fromTo(q(".logo"), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.45);`,
}));

/* ---------------- Frame 4 — Benefits ---------------- */
const cards = [
  ["flask", "Chemical Resistant", "Acids, alkalis and solvents: resistant across 168 hours of ASTM D 543 immersion."],
  ["layers", "Seamless &amp; Hygienic", "A continuous, joint-free surface that harbours no dirt, bacteria or germs."],
  ["link", "Superior Adhesion", "Low viscosity penetrates deep into concrete, tile, wood, metal and stone."],
  ["drop", "Water &amp; Wear", "0.07% water absorption and Shore D hardness above 80."],
].map(([i, t, d]) => `            <div class="card">${ICO[i]}<div class="body"><div class="t">${t}</div><p class="d">${d}</p></div></div>`).join("\n");

writeFileSync(`${OUT}/04-benefits.html`, page({
  id: "04-benefits",
  body: `        <div class="stage">
          ${ground("--horizon:62%;--bloom-x:50%;--bloom-y:58%;--sheen:.55;--tint:#242120")}
          <div class="scrim even"></div>
          ${logo(false)}
          <div class="col" style="top:188px;transform:none;width:1300px;max-width:1300px;">
            <div class="eyebrow">Why It Holds</div>
            <h2 style="margin-top:22px;font-size:60px;">
              <span class="hl-line" style="display:block;">Engineered To <span class="hl">Resist</span></span>
            </h2>
            <div class="rule" style="margin-top:26px;"></div>
          </div>
          <div class="grid2">
${cards}
          </div>
          ${tickwrap}
        </div>`,
  js: `
          tl.fromTo(q(".ground-wrap"), { scale: 1 }, { scale: 1.08, duration: 7, ease: "none" }, 0);
          tl.fromTo(q(".stage"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
          tl.fromTo(q(".eyebrow"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
          tl.fromTo(qa(".hl-line"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.35);
          tl.fromTo(q(".rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 0.7);
          tl.fromTo(qa(".card"), { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.16 }, 0.9);
          tl.fromTo(qa(".card .ico"), { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.45, ease: "power3.out", stagger: 0.16 }, 1.0);
          tl.fromTo(q(".tickline"), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, 1.3);
          tl.fromTo(qa(".ticks i"), { opacity: 0, y: 10 }, { opacity: 0.55, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.018 }, 1.45);
          tl.fromTo(q(".logo"), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.45);`,
}));

/* ---------------- Frame 5 — Specs ---------------- */
const chips = [
  ["40&ndash;50 <em>sq ft/L</em>", "Coverage @ 250 &micro;m"],
  ["&gt; 80", "Shore D Hardness"],
  ["0.07<em>%</em>", "Water Absorption"],
  ["NIL", "VOC Content &mdash; ASTM D 2369"],
  ["24 <em>months</em>", "Shelf Life"],
  ["&minus;20&deg;…120&deg;<em>C</em>", "Service Temperature &dagger;"],
].map(([v, l]) => `            <div class="chip"><div class="v">${v}</div><div class="l">${l}</div></div>`).join("\n");

writeFileSync(`${OUT}/05-specs.html`, page({
  id: "05-specs",
  body: `        <div class="stage">
          ${ground("--horizon:60%;--bloom-x:78%;--bloom-y:54%;--sheen:.58;--tint:#231f1e")}
          <div class="scrim"></div>
          ${logo(false)}
          <div class="product" style="height:330px;right:92px;bottom:250px;">
            <img src="assets/cut/pack-topcoat.png" alt="Star Epoxy Shield Top Coat" />
          </div>
          <div class="product" style="height:268px;right:250px;bottom:250px;">
            <img src="assets/cut/pack-screed.png" alt="Star Epoxy Shield Screed" />
          </div>
          <div class="product" style="height:238px;right:380px;bottom:250px;">
            <img src="assets/cut/pack-primer.png" alt="Star Epoxy Shield Primer" />
          </div>
          <div class="col" style="top:176px;transform:none;">
            <div class="eyebrow">Verified Specifications</div>
            <h2 style="margin-top:22px;font-size:58px;">
              <span class="hl-line" style="display:block;">The <span class="hl">Numbers</span>,</span>
              <span class="hl-line" style="display:block;">From The Data Sheet</span>
            </h2>
            <div class="rule" style="margin-top:26px;"></div>
          </div>
          <div class="chips">
${chips}
          </div>
          <div class="srcline">Star Epoxy Flooring Technical Data Sheet &middot; IS and ASTM methods. &dagger; Published on the official product page, not in the TDS results table.</div>
          ${tickwrap}
        </div>`,
  js: `
          tl.fromTo(q(".ground-wrap"), { scale: 1 }, { scale: 1.08, duration: 5, ease: "none" }, 0);
          tl.fromTo(q(".stage"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
          tl.fromTo(q(".eyebrow"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
          tl.fromTo(qa(".hl-line"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.09 }, 0.35);
          tl.fromTo(q(".rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 0.7);
          tl.fromTo(qa(".chip"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out", stagger: 0.09 }, 0.85);
          tl.fromTo(qa(".product"), { opacity: 0, x: 36 }, { opacity: 1, x: 0, duration: 0.6, ease: "power3.out", stagger: 0.08 }, 1.2);
          tl.fromTo(q(".srcline"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 2.0);
          tl.fromTo(q(".tickline"), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, 1.3);
          tl.fromTo(qa(".ticks i"), { opacity: 0, y: 10 }, { opacity: 0.55, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.018 }, 1.45);
          tl.fromTo(q(".logo"), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.45);`,
}));

/* ---------------- Frame 6 — Apply ---------------- */
const PLATE = {
  prep: `background:repeating-linear-gradient(116deg,rgba(255,255,255,.14) 0 2px,transparent 2px 11px),repeating-linear-gradient(62deg,rgba(0,0,0,.30) 0 3px,transparent 3px 17px),linear-gradient(168deg,#6f635a 0%,#3d352f 44%,#1c1a18 100%);`,
  mix: `background:repeating-linear-gradient(0deg,rgba(255,255,255,.05) 0 1px,transparent 1px 34px),radial-gradient(88% 74% at 32% 26%,#5c5149 0%,#2e2926 48%,#141312 100%);`,
  apply: `background:linear-gradient(104deg,transparent 18%,rgba(255,248,238,.34) 38%,rgba(255,244,232,.10) 52%,transparent 68%),radial-gradient(92% 76% at 60% 18%,#7d6e61 0%,#38312c 48%,#151414 100%);`,
};
const tiles = [
  ["01", "Prepare", "Abrade to a clean mechanical key. Fill cracks. No water residue on the slab.", PLATE.prep, ""],
  ["02", "Mix 2:1", "Rest 10 minutes after unsealing, then stir Part A and Part B 3&ndash;4 minutes at 300&ndash;400 RPM.", PLATE.mix,
    `<div class="tinpack"><img src="assets/cut/pack-flooring.png" alt="Part A and Part B" /></div>`],
  ["03", "Apply", "Spread with a notched squeegee, roll out the air, second coat perpendicular.", PLATE.apply, ""],
].map(([n, t, d, plate, extra]) =>
  `            <div class="tile"><div class="plate" style="${plate}"></div><div class="gloss"></div>${extra}<div class="shade"></div>` +
  `<div class="n">${n}</div><div class="cap"><div class="ct">${t}</div><p class="cd">${d}</p></div></div>`).join("\n");

const pills = ["Pot life 25 min", "Recoat 2&ndash;3 hrs", "Max 36 hrs between coats", "Cure 24 hrs",
  "Light traffic 24 hrs", "Full traffic 48 hrs", "Chemical spillage 7 days"]
  .map((p) => `            <div class="pill">${p}</div>`).join("\n");

writeFileSync(`${OUT}/06-apply.html`, page({
  id: "06-apply",
  body: `        <div class="stage">
          ${ground("--horizon:64%;--bloom-x:46%;--bloom-y:60%;--sheen:.48;--tint:#221f1e")}
          <div class="scrim even"></div>
          ${logo(false)}
          <div class="col" style="top:168px;transform:none;width:1300px;max-width:1300px;">
            <div class="eyebrow">Method Of Application</div>
            <h2 style="margin-top:22px;font-size:58px;">
              <span class="hl-line" style="display:block;"><span class="hl">Three</span> Steps, By The Sheet</span>
            </h2>
            <div class="rule" style="margin-top:24px;"></div>
          </div>
          <div class="tiles">
${tiles}
          </div>
          <div class="pills">
${pills}
          </div>
          ${tickwrap}
        </div>`,
  js: `
          tl.fromTo(q(".ground-wrap"), { scale: 1 }, { scale: 1.08, duration: 6, ease: "none" }, 0);
          tl.fromTo(q(".stage"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
          tl.fromTo(q(".eyebrow"), { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.2);
          tl.fromTo(qa(".hl-line"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.35);
          tl.fromTo(q(".rule"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 0.7);
          tl.fromTo(qa(".tile"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.55, ease: "power3.out", stagger: 0.16 }, 0.9);
          tl.fromTo(qa(".pill"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.08 }, 2.1);
          tl.fromTo(q(".tickline"), { scaleX: 0, opacity: 0 }, { scaleX: 1, opacity: 1, duration: 0.7, ease: "power2.out" }, 1.3);
          tl.fromTo(qa(".ticks i"), { opacity: 0, y: 10 }, { opacity: 0.55, y: 0, duration: 0.4, ease: "power3.out", stagger: 0.018 }, 1.45);
          tl.fromTo(q(".logo"), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.45);`,
}));

/* ---------------- Frame 7 — End card ---------------- */
writeFileSync(`${OUT}/07-endcard.html`, page({
  id: "07-endcard",
  body: `        <div class="endcard">
          <svg class="rings" viewBox="0 0 680 680" aria-hidden="true" data-layout-allow-overflow>
            <circle cx="340" cy="340" r="170" /><circle cx="340" cy="340" r="255" /><circle cx="340" cy="340" r="340" />
          </svg>
          ${logo(true)}
          <div class="endinner">
            <div class="dots"><i></i><i></i><i></i></div>
            <h1 class="endname">Star Epoxy Flooring</h1>
            <div class="endtag">Bond &middot; Shield &middot; Endure</div>
            <div class="endbox">High-Performance Nanotech Epoxy Floor Coating</div>
            <div class="enddiv"></div>
            <div class="endcap">Manufacturing &middot; Pharma &middot; Warehousing &middot; Food Processing &middot; Aviation</div>
          </div>
        </div>`,
  js: `
          tl.fromTo(q(".endcard"), { opacity: 0 }, { opacity: 1, duration: 0.45, ease: "power2.out" }, 0);
          tl.fromTo(qa(".rings circle"), { opacity: 0, scale: 0.92, transformOrigin: "340px 340px" }, { opacity: 1, scale: 1, duration: 0.8, ease: "power3.out", stagger: 0.1 }, 0.1);
          tl.fromTo(q(".logo"), { opacity: 0, y: -10 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 0.3);
          tl.fromTo(q(".dots"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" }, 0.3);
          tl.fromTo(q(".endname"), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.6, ease: "power3.out" }, 0.6);
          tl.fromTo(q(".endtag"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.0);
          tl.fromTo(q(".endbox"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 1.4);
          tl.fromTo(q(".enddiv"), { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: "power2.out" }, 1.8);
          tl.fromTo(q(".endcap"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" }, 2.1);`,
}));

console.log("7 frames written to", OUT);
