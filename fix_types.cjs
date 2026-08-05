const fs = require('fs');
let typesSrc = fs.readFileSync('src/types.ts', 'utf8');

typesSrc = typesSrc.replace(
  /'store' \| 'checkout';/,
  "'store' | 'checkout' | 'store-admin';"
);

fs.writeFileSync('src/types.ts', typesSrc);
