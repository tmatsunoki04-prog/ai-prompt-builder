const fs = require('fs');
const path = require('path');

const DIR = __dirname;

function updateHtml(filename, title, description, canonicalUrl, faqData, extraFooter = null) {
    const filepath = path.join(DIR, filename);
    let content = fs.readFileSync(filepath, 'utf-8');
    
    // Update title
    content = content.replace(/<title>.*?<\/title>/s, `<title>${title}</title>`);
    
    // Update description
    content = content.replace(/<meta name="description" content=".*?">/, `<meta name="description" content="${description}">`);
    
    // Add canonical if not exists
    if (!content.includes('<link rel="canonical"')) {
        content = content.replace('<link rel="stylesheet" href="styles.css">', `<link rel="canonical" href="${canonicalUrl}">\n    <link rel="stylesheet" href="styles.css">`);
    }
    
    // Add FAQ JSON-LD if not exists and faqData provided
    if (faqData && !content.includes('<script type="application/ld+json">')) {
        const ldJson = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": faqData.map(item => ({
                "@type": "Question",
                "name": item[0],
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": item[1]
                }
            }))
        };
        const jsonStr = JSON.stringify(ldJson, null, 2);
        const scriptTag = `\n    <script type="application/ld+json">\n${jsonStr}\n    </script>\n</head>`;
        content = content.replace('</head>', scriptTag);
    }
        
    // Append extra footer (internal links) for index-ja.html
    if (extraFooter && filename === 'index-ja.html' && !content.includes('chatgpt-does-not-understand')) {
        const footerLinksTarget = '<div class="footer-links">';
        content = content.replace(footerLinksTarget, extraFooter + '\n        ' + footerLinksTarget);
    }

    fs.writeFileSync(filepath, content, 'utf-8');
}

// --- index-ja.html ---
const faqJa = [
    ["AIにより良い質問をするには", "明確な役割から始め、目的を具体的に定義し、文字数やフォーマットなどの制約を追加して、最終的な出力形式を指定します。PitaPromptは、その構造を自動的に処理します。"],
    ["プロンプトとは何ですか", "プロンプトとは、AIシステムに与える指示や質問のことです。AIがあなたの必要なものと、どのように応答すべきかを理解するためのガイドとなります。"],
    ["AIの回答が良くない時があるのはなぜですか", "AIモデルには心を読む能力はありません。プロンプトが短すぎたり曖昧だったりすると、AIはあなたの意図を推測し、結果として一般的であったり不正確な回答になりがちです。"]
];

const extraFooterJa = `<div class="footer-links" style="justify-content: center; margin-bottom: 1.5rem; gap: 1.5rem; flex-wrap: wrap;">
            <a href="chatgpt-does-not-understand.html">ChatGPTに伝わらない時の対処法</a>
            <a href="why-ai-misunderstands-intent.html">AIがくみ取らない理由</a>
            <a href="rough-notes-to-ai-prompts.html">雑なメモをAIに伝える方法</a>
        </div>`;

updateHtml('index-ja.html', 
            "PitaPrompt (ピタプロン) | 雑なメモをAIに伝わる指示へ変換", 
            "「何度やってもChatGPTに伝わらない…」そんなイライラはもう終わり。頭の中にある雑なメモをそのまま投げ込むだけで、AIが確実に理解できる形へ自動で整えます。登録不要、今すぐ無料で使えます。", 
            "https://pitaprompt.com/index-ja.html",
            faqJa,
            extraFooterJa);

// --- index.html ---
const faqEn = [
    ["How to ask AI better questions?", "Start with a clear role, define your goal specifically, add constraints like word count or format, and specify the final output format. Our tool handles this structure for you automatically."],
    ["What is a prompt?", "A prompt is the instruction or question you give to an Artificial Intelligence system. It guides the AI to understand what you need and how to respond."],
    ["Why are AI answers sometimes unhelpful?", "AI models lack mind-reading abilities. If a prompt is too brief or ambiguous, the AI guesses your intent, which often leads to generic or incorrect answers."]
];

updateHtml('index.html', 
            "PitaPrompt | Transform Rough Notes into Perfect AI Instructions", 
            "AI just doesn't get what you're trying to say? PitaPrompt fixes that. Drop your rough ideas into our tool, and we'll format them into clear instructions that AI perfectly understands. Free to use, no sign up required.", 
            "https://pitaprompt.com/",
            faqEn);

// --- SEO Pages ---
const seoPages = [
    {
        file: "chatgpt-does-not-understand.html",
        title: "ChatGPTに思い通り動いてもらう対処法 | PitaPrompt",
        desc: "「何度やり直してもChatGPTに意図が伝わらない…」そんな時の原因と対処法を解説。難しい知識がなくても、PitaPromptを使えばAIを思い通りに動かせるようになります。",
        faq: [
            ["本当に適当な言葉でも大丈夫ですか？", "はい。文法が間違っていても、箇条書きのメモのままでも、AIが文脈を整理して伝わりやすい形に整えます。"],
            ["ChatGPT以外のAIでも使えますか？", "はい。生成される依頼文は、ClaudeやGeminiなど、様々なAIが理解しやすい汎用的な形式になっています。"]
        ]
    },
    {
        file: "why-ai-misunderstands-intent.html",
        title: "AIが意図をくみ取ってくれない理由と改善のコツ | PitaPrompt",
        desc: "「AIから的外れな回答が返ってくる…」その根本的な理由と、改善する伝え方のコツをご紹介します。PitaPromptなら直感的な操作でAIとのズレを一瞬で直せます。",
        faq: [
            ["本当に思いついたままでいいんですか？", "はい。抜け漏れがあればPitaPromptが「もっと狙い通りにするための質問」を出してくれるので、それに答えていくだけで自然と伝わる形になります。"],
            ["登録や課金は必要ですか？", "いいえ、面倒な登録は不要で、ブラウザから今すぐ無料でご利用いただけます。"]
        ]
    },
    {
        file: "rough-notes-to-ai-prompts.html",
        title: "頭の中の雑なメモを、AIに伝わる形にする方法 | PitaPrompt",
        desc: "アイデアや雑な箇条書きメモを、AIがそのまま作業できる「伝わる形」に整える方法をご紹介します。ツールに丸投げして、面倒な文章化を終わらせましょう。",
        faq: [
            ["本当に単語の羅列だけでもいいんですか？", "はい。文の繋がりがなくても大丈夫です。関連性の薄い単語ばかりの場合は、足りない要素についてAIから質問形式で補足をお願いすることがあります。"],
            ["アプリのインストールは必要ですか？", "いいえ、Webブラウザ上で動くため、スマホからでもPCからでもその場ですぐに使えます。"]
        ]
    }
];

seoPages.forEach(p => {
    updateHtml(p.file, p.title, p.desc, `https://pitaprompt.com/${p.file}`, p.faq);
});

console.log("Updated HTML files successfully.");
