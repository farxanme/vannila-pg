import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dir = path.join(__dirname, '../src/assets/images/icons');

for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.svg'))) {
  const fp = path.join(dir, f);
  let s = fs.readFileSync(fp, 'utf8');
  const orig = s;
  s = s.replace(/fill="#[^"]*"/gi, (m) => (/none/i.test(m) ? m : 'fill="#000000"'));
  s = s.replace(/stroke="#[^"]*"/gi, (m) => (/none/i.test(m) ? m : 'stroke="#000000"'));
  if (s !== orig) fs.writeFileSync(fp, s);
  console.log(f, s !== orig ? 'updated' : 'unchanged');
}
