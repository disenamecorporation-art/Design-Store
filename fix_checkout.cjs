const fs = require('fs');
let code = fs.readFileSync('src/components/CheckoutView.tsx', 'utf8');

// Add state for form fields
code = code.replace(
  /const \[isProcessing, setIsProcessing\] = useState\(false\);/,
  `const [isProcessing, setIsProcessing] = useState(false);\n  const [formData, setFormData] = useState({ name: '', email: '', phone: '', address: '', city: '', zip: '' });`
);

// Add onChange handlers and values to inputs
code = code.replace(
  /<input required type="text" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500\/10 focus:border-cyan-400 transition-all" placeholder="Ej\. Juan Pérez" \/>/,
  `<input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Ej. Juan Pérez" />`
);

code = code.replace(
  /<input required type="email" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500\/10 focus:border-cyan-400 transition-all" placeholder="juan@ejemplo\.com" \/>/,
  `<input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="juan@ejemplo.com" />`
);

code = code.replace(
  /<input required type="tel" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500\/10 focus:border-cyan-400 transition-all" placeholder="\+58 412 000 0000" \/>/,
  `<input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="+58 412 000 0000" />`
);

code = code.replace(
  /<input required type="text" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500\/10 focus:border-cyan-400 transition-all" placeholder="Calle, Avenida, Edificio, Apartamento\.\.\." \/>/,
  `<input required type="text" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Calle, Avenida, Edificio, Apartamento..." />`
);

code = code.replace(
  /<input required type="text" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500\/10 focus:border-cyan-400 transition-all" placeholder="Ej\. Caracas" \/>/,
  `<input required type="text" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Ej. Caracas" />`
);

code = code.replace(
  /<input required type="text" className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500\/10 focus:border-cyan-400 transition-all" placeholder="Ej\. 1010" \/>/,
  `<input required type="text" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} className="w-full px-5 py-4 bg-zinc-50 border border-zinc-200 rounded-2xl font-medium focus:bg-white focus:ring-4 focus:ring-cyan-500/10 focus:border-cyan-400 transition-all" placeholder="Ej. 1010" />`
);


// Update WhatsApp message
const oldMsgCode = `const message = \`Este es tu CODIGO NUMERICO DE IDENTIFICACIÓN DE SERVICIO *\${uniqueCode}*\`;`;
const newMsgCode = `
    const itemsList = items.map(i => \`- \${i.quantity}x \${i.product.name} ($\${(i.product.price * i.quantity).toFixed(2)})\`).join('\\n');
    const message = \`Este es tu CODIGO NUMERICO DE IDENTIFICACIÓN DE SERVICIO *\${uniqueCode}*

*DATOS DEL CLIENTE*
Nombre: \${formData.name}
Email: \${formData.email}
Teléfono: \${formData.phone}

*DIRECCIÓN DE ENVÍO*
Dirección: \${formData.address}
Ciudad: \${formData.city}
Código Postal: \${formData.zip}

*RESUMEN DEL PEDIDO*
\${itemsList}

*Total:* $\${cartTotal.toFixed(2)}\`;
`;
code = code.replace(oldMsgCode, newMsgCode);

fs.writeFileSync('src/components/CheckoutView.tsx', code);
