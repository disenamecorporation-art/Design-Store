import React, { useState, useEffect, useRef } from 'react';
import { Layers, RotateCw, Settings, Target, RefreshCw } from 'lucide-react';

export const CutCalculatorView: React.FC = () => {
  const [sheetWidth, setSheetWidth] = useState<number | ''>(100);
  const [sheetHeight, setSheetHeight] = useState<number | ''>(100);
  const [stickerWidth, setStickerWidth] = useState<number | ''>(10);
  const [stickerHeight, setStickerHeight] = useState<number | ''>(10);
  const [targetQuantity, setTargetQuantity] = useState<number | ''>('');
  
  const [forceOrientation, setForceOrientation] = useState<'auto' | 'horizontal' | 'vertical'>('auto');
  const [margin, setMargin] = useState<number | ''>(0);
  const [bleed, setBleed] = useState<number | ''>(0);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Calculate best layout
  const calculateLayout = () => {
    const swNum = Number(sheetWidth) || 0;
    const shNum = Number(sheetHeight) || 0;
    const stWNum = Number(stickerWidth) || 0;
    const stHNum = Number(stickerHeight) || 0;
    const mNum = Number(margin) || 0;
    const bNum = Number(bleed) || 0;

    const sw = swNum - (mNum * 2);
    const sh = shNum - (mNum * 2);
    const w = stWNum + (bNum * 2);
    const h = stHNum + (bNum * 2);
    
    if (w <= 0 || h <= 0 || sw <= 0 || sh <= 0 || !isFinite(sw) || !isFinite(sh) || !isFinite(w) || !isFinite(h)) {
      return { count: 0, cols: 0, rows: 0, orientation: 'none', efficiency: 0, w: 0, h: 0, sw: 0, sh: 0 };
    }

    // Horizontal arrangement (Normal)
    const colsH = Math.floor(sw / w);
    const rowsH = Math.floor(sh / h);
    const countH = colsH * rowsH;

    // Vertical arrangement (Rotated)
    const colsV = Math.floor(sw / h);
    const rowsV = Math.floor(sh / w);
    const countV = colsV * rowsV;

    let cols, rows, count, orientation;

    if (forceOrientation === 'horizontal') {
      cols = colsH; rows = rowsH; count = countH; orientation = 'horizontal';
    } else if (forceOrientation === 'vertical') {
      cols = colsV; rows = rowsV; count = countV; orientation = 'vertical';
    } else {
      if (countH >= countV) {
        cols = colsH; rows = rowsH; count = countH; orientation = 'horizontal';
      } else {
        cols = colsV; rows = rowsV; count = countV; orientation = 'vertical';
      }
    }

    const stickerArea = w * h;
    const totalArea = swNum * shNum;
    const usedArea = (count * stickerArea);
    const efficiency = totalArea > 0 ? (usedArea / totalArea) * 100 : 0;

    return { count, cols, rows, orientation, efficiency: isNaN(efficiency) ? 0 : efficiency, w, h, sw, sh };
  };

  const layout = calculateLayout();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Responsive setup
    const parent = canvas.parentElement;
    if (parent) {
      canvas.width = parent.clientWidth;
      canvas.height = 400; 
    }

    const { width: cw, height: ch } = canvas;
    
    // Clear
    ctx.clearRect(0, 0, cw, ch);

    const sWidth = Number(sheetWidth) || 0;
    const sHeight = Number(sheetHeight) || 0;
    const mVal = Number(margin) || 0;
    const bVal = Number(bleed) || 0;

    if (layout.count === 0 || sWidth <= 0 || sHeight <= 0 || !isFinite(sWidth) || !isFinite(sHeight)) return;

    // Calculate scale to fit the sheet in canvas
    const padding = 40;
    const availW = cw - padding * 2;
    const availH = ch - padding * 2;
    const scale = Math.min(availW / sWidth, availH / sHeight);

    if (!isFinite(scale) || scale <= 0 || isNaN(scale)) return;

    const drawW = sWidth * scale;
    const drawH = sHeight * scale;
    const offsetX = (cw - drawW) / 2;
    const offsetY = (ch - drawH) / 2;

    // Draw Sheet
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 20;
    ctx.shadowOffsetY = 10;
    ctx.fillStyle = '#18181b'; // zinc-900
    ctx.fillRect(offsetX, offsetY, drawW, drawH);
    ctx.shadowColor = 'transparent';

    // Draw Margin
    if (mVal > 0) {
      ctx.strokeStyle = 'rgba(244, 63, 94, 0.4)'; // rose-500
      ctx.setLineDash([5, 5]);
      ctx.strokeRect(
        offsetX + mVal * scale, 
        offsetY + mVal * scale, 
        (sWidth - mVal * 2) * scale, 
        (sHeight - mVal * 2) * scale
      );
      ctx.setLineDash([]);
    }

    // Draw Stickers
    const stickerDrawW = (layout.orientation === 'horizontal' ? layout.w : layout.h) * scale;
    const stickerDrawH = (layout.orientation === 'horizontal' ? layout.h : layout.w) * scale;

    const startX = offsetX + mVal * scale;
    const startY = offsetY + mVal * scale;

    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        const x = startX + c * stickerDrawW;
        const y = startY + r * stickerDrawH;

        // Base sticker rect
        ctx.fillStyle = 'rgba(6, 182, 212, 0.15)'; // cyan-500/15
        ctx.strokeStyle = '#06b6d4'; // cyan-500
        ctx.lineWidth = 1;
        
        ctx.fillRect(x + 1, y + 1, stickerDrawW - 2, stickerDrawH - 2);
        ctx.strokeRect(x + 1, y + 1, stickerDrawW - 2, stickerDrawH - 2);

        // Draw inner actual sticker without bleed
        if (bVal > 0) {
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
          ctx.setLineDash([2, 2]);
          ctx.strokeRect(
            x + 1 + (bVal * scale), 
            y + 1 + (bVal * scale), 
            stickerDrawW - 2 - (bVal * 2 * scale), 
            stickerDrawH - 2 - (bVal * 2 * scale)
          );
          ctx.setLineDash([]);
        }
      }
    }

    // Draw annotations
    ctx.fillStyle = '#a1a1aa'; // zinc-400
    ctx.font = '12px system-ui, sans-serif';
    ctx.textAlign = 'center';
    
    // Width annotation
    ctx.fillText(`${sWidth}cm`, offsetX + drawW / 2, offsetY - 10);
    
    // Height annotation
    ctx.save();
    ctx.translate(offsetX - 15, offsetY + drawH / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(`${sHeight}cm`, 0, 0);
    ctx.restore();

  }, [sheetWidth, sheetHeight, stickerWidth, stickerHeight, margin, bleed, forceOrientation, layout]);

  const handleReset = () => {
    setSheetWidth(100);
    setSheetHeight(100);
    setStickerWidth(10);
    setStickerHeight(10);
    setTargetQuantity('');
    setForceOrientation('auto');
    setMargin(0);
    setBleed(0);
  };

  const numSheets = targetQuantity ? Math.ceil(Number(targetQuantity) / (layout.count || 1)) : 0;
  const finalQuantity = numSheets * layout.count;

  return (
    <div className="w-full bg-[#111113]/80 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 shadow-[0_30px_60px_-15px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-white relative">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/4 w-1/2 h-64 bg-cyan-500/20 blur-[120px] pointer-events-none rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-1/3 h-64 bg-fuchsia-500/10 blur-[120px] pointer-events-none rounded-full"></div>

      <div className="px-8 py-6 border-b border-white/10 flex items-center justify-between bg-white/5 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.2)]">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg tracking-tight">Calculadora de Cortes</h3>
            <p className="text-xs font-medium text-zinc-400">Design Store Venezuela</p>
          </div>
        </div>
        <button onClick={handleReset} className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-full transition-colors" title="Reiniciar">
          <RefreshCw className="w-5 h-5" />
        </button>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start relative z-10">
        {/* Controls */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-black/20 p-6 rounded-[1.5rem] border border-white/5 shadow-inner backdrop-blur-md space-y-4">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Settings className="w-4 h-4 text-cyan-400" />
              Pliego / Material
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ancho (cm)</label>
                <input type="number" value={sheetWidth} onChange={e => setSheetWidth(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-white placeholder:text-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Alto (cm)</label>
                <input type="number" value={sheetHeight} onChange={e => setSheetHeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-white placeholder:text-zinc-600" />
              </div>
            </div>
            <div className="space-y-1.5 pt-2 border-t border-white/5">
              <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Margen (cm)</label>
              <input type="number" step="0.1" value={margin} onChange={e => setMargin(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all text-white placeholder:text-zinc-600" />
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-[1.5rem] border border-white/5 shadow-inner backdrop-blur-md space-y-4">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <Target className="w-4 h-4 text-fuchsia-400" />
              Pieza / Sticker
            </h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Ancho (cm)</label>
                <input type="number" value={stickerWidth} onChange={e => setStickerWidth(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all text-white placeholder:text-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Alto (cm)</label>
                <input type="number" value={stickerHeight} onChange={e => setStickerHeight(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all text-white placeholder:text-zinc-600" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Sangrado (cm)</label>
                <input type="number" step="0.1" value={bleed} onChange={e => setBleed(e.target.value === '' ? '' : Number(e.target.value))} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all text-white placeholder:text-zinc-600" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">Objetivo</label>
                <input type="number" placeholder="Opcional" value={targetQuantity} onChange={e => setTargetQuantity(Number(e.target.value) || '')} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-fuchsia-500/50 focus:border-fuchsia-500 transition-all text-white placeholder:text-zinc-600" />
              </div>
            </div>
          </div>

          <div className="bg-black/20 p-6 rounded-[1.5rem] border border-white/5 shadow-inner backdrop-blur-md space-y-3">
            <h4 className="text-sm font-bold text-zinc-100 flex items-center gap-2">
              <RotateCw className="w-4 h-4 text-amber-400" />
              Orientación
            </h4>
            <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5">
              <button 
                onClick={() => setForceOrientation('auto')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${forceOrientation === 'auto' ? 'bg-white/10 shadow-sm text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Óptima
              </button>
              <button 
                onClick={() => setForceOrientation('horizontal')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${forceOrientation === 'horizontal' ? 'bg-white/10 shadow-sm text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Horiz
              </button>
              <button 
                onClick={() => setForceOrientation('vertical')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${forceOrientation === 'vertical' ? 'bg-white/10 shadow-sm text-white' : 'text-zinc-400 hover:text-white'}`}
              >
                Vertic
              </button>
            </div>
          </div>
        </div>

        {/* Canvas & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Canvas Wrapper */}
          <div className="w-full h-[400px] bg-black/30 rounded-3xl border border-white/10 shadow-inner overflow-hidden relative">
            <canvas ref={canvasRef} className="w-full h-full block relative z-10" />
            <div className="absolute top-4 right-4 flex gap-2 z-20">
              <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full border border-white/10 text-xs font-bold text-white shadow-sm">
                Eficiencia: {layout.efficiency.toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Results Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col items-center text-center backdrop-blur-md">
              <span className="text-[11px] uppercase font-bold text-zinc-400 mb-1">Pzas / Pliego</span>
              <span className="text-3xl font-extrabold text-white">{layout.count}</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col items-center text-center backdrop-blur-md">
              <span className="text-[11px] uppercase font-bold text-zinc-400 mb-1">Desperdicio</span>
              <span className="text-3xl font-extrabold text-amber-400">{(100 - layout.efficiency).toFixed(1)}%</span>
            </div>
            <div className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-sm flex flex-col items-center text-center backdrop-blur-md">
              <span className="text-[11px] uppercase font-bold text-zinc-400 mb-1">Distribución</span>
              <span className="text-xl font-bold text-white mt-1">{layout.cols} <span className="text-zinc-500 text-sm font-medium">x</span> {layout.rows}</span>
            </div>
            {targetQuantity && targetQuantity !== '' ? (
              <div className="bg-cyan-500/10 p-4 rounded-2xl border border-cyan-500/20 shadow-[0_0_15px_rgba(6,182,212,0.1)] flex flex-col items-center text-center backdrop-blur-md">
                <span className="text-[11px] uppercase font-bold text-cyan-400 mb-1">Pliegos Req.</span>
                <span className="text-3xl font-extrabold text-cyan-400">{numSheets}</span>
                <span className="text-[10px] font-medium text-cyan-500 mt-1">Prod: {finalQuantity} pzas</span>
              </div>
            ) : (
              <div className="bg-black/20 p-4 rounded-2xl border border-white/5 flex flex-col items-center justify-center text-center opacity-50 backdrop-blur-md">
                <span className="text-[11px] uppercase font-bold text-zinc-500 mb-1">Sin Meta</span>
                <span className="text-xs text-zinc-500 font-medium">Cant. opcional</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
