const fs = require('fs');

let appSrc = fs.readFileSync('src/App.tsx', 'utf8');

if (!appSrc.includes('import { StoreView }')) {
  appSrc = appSrc.replace(
    /import \{ AdminView \} from '\.\/components\/AdminView';/,
    `import { AdminView } from './components/AdminView';\nimport { StoreView } from './components/StoreView';\nimport { CheckoutView } from './components/CheckoutView';\nimport { CartDrawer } from './components/CartDrawer';`
  );
}

// Add the tabs to AnimatePresence
appSrc = appSrc.replace(
  /\{activeTab === 'admin' && \([\s\S]*?<\/motion\.div>\s*\)\}/,
  `{activeTab === 'admin' && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <AdminView />
            </motion.div>
          )}
          {activeTab === 'store' && (
            <motion.div
              key="store"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <StoreView />
            </motion.div>
          )}
          {activeTab === 'checkout' && (
            <motion.div
              key="checkout"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <CheckoutView setActiveTab={setActiveTab} />
            </motion.div>
          )}`
);

// Add CartDrawer before Footer
appSrc = appSrc.replace(
  /<\/main>\s*\{\/\* Footer \*\/\}/,
  `</main>\n      <CartDrawer setActiveTab={setActiveTab} />\n      {/* Footer */}`
);

fs.writeFileSync('src/App.tsx', appSrc);
console.log('App updated with store');
