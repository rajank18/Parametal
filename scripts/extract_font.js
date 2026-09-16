const fs = require('fs');
const path = require('path');

const srcPath = 'C:\\Users\\Dell\\.gemini\\antigravity-ide\\brain\\ea5136da-f6c5-41f7-9ad6-ac5106274fc3\\.system_generated\\steps\\1705\\content.md';
const text = fs.readFileSync(srcPath, 'utf8');

const lines = text.split('\n');
const jsonLine = lines.find(l => l.startsWith('{"glyphs"'));

if (jsonLine) {
  const targetDir = path.join(__dirname, '..', 'public', 'fonts');
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const targetPath = path.join(targetDir, 'helvetiker_bold.typeface.json');
  fs.writeFileSync(targetPath, jsonLine.trim(), 'utf8');
  console.log('Font successfully extracted to:', targetPath);
} else {
  console.error('Could not find font JSON line in file');
}
