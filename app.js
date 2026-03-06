document.addEventListener('DOMContentLoaded', () => {
    const inputArea = document.getElementById('prompt-input');
    const generateBtn = document.getElementById('generate-btn');
    const resultSection = document.getElementById('result-section');
    const promptOutput = document.getElementById('prompt-output');
    const copyBtn = document.getElementById('copy-btn');
    const shareBtn = document.getElementById('share-btn');

    let currentIntentCategory = 'unknown';
    let currentIntentSubtype = 'unknown';
    let currentIntentAction = 'unknown';
    let currentPromptStr = '';
    // ブラウザメモリ上の一時保持のみ。localStorage / sessionStorage / cookie / analytics には保存しない
    let currentOriginalInput = '';

    // Core function to send tracking events (Fire & Forget)
    const logEvent = (eventType, inputLength) => {
        try {
            let lengthBucket = 'small';
            if (typeof inputLength === 'number') {
                if (inputLength > 50) lengthBucket = 'medium';
                if (inputLength > 200) lengthBucket = 'large';
            }

            fetch('/api/event', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    event_type: eventType,
                    intent_category: currentIntentCategory,
                    intent_subtype: currentIntentSubtype,
                    intent_action: currentIntentAction,
                    input_length_bucket: lengthBucket,
                    timestamp: new Date().toISOString()
                })
            }).catch(e => {
                // Silently swallow network errors for analytics to preserve UI flow
                console.warn('Anonymous tracking silently failed');
            });
        } catch (error) {
            // General catch-all to ensure tracking never breaks the main app
            console.warn('Tracking setup error');
        }
    };

    // Handle Generation
    generateBtn.addEventListener('click', async () => {
        const text = inputArea.value.trim();
        if (!text) return;

        currentOriginalInput = text;
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
                currentIntentCategory = data.intent_category;
                currentIntentSubtype = data.intent_subtype;
                currentIntentAction = data.intent_action;

                // Show result
                document.getElementById('intent-summary-output').textContent = data.intent_summary;

                const missingInfoContainer = document.getElementById('missing-info-output');
                missingInfoContainer.innerHTML = ''; // clear previous

                if (Array.isArray(data.missing_information) && data.missing_information.length > 0) {
                    data.missing_information.forEach((question, index) => {
                        const itemDiv = document.createElement('div');
                        itemDiv.className = 'missing-info-item';

                        const label = document.createElement('label');
                        label.className = 'missing-info-label';
                        label.textContent = `${index + 1}. ${question}`;

                        const input = document.createElement('input');
                        input.type = 'text';
                        input.className = 'missing-info-input';
                        input.dataset.question = question;
                        input.placeholder = 'Your answer...';

                        itemDiv.appendChild(label);
                        itemDiv.appendChild(input);
                        missingInfoContainer.appendChild(itemDiv);
                    });
                    document.getElementById('regenerate-group').classList.remove('hidden');
                } else {
                    missingInfoContainer.textContent = "No additional information requested.";
                    document.getElementById('regenerate-group').classList.add('hidden');
                }

                document.getElementById('prompt-stage').textContent = '(Initial)';
                document.getElementById('prompt-stage').style.color = 'var(--text-muted)';
                promptOutput.textContent = currentPromptStr;
                resultSection.classList.remove('hidden');

                // Track Event
                logEvent('generate', text.length);
            } else {
                const data = await response.json();
                alert(`Generation failed: ${data.error || response.statusText} (${response.status})`);
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                alert('Network Error: The local server is not running or unreachable. Please run `node server.js` and try again.');
            } else {
                alert(`Application Error: ${error.message}`);
            }
        } finally {
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Prompt';
        }
    });

    const regenerateBtn = document.getElementById('regenerate-btn');

    regenerateBtn.addEventListener('click', async () => {
        regenerateBtn.disabled = true;
        regenerateBtn.textContent = 'Generating...';

        try {
            const inputs = document.querySelectorAll('.missing-info-input');
            const answers = {};
            inputs.forEach(input => {
                if (input.value.trim() !== '') {
                    answers[input.dataset.question] = input.value.trim();
                }
            });

            const response = await fetch('/api/regenerate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    original_input: currentOriginalInput,
                    answers: answers,
                    intent_category: currentIntentCategory,
                    intent_subtype: currentIntentSubtype,
                    intent_action: currentIntentAction
                })
            });

            if (response.ok) {
                const data = await response.json();
                currentPromptStr = data.generated_prompt;
                currentIntentCategory = data.intent_category;
                currentIntentSubtype = data.intent_subtype;
                currentIntentAction = data.intent_action;

                // Show result
                promptOutput.textContent = currentPromptStr;
                document.getElementById('prompt-stage').textContent = '(Final)';
                document.getElementById('prompt-stage').style.color = 'var(--success-color)';

                // Track Event
                logEvent('regenerate', 0);
            } else {
                const data = await response.json();
                alert(`Regeneration failed: ${data.error || response.statusText} (${response.status})`);
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                alert('Network Error: The local server is not running or unreachable. Please run `node server.js` and try again.');
            } else {
                alert(`Application Error: ${error.message}`);
            }
        } finally {
            regenerateBtn.disabled = false;
            regenerateBtn.textContent = 'Regenerate Prompt';
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
            logEvent('copy', 0); // length is 0 since we only care about the action here
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
        logEvent('share', 0);
    });
});
