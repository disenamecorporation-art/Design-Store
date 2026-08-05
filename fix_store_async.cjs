const fs = require('fs');

function fixFile(file) {
  let src = fs.readFileSync(file, 'utf8');
  
  // StoreView
  src = src.replace(
    /setProducts\(storeAPI\.getProducts\(\)\);\s*setCategories\(storeAPI\.getCategories\(\)\);/,
    `storeAPI.getProducts().then(setProducts);
    storeAPI.getCategories().then(setCategories);`
  );
  
  fs.writeFileSync(file, src);
}

fixFile('src/components/StoreView.tsx');
fixFile('src/components/StoreAdminView.tsx');
console.log('Fixed async');
