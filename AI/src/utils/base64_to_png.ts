// src/utils/base64_to_png.ts
import fs from 'fs';
import path from 'path';
import { writeFileSync } from 'fs';
import { writeFile } from 'fs/promises';

const OUTPUT_DIR = path.join(__dirname, '..', 'public', 'images');

/**
 * Ensure the output directory exists.
 */
function ensureOutputDir() {
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }
}

/**
 * Generate a unique filename with date/time and random prefix.
 * Example: "img_20250628_142530_8347.png"
 */
function generateFileName(extension = 'png'): string {
  const now = new Date();
  const datePart = now.toISOString().slice(0, 19).replace(/[-T:]/g, '');
  const rand = Math.floor(Math.random() * 9000) + 1000;
  return `img_${datePart}_${rand}.${extension}`;
}

/**
 * Save Base64 image synchronously and return the file path.
 */
export function saveBase64ToPngSync(base64String: string): string {
  ensureOutputDir();
  const filename = generateFileName();
  const outputPath = path.join(OUTPUT_DIR, filename);

  const data = base64String.split(';base64,').pop()!;
  writeFileSync(outputPath, data, { encoding: 'base64' });
  console.log(`✅ Saved synchronously to ${outputPath}`);

  return outputPath;
}

/**
 * Save Base64 image asynchronously and return the file path.
 */
export async function saveBase64ToPngAsync(base64String: string): Promise<string> {
  ensureOutputDir();
  const filename = generateFileName();
  const outputPath = path.join(OUTPUT_DIR, filename);

  const data = base64String.split(';base64,').pop()!;
  await writeFile(outputPath, data, { encoding: 'base64' });
  console.log(`✅ Saved asynchronously to ${outputPath}`);

  return outputPath;
}
