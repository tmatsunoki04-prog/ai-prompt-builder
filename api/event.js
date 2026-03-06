// This endpoint handles anonymous event logging for generating, copying, and sharing.
// MVP Constraints: We MUST NOT log IP addresses, PII, or the raw input text.

module.exports = (req, res) => {
    const { event_type, category, input_length_bucket, prompt_features, timestamp } = req.body;

    if (!event_type) {
        return res.status(400).json({ error: 'event_type is required' });
    }

    // Allowable events
    const validEvents = ['generate', 'copy', 'share'];
    if (!validEvents.includes(event_type)) {
        return res.status(400).json({ error: 'Invalid event type' });
    }

    // Create the anonymous log object
    // Notice that no IP address or input text is being included.
    const logEntry = {
        event_type,
        category: category || 'unknown',
        input_length_bucket: input_length_bucket || 'unknown',
        prompt_features: prompt_features || {},
        timestamp: timestamp || new Date().toISOString()
    };

    // For MVP, we are just outputting this to the server console.
    // In a production app, this might go to an analytics DB or server log.
    console.log('[ANONYMOUS EVENT LOGGING]', JSON.stringify(logEntry));

    // Acknowledge receipt
    res.status(200).json({ success: true });
};
