import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function generate() {
  const svgPath = path.join(process.cwd(), 'public', 'icon.svg');
  const out192 = path.join(process.cwd(), 'public', 'icon-192.png');
  const out512 = path.join(process.cwd(), 'public', 'icon-512.png');

  console.log('Generating PWA icons from SVG...');
  
  if (!fs.existsSync(svgPath)) {
    console.error('Error: public/icon.svg not found!');
    process.exit(1);
  }

  try {
    // Generate 192x192
    await sharp(svgPath)
      .resize(192, 192)
      .png()
      .toFile(out192);
    console.log('Generated: public/icon-192.png');

    // Generate 512x512
    await sharp(svgPath)
      .resize(512, 512)
      .png()
      .toFile(out512);
    console.log('Generated: public/icon-512.png');
    
  } catch (err) {
    console.error('Failed to generate PNG icons:', err);
    process.exit(1);
  }
}

generate();
