// This endpoint takes in the user's raw input and returns a structured AI prompt.
// MVP Constraint: we do not save the input data anywhere.
const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
    const { input, language } = req.body;
    const isJa = language === 'ja';

    if (!input || typeof input !== 'string') {
        return res.status(400).json({ error: 'Input is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    // 2. Call AI API to structure the prompt
    let aiResponseJson;
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        // Using flash for low latency/cost
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const systemInstruction = `You are a structural AI assistant that converts vague user inputs into structured fields.
Output MUST be valid raw JSON only, without markdown formatting.

Keys required:
- "intent_summary": A very brief 1-sentence summary of the user's intention. ${isJa ? "(MUST BE IN JAPANESE)" : ""}
- "goal": Rewrite the user's task into a clear, direct English statement. ${isJa ? "(MUST BE IN JAPANESE)" : ""}
- "context": A description of the user's situation or background inferred from the input. ${isJa ? "(MUST BE IN JAPANESE)" : ""}
- "missing_information": A JSON array of 3 to 5 strings, where each string is a question asking the user for additional information to improve their prompt. ${isJa ? "Example: [\"対象読者は誰ですか？\", \"予算はいくらですか？\"]. (MUST BE IN JAPANESE)" : "Example: [\"Who is your target audience?\", \"What is your budget?\"]."}
- "intent_category": A broad category (snake_case/lower-case-hyphen) of the request. E.g. business, marketing, study, coding.
- "intent_subtype": A sub-category (snake_case/lower-case-hyphen) of the request. E.g. education, youtube, web-development.
- "intent_action": The specific action (snake_case/lower-case-hyphen). E.g. start_school, improve_thumbnail, debug_error.
DO NOT quote raw user text into these three intent fields.`;

        const result = await model.generateContent(`${systemInstruction}\n\nUser Input:\n${input}`);
        let responseText = result.response.text().trim();

        // Clean markdown JSON block if present
        if (responseText.startsWith('```json')) {
            responseText = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (responseText.startsWith('```')) {
            responseText = responseText.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }

        aiResponseJson = JSON.parse(responseText);
    } catch (error) {
        console.error("AI Generation Error:", error);
        return res.status(500).json({ error: 'Failed to generate prompt structure from AI' });
    }

    // 3. Assemble the generated prompt template
    const generatedPrompt = isJa ? `あなたは関連分野の専門コンサルタントです。

目的
${aiResponseJson.goal}

背景
${aiResponseJson.context}

制約
明確で構造化された回答を提供してください。
情報が不足している場合は、前提条件を明記してください。

出力形式
1. 重要な説明
2. 具体的な手順
3. 重要な考慮事項` : `You are an expert consultant in the relevant field.

Goal
${aiResponseJson.goal}

Context
${aiResponseJson.context}

Constraints
Provide a clear and structured answer.
State assumptions when information is missing.

Output format
1. Key explanation
2. Practical steps
3. Important considerations`;

    // 4. Sanitize intent fields to guarantee no raw text leaks
    const sanitizeIntent = (val) => {
        if (!val || typeof val !== 'string') return 'unknown';
        const cleaned = val.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 50);
        return cleaned === '' ? 'unknown' : cleaned;
    };

    // 5. Return the complete result
    // Data is safely returned without being persisted.
    res.json({
        prompt: generatedPrompt,
        intent_category: sanitizeIntent(aiResponseJson.intent_category),
        intent_subtype: sanitizeIntent(aiResponseJson.intent_subtype),
        intent_action: sanitizeIntent(aiResponseJson.intent_action),
        intent_summary: aiResponseJson.intent_summary,
        missing_information: aiResponseJson.missing_information,
        goal: aiResponseJson.goal,
        context: aiResponseJson.context
    });
};
