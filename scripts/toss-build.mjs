import { execSync } from 'child_process';
import { renameSync } from 'fs';

try {
  renameSync('src/app/api', 'src/app/_api_backup');
} catch {}

try {
  execSync('npx next build', { stdio: 'inherit', env: { ...process.env, BUILD_TARGET: 'toss' } });
} finally {
  try {
    renameSync('src/app/_api_backup', 'src/app/api');
  } catch {}
}
