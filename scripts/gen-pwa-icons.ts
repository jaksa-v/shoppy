/**
 * Generates PWA icon PNGs from the SVG favicon.
 * Run with: bun scripts/gen-pwa-icons.ts
 */

import sharp from 'sharp';
import { readFileSync } from 'fs';
import { join } from 'path';

const svgPath = join(import.meta.dirname, '../src/lib/assets/favicon.svg');
const outDir = join(import.meta.dirname, '../static/icons');

const svg = readFileSync(svgPath);

const icons: { size: number; name: string }[] = [
	{ size: 180, name: 'apple-touch-icon.png' },
	{ size: 192, name: 'icon-192.png' },
	{ size: 512, name: 'icon-512.png' }
];

await import('fs').then((fs) => fs.mkdirSync(outDir, { recursive: true }));

for (const { size, name } of icons) {
	await sharp(svg).resize(size, size).png().toFile(join(outDir, name));
	console.log(`Generated ${name} (${size}x${size})`);
}

console.log('Done.');
