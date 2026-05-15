/*
 * Renumber the page-number tags in SkillTree-eksam.pptx.
 *
 * The original generator hard-codes "X / 11" on every chrome'd slide.
 * Once you add or remove slides in PowerPoint, those numbers go stale.
 *
 * This script:
 *   1. Walks slides in order
 *   2. Finds slides that contain a "<digits> / <digits>" pattern
 *   3. Replaces with "<position> / <total>" — where total = count of
 *      numbered slides (so the title/thanks slides aren't counted)
 *
 * Run with: node scripts/renumber-presentation.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";

const FILE = "SkillTree-eksam.pptx";
const PAGE_RE = /\b\d+\s*\/\s*\d+\b/;

const buf = await readFile(FILE);
const zip = await JSZip.loadAsync(buf);

// Collect slides in document order. PowerPoint stores presentation slide
// references in ppt/_rels/presentation.xml.rels + ppt/presentation.xml,
// but slide files themselves are usually named slideN.xml in 1..N order
// matching their position. Trust the numeric suffix.
const slidePaths = Object.keys(zip.files)
  .filter((p) => /^ppt\/slides\/slide\d+\.xml$/.test(p))
  .sort((a, b) => {
    const na = parseInt(a.match(/(\d+)\.xml$/)[1], 10);
    const nb = parseInt(b.match(/(\d+)\.xml$/)[1], 10);
    return na - nb;
  });

// First pass — find which slides contain a page-number tag
const numberedIndices = [];
const slideTexts = {};
for (const path of slidePaths) {
  const xml = await zip.file(path).async("string");
  slideTexts[path] = xml;
  if (PAGE_RE.test(xml)) numberedIndices.push(path);
}
const total = numberedIndices.length;
console.log(`Found ${slidePaths.length} slides, ${total} have page numbers.`);

// Second pass — rewrite each numbered slide's page tag in document order
let position = 0;
for (const path of numberedIndices) {
  position++;
  const original = slideTexts[path];
  const updated = original.replace(PAGE_RE, `${position} / ${total}`);
  if (updated !== original) {
    zip.file(path, updated);
    console.log(`  ${path}  →  ${position} / ${total}`);
  }
}

const out = await zip.generateAsync({ type: "nodebuffer" });
await writeFile(FILE, out);
console.log(`Wrote ${FILE}`);
