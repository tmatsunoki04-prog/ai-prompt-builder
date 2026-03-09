import os
import json
import re

DIR = r"c:\Users\user\Desktop\20260306 ai-prompt-builder"

def update_html(filename, title, description, canonical_url, faq_data, extra_footer=None):
    filepath = os.path.join(DIR, filename)
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Update title
    content = re.sub(r'<title>.*?</title>', f'<title>{title}</title>', content, flags=re.DOTALL)
    # Update description
    content = re.sub(r'<meta name="description" content=".*?">', f'<meta name="description" content="{description}">', content)
    
    # Add canonical if not exists
    if '<link rel="canonical"' not in content:
        content = content.replace('<link rel="stylesheet" href="styles.css">', f'<link rel="canonical" href="{canonical_url}">\n    <link rel="stylesheet" href="styles.css">')
    
    # Add FAQ JSON-LD if not exists and faq_data provided
    if faq_data and '<script type="application/ld+json">' not in content:
        ld_json = {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {
                    "@type": "Question",
                    "name": q,
                    "acceptedAnswer": {
                        "@type": "Answer",
                        "text": a
                    }
                } for q, a in faq_data
            ]
        }
        json_str = json.dumps(ld_json, ensure_ascii=False, indent=2)
        script_tag = f'\n    <script type="application/ld+json">\n{json_str}\n    </script>\n</head>'
        content = content.replace('</head>', script_tag)
        
    # Append extra footer (internal links) for index-ja.html
    if extra_footer and filename == 'index-ja.html' and 'chatgpt-does-not-understand' not in content:
        footer_links_target = '<div class="footer-links">'
        content = content.replace(footer_links_target, extra_footer + '\n        ' + footer_links_target, 1)

    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)


# --- index-ja.html ---
faq_ja = [
    ("AIにより良い質問をするには", "明確な役割から始め、目的を具体的に定義し、文字数やフォーマットなどの制約を追加して、最終的な出力形式を指定します。PitaPromptは、その構造を自動的に処理します。"),
    ("プロンプトとは何ですか", "プロンプトとは、AIシステムに与える指示や質問のことです。AIがあなたの必要なものと、どのように応答すべきかを理解するためのガイドとなります。"),
    ("AIの回答が良くない時があるのはなぜですか", "AIモデルには心を読む能力はありません。プロンプトが短すぎたり曖昧だったりすると、AIはあなたの意図を推測し、結果として一般的であったり不正確な回答になりがちです。")
]

extra_footer_ja = """<div class="footer-links" style="justify-content: center; margin-bottom: 1.5rem; gap: 1.5rem; flex-wrap: wrap;">
            <a href="chatgpt-does-not-understand.html">ChatGPTに伝わらない時の対処法</a>
            <a href="why-ai-misunderstands-intent.html">AIがくみ取ってくれない理由</a>
            <a href="rough-notes-to-ai-prompts.html">雑なメモをAIに伝える方法</a>
        </div>"""

update_html('index-ja.html', 
            title="PitaPrompt (ピタプロン) | 雑なメモをAIに伝わる指示へ変換", 
            description="「何度やってもChatGPTに伝わらない…」そんなイライラはもう終わり。頭の中にある雑なメモをそのまま投げ込むだけで、AIが確実に理解できる形へ自動で整えます。登録不要、今すぐ無料で使えます。", 
            canonical_url="https://pitaprompt.com/index-ja.html",
            faq_data=faq_ja,
            extra_footer=extra_footer_ja)

# --- index.html ---
faq_en = [
    ("How to ask AI better questions?", "Start with a clear role, define your goal specifically, add constraints like word count or format, and specify the final output format. Our tool handles this structure for you automatically."),
    ("What is a prompt?", "A prompt is the instruction or question you give to an Artificial Intelligence system. It guides the AI to understand what you need and how to respond."),
    ("Why are AI answers sometimes unhelpful?", "AI models lack mind-reading abilities. If a prompt is too brief or ambiguous, the AI guesses your intent, which often leads to generic or incorrect answers.")
]

update_html('index.html', 
            title="PitaPrompt | Transform Rough Notes into Perfect AI Instructions", 
            description="AI just doesn't get what you're trying to say? PitaPrompt fixes that. Drop your rough ideas into our tool, and we'll format them into clear instructions that AI perfectly understands. Free to use, no sign up required.", 
            canonical_url="https://pitaprompt.com/",
            faq_data=faq_en)

# --- SEO Pages ---
seo_pages = [
    {
        "file": "chatgpt-does-not-understand.html",
        "title": "ChatGPTに思い通り動いてもらう対処法 | PitaPrompt",
        "desc": "「何度やり直してもChatGPTに意図が伝わらない…」そんな時の原因と対処法を解説。難しい知識がなくても、PitaPromptを使えばAIを思い通りに動かせるようになります。",
        "faq": [
            ("本当に適当な言葉でも大丈夫ですか？", "はい。文法が間違っていても、箇条書きのメモのままでも、AIが文脈を整理して伝わりやすい形に整えます。"),
            ("ChatGPT以外のAIでも使えますか？", "はい。生成される依頼文は、ClaudeやGeminiなど、様々なAIが理解しやすい汎用的な形式になっています。")
        ]
    },
    {
        "file": "why-ai-misunderstands-intent.html",
        "title": "AIが意図をくみ取ってくれない理由と改善のコツ | PitaPrompt",
        "desc": "「AIから的外れな回答が返ってくる…」その根本的な理由と、改善する伝え方のコツをご紹介します。PitaPromptなら直感的な操作でAIとのズレを一瞬で直せます。",
        "faq": [
            ("本当に思いついたままでいいんですか？", "はい。抜け漏れがあればPitaPromptが「もっと狙い通りにするための質問」を出してくれるので、それに答えていくだけで自然と伝わる形になります。"),
            ("登録や課金は必要ですか？", "いいえ、面倒な登録は不要で、ブラウザから今すぐ無料でご利用いただけます。")
        ]
    },
    {
        "file": "rough-notes-to-ai-prompts.html",
        "title": "頭の中の雑なメモを、AIに伝わる形にする方法 | PitaPrompt",
        "desc": "アイデアや雑な箇条書きメモを、AIがそのまま作業できる「伝わる形」に整える方法をご紹介します。ツールに丸投げして、面倒な文章化を終わらせましょう。",
        "faq": [
            ("本当に単語の羅列だけでもいいんですか？", "はい。文の繋がりがなくても大丈夫です。関連性の薄い単語ばかりの場合は、足りない要素についてAIから質問形式で補足をお願いすることがあります。"),
            ("アプリのインストールは必要ですか？", "いいえ、Webブラウザ上で動くため、スマホからでもPCからでもその場ですぐに使えます。")
        ]
    }
]

for p in seo_pages:
    update_html(p["file"], p["title"], p["desc"], f"https://pitaprompt.com/{p['file']}", p["faq"])

print("Updated HTML files successfully.")
