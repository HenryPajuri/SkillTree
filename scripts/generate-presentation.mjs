/*
 * SkillTree exam presentation generator.
 *
 * Run with: node scripts/generate-presentation.mjs
 * Outputs:  SkillTree-eksam.pptx in the project root.
 *
 * Estonian-language slides matching the format the previous students used
 * (Rifts of Terra, Reisimaailm, GO BAR): title → idea → target audience →
 * UVP → process (colors, fonts, components, tech) → reflection → thanks.
 */

import pptxgen from "pptxgenjs";
import sharp from "sharp";

// Brand palette (mirrors src/index.css)
const C = {
  cream: "FAF6F0",
  parchment: "F0E8DC",
  forest: "2D4A3E",
  forestDark: "1F3329",
  amber: "C8956C",
  bark: "5C4A3A",
  stone: "9B9585",
  ink: "1A1A18",
  blossom: "E8B5C0",
  sage: "8BA692",
};

const FONT_TITLE = "Playfair Display";
const FONT_BODY = "DM Sans";

const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE"; // 13.33 × 7.5 inches
pres.title = "SkillTree";
pres.author = "Henry Pajuri";

// ---------- Brand mark v2 (SVG, embedded as data URI) ----------
// Same SVG used by the live site (BrandMark in landing.tsx / auth-screens.tsx).
const BRAND_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 48">
  <defs>
    <linearGradient id="tk" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3D2F24"/>
      <stop offset="55%" stop-color="#5C4A3A"/>
      <stop offset="100%" stop-color="#7A6856"/>
    </linearGradient>
  </defs>
  <path d="M 17.4 47 L 18.4 32 Q 18.8 24 19.4 18 L 20.6 18 Q 21.2 24 21.6 32 L 22.6 47 Z" fill="url(#tk)"/>
  <path d="M 19.5 28 Q 19.8 35 19.6 42" stroke="#3D2F24" stroke-width="0.5" fill="none" opacity="0.6"/>
  <path d="M 20 22 Q 14 19 9.5 17.5" stroke="#5C4A3A" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <path d="M 20 22 Q 26 19 30.5 17.5" stroke="#5C4A3A" stroke-width="1.7" fill="none" stroke-linecap="round"/>
  <path d="M 20 18 Q 20 13 20 9" stroke="#5C4A3A" stroke-width="1.4" fill="none" stroke-linecap="round"/>
  <path d="M 20 3 C 30 3 37 9 37 15 C 37 20 33 23 28 23 C 30 25 27 28 22 27 C 21 27 20 27 19 27.5 C 14 28 11 25 13 23 C 8 23 3 20 3 15 C 3 9 10 3 20 3 Z" fill="#5B8472"/>
  <path d="M 9 19 C 12 24 17 26 20 25 C 23 26 28 24 31 19 C 27 22 22 22 20 21 C 18 22 13 22 9 19 Z" fill="#3F6353" opacity="0.45"/>
  <ellipse cx="17" cy="8" rx="7" ry="3.5" fill="#A8C7B5" opacity="0.7"/>
  <ellipse cx="26" cy="12" rx="4" ry="2.5" fill="#A8C7B5" opacity="0.55"/>
  <path d="M 8.5 12 Q 11 13 11 16 Q 9 17 7.5 15.5 Q 7 13.5 8.5 12 Z" fill="#3F6353" opacity="0.7"/>
  <path d="M 11 15 Q 13 16 13.5 19 Q 11.5 19.5 10 18 Q 9.5 16 11 15 Z" fill="#3F6353" opacity="0.6"/>
  <path d="M 31 11 Q 33.5 12 33.5 15 Q 31.5 16 30 14.5 Q 29.5 12 31 11 Z" fill="#3F6353" opacity="0.65"/>
  <path d="M 28 17 Q 30 18 30 21 Q 28 21.5 26.5 20 Q 26 18 28 17 Z" fill="#3F6353" opacity="0.55"/>
  <path d="M 15 22 Q 17 23 17 25 Q 15 25.5 14 24 Q 13.5 22.5 15 22 Z" fill="#3F6353" opacity="0.5"/>
  <path d="M 22 24 Q 24 24.5 24.5 26 Q 23 27 21.5 26 Q 21 24.5 22 24 Z" fill="#3F6353" opacity="0.55"/>
  <g transform="translate(25 9)">
    <ellipse cx="0" cy="-2.3" rx="1.4" ry="1.7" fill="#E8B5C0"/>
    <ellipse cx="2.2" cy="-0.7" rx="1.4" ry="1.7" transform="rotate(72)" fill="#E8B5C0"/>
    <ellipse cx="1.4" cy="1.9" rx="1.4" ry="1.7" transform="rotate(144)" fill="#E8B5C0"/>
    <ellipse cx="-1.4" cy="1.9" rx="1.4" ry="1.7" transform="rotate(216)" fill="#E8B5C0"/>
    <ellipse cx="-2.2" cy="-0.7" rx="1.4" ry="1.7" transform="rotate(288)" fill="#E8B5C0"/>
    <circle cx="0" cy="0" r="0.9" fill="#C97A8B"/>
    <circle cx="0" cy="0" r="0.4" fill="#F3DCA7"/>
  </g>
  <g transform="translate(11 18)">
    <ellipse cx="0" cy="-1.6" rx="1" ry="1.2" fill="#E8B5C0"/>
    <ellipse cx="1.5" cy="-0.5" rx="1" ry="1.2" transform="rotate(72)" fill="#E8B5C0"/>
    <ellipse cx="0.95" cy="1.3" rx="1" ry="1.2" transform="rotate(144)" fill="#E8B5C0"/>
    <ellipse cx="-0.95" cy="1.3" rx="1" ry="1.2" transform="rotate(216)" fill="#E8B5C0"/>
    <ellipse cx="-1.5" cy="-0.5" rx="1" ry="1.2" transform="rotate(288)" fill="#E8B5C0"/>
    <circle cx="0" cy="0" r="0.6" fill="#C97A8B"/>
  </g>
  <circle cx="32" cy="20" r="1.2" fill="#E8B5C0"/>
  <circle cx="32" cy="20" r="0.5" fill="#C97A8B"/>
</svg>`;
// Rasterize SVG to PNG so Google Slides / Keynote / older PowerPoint can
// render it. SVG-as-data-URI works in modern PowerPoint but breaks in
// Google Slides ("Image could not be loaded").
const BRAND_PNG = await sharp(Buffer.from(BRAND_SVG))
  .resize({ width: 800 })
  .png()
  .toBuffer();
const BRAND_DATA_URL = "data:image/png;base64," + BRAND_PNG.toString("base64");

// ---------- Slide chrome (called per slide) ----------

function addChrome(slide, opts = {}) {
  // Cream background
  slide.background = { color: C.cream };
  // Subtle dot grid feel via a faint top-left ornament
  // (kept minimal — the slide content is the focus)
  // Forest accent stripe at the top
  slide.addShape("rect", {
    x: 0, y: 0, w: 13.33, h: 0.08,
    fill: { color: C.forest }, line: { type: "none" },
  });
  // Tiny brand mark + name in bottom-left
  slide.addShape("ellipse", {
    x: 0.4, y: 7.05, w: 0.18, h: 0.18,
    fill: { color: C.forest }, line: { type: "none" },
  });
  slide.addText("SkillTree", {
    x: 0.65, y: 6.98, w: 2.0, h: 0.32,
    fontFace: FONT_TITLE, fontSize: 12, color: C.bark, bold: true,
  });
  // Slide number / total in bottom-right
  if (opts.pageNum) {
    slide.addText(`${opts.pageNum} / ${opts.pageTotal}`, {
      x: 12.2, y: 6.98, w: 0.9, h: 0.32,
      fontFace: FONT_BODY, fontSize: 10, color: C.stone, align: "right",
    });
  }
}

const TOTAL = 11;
let pageNum = 0;
function newSlide() {
  pageNum++;
  const slide = pres.addSlide();
  addChrome(slide, { pageNum, pageTotal: TOTAL });
  return slide;
}

function title(slide, text, y = 0.7) {
  slide.addText(text, {
    x: 0.7, y, w: 12, h: 1.0,
    fontFace: FONT_TITLE, fontSize: 40, color: C.ink, bold: false,
    charSpacing: -1,
  });
}

function eyebrow(slide, text, y = 0.45) {
  slide.addText(text, {
    x: 0.7, y, w: 12, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, color: C.forest, bold: true,
    charSpacing: 1.5,
  });
}

function bulletList(slide, items, opts = {}) {
  const x = opts.x ?? 0.9;
  const y = opts.y ?? 2.2;
  const w = opts.w ?? 11.5;
  const h = opts.h ?? 4.5;
  const fontSize = opts.fontSize ?? 22;
  slide.addText(
    items.map((t) => ({ text: t, options: { bullet: { indent: 18 }, breakLine: true } })),
    {
      x, y, w, h,
      fontFace: FONT_BODY, fontSize, color: C.bark,
      paraSpaceAfter: 14, lineSpacingMultiple: 1.3,
    },
  );
}

function paragraph(slide, text, opts = {}) {
  slide.addText(text, {
    x: opts.x ?? 0.9, y: opts.y ?? 2.2,
    w: opts.w ?? 11.5, h: opts.h ?? 4.5,
    fontFace: FONT_BODY, fontSize: opts.fontSize ?? 22, color: C.bark,
    paraSpaceAfter: 14, lineSpacingMultiple: 1.4,
  });
}

// ---------- Slide 1 — Title ----------

{
  const s = pres.addSlide();
  s.background = { color: C.cream };
  // big forest panel on the right
  s.addShape("rect", {
    x: 8.0, y: 0, w: 5.33, h: 7.5,
    fill: { color: C.forest }, line: { type: "none" },
  });
  // Brand mark v2 (SVG, embedded). Same artwork as the live site.
  // viewBox aspect 40:48 — width 3.0in → height 3.6in.
  s.addImage({
    data: BRAND_DATA_URL,
    x: 9.66, y: 1.95, w: 3.0, h: 3.6,
  });

  // Title block on the left
  s.addText("SkillTree", {
    x: 0.7, y: 2.7, w: 7.0, h: 1.5,
    fontFace: FONT_TITLE, fontSize: 88, color: C.ink, bold: false,
    charSpacing: -2,
  });
  s.addText("Iga ekspert oli kunagi algaja.", {
    x: 0.7, y: 4.0, w: 7.0, h: 0.6,
    fontFace: FONT_TITLE, fontSize: 22, color: C.stone, italic: true,
  });
  s.addText("Henry Pajuri", {
    x: 0.7, y: 6.4, w: 7.0, h: 0.4,
    fontFace: FONT_BODY, fontSize: 14, color: C.bark, bold: true,
  });
  s.addText("Kasutajaliidese esteetika · 2026", {
    x: 0.7, y: 6.75, w: 7.0, h: 0.3,
    fontFace: FONT_BODY, fontSize: 11, color: C.stone,
  });
}

// ---------- Slide 2 — Idee ----------

{
  const s = newSlide();
  eyebrow(s, "01");
  title(s, "Idee");
  paragraph(s,
    "SkillTree on visuaalne oskuste päevik, kus iga oskus, mida õpid, kasvab " +
    "elava puuna. Iga harjutus toidab oksa — algajast täielikult õitsenud osavaks.\n\n" +
    "Inspiratsiooniks olid mängude oskustepuud (Diablo, Path of Exile) ja Duolingo, " +
    "kuid neil kõigil puudus botaaniline metafoor — meie keskendume kasvule, mitte võistlusele.",
  );
}

// ---------- Slide 3 — Sihtrühm ----------

{
  const s = newSlide();
  eyebrow(s, "02");
  title(s, "Sihtrühm");
  bulletList(s, [
    "Inimesed, kes tahavad õppida pikaajalist oskust (kitarr, kokandus, joonistamine, jne)",
    "Algajad, kes vajavad nähtavat teed alustamisest meisterlikkuseni",
    "Õppijad, keda traditsioonilised \"streak\"-pidamise äpid on heidutanud",
    "Kõik vanusegrupid — eriti 18–45, kes harrastavad loovaid hobisid",
  ]);
}

// ---------- Slide 4 — UVP ----------

{
  const s = newSlide();
  eyebrow(s, "03");
  title(s, "Unikaalne väärtuspakkumine");
  bulletList(s, [
    "Botaaniline metafoor — oskused kasvavad puuna, mitte numbrina",
    "Neli olekut: uinunud → paljas oks → kasvab → õitseb",
    "Ei ole \"kaotamist\" — vahele jäänud päev ei kustuta saavutusi",
    "Soovituslikud õppematerjalid iga oskuse juures (JustinGuitar, Proko jne)",
    "Eesti ja inglise keel, harjutuspäevade soojuskaart, valikuline järjest pidamine",
  ]);
}

// ---------- Slide 5 — Värvipalett ----------

{
  const s = newSlide();
  eyebrow(s, "04");
  title(s, "Praktiline protsess: värvipalett");

  const swatches = [
    { name: "Cream",     hex: "FAF6F0", role: "taust" },
    { name: "Parchment", hex: "F0E8DC", role: "kaardid" },
    { name: "Forest",    hex: "2D4A3E", role: "õitsenud, primaarne" },
    { name: "Amber",     hex: "C8956C", role: "kasvab" },
    { name: "Bark",      hex: "5C4A3A", role: "tüvi, tekst" },
    { name: "Sage",      hex: "8BA692", role: "lehed, aktsendid" },
  ];

  swatches.forEach((sw, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.9 + col * 4.05;
    const y = 2.2 + row * 1.95;
    s.addShape("rect", {
      x, y, w: 1.4, h: 1.4,
      fill: { color: sw.hex },
      line: { color: "C5BBAE", width: 0.5 },
    });
    s.addText(sw.name, {
      x: x + 1.55, y: y + 0.05, w: 2.5, h: 0.35,
      fontFace: FONT_TITLE, fontSize: 18, color: C.ink, bold: false,
    });
    s.addText("#" + sw.hex, {
      x: x + 1.55, y: y + 0.5, w: 2.5, h: 0.3,
      fontFace: FONT_BODY, fontSize: 12, color: C.stone,
    });
    s.addText(sw.role, {
      x: x + 1.55, y: y + 0.85, w: 2.5, h: 0.3,
      fontFace: FONT_BODY, fontSize: 12, color: C.stone, italic: true,
    });
  });
}

// ---------- Slide 6 — Fondid ----------

{
  const s = newSlide();
  eyebrow(s, "05");
  title(s, "Praktiline protsess: fondid");

  // Playfair Display sample
  s.addText("Playfair Display", {
    x: 0.9, y: 2.2, w: 11.5, h: 0.6,
    fontFace: FONT_BODY, fontSize: 13, color: C.stone, bold: true,
    charSpacing: 1,
  });
  s.addText("Plant a skill. Watch it bloom.", {
    x: 0.9, y: 2.6, w: 11.5, h: 1.2,
    fontFace: FONT_TITLE, fontSize: 56, color: C.ink, italic: false,
  });
  s.addText("Pealkirjad, eyebrow-id, dekoratiivne tekst — soe, klassikaline serif, mis annab " +
    "rakenduse \"käsitsi tehtud päeviku\" tunde.", {
    x: 0.9, y: 3.85, w: 11.5, h: 0.6,
    fontFace: FONT_BODY, fontSize: 14, color: C.stone,
  });

  // DM Sans sample
  s.addText("DM Sans", {
    x: 0.9, y: 4.7, w: 11.5, h: 0.4,
    fontFace: FONT_BODY, fontSize: 13, color: C.stone, bold: true,
    charSpacing: 1,
  });
  s.addText("Logi harjutus. Kasvata oma puud.", {
    x: 0.9, y: 5.05, w: 11.5, h: 0.7,
    fontFace: FONT_BODY, fontSize: 28, color: C.ink,
  });
  s.addText("Kogu sisu, nupud, sildid — selge ja loetav grotesk, mis hoiab UI-d kerge ja " +
    "moodsana, ilma serifit kuhugi suruda.", {
    x: 0.9, y: 5.85, w: 11.5, h: 0.6,
    fontFace: FONT_BODY, fontSize: 14, color: C.stone,
  });
}

// ---------- Slide 7 — Komponendid ----------

{
  const s = newSlide();
  eyebrow(s, "06");
  title(s, "Praktiline protsess: komponendid");
  bulletList(s, [
    "Maandumisleht — sissejuhatav ja kutsuv",
    "Sisselogimine / registreerimine (Supabase)",
    "Pearakendus — interaktiivne SVG-puu, mille tekstuur on käsitsi joonistatud",
    "Oskuse kaart (\"practice sheet\") — XP logimise modaal, soovituslik tutorial",
    "Statistika modaal — järjest, kogu XP, harjutuspäevad, soojuskaart",
    "Õnnitluse ekraan — kui kogu puu on õitsenud",
    "Päise menüü — keelevahetus (EN/ET), lähtesta, kasutajamenüü",
  ], { fontSize: 18 });
}

// ---------- Slide 8 — Tehnoloogiad ----------

{
  const s = newSlide();
  eyebrow(s, "07");
  title(s, "Tehnoloogiad ja tööriistad");
  bulletList(s, [
    "React + TypeScript + Vite — kogu front-end",
    "Supabase — autentimine (e-mail / parool)",
    "localStorage — XP edenemine ja harjutuste ajalugu",
    "SVG — puu visualiseerimine, dekoratiivsed harud, lehed, õied",
    "GitHub Pages + GitHub Actions — automaatne deployment",
    "Claude Design — visuaalsed konseptsioonid (puu, autentimine, maandumisleht)",
    "Claude Code — kogu koodi kirjutamine ja integreerimine",
  ], { fontSize: 18 });
}

// ---------- Slide 9 — Mis oli raske ----------

{
  const s = newSlide();
  eyebrow(s, "08");
  title(s, "Reflektsioon: mis oli raske");
  bulletList(s, [
    "Puu visualiseerimise leidmine — esimesed katsed nägid välja kui graafik, mitte puu",
    "Jõudlus — algselt tuhandeid SVG-elemente, vajas optimeerimist",
    "Koore tekstuuri leidmine, mis töötaks nii vertikaalsel tüvel kui ka oksadel",
    "i18n ulatuse otsustamine — mis tõlkida ja mis mitte (oskuste nimed jätsime kakskeelseks)",
    "Maandumislehe ja rakenduse vahel järjepidevus — sama metafoor, sama tonaalsus",
  ], { fontSize: 18 });
}

// ---------- Slide 10 — Mis tuli kergelt ----------

{
  const s = newSlide();
  eyebrow(s, "09");
  title(s, "Reflektsioon: mis tuli kergelt");
  bulletList(s, [
    "Värvipalett ja fondide valik — tahtsin sooja, paberist päeviku tunnet",
    "Andmestruktuur — oskuste sõltuvuste graafiks tegemine oli loomulik",
    "Supabase autentimine — minimaalne kogus koodi, töötas esimese korraga",
    "Sõltumine olekust (XP → uinunud / paljas / kasvab / õitseb) — puhas funktsioon",
    "AI tööriistade koostöö — Claude Design visualiseeris, Claude Code rakendas",
  ], { fontSize: 18 });
}

// ---------- Slide 11 — Tänan ----------

{
  const s = pres.addSlide();
  s.background = { color: C.forest };
  // Big serif thank-you on a forest backdrop
  s.addText("Tänan kuulamast.", {
    x: 0.7, y: 2.6, w: 12, h: 1.6,
    fontFace: FONT_TITLE, fontSize: 80, color: C.cream, italic: false,
  });
  s.addText("Iga ekspert oli kunagi algaja.", {
    x: 0.7, y: 4.1, w: 12, h: 0.6,
    fontFace: FONT_TITLE, fontSize: 22, color: "A8C7B5", italic: true,
  });
  s.addText("henrypajuri.github.io/SkillTree", {
    x: 0.7, y: 6.4, w: 12, h: 0.4,
    fontFace: FONT_BODY, fontSize: 14, color: "A8C7B5",
  });
}

await pres.writeFile({ fileName: "SkillTree-eksam.pptx" });
console.log("Wrote SkillTree-eksam.pptx");
