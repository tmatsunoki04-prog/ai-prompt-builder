const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const DIR = __dirname;
const PRIMARY_BLUE = "#2563eb";
const TEXT_BLACK = "#1c1917";

// 1. Generate Favicon SVG
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M6 4h12a2 2 0 0 1 2 2v7h-7v7H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="${TEXT_BLACK}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  <rect x="13" y="13" width="7" height="7" rx="1.5" fill="${PRIMARY_BLUE}" />
</svg>`;
fs.writeFileSync(path.join(DIR, 'favicon.svg'), faviconSvg);

// 2. Build PNG favicons using Sharp
async function buildFavicons() {
    const svgBuffer = Buffer.from(faviconSvg);
    await sharp(svgBuffer).resize(32, 32).png().toFile(path.join(DIR, 'favicon-32.png'));
    await sharp(svgBuffer).resize(16, 16).png().toFile(path.join(DIR, 'favicon-16.png'));
    console.log("Favicons generated");
}

// 3. Update HTML files
const INLINE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" class="pitaprompt-logo-icon">
                <path d="M6 4h12a2 2 0 0 1 2 2v7h-7v7H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <rect x="13" y="13" width="7" height="7" rx="1.5" fill="${PRIMARY_BLUE}" />
            </svg>`;

const BRAND_INLINE_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" class="pitaprompt-logo-icon" style="flex-shrink: 0;">
                <path d="M6 4h12a2 2 0 0 1 2 2v7h-7v7H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <rect x="13" y="13" width="7" height="7" rx="1.5" fill="${PRIMARY_BLUE}" />
            </svg>`;

const files = [
    { name: "index.html", isHero: true },
    { name: "index-ja.html", isHero: true },
    { name: "chatgpt-does-not-understand.html", isHero: false },
    { name: "why-ai-misunderstands-intent.html", isHero: false },
    { name: "rough-notes-to-ai-prompts.html", isHero: false },
    { name: "privacy.html", isHero: false },
    { name: "privacy-ja.html", isHero: false },
    { name: "terms.html", isHero: false },
    { name: "terms-ja.html", isHero: false }
];

files.forEach(fileObj => {
    const filepath = path.join(DIR, fileObj.name);
    if (!fs.existsSync(filepath)) return;
    
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // Add favicon link if not there
    if (!content.includes('favicon.svg')) {
        content = content.replace('<link rel="stylesheet"', '<link rel="icon" href="/favicon.svg" type="image/svg+xml">\n    <link rel="icon" href="/favicon-32.png" sizes="32x32" type="image/png">\n    <link rel="icon" href="/favicon-16.png" sizes="16x16" type="image/png">\n    <link rel="stylesheet"');
    }

    if (fileObj.isHero) {
        // Replace <h1 class="hero-title">PitaPrompt</h1>
        if (content.includes('<h1 class="hero-title">PitaPrompt</h1>')) {
            const newHero = `<h1 class="hero-title" style="display: inline-flex; align-items: center; gap: 0.5rem; justify-content: center;">
            ${INLINE_SVG}
            PitaPrompt
            </h1>`;
            content = content.replace('<h1 class="hero-title">PitaPrompt</h1>', newHero);
        }
    } else {
        // Replace <a href="index-ja.html" class="header-brand">PitaPrompt</a>
        if (content.includes('class="header-brand">PitaPrompt</a>')) {
            const newBrand = `class="header-brand" style="display: inline-flex; align-items: center; gap: 0.5rem;">
                ${BRAND_INLINE_SVG}
                PitaPrompt
            </a>`;
            content = content.replace(/class="header-brand">PitaPrompt<\/a>/, newBrand);
        }
    }
    
    fs.writeFileSync(filepath, content, 'utf-8');
});

buildFavicons().catch(console.error);
