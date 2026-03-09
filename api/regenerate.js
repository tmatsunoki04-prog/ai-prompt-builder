const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
    const { original_input, answers, language } = req.body;
    const isJa = language === 'ja';

    if (!original_input || typeof original_input !== 'string') {
        return res.status(400).json({ error: 'Original input is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

        const systemInstruction = `You are a structural AI assistant that creates highly effective AI prompts.
The user has provided their original goal, along with answers to clarifying questions.
Your task is to generate the FINAL, comprehensive prompt that the user can copy and paste into an AI.

Output MUST be valid raw JSON only, without markdown formatting.

Keys required:
- "generated_prompt": The final constructed AI prompt. ${isJa ? "(MUST BE IN JAPANESE)" : ""}

The final prompt MUST be formatted as follows:

${isJa ? `あなたは関連分野の専門コンサルタントです。

目的
[元の入力と回答を統合した最終的な目的を挿入]

背景
[新しい回答を統合した状況の背景を挿入]

制約
明確で構造化された回答を提供してください。
情報が不足している場合は、前提条件を明記してください。

出力形式
1. 重要な説明
2. 具体的な手順
3. 重要な考慮事項` : `You are an expert consultant in the relevant field.

Goal
[Insert the finalized goal incorporating the original input and answers]

Context
[Insert the situational background incorporating the new answers]

Constraints
Provide a clear and structured answer.
State assumptions when information is missing.

Output format
1. Key explanation
2. Practical steps
3. Important considerations`}`;

        const promptText = `User original goal:\n${original_input}\n\nAdditional information provided by user:\n${JSON.stringify(answers || {})}`;
        const result = await model.generateContent(`${systemInstruction}\n\n${promptText}`);
        let responseText = result.response.text().trim();

        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        const aiResponseJson = JSON.parse(responseText);

        const sanitizeIntent = (val) => {
            if (!val || typeof val !== 'string') return 'unknown';
            const cleaned = val.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 50);
            return cleaned === '' ? 'unknown' : cleaned;
        };

        // Note: original_input and answers are intentionally NOT saved and NOT output to console.
        res.json({
            generated_prompt: aiResponseJson.generated_prompt,
            intent_category: sanitizeIntent(req.body.intent_category),
            intent_subtype: sanitizeIntent(req.body.intent_subtype),
            intent_action: sanitizeIntent(req.body.intent_action)
        });
    } catch (error) {
        console.error("AI Regeneration Error:", error);
        return res.status(500).json({ error: 'Failed to regenerate prompt from AI' });
    }
};
