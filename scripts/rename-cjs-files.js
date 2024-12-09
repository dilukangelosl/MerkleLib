import { readdir, rename } from 'fs/promises';
import { join } from 'path';

const cjsDir = './dist/cjs';

async function renameFiles(dir) {
  try {
    const files = await readdir(dir);
    
    for (const file of files) {
      if (file.endsWith('.js')) {
        const oldPath = join(dir, file);
        const newPath = join(dir, file.replace('.js', '.cjs'));
        await rename(oldPath, newPath);
      }
    }
    console.log('Successfully renamed CJS files');
  } catch (error) {
    console.error('Error renaming files:', error);
    process.exit(1);
  }
}

renameFiles(cjsDir);
