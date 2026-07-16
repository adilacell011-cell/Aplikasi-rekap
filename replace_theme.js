const fs = require('fs');
const path = require('path');

const dir = 'artifacts/alfathpulsa/src/components';

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Colors and text
  content = content.replace(/text-asphalt-text-400/g, 'text-white/60');
  content = content.replace(/text-asphalt-text-100/g, 'text-white/90');
  content = content.replace(/text-asphalt-text-300/g, 'text-white/70');
  
  // Borders
  content = content.replace(/border-asphalt-700\/[0-9]+/g, 'border-white/10');
  content = content.replace(/border-asphalt-800\/[0-9]+/g, 'border-white/10');
  content = content.replace(/border-asphalt-[0-9]+/g, 'border-white/10');
  
  // Backgrounds
  // Usually bg-asphalt-800 with borders and shadow is a card. 
  // Let's replace 'bg-asphalt-800 rounded-2xl p-4 border border-white/10 shadow-xl' -> 'glass-card p-4' roughly, but simple string replace is safer.
  content = content.replace(/bg-asphalt-800/g, 'glass-card');
  content = content.replace(/bg-asphalt-900\/[0-9]+/g, 'bg-white/5');
  content = content.replace(/bg-asphalt-900/g, 'bg-transparent');
  content = content.replace(/bg-asphalt-700\/[0-9]+/g, 'bg-white/10');
  content = content.replace(/bg-asphalt-700/g, 'bg-white/10');
  content = content.replace(/bg-asphalt-[0-9]+/g, 'bg-white/5');

  // Inputs
  // Many inputs have 'bg-transparent' now instead of 'bg-asphalt-900' which might look weird if they need a background. 
  // We can fix inputs manually or try to match them.
  content = content.replace(/className="([^"]*)w-full([^"]*)bg-transparent([^"]*)border-white\/10([^"]*)"/g, 'className="$1w-full$2glass-input$3$4"');

  fs.writeFileSync(filePath, content, 'utf8');
}

const files = fs.readdirSync(dir);
files.forEach(file => {
  if (file.endsWith('.tsx') && file !== 'Layout.tsx' && file !== 'Dashboard.tsx' && file !== 'Login.tsx' && file !== 'SalaryAbsensi.tsx') {
    replaceInFile(path.join(dir, file));
  }
});

console.log("Done");