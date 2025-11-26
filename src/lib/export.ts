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
      container.id = 'pdf-export-container';
      container.style.width = '595px'; // A4 width in pixels (approx) at 72dpi
      container.style.padding = '40px';
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      container.style.fontFamily = 'Arial, sans-serif';
      container.style.fontSize = '12px';
      container.style.color = '#000000';
      container.style.backgroundColor = '#ffffff';

      container.innerHTML = `
        <style>
          #pdf-export-container {
            --background: #ffffff;
            --foreground: #000000;
            --muted: #f3f4f6;
            --muted-foreground: #6b7280;
            --popover: #ffffff;
            --popover-foreground: #000000;
            --card: #ffffff;
            --card-foreground: #000000;
            --border: #e5e7eb;
            --input: #e5e7eb;
            --primary: #000000;
            --primary-foreground: #ffffff;
            --secondary: #f3f4f6;
            --secondary-foreground: #111827;
            --accent: #f3f4f6;
            --accent-foreground: #111827;
            --destructive: #ef4444;
            --destructive-foreground: #ffffff;
            --ring: #e5e7eb;
          }
          #pdf-export-container * {
            border-color: #e5e7eb !important;
            outline-color: #e5e7eb !important;
          }
          #pdf-export-container h1 { font-size: 24px; margin-bottom: 16px; font-weight: bold; color: #000000; }
          #pdf-export-container h2 { font-size: 20px; margin-top: 24px; margin-bottom: 12px; font-weight: bold; color: #000000; }
          #pdf-export-container h3 { font-size: 16px; margin-top: 20px; margin-bottom: 10px; font-weight: bold; color: #000000; }
          #pdf-export-container p { margin-bottom: 12px; line-height: 1.6; color: #000000; }
          #pdf-export-container ul { list-style-type: disc; padding-left: 24px; margin-bottom: 12px; }
          #pdf-export-container ol { list-style-type: decimal; padding-left: 24px; margin-bottom: 12px; }
          #pdf-export-container li { margin-bottom: 4px; color: #000000; }
          #pdf-export-container blockquote { border-left: 4px solid #e5e7eb; padding-left: 16px; margin-left: 0; color: #4b5563; font-style: italic; }
          #pdf-export-container code { background: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace; font-size: 0.9em; color: #111827; }
          #pdf-export-container pre { background: #f3f4f6; padding: 16px; border-radius: 8px; overflow-x: auto; margin-bottom: 16px; }
          #pdf-export-container pre code { background: transparent; padding: 0; color: inherit; }
          #pdf-export-container img { max-width: 100%; height: auto; margin: 16px 0; }
          #pdf-export-container table { border-collapse: collapse; width: 100%; margin-bottom: 16px; }
          #pdf-export-container th, #pdf-export-container td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; color: #000000; }
          #pdf-export-container th { background-color: #f9fafb; font-weight: bold; }
          #pdf-export-container hr { border: 0; border-top: 1px solid #e5e7eb; margin: 24px 0; }
          #pdf-export-container a { color: #2563eb; text-decoration: underline; }
        </style>
        <h1>${note.title}</h1>
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
          windowWidth: 595,
          html2canvas: {
            onclone: (clonedDoc: Document) => {
              const root = clonedDoc.documentElement;
              root.style.setProperty('--background', '#ffffff');
              root.style.setProperty('--foreground', '#000000');
              root.style.setProperty('--card', '#ffffff');
              root.style.setProperty('--card-foreground', '#000000');
              root.style.setProperty('--popover', '#ffffff');
              root.style.setProperty('--popover-foreground', '#000000');
              root.style.setProperty('--primary', '#000000');
              root.style.setProperty('--primary-foreground', '#ffffff');
              root.style.setProperty('--secondary', '#f3f4f6');
              root.style.setProperty('--secondary-foreground', '#111827');
              root.style.setProperty('--muted', '#f3f4f6');
              root.style.setProperty('--muted-foreground', '#6b7280');
              root.style.setProperty('--accent', '#f3f4f6');
              root.style.setProperty('--accent-foreground', '#111827');
              root.style.setProperty('--destructive', '#ef4444');
              root.style.setProperty('--destructive-foreground', '#ffffff');
              root.style.setProperty('--border', '#e5e7eb');
              root.style.setProperty('--input', '#e5e7eb');
              root.style.setProperty('--ring', '#e5e7eb');
              root.style.setProperty('--sidebar', '#f9fafb');
              root.style.setProperty('--sidebar-foreground', '#111827');
            }
          }
        });
      } finally {
        container.remove();
      }
    }
  }
}
