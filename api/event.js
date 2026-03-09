const { createClient } = require('@supabase/supabase-js');

// 最小限の接続設定
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;

module.exports = async (req, res) => {
    const { event_type, intent_category, intent_subtype, intent_action, input_length_bucket, timestamp } = req.body;

    if (!event_type) {
        return res.status(400).json({ error: 'event_type is required' });
    }

    const validEvents = ['generate', 'copy', 'share', 'regenerate'];
    if (!validEvents.includes(event_type)) {
        return res.status(400).json({ error: 'Invalid event type' });
    }

    const sanitizeIntent = (val) => {
        if (!val || typeof val !== 'string') return 'unknown';
        const cleaned = val.toLowerCase().replace(/[^a-z0-9_-]/g, '').substring(0, 50);
        return cleaned === '' ? 'unknown' : cleaned;
    };

    const validBuckets = ['small', 'medium', 'large', 'unknown'];
    const safeBucket = validBuckets.includes(input_length_bucket) ? input_length_bucket : 'unknown';

    const logEntry = {
        event_type,
        intent_category: sanitizeIntent(intent_category),
        intent_subtype: sanitizeIntent(intent_subtype),
        intent_action: sanitizeIntent(intent_action),
        input_length_bucket: safeBucket,
        timestamp: typeof timestamp === 'string' ? timestamp.substring(0, 30) : new Date().toISOString().substring(0, 30)
    };

    if (process.env.NODE_ENV === 'development') {
        console.log('[ANONYMOUS EVENT LOGGING]', JSON.stringify(logEntry));
    }

    // Supabaseへの保存処理
    if (supabase) {
        const { error } = await supabase
            .from('events')
            .insert([logEntry]);

        if (error) {
            console.error('Supabase Insert Error:', error);
            return res.status(500).json({ error: 'Failed to insert event log' });
        }
    }

    res.status(200).json({ success: true });
};
