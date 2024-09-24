import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';

/**
 * Ensure the file exists, if not, create it and its directory.
 * @param {string} filePath - The path to the file.
 */
export function ensureFileSync(filePath) {
  try {
    // Check if the file already exists
    if (!existsSync(filePath)) {
      // Get the directory name of the file
      const dir = path.dirname(filePath);

      // Recursively create the directory if it doesn't exist
      if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
      }

      // Create an empty file
      writeFileSync(filePath, '');
    }
  } catch (error) {
    console.error(`Error ensuring file: ${error.message}`);
  }
}
