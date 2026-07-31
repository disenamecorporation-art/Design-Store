const fs = require('fs');

let accountViewSrc = fs.readFileSync('src/components/AccountView.tsx', 'utf8');

accountViewSrc = accountViewSrc.replace(
  /formData\.email\.toLowerCase\(\) === 'admin@designstore\.ve'/g,
  "['admin@designstore.ve', 'legaintcorporation@gmail.com'].includes(formData.email.toLowerCase())"
);

accountViewSrc = accountViewSrc.replace(
  /Acceder como Administrador Demo \(admin@designstore\.ve\)/g,
  "Acceder como Administrador Demo"
);

accountViewSrc = accountViewSrc.replace(
  /\(admin@designstore\.ve\)/g,
  ""
);

fs.writeFileSync('src/components/AccountView.tsx', accountViewSrc);
console.log('AccountView admin fixed');
