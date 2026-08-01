const fs = require('fs');

let accountViewSrc = fs.readFileSync('src/components/AccountView.tsx', 'utf8');

accountViewSrc = accountViewSrc.replace(
  /const handleAddDemoAdmin = \(\) => \{/,
  `const handleUpdateUserPoints = (id: string, points: number) => { console.log(id, points); };\n  const handleDeleteUser = (id: string) => { console.log(id); };\n\n  const handleAddDemoAdmin = () => {`
);

fs.writeFileSync('src/components/AccountView.tsx', accountViewSrc);
console.log('Account type fixed');
