const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const LOGO_IMG = `<img src="/logo.png" alt="PitaPrompt logo" style="width:32px; height:32px; display:block;">`;
const SMALL_LOGO_IMG = `<img src="/logo.png" alt="PitaPrompt logo" style="width:24px; height:24px; display:block; flex-shrink:0;">`;

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
    
    // Update favicons correctly (replace the previous SVG favicon logic)
    if (content.includes('<link rel="icon" href="/favicon.svg"')) {
        content = content.replace(
            /<link rel="icon" href="\/favicon\.svg" type="image\/svg\+xml">\s*<link rel="icon" href="\/favicon-32\.png" sizes="32x32" type="image\/png">\s*<link rel="icon" href="\/favicon-16\.png" sizes="16x16" type="image\/png">/i,
            '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">'
        );
    } else if (!content.includes('<link rel="icon" type="image/png" sizes="32x32"')) {
        content = content.replace('<link rel="stylesheet"', '<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">\n    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">\n    <link rel="stylesheet"');
    }

    if (fileObj.isHero) {
        // Replace the SVG hero title with IMG hero title
        const oldHeroRegex = /<h1 class="hero-title"[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>\s*PitaPrompt\s*<\/h1>/i;
        if (oldHeroRegex.test(content)) {
            const newHero = `<h1 class="hero-title" style="display:inline-flex; align-items:center; gap:8px; justify-content:center;">
            ${LOGO_IMG}
            <span>PitaPrompt</span>
        </h1>`;
            content = content.replace(oldHeroRegex, newHero);
        } else if (content.includes('<h1 class="hero-title">PitaPrompt</h1>')) {
            const newHero = `<h1 class="hero-title" style="display:inline-flex; align-items:center; gap:8px; justify-content:center;">
            ${LOGO_IMG}
            <span>PitaPrompt</span>
        </h1>`;
            content = content.replace('<h1 class="hero-title">PitaPrompt</h1>', newHero);
        }
    } else {
        // Replace the SVG header-brand with IMG header-brand
        const oldBrandRegex = /<a href="index(?:-ja)?\.html" class="header-brand"[^>]*>[\s\S]*?<svg[\s\S]*?<\/svg>\s*PitaPrompt\s*<\/a>/i;
        if (oldBrandRegex.test(content)) {
            const linkTarget = fileObj.name.includes('-ja') ? "index-ja.html" : "index.html";
            const newBrand = `<a href="${linkTarget}" class="header-brand" style="display:inline-flex; align-items:center; gap:8px;">
            ${SMALL_LOGO_IMG}
            <span>PitaPrompt</span>
        </a>`;
            content = content.replace(oldBrandRegex, newBrand);
        }
    }
    
    fs.writeFileSync(filepath, content, 'utf-8');
    console.log(`Updated ${fileObj.name}`);
});

console.log("HTML logos implemented successfully.");
