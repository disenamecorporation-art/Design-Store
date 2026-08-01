const fs = require('fs');

let adminViewSrc = fs.readFileSync('src/components/AdminView.tsx', 'utf8');
adminViewSrc = adminViewSrc.replace(
  /\{Object\.values\(orders\)\.reverse\(\)\.map\(order => \(/,
  '{Object.values(orders).reverse().map((order: any) => ('
);

fs.writeFileSync('src/components/AdminView.tsx', adminViewSrc);
console.log('Admin type fixed');
