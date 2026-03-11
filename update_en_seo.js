const fs = require('fs');

const filepath = 'c:\\Users\\user\\Desktop\\20260306 ai-prompt-builder\\index.html';
let content = fs.readFileSync(filepath, 'utf-8');

// Title
content = content.replace(
    /<title>.*?<\/title>/,
    '<title>PitaPrompt \u2013 Turn Rough Notes Into Clearer AI Prompts</title>'
);

// Meta description
content = content.replace(
    /<meta name="description" content=".*?">/,
    '<meta name="description" content="Turn rough notes into clearer prompts that AI can follow better. Reduce the “almost right but still wrong” loop when using AI.">'
);

// OG Title & Twitter Title
content = content.replace(
    /<meta property="og:title" content=".*?">/,
    '<meta property="og:title" content="PitaPrompt \u2013 Turn Rough Notes Into Clearer AI Prompts">'
);
content = content.replace(
    /<meta name="twitter:title" content=".*?">/,
    '<meta name="twitter:title" content="PitaPrompt \u2013 Turn Rough Notes Into Clearer AI Prompts">'
);

// OG Desc & Twitter Desc
content = content.replace(
    /<meta property="og:description" content=".*?">/,
    '<meta property="og:description" content="Turn rough notes into clearer prompts that AI can follow better. Reduce the “almost right but still wrong” loop when using AI.">'
);
content = content.replace(
    /<meta name="twitter:description" content=".*?">/,
    '<meta name="twitter:description" content="Turn rough notes into clearer prompts that AI can follow better. Reduce the “almost right but still wrong” loop when using AI.">'
);

// JSON LD Description
content = content.replace(
    /"description": ".*?"/,
    '"description": "Turn rough notes into clearer prompts that AI can follow better. Reduce the “almost right but still wrong” loop when using AI."'
);

// Hero Pain
content = content.replace(
    /<p class="hero-pain">.*?<\/p>/,
    '<p class="hero-pain">Turn rough notes into clearer AI prompts</p>'
);

// Hero Solution
content = content.replace(
    /<p class="hero-solution">.*?<\/p>/s,
    '<p class="hero-solution">Paste messy notes or vague instructions, and PitaPrompt rewrites them into a prompt AI can follow more reliably.</p>'
);

fs.writeFileSync(filepath, content, 'utf-8');
console.log('Update complete.');
