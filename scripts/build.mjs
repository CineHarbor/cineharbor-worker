import { createHash } from 'node:crypto';
import { existsSync, lstatSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'dist');
if (existsSync(output) && (!lstatSync(output).isDirectory() || lstatSync(output).isSymbolicLink()))
  throw new Error('Refusing unsafe build output');
mkdirSync(output, { recursive: true });
const source = readFileSync(path.join(root, 'proxy.worker.js'));
writeFileSync(path.join(output, 'proxy.worker.js'), source);
writeFileSync(path.join(output, 'SHA256SUMS'), `${createHash('sha256').update(source).digest('hex')}  proxy.worker.js\n`);
console.log('Built fixed-upstream addon gateway; deployment has not been performed.');
