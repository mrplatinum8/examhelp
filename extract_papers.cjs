const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const DIR = path.join(__dirname, 'prev papers zip');

async function main() {
  const files = fs.readdirSync(DIR).filter(f => f.endsWith('.pdf'));
  const results = {};

  for (const file of files) {
    try {
      const buf = fs.readFileSync(path.join(DIR, file));
      const uint8 = new Uint8Array(buf);
      const parser = new PDFParse(uint8);
      await parser.load();
      const info = parser.getInfo();
      const numPages = info?.numPages || info?.pages || 0;
      let fullText = '';
      for (let i = 1; i <= (numPages || 20); i++) {
        try {
          const pageText = await parser.getPageText(i);
          fullText += `\n--- PAGE ${i} ---\n` + pageText;
        } catch (e) {
          break; // no more pages
        }
      }
      parser.destroy();
      results[file] = fullText;
      console.log(`✅ ${file} — ${numPages} pages, ${fullText.length} chars`);
    } catch (e) {
      console.error(`❌ ${file}: ${e.message}`);
      results[file] = `[ERROR] ${e.message}`;
    }
  }

  fs.writeFileSync(
    path.join(__dirname, 'papers_extracted.json'),
    JSON.stringify(results, null, 2),
    'utf8'
  );
  console.log('\nDone! Wrote papers_extracted.json');
}

main();
