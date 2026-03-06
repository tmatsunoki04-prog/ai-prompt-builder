// This endpoint takes in the user's raw input and returns a structured AI prompt.
// MVP Constraint: we do not save the input data anywhere.

module.exports = (req, res) => {
    const { input } = req.body;

    if (!input || typeof input !== 'string') {
        return res.status(400).json({ error: 'Input is required' });
    }

    // 1. Categorize (Simple keyword-based categorization for MVP)
    let category = 'other';
    const lowerInput = input.toLowerCase();

    if (lowerInput.match(/write|essay|blog|article/)) category = 'writing';
    else if (lowerInput.match(/business|startup|idea|strategy/)) category = 'business';
    else if (lowerInput.match(/study|learn|explain|physics|math/)) category = 'study';
    else if (lowerInput.match(/code|program|script|debug/)) category = 'coding';
    else if (lowerInput.match(/translate|language|japanese|english/)) category = 'translation';

    // 2. Generate the structured prompt
    // This uses a predefined template for the MVP to avoid expensive API calls to an LLM.
    const generatedPrompt = `You are an expert consultant in the relevant field.

Goal: ${input}

Constraints:
1. Provide a highly actionable, structured answer.
2. If necessary, outline assumptions you are making.
3. Keep the language clear and concise.

Output format:
Please provide the output using clear headings, bullet points, and actionable next steps.`;

    // 3. Return the result and category
    // Data is safely returned without being persisted.
    res.json({
        prompt: generatedPrompt,
        category: category
    });
};
