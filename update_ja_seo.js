const fs = require('fs');

const filepath = 'c:\\Users\\user\\Desktop\\20260306 ai-prompt-builder\\index-ja.html';
let content = fs.readFileSync(filepath, 'utf-8');

// 1. Title
content = content.replace(
    /<title>.*?<\/title>/,
    '<title>PitaPrompt（ピタプロンプト）｜雑なメモをAIに伝わるプロンプトに整えるツール</title>'
);

// 2. Meta description
content = content.replace(
    /<meta name="description" content=".*?">/,
    '<meta name="description" content="雑なメモや曖昧な依頼を、AIに伝わるプロンプトに整えるツール。AIにちゃんと入れたのに“なんか違う”を減らします。">'
);

// 3. OG / Twitter Title
content = content.replace(
    /<meta property="og:title" content=".*?">/,
    '<meta property="og:title" content="PitaPrompt（ピタプロンプト）｜雑なメモをAIに伝わるプロンプトに整えるツール">'
);
content = content.replace(
    /<meta name="twitter:title" content=".*?">/,
    '<meta name="twitter:title" content="PitaPrompt（ピタプロンプト）｜雑なメモをAIに伝わるプロンプトに整えるツール">'
);

// 4. OG / Twitter Description
content = content.replace(
    /<meta property="og:description" content=".*?">/,
    '<meta property="og:description" content="雑なメモや曖昧な依頼を、AIに伝わるプロンプトに整えるツール。AIにちゃんと入れたのに“なんか違う”を減らします。">'
);
content = content.replace(
    /<meta name="twitter:description" content=".*?">/,
    '<meta name="twitter:description" content="雑なメモや曖昧な依頼を、AIに伝わるプロンプトに整えるツール。AIにちゃんと入れたのに“なんか違う”を減らします。">'
);

// 5. JSON LD Description
content = content.replace(
    /"description": ".*?"/,
    '"description": "雑なメモや曖昧な依頼を、AIに伝わるプロンプトに整えるツール。AIにちゃんと入れたのに“なんか違う”を減らします。"'
);

// 6. Hero Pain
content = content.replace(
    /<p class="hero-pain">.*?<\/p>/,
    '<p class="hero-pain">雑なメモを、AIに伝わるプロンプトへ</p>'
);

// 7. Hero Solution (Maintaining the previously added mobile line break layout)
content = content.replace(
    /<p class="hero-solution">.*?<\/p>/,
    '<p class="hero-solution">頭の中のメモや曖昧な依頼をいれるだけで、<br class="sp-br">AIが理解しやすい<br class="pc-br"><br class="sp-br">プロンプトの形に整えます。</p>'
);

fs.writeFileSync(filepath, content, 'utf-8');
console.log('Japanese SEO/AEO update complete.');
