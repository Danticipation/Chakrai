// Node.js script to create PWA icons from high-res image
const fs = require('fs');
const { execSync } = require('child_process');

const sourceImage = '../../attached_assets/TRaI-Logo-7-9_upscaled-silver-noBG_1752058298931.png';
const darkBlue = '#0a0e1a';

try {
  // Create 512x512 icon with dark background
  execSync(`convert "${sourceImage}" -resize 480x480 -background "${darkBlue}" -gravity center -extent 512x512 pwa-512x512.png`);
  console.log('Created 512x512 icon');
  
  // Create 192x192 icon with dark background  
  execSync(`convert "${sourceImage}" -resize 180x180 -background "${darkBlue}" -gravity center -extent 192x192 pwa-192x192.png`);
  console.log('Created 192x192 icon');
  
  console.log('PWA icons created successfully!');
} catch (error) {
  console.error('Error creating icons:', error.message);
}