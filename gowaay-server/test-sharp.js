const sharp = require('sharp');
const fs = require('fs');

async function testSharp() {
  try {
    console.log('Testing sharp...');
    
    // Create a simple test image
    const testImage = await sharp({
      create: {
        width: 100,
        height: 100,
        channels: 3,
        background: { r: 255, g: 0, b: 0 }
      }
    })
    .webp({ quality: 80 })
    .toBuffer();
    
    console.log('Sharp test successful, buffer size:', testImage.length);
    
    // Test with the PNG file
    const pngBuffer = fs.readFileSync('test-image.png');
    console.log('PNG file size:', pngBuffer.length);
    
    const processed = await sharp(pngBuffer)
      .resize(1920, 1920, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .webp({ quality: 80 })
      .toBuffer();
    
    console.log('PNG processing successful, output size:', processed.length);
    
  } catch (error) {
    console.error('Sharp test failed:', error);
  }
}

testSharp();
