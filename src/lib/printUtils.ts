export function downloadAndPrintReport(title: string, bodyHtml: string, filename: string) {
  const fullHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    @media print {
      .no-print { display: none !important; }
      body { padding: 0; margin: 0; }
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      padding: 30px;
      color: #18181b;
      background: #ffffff;
      max-width: 900px;
      margin: 0 auto;
      line-height: 1.5;
    }
    .header {
      border-bottom: 3px solid #18181b;
      padding-bottom: 12px;
      margin-bottom: 20px;
    }
    h1 {
      font-size: 24px;
      font-weight: 900;
      margin: 0 0 6px 0;
      color: #000000;
      letter-spacing: -0.5px;
    }
    .meta {
      font-size: 12px;
      color: #71717a;
      font-weight: 500;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 20px;
      font-size: 12px;
    }
    th {
      background: #f4f4f5;
      text-align: left;
      padding: 10px 12px;
      font-weight: 700;
      border-bottom: 2px solid #e4e4e7;
      color: #27272a;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f4f4f5;
      color: #3f3f46;
    }
    tr:nth-child(even) td {
      background: #fafafa;
    }
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      background: #f4f4f5;
      padding: 16px;
      border-radius: 12px;
      margin-bottom: 20px;
    }
    .summary-item {
      display: flex;
      flex-direction: column;
    }
    .summary-label {
      font-size: 11px;
      color: #71717a;
      font-weight: 600;
      text-transform: uppercase;
    }
    .summary-value {
      font-size: 18px;
      font-weight: 900;
      color: #18181b;
      margin-top: 2px;
    }
    .footer {
      margin-top: 50px;
      padding-top: 20px;
      border-top: 1px solid #e4e4e7;
      text-align: center;
      font-size: 11px;
      color: #a1a1aa;
    }
    .no-print-bar {
      background: #18181b;
      color: #ffffff;
      padding: 12px 20px;
      border-radius: 12px;
      margin-bottom: 24px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    }
    .btn-print {
      background: #f59e0b;
      color: #000000;
      border: none;
      padding: 8px 18px;
      font-weight: 800;
      border-radius: 8px;
      cursor: pointer;
      font-size: 13px;
    }
    .btn-print:hover {
      background: #d97706;
    }
  </style>
</head>
<body>
  <div class="no-print-bar no-print">
    <span style="font-size: 13px; font-weight: 600;">📄 Documento Generado para Taller</span>
    <button class="btn-print" onclick="window.print()">🖨️ Imprimir / Guardar en PDF</button>
  </div>
  
  <div class="header">
    <h1>${title}</h1>
    <div class="meta">Fecha de emisión: ${new Date().toLocaleDateString('es-VE')} - ${new Date().toLocaleTimeString('es-VE')}</div>
  </div>

  ${bodyHtml}

  <div class="footer">
    Documento Oficial — Admin Panel #3 (Sistema de Taller)
  </div>
</body>
</html>`;

  const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);

  // 1. Trigger HTML file download to PC
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  // 2. Open printable tab
  const printWindow = window.open(url, '_blank');
  if (printWindow) {
    printWindow.focus();
  }
}
