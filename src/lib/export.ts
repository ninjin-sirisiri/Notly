import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile, writeTextFile } from '@tauri-apps/plugin-fs';

import { type NoteWithContent } from '@/types/notes';

export async function exportNote(note: NoteWithContent, format: 'md' | 'html' | 'pdf') {
  const content = note.content || '';
  const suggestedName = `${note.title}`;

  if (format === 'md') {
    const path = await save({
      defaultPath: `${suggestedName}.md`,
      filters: [{ name: 'Markdown', extensions: ['md'] }]
    });
    if (path) {
      await writeTextFile(path, content);
    }
  } else if (format === 'html') {
    const htmlContent = await marked.parse(content);
    const fullHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${note.title}</title>
  <style>
    body { 
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
      max-width: 800px; 
      margin: 0 auto; 
      padding: 2rem; 
      line-height: 1.6;
      color: #333;
    }
    img { max-width: 100%; }
    h1, h2, h3 { color: #111; }
    code { background: #f4f4f4; padding: 0.2em 0.4em; border-radius: 3px; }
    pre { background: #f4f4f4; padding: 1em; border-radius: 5px; overflow-x: auto; }
    blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 1em; color: #666; }
  </style>
</head>
<body>
  <h1>${note.title}</h1>
  ${htmlContent}
</body>
</html>
      `;
    const path = await save({
      defaultPath: `${suggestedName}.html`,
      filters: [{ name: 'HTML', extensions: ['html'] }]
    });
    if (path) {
      await writeTextFile(path, fullHtml);
    }
  } else if (format === 'pdf') {
    const path = await save({
      defaultPath: `${suggestedName}.pdf`,
      filters: [{ name: 'PDF', extensions: ['pdf'] }]
    });

    if (path) {
      const htmlContent = await marked.parse(content);

      // Create a temporary container for PDF generation
      const container = document.createElement('div');
      container.style.width = '595px'; // A4 width in pixels (approx) at 72dpi
      container.style.padding = '20px';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';

      container.innerHTML = `
          <h1 style="font-size: 24px; margin-bottom: 20px;">${note.title}</h1>
          <div>${htmlContent}</div>
        `;

      document.body.append(container);

      const doc = new jsPDF({
        unit: 'pt',
        format: 'a4',
        orientation: 'portrait'
      });

      try {
        await doc.html(container, {
          callback: async doc => {
            const pdfData = doc.output('arraybuffer');
            await writeFile(path, new Uint8Array(pdfData));
          },
          x: 10,
          y: 10,
          width: 575, // A4 width (595) - padding
          windowWidth: 595
        });
      } finally {
        container.remove();
      }
    }
  }
}
