import { jsPDF } from 'jspdf';
import { marked } from 'marked';
import html2canvas from 'html2canvas';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile, writeTextFile } from '@tauri-apps/plugin-fs';

import { sleep } from '@/lib/utils';
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

      // Create a temporary iframe for isolation to avoid inheriting unsupported CSS (like oklch)
      const iframe = document.createElement('iframe');
      iframe.style.position = 'fixed';
      iframe.style.left = '0';
      iframe.style.top = '0';
      iframe.style.width = '794px'; // A4 width at 96dpi
      iframe.style.height = '0'; // Hide it visually but keep it in layout
      iframe.style.border = 'none';
      iframe.style.zIndex = '-1000';
      iframe.style.visibility = 'hidden'; // Use visibility hidden instead of display none

      document.body.append(iframe);

      try {
        const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
        
        if (!iframeDoc) {
          throw new Error('Could not access iframe document');
        }

        // Set content using DOM manipulation to avoid deprecated document.write
        iframeDoc.head.innerHTML = `
          <style>
            body { 
              font-family: Arial, sans-serif; 
              font-size: 14px; 
              line-height: 1.6; 
              color: #000000; 
              background-color: #ffffff;
              margin: 0;
              padding: 40px;
              width: 714px; /* 794px - 80px padding */
            }
            
            img { max-width: 100%; height: auto; }
            h1 { font-size: 24px; font-weight: bold; margin-bottom: 1rem; border-bottom: 1px solid #eee; padding-bottom: 0.5rem; color: #000000; }
            h2 { font-size: 20px; font-weight: bold; margin-top: 1.5rem; margin-bottom: 1rem; color: #000000; }
            h3 { font-size: 18px; font-weight: bold; margin-top: 1.25rem; margin-bottom: 0.75rem; color: #000000; }
            p { margin-bottom: 1rem; color: #000000; }
            ul, ol { margin-bottom: 1rem; padding-left: 2rem; color: #000000; }
            li { margin-bottom: 0.25rem; }
            blockquote { border-left: 4px solid #ddd; padding-left: 1rem; color: #666; margin-bottom: 1rem; }
            code { background: #f5f5f5; padding: 0.2rem 0.4rem; border-radius: 3px; font-family: monospace; color: #000000; }
            pre { background: #f5f5f5; padding: 1rem; border-radius: 5px; overflow-x: auto; margin-bottom: 1rem; }
            pre code { background: transparent; padding: 0; color: #000000; }
            table { border-collapse: collapse; width: 100%; margin-bottom: 1rem; }
            th, td { border: 1px solid #ddd; padding: 0.5rem; text-align: left; color: #000000; }
            th { background-color: #f9f9f9; }
            a { color: #2563eb; text-decoration: underline; }
          </style>
        `;
        
        iframeDoc.body.innerHTML = `
          <h1>${note.title}</h1>
          <div>${htmlContent}</div>
        `;

        // Wait for resources to load
        await sleep(500);

        // Adjust iframe height to fit content for full capture
        iframe.style.height = `${iframeDoc.body.scrollHeight + 100}px`;

        const canvas = await html2canvas(iframeDoc.body, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff'
        });

        const imgData = canvas.toDataURL('image/jpeg', 0.95);
        const imgWidth = 595.28; // A4 width in pt
        const pageHeight = 841.89; // A4 height in pt
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;
        let position = 0;

        const doc = new jsPDF('p', 'pt', 'a4');

        doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;

        while (heightLeft > 0) {
          position = heightLeft - imgHeight;
          doc.addPage();
          doc.addImage(imgData, 'JPEG', 0, position, imgWidth, imgHeight);
          heightLeft -= pageHeight;
        }

        const pdfData = doc.output('arraybuffer');
        await writeFile(path, new Uint8Array(pdfData));

      } finally {
        iframe.remove();
      }
    }
  }
}
