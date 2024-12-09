import { readdir, rename, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

const cjsDir = './dist/cjs';

async function updateImports(filePath) {
  const content = await readFile(filePath, 'utf8');
  const updatedContent = content.replace(/require\(['"]\.\/([^'"]+)['"]\)/g, "require('./$1.cjs')");
  await writeFile(filePath, updatedContent);
}

async function renameFiles(dir) {
  try {
    const files = await readdir(dir);
    
    // First update imports in all JS files
    for (const file of files) {
      if (file.endsWith('.js')) {
        const filePath = join(dir, file);
        await updateImports(filePath);
      }
    }

    // Then rename files to .cjs
    for (const file of files) {
      if (file.endsWith('.js')) {
        const oldPath = join(dir, file);
        const newPath = join(dir, file.replace('.js', '.cjs'));
        await rename(oldPath, newPath);
      }
    }
    console.log('Successfully renamed CJS files and updated imports');
  } catch (error) {
    console.error('Error processing files:', error);
    process.exit(1);
  }
}

renameFiles(cjsDir);
