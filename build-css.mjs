#!/usr/bin/env bun
import { transform } from 'lightningcss';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join, dirname, resolve } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');
const isProduction = !isWatch;

const inputFile = join(__dirname, 'theme/css/a5ebec.pcss');
const outputDir = join(__dirname, '_css');
const outputFile = join(outputDir, 'a5ebec.css');

// Ensure output directory exists
if (!existsSync(outputDir)) {
  mkdirSync(outputDir, { recursive: true });
}

// Default browser targets
const targets = {
  chrome: 80 << 16,
  firefox: 72 << 16,
  safari: 13 << 16,
  edge: 80 << 16
};

// Function to resolve and inline imports
function resolveImports(filePath, visited = new Set()) {
  if (visited.has(filePath)) return '';
  visited.add(filePath);
  
  const content = readFileSync(filePath, 'utf8');
  const dir = dirname(filePath);
  
  // Replace @import statements with file contents
  return content.replace(/@import\s+["']([^"']+)["'];?/g, (match, importPath) => {
    const resolvedPath = resolve(dir, importPath);
    const fullPath = existsSync(resolvedPath) ? resolvedPath : resolve(dir, importPath.replace(/\.pcss$/, '') + '.pcss');
    
    if (existsSync(fullPath)) {
      return resolveImports(fullPath, visited);
    }
    console.warn(`Import not found: ${importPath}`);
    return match;
  });
}

async function buildCSS() {
  try {
    // Resolve all imports
    const css = resolveImports(inputFile);
    
    const { code, map } = transform({
      filename: inputFile,
      code: Buffer.from(css),
      targets,
      include: 0xffffffff, // Include all features
      sourceMap: !isProduction,
    });

    writeFileSync(outputFile, code);
    if (!isProduction && map) {
      writeFileSync(`${outputFile}.map`, map);
    }
    
    console.log(`✓ Built ${outputFile}`);
  } catch (error) {
    console.error('Error building CSS:', error);
    if (!isWatch) process.exit(1);
  }
}

// Initial build
await buildCSS();

// Watch mode
if (isWatch) {
  const { watch } = await import('chokidar');
  const watcher = watch('theme/css/**/*.pcss', { 
    persistent: true,
    ignoreInitial: true 
  });
  
  watcher.on('change', async (path) => {
    console.log(`File changed: ${path}`);
    await buildCSS();
  });
  
  console.log('Watching for changes...');
}