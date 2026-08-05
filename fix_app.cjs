const fs = require('fs');

let appSrc = fs.readFileSync('src/App.tsx', 'utf8');

if (!appSrc.includes('import { StoreAdminView }')) {
  appSrc = appSrc.replace(
    /import \{ AdminView \} from '\.\/components\/AdminView';/,
    `import { AdminView } from './components/AdminView';\nimport { StoreAdminView } from './components/StoreAdminView';`
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
          {activeTab === 'store-admin' && (
            <motion.div
              key="store-admin"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
            >
              <StoreAdminView />
            </motion.div>
          )}`
);


fs.writeFileSync('src/App.tsx', appSrc);
console.log('App updated with store-admin');
