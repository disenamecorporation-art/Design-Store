const fs = require('fs');
let sbSrc = fs.readFileSync('src/lib/supabase.ts', 'utf8');
sbSrc = sbSrc.replace(/import\.meta\.env/g, '(import.meta as any).env');
fs.writeFileSync('src/lib/supabase.ts', sbSrc);
