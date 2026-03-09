const fs = require('fs');
const path = require('path');

const DIR = __dirname;
const OGP_IMAGE = "https://pitaprompt.com/ogp.jpg";

const SEOPagesMeta = [
    {
        name: "chatgpt-does-not-understand.html",
        linkText: "ChatGPTに思い通り動いてもらう対処法",
        title: "ChatGPTにうまく伝わらない時の対処法 | PitaPrompt"
    },
    {
        name: "why-ai-misunderstands-intent.html",
        linkText: "AIが意図をくみ取ってくれない理由と改善のコツ",
        title: "AIが意図をくみ取ってくれない理由と改善のコツ | PitaPrompt"
    },
    {
        name: "rough-notes-to-ai-prompts.html",
        linkText: "頭の中の雑なメモを、AIに伝わる形にする方法",
        title: "頭の中の雑なメモを、AIに伝わる形にする方法 | PitaPrompt"
    }
];

// Helper to rebuild FAQ Section HTML and JSON-LD
function updateFAQ(content, newFaqData) {
    // Rebuild HTML
    let newFaqHtml = `\n            <div class="faq-section">\n                <h2>よくある質問</h2>`;
    newFaqData.forEach(item => {
        newFaqHtml += `\n                <div class="faq-item">\n                    <h3>Q. ${item[0]}</h3>\n                    <p>${item[1]}</p>\n                </div>`;
    });
    newFaqHtml += `\n            </div>\n        </article>`;
    
    // Replace existing FAQ section HTML
    content = content.replace(/<div class="faq-section">[\s\S]*?<\/article>/i, newFaqHtml.trimStart());
    
    // Update JSON-LD FAQPage
    const ldJson = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": newFaqData.map(item => ({
            "@type": "Question",
            "name": item[0],
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item[1]
            }
        }))
    };
    const jsonStr = JSON.stringify(ldJson, null, 2);
    // Replace old FAQPage script
    content = content.replace(/<script type="application\/ld\+json">[\s\S]*?"@type": "FAQPage"[\s\S]*?<\/script>/, `<script type="application/ld+json">\n${jsonStr}\n    </script>`);
    return content;
}

function processFiles() {
    const files = [
        { name: "index-ja.html", type: "website" },
        { name: "index.html", type: "website" },
        { name: "chatgpt-does-not-understand.html", type: "article" },
        { name: "why-ai-misunderstands-intent.html", type: "article" },
        { name: "rough-notes-to-ai-prompts.html", type: "article" }
    ];

    files.forEach(fileObj => {
        const filepath = path.join(DIR, fileObj.name);
        let content = fs.readFileSync(filepath, 'utf-8');

        // Extract Title and Description cleanly
        const titleMatch = content.match(/<title>(.*?)<\/title>/is);
        const title = titleMatch ? titleMatch[1].trim() : "PitaPrompt";
        
        const descMatch = content.match(/<meta name="description" content="(.*?)">/is);
        const description = descMatch ? descMatch[1].trim() : "";
        
        const canonicalMatch = content.match(/<link rel="canonical" href="(.*?)">/is);
        const url = canonicalMatch ? canonicalMatch[1].trim() : `https://pitaprompt.com/${fileObj.name === 'index.html' ? '' : fileObj.name}`;

        // 1. Add/Update OGP & Twitter tags
        const ogpTags = `    <!-- OGP & Twitter Cards -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="${fileObj.type}">
    <meta property="og:url" content="${url}">
    <meta property="og:image" content="${OGP_IMAGE}">
    <meta property="og:site_name" content="PitaPrompt">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${OGP_IMAGE}">\n`;
        
        if (content.includes('<!-- OGP & Twitter Cards -->')) {
            content = content.replace(/<!-- OGP & Twitter Cards -->[\s\S]*?<meta name="twitter:image"[^>]+>\n/i, ogpTags);
        } else {
            content = content.replace('</head>', `${ogpTags}</head>`);
        }

        // 2. SoftwareApplication JSON-LD (Only for top pages)
        if (fileObj.type === 'website') {
            const swJson = {
                "@context": "https://schema.org",
                "@type": "SoftwareApplication",
                "name": "PitaPrompt",
                "applicationCategory": "WebApplication",
                "operatingSystem": "Web",
                "url": url,
                "description": description
            };
            const swTag = `    <script type="application/ld+json">\n${JSON.stringify(swJson, null, 2)}\n    </script>\n`;
            
            if (!content.includes('"@type": "SoftwareApplication"')) {
                content = content.replace('</head>', `${swTag}</head>`);
            }
        }

        // 3. Update FAQ
        if (fileObj.name === 'chatgpt-does-not-understand.html') {
            const faqData = [
                ["本当に適当な言葉でも大丈夫ですか？", "はい。文法が間違っていても、箇条書きのメモのままでも、AIが文脈を整理して伝わりやすい形に整えます。"],
                ["ChatGPT以外のAIでも使えますか？", "はい。生成される依頼文は、ClaudeやGeminiなど、様々なAIが理解しやすい汎用的な形式になっています。"],
                ["日本語でも英語でも使えますか？", "はい。入力した言語に合わせて、最適な指示書を出力します。海外のAIツールを英語で使いたい時などにも役立ちます。"]
            ];
            content = updateFAQ(content, faqData);
        } else if (fileObj.name === 'why-ai-misunderstands-intent.html') {
            const faqData = [
                ["本当に思いついたままでいいんですか？", "はい。抜け漏れがあればPitaPromptが「もっと狙い通りにするための質問」を出してくれるので、それに答えていくだけで自然と伝わる形になります。"],
                ["どんな用途に向いていますか？", "メールの作成、アイデア出し、資料の構成案、文章の要約など、AIに何かを依頼するすべての用途で使えます。"],
                ["登録や課金は必要ですか？", "いいえ、面倒な登録は不要で、ブラウザから今すぐ無料でご利用いただけます。"]
            ];
            content = updateFAQ(content, faqData);
        } else if (fileObj.name === 'rough-notes-to-ai-prompts.html') {
            const faqData = [
                ["本当に単語の羅列だけでもいいんですか？", "はい。文の繋がりがなくても大丈夫です。関連性の薄い単語ばかりの場合は、足りない要素についてAIから質問形式で補足をお願いすることがあります。"],
                ["ChatGPT以外でも使えますか？", "はい。ClaudeやGeminiなど、代表的なAIが理解しやすい汎用的なフォーマットで出力します。"],
                ["アプリのインストールは必要ですか？", "いいえ、Webブラウザ上で動くため、スマホでもPCでもその場ですぐに使えます。"]
            ];
            content = updateFAQ(content, faqData);
        }

        // 4. Update Internal Links
        if (fileObj.type === 'article') {
            const relatedLinks = SEOPagesMeta.filter(p => p.name !== fileObj.name);
            let linkHtml = `
            <div class="related-articles-box" style="margin-top: 3rem; margin-bottom: 2rem; padding: 1.5rem; background: #fafaf9; border-radius: var(--border-radius); border: 2px solid var(--border-light);">
                <h3 style="font-size: 1.05rem; margin-bottom: 1rem; margin-top: 0; font-weight: 700; color: var(--text-color);">📑 こちらの記事も読まれています</h3>
                <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                    ${relatedLinks.map(l => `<li><a href="${l.name}" style="color: var(--primary-color); text-decoration: underline; font-weight: 500;">${l.linkText}</a></li>`).join('')}
                </ul>
            </div>`;
            
            // Insert it before cta-section
            if (!content.includes('related-articles-box')) {
                content = content.replace('<div class="cta-section">', `${linkHtml}\n\n            <div class="cta-section">`);
            }
        }

        if (fileObj.name === 'index-ja.html') {
            const internalLinksTop = `
        <section class="related-articles-section" style="margin-top: 2rem; text-align: left; background: var(--card-bg); border-radius: var(--border-radius); border: 2px solid var(--border-color); padding: 1.5rem; box-shadow: 0 4px 16px rgba(41, 37, 36, 0.05);">
            <h2 style="font-size: 1.15rem; margin-bottom: 1rem; color: var(--text-color); margin-top: 0;">💡 こんな時におすすめ</h2>
            <ul style="list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 0.75rem;">
                ${SEOPagesMeta.map(l => `<li><a href="${l.name}" style="color: var(--primary-color); text-decoration: underline; font-weight: 500;">${l.title}</a></li>`).join('')}
            </ul>
        </section>\n
        <!-- Result Section (Hidden initially) -->`;
            
            if (!content.includes('related-articles-section')) {
                content = content.replace('<!-- Result Section (Hidden initially) -->', internalLinksTop);
            }
        }

        fs.writeFileSync(filepath, content, 'utf-8');
    });
}

processFiles();
console.log("SEO final enhancements completed successfully.");
