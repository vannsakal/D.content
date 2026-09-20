const Recommendation = require('../models/Recommendation');

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://127.0.0.1:8000';

const PURPOSES = ['Content Creator', 'Business', 'Existing Content'];
const GENDERS = ['Women', 'Men', 'All'];
const CHANNELS = ['TikTok', 'Instagram', 'Facebook'];

const getUserId = (req) => req.user.userId || req.user.id || req.user.user_id;

function validatePlanInput(b) {
    if (!PURPOSES.includes(b.plan_purpose)) return 'Invalid plan_purpose';
    if (!b.product_name) return 'product_name is required';
    if (!b.product_category) return 'product_category is required';
    if (!b.demographics_age) return 'demographics_age is required';
    if (b.demographics_gender && !GENDERS.includes(b.demographics_gender)) return 'Invalid demographics_gender';
    if (!Array.isArray(b.interests) || b.interests.length < 1) return 'At least one interest is required';
    if (!b.plan_goal) return 'plan_goal is required';
    if (!CHANNELS.includes(b.plan_channel)) return 'Invalid plan_channel';
    return null;
}

exports.createRecommendation = async (req, res) => {
    const body = req.body;

    const validationError = validatePlanInput(body);
    if (validationError) return res.status(400).json({ error: validationError });

    // 1. Run predict_ml_plan + generate_combined_response through the Python bridge
    let ml, ai;
    try {
        const response = await fetch(`${AI_SERVICE_URL}/recommendation`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
            signal: AbortSignal.timeout(90_000), // ai_service retries up to 3x with sleeps
        });
        if (!response.ok) {
            console.error('AI service error:', response.status, await response.text());
            return res.status(502).json({ error: 'Recommendation generation failed' });
        }
        const json = await response.json();
        ml = json.ml;
        ai = json.ai;
    } catch (err) {
        console.error('AI service unreachable:', err);
        return res.status(502).json({ error: 'Recommendation service unavailable' });
    }

    if (!ml || !ai) {
        return res.status(502).json({ error: 'Recommendation service returned incomplete data' });
    }

    // 2. Save Plan + Recommendation tree atomically
    try {
        const recommendation = await Recommendation.create(getUserId(req), body, ml, ai);
        return res.status(201).json({ recommendation });
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save recommendation' });
    }
};

exports.fetchRecommendation = async (req, res) => {
    try {
        const userId = getUserId(req);
        const recommendation = await Recommendation.getRecommendation(userId);

        return res.status(200).json({ recommendation });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Failed to fetch recommendation'
        });
    }
};