const fs = require('fs');

let src = fs.readFileSync('src/components/StoreAdminView.tsx', 'utf8');

src = src.replace(/id: \\`prod_\\\$\\{Date\.now\(\)\\}\\`/g, "id: `prod_${Date.now()}`");
src = src.replace(/\\\$/g, "$");

fs.writeFileSync('src/components/StoreAdminView.tsx', src);
console.log('Fixed StoreAdminView');
