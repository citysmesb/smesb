const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const imgDir = path.join(__dirname, 'public', 'images');
const imagesToOptimize = [
  'Image-100.jpg',
  'Image-107.jpg',
  'Product-Branding.jpeg'
];

async function optimizeImages() {
  for (const img of imagesToOptimize) {
    const inputPath = path.join(imgDir, img);
    const outputPath = path.join(imgDir, 'opt_' + img);
    
    if (fs.existsSync(inputPath)) {
        console.log(`Optimizing ${img}...`);
        try {
            await sharp(inputPath).resize({ width: 1200 }).jpeg({ quality: 80 }).toFile(outputPath);
            fs.unlinkSync(inputPath);
            fs.renameSync(outputPath, inputPath);
            console.log(`Successfully optimized ${img}`);
        } catch (err) {
            console.error(`Error optimizing ${img}:`, err);
        }
    } else {
        console.log(`File not found: ${img}`);
    }
  }
}

optimizeImages();
