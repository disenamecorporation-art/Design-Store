const fs = require('fs');

let navSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

// For desktop:
navSrc = navSrc.replace(
  /\{isAdmin && \(\s*<button[\s\S]*?Admin CRM[\s\S]*?<\/button>\s*<button[\s\S]*?Admin Tienda[\s\S]*?<\/button>\s*\)\}/,
  (match) => {
    return match.replace(/\{isAdmin && \(\s*/, '{isAdmin && (<>').replace(/\s*\)\}/, '</>)}');
  }
);

// For mobile:
navSrc = navSrc.replace(
  /\{isAdmin && \(\s*<button[\s\S]*?Admin CRM[\s\S]*?<\/button>\s*<button[\s\S]*?Admin Tienda[\s\S]*?<\/button>\s*\)\}/,
  (match) => {
    return match.replace(/\{isAdmin && \(\s*/, '{isAdmin && (<>').replace(/\s*\)\}/, '</>)}');
  }
);

fs.writeFileSync('src/components/Navbar.tsx', navSrc);
console.log('Fixed Navbar JSX');
