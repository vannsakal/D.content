const express = require('express');
const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

router.get('/ai', async (req, res) => {
    try {
        const response = await fetch(AI_SERVICE_URL, {
            method: 'GET',
            signal: AbortSignal.timeout(3000),
        });
        if (!response.ok) {
            return res.json({ ai_service: 'degraded', status: response.status });
        }
        res.json({ ai_service: 'ok' });
    } catch (err) {
        res.json({ ai_service: 'unavailable', error: err.message });
    }
});

module.exports = router;
