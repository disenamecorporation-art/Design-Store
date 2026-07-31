const fs = require('fs');

let adminViewSrc = fs.readFileSync('src/components/AdminView.tsx', 'utf8');

adminViewSrc = adminViewSrc.replace(
  /<div>\s*<h1 className="text-3xl font-bold text-zinc-900">Panel de Administración<\/h1>\s*<p className="text-zinc-500 font-medium">Gestiona los proyectos y sus fases\.<\/p>\s*<\/div>\s*<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">\s*\{\/\* Create Order Form \*\/}\s*<div className="lg:col-span-1 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm space-y-6 self-start">/m,
  `<div>
          <h1 className="text-4xl font-extrabold text-zinc-900">Hola, Administrador Especial</h1>
          <p className="text-lg text-zinc-500 font-medium mt-2">Gestiona los proyectos, fases y crea nuevos trackings desde este panel principal.</p>
        </div>
        
        {/* Create Order Form - Prominent */}
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-zinc-200 shadow-lg space-y-8 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-cyan-400 via-fuchsia-400 to-blue-400" />
          
          <h2 className="text-2xl font-extrabold text-zinc-900 flex items-center gap-3">
            <div className="p-3 bg-zinc-900 text-white rounded-2xl">
              <Plus className="w-6 h-6" />
            </div>
            Crear Nuevo Proyecto (Tracking)
          </h2>
          
          <div className="lg:col-span-1 bg-white">`
);

adminViewSrc = adminViewSrc.replace(
  /<div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">/m,
  `</div>
        </div>
        <div className="bg-white p-8 sm:p-10 rounded-[2.5rem] border border-zinc-200 shadow-lg">`
);

// We need a more precise regex. I'll just write a script that does it with precise replacements.
