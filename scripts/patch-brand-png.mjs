/*
 * Patch SkillTree-eksam.pptx to replace the embedded SVG brand mark
 * with a rasterized PNG.
 *
 * Why: PowerPoint 2016+ renders SVG natively, but Google Slides cannot
 * — it shows "Image could not be loaded" on the title slide. PNG works
 * everywhere.
 *
 * This script PRESERVES all your custom edits — added slides, removed
 * slides, custom numbering. It only swaps one image file inside the
 * .pptx zip and updates the relationship type that tells PowerPoint
 * what kind of image it is.
 *
 * Run with: node scripts/patch-brand-png.mjs
 */

import { readFile, writeFile } from "node:fs/promises";
import JSZip from "jszip";
import sharp from "sharp";

const FILE = "SkillTree-eksam.pptx";

// Same SVG used by the live site (BrandMark v2).
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

const buf = await readFile(FILE);
const zip = await JSZip.loadAsync(buf);

// Find every .svg image inside ppt/media/. Replace each with a PNG of
// the same brand mark, and rewrite the file extension everywhere it's
// referenced (relationship XMLs and content-types).
const svgPaths = Object.keys(zip.files).filter((p) => /^ppt\/media\/.*\.svg$/i.test(p));
if (svgPaths.length === 0) {
  console.log("No SVG images found in ppt/media/. Nothing to patch.");
  process.exit(0);
}
console.log(`Found ${svgPaths.length} SVG image(s) in deck:`, svgPaths);

const png = await sharp(Buffer.from(BRAND_SVG))
  .resize({ width: 800 })
  .png()
  .toBuffer();
console.log(`Rasterized brand mark to PNG (${png.length} bytes).`);

for (const svgPath of svgPaths) {
  const pngPath = svgPath.replace(/\.svg$/i, ".png");
  zip.file(pngPath, png);
  zip.remove(svgPath);
  const oldName = svgPath.split("/").pop();
  const newName = pngPath.split("/").pop();
  console.log(`  ${oldName}  →  ${newName}`);

  // Patch every relationship + content-type + slide that references the
  // SVG. The tricky part is the slide XML: PowerPoint stores SVG images
  // as an svgBlip element nested inside a:blip's extLst, and the parent
  // a:blip often has no r:embed of its own. After we swap the file for
  // a PNG, that whole structure has to become a plain PNG <a:blip>.
  for (const filePath of Object.keys(zip.files)) {
    if (!/\.(xml|rels)$/i.test(filePath)) continue;
    let xml = await zip.file(filePath).async("string");
    const before = xml;

    // 1. Rename file references and MIME types
    xml = xml.replaceAll(oldName, newName);
    xml = xml.replaceAll("image/svg+xml", "image/png");

    // 2. In slide XML: collapse the SVG-extension blip into a plain PNG blip.
    //    Pattern: <a:blip>...<asvg:svgBlip ... r:embed="rId..."/>...</a:blip>
    //    Replacement: <a:blip r:embed="rId..."/>
    xml = xml.replace(
      /<a:blip(?:\s[^>]*)?>\s*<a:extLst>[\s\S]*?<asvg:svgBlip[^>]*r:embed="(rId\d+)"[^>]*\/>[\s\S]*?<\/a:extLst>\s*<\/a:blip>/g,
      (_m, rid) => `<a:blip r:embed="${rid}"/>`,
    );

    // 3. Remove the obsolete svg Default extension entry from Content_Types.
    //    [^>]* (not [^/]*) — Content-Type values like "image/png" contain a slash.
    xml = xml.replace(/<Default Extension="svg"[^>]*\/>/g, "");

    if (xml !== before) {
      zip.file(filePath, xml);
      console.log(`    patched ${filePath}`);
    }
  }
}

const out = await zip.generateAsync({ type: "nodebuffer" });
await writeFile(FILE, out);
console.log(`Wrote ${FILE}`);
