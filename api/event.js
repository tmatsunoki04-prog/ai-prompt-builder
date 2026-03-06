// This endpoint handles anonymous event logging for generating, copying, and sharing.
// MVP Constraints: We MUST NOT log IP addresses, PII, or the raw input text.

module.exports = (req, res) => {
    const { event_type, intent_category, intent_subtype, intent_action, input_length_bucket, timestamp } = req.body;

    if (!event_type) {
        return res.status(400).json({ error: 'event_type is required' });
    }

    // Allowable events
    const validEvents = ['generate', 'copy', 'share', 'regenerate'];
    if (!validEvents.includes(event_type)) {
        return res.status(400).json({ error: 'Invalid event type' });
    }

    // Sanitize values to prevent large payload injections (max 50 chars)
    const sanitizeVal = (val) => (typeof val === 'string' ? val.substring(0, 50) : 'unknown');

    // Create the anonymous log object
    // Notice that no IP address or input text is being included.
    const logEntry = {
        event_type,
        intent_category: sanitizeVal(intent_category),
        intent_subtype: sanitizeVal(intent_subtype),
        intent_action: sanitizeVal(intent_action),
        input_length_bucket: sanitizeVal(input_length_bucket),
        timestamp: typeof timestamp === 'string' ? timestamp.substring(0, 30) : new Date().toISOString()
    };

    // For MVP, we are just outputting this to the server console.
    // In a production app, this might go to an analytics DB or server log.
    console.log('[ANONYMOUS EVENT LOGGING]', JSON.stringify(logEntry));

    // Acknowledge receipt
    res.status(200).json({ success: true });
};
