const fs = require('fs');

let navbarSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// 1. Add state for user menu
navbarSrc = navbarSrc.replace(
  /const \[mobileMenuOpen, setMobileMenuOpen\] = useState\(false\);/,
  `const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [userMenuOpen, setUserMenuOpen] = useState(false);`
);
if (!navbarSrc.includes('userMenuOpen')) {
  navbarSrc = navbarSrc.replace(
    /const \[isAdmin, setIsAdmin\] = useState\(false\);/,
    `const [isAdmin, setIsAdmin] = useState(false);\n  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [userMenuOpen, setUserMenuOpen] = useState(false);`
  );
  // Remove the old mobileMenuOpen if it was defined later, to avoid duplicates
  // But wait, the original file definitely has `mobileMenuOpen` somewhere. Let's verify where it is first.
}

fs.writeFileSync('src/components/Navbar.tsx', navbarSrc);
