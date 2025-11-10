const sharp = require('sharp');
const fs = require('fs');

async function createTestImage() {
  try {
    // Create a proper test image using sharp
    await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .png()
    .toFile('test-image.png');
    
    console.log('Test image created successfully');
    
    // Test processing it
    const processed = await sharp('test-image.png')
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    console.log('Image processing successful, output size:', processed.length);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

createTestImage();
