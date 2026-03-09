const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

async function run() {
    try {
        const inputImage = 'C:\\Users\\user\\.gemini\\antigravity\\brain\\4a8466fa-ab83-4c3d-ba69-b3d9f4a26844\\logo_perfect_fit_color_1773042688883.png';
        const outDir = 'c:\\Users\\user\\Desktop\\20260306 ai-prompt-builder';
        const logoPath = path.join(outDir, 'logo.png');
        const fav32 = path.join(outDir, 'favicon-32.png');
        const fav16 = path.join(outDir, 'favicon-16.png');

        const img = sharp(inputImage);
        const meta = await img.metadata();

        // 1. Crop the left 45% to isolate the symbol from the text
        const leftHalfBuffer = await img.extract({
            left: 0,
            top: 0,
            width: Math.floor(meta.width * 0.45),
            height: meta.height
        }).toBuffer();

        // 2. Trim the white background tightly around the symbol, and ensure Alpha channel
        const { data, info } = await sharp(leftHalfBuffer)
            .trim()
            .ensureAlpha()
            .raw()
            .toBuffer({ resolveWithObject: true });

        // 3. Convert white pixels to transparent
        // Threshold for white-ish colors to handle slight antialiasing/compression artifacts
        const threshold = 230;
        for (let i = 0; i < data.length; i += info.channels) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];
            
            if (r > threshold && g > threshold && b > threshold) {
                data[i + 3] = 0; // Make transparent
            }
        }

        // 4. Save as 512x512 transparent PNG
        await sharp(data, {
            raw: {
                width: info.width,
                height: info.height,
                channels: info.channels
            }
        })
        .resize(512, 512, { 
            fit: 'contain', 
            background: { r: 255, g: 255, b: 255, alpha: 0 } 
        })
        .png()
        .toFile(logoPath);

        console.log("Successfully created logo.png (512x512, transparent)");

        // 5. Generate Favicons
        await sharp(logoPath).resize(32, 32).toFile(fav32);
        await sharp(logoPath).resize(16, 16).toFile(fav16);
        console.log("Successfully created favicon-32.png and favicon-16.png");

    } catch (e) {
        console.error("Error processing logo image:", e);
    }
}

run();
