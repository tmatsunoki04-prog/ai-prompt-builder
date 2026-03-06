document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const resultSection = document.getElementById('result-section');
    const promptOutput = document.getElementById('prompt-output');
    const copyBtn = document.getElementById('copy-btn');
    const shareBtn = document.getElementById('share-btn');

    let currentCategory = 'other';
    let currentPromptStr = '';

    // Core function to send tracking events (Fire & Forget)
    const logEvent = (eventType, category, inputLength) => {
        let lengthBucket = 'small';
        if (inputLength > 50) lengthBucket = 'medium';
        if (inputLength > 200) lengthBucket = 'large';

        fetch('/api/event', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                event_type: eventType,
                category: category,
                input_length_bucket: lengthBucket,
                prompt_features: {
                    has_role: true,
                    has_constraints: true
                },
                timestamp: new Date().toISOString()
            })
        }).catch(e => console.error('Silent tracking error:', e));
    };

    // Handle Generation
    generateBtn.addEventListener('click', async () => {
        const text = inputArea.value.trim();
        if (!text) return;

        generateBtn.disabled = true;
        generateBtn.textContent = 'Generating...';

        try {
            const response = await fetch('/api/generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ input: text })
            });

            if (response.ok) {
                const data = await response.json();
                currentPromptStr = data.prompt;
                currentCategory = data.category;

                // Show result
                promptOutput.textContent = currentPromptStr;
                resultSection.classList.remove('hidden');

                // Track Event
                logEvent('generate', currentCategory, text.length);
            } else {
                alert('Generation failed, please try again.');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('An error occurred.');
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Prompt';
        }
    });

    // Handle Copy
    copyBtn.addEventListener('click', async () => {
        try {
            await navigator.clipboard.writeText(currentPromptStr);

            // Visual feedback
            const originalText = copyBtn.innerHTML;
            copyBtn.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color:#2ea043"><polyline points="20 6 9 17 4 12"></polyline></svg> Copied!';

            setTimeout(() => {
                copyBtn.innerHTML = originalText;
            }, 2000);

            // Track Event
            logEvent('copy', currentCategory, 0); // length is 0 since we only care about the action here
        } catch (err) {
            console.error('Failed to copy text: ', err);
            alert('Clipboard copy failed. Please select and copy manually.');
        }
    });

    // Handle Share
    shareBtn.addEventListener('click', () => {
        // App URL would be dynamically resolved in prod, assuming window.location
        const appUrl = encodeURIComponent(window.location.origin);
        const text = encodeURIComponent('Generated an AI prompt using this tool');
        const xShareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${appUrl}`;

        window.open(xShareUrl, '_blank', 'noopener,noreferrer');

        // Track Event
        logEvent('share', currentCategory, 0);
    });
});
