#!/usr/bin/env node
// Builds a single self-contained standalone.html from the Vite dist output.
// Inlines CSS, JS, and the background-music mp3 (as a base64 data URL) so the
// file works offline by simply opening it in a browser — no server needed.

const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "dist");
const publicDir = path.join(__dirname, "..", "public");

const indexHtml = fs.readFileSync(path.join(distDir, "index.html"), "utf8");

// Collect the hashed asset filenames from the built index.html.
const cssMatch = indexHtml.match(/<link[^>]*href="\/assets\/([^"]+\.css)"[^>]*>/);
const jsMatch = indexHtml.match(/<script[^>]*src="\/assets\/([^"]+\.js)"[^>]*><\/script>/);
if (!cssMatch || !jsMatch) {
  console.error("Could not find inlined CSS/JS references in dist/index.html");
  process.exit(1);
}

const css = fs.readFileSync(path.join(distDir, "assets", cssMatch[1]), "utf8");
const js = fs.readFileSync(path.join(distDir, "assets", jsMatch[1]), "utf8");

// Inline the mp3 as a base64 data URL so no network fetch is needed.
const mp3Buf = fs.readFileSync(path.join(publicDir, "Macabre_Waltz.mp3"));
const mp3DataUri = "data:audio/mpeg;base64," + mp3Buf.toString("base64");

// Replace the runtime reference to /Macabre_Waltz.mp3 with the data URL.
const jsInlined = js.split('"/Macabre_Waltz.mp3"').join(JSON.stringify(mp3DataUri));

// Pull in Google Fonts via @import so the file is fully offline once cached,
// and gracefully falls back to system fonts otherwise.
const fontsImport = `@import url('https://fonts.googleapis.com/css2?family=Creepster&family=Nosifer&family=Inter:wght@400;500;600;700&display=swap');`;

// Rebuild the HTML with everything inlined.
let out = indexHtml
  // Remove the external font <link> tags (we move the import into CSS).
  .replace(/<link rel="preconnect"[^>]*>\s*/g, "")
  .replace(/<link[^>]*fonts\.googleapis[^>]*>/g, "")
  .replace(/<link[^>]*fonts\.gstatic[^>]*>/g, "")
  // Drop the favicon reference (no external file in standalone mode).
  .replace(/<link rel="icon"[^>]*>\s*/g, "")
  // Remove external CSS <link> and replace with an inline <style>.
  .replace(/<link[^>]*href="\/assets\/[^"]+\.css"[^>]*>/, `<style>\n${fontsImport}\n${css}\n</style>`)
  // Remove ALL external JS <script src="/assets/..."> tags (Vite may emit more
  // than one), then inject a single inline <script> before </body>.
  .replace(/<script[^>]*src="\/assets\/[^"]+\.js"[^>]*><\/script>\s*/g, "")
  .replace(/\s*<\/body>/, `\n<script type="module">\n${jsInlined}\n</script>\n  </body>`);

const outPath = path.join(distDir, "standalone.html");
fs.writeFileSync(outPath, out);
console.log(`Wrote ${outPath} (${(out.length / 1024 / 1024).toFixed(2)} MB)`);
