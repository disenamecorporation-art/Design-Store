const fs = require('fs');

let navbarSrc = fs.readFileSync('src/components/Navbar.tsx', 'utf8');

navbarSrc = navbarSrc.replace(
  /import React, \{ useState \} from 'react';/,
  "import React, { useState, useEffect } from 'react';"
);

navbarSrc = navbarSrc.replace(
  /import \{ Menu, X, ArrowRight, Phone, Sparkles, Search, Instagram, Facebook, Twitter \} from 'lucide-react';/,
  "import { Menu, X, ArrowRight, Phone, Sparkles, Search, Instagram, Facebook, Twitter, User, LogOut, Settings } from 'lucide-react';\nimport { supabase } from '../lib/supabase';"
);

fs.writeFileSync('src/components/Navbar.tsx', navbarSrc);
console.log('Navbar imports fixed');
