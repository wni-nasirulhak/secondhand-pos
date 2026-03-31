import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const apiDir = path.join(__dirname, '../src/app/api');

const mode = process.argv[2];

if (mode !== 'edge' && mode !== 'local') {
  console.error("Usage: node toggle_edge.mjs <edge|local>");
  process.exit(1);
}

let modifiedCount = 0;

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (file === 'route.js' || file === 'route.ts') {
      processFile(fullPath);
    }
  }
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  if (mode === 'edge') {
    // // export const runtime = 'edge'; -> export const runtime = 'edge';
    newContent = content.replace(/\/\/\s*export const runtime = 'edge'/g, "export const runtime = 'edge'");
  } else if (mode === 'local') {
    // export const runtime = 'edge'; -> // export const runtime = 'edge';
    // Only if it doesn't already have // in front, handled by regex not matching if already commented? Wait, regex needs to be precise.
    newContent = content.replace(/^(?!\/\/)\s*export const runtime = 'edge'/gm, "// export const runtime = 'edge'");
  }

  if (content !== newContent) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Updated [${mode}]: ${path.relative(process.cwd(), filePath)}`);
    modifiedCount++;
  }
}

console.log(`Setting environment to: ${mode.toUpperCase()} MODE...`);
walkDir(apiDir);
console.log(`Done. Modified ${modifiedCount} files.`);
