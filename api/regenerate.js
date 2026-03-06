const { GoogleGenerativeAI } = require('@google/generative-ai');

module.exports = async (req, res) => {
    const { original_input, answers } = req.body;

    if (!original_input || typeof original_input !== 'string') {
        return res.status(400).json({ error: 'Original input is required' });
    }

    if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: 'GEMINI_API_KEY environment variable is missing.' });
    }

    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const systemInstruction = `You are a structural AI assistant that creates highly effective AI prompts.
The user has provided their original goal, along with answers to clarifying questions.
Your task is to generate the FINAL, comprehensive prompt that the user can copy and paste into an AI.

Output MUST be valid raw JSON only, without markdown formatting.

Keys required:
- "generated_prompt": The final constructed AI prompt. 

The final prompt MUST be formatted as follows:

You are an expert consultant in the relevant field.

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
3. Important considerations`;

        const promptText = `User original goal:\n${original_input}\n\nAdditional information provided by user:\n${JSON.stringify(answers || {})}`;
        const result = await model.generateContent(`${systemInstruction}\n\n${promptText}`);
        let responseText = result.response.text().trim();

        if (responseText.startsWith('\`\`\`json')) {
            responseText = responseText.replace(/^\`\`\`json\s*/, '').replace(/\s*\`\`\`$/, '');
        } else if (responseText.startsWith('\`\`\`')) {
            responseText = responseText.replace(/^\`\`\`\s*/, '').replace(/\s*\`\`\`$/, '');
        }

        const aiResponseJson = JSON.parse(responseText);

        res.json({
            generated_prompt: aiResponseJson.generated_prompt
        });
    } catch (error) {
        console.error("AI Regeneration Error:", error);
        return res.status(500).json({ error: 'Failed to regenerate prompt from AI' });
    }
};
