const Plan = require('../models/Plan');
const User = require('../models/User');

exports.createNewPlan = async (req, res) => {
    try {
        const { userId } = req.user;
        const userExists = await User.findById(userId);

        if (!userExists) {
            return res.status(401).json({ error: 'Authenticated user not found.' });
        }

        const {
            purpose: planPurpose,
            product: productName,
            category: productCategory,
            productDescription,
            age: demographicsAge,
            gender: demographicsGender,
            interests,
            audienceDescription,
            audience_description: audienceDescriptionAlt,
            goal: planGoal,
            channel: planChannel,
        } = req.body;

        const normalizedInterests = Array.isArray(interests)
            ? interests.map((item) => String(item).trim()).filter(Boolean)
            : (typeof interests === 'string' && interests.trim()
                ? interests.split(',').map((item) => item.trim()).filter(Boolean)
                : []);

        const normalizedAudienceDescription = audienceDescription || audienceDescriptionAlt || '';

        if (!userId || !planPurpose || !productName || !productCategory || !demographicsAge || !demographicsGender || normalizedInterests.length === 0 || !planChannel || !planGoal) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        const planId = await Plan.createPlan({
            userId,
            planPurpose,
            productName,
            productCategory,
            productDescription,
            demographicsAge,
            demographicsGender,
            interests: normalizedInterests,
            audienceDescription: normalizedAudienceDescription,
            planGoal,
            planChannel,
        });

        return res.status(201).json({
            message: 'Plan created successfully',
            planId,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Failed to create plan',
        });
    }
};

exports.findPlanById = async (req, res) => {
    try {
        const { planId } = req.params;
        const { userId } = req.user;

        const plan = await Plan.getPlanById(planId);

        if (!plan) {
            return res.status(404).json({
                error: 'Plan not found'
            });
        }
        if (plan.user_id !== userId) {
            return res.status(403).json({ 
                error: 'Forbidden access' 
            });
        }

        return res.status(200).json({ plan });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Failed to fetch plan'
        });
    }
};

exports.viewPlansHistory = async (req, res) => {
    try {
        const { userId } = req.user;

        const history = await Plan.getPlanByUser(userId);

        return res.status(200).json({ history });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Failed to fetch history'
        });
    }
};

exports.createNewSavedPlan = async (req, res) => {
    try {
        const { userId } = req.user;
        const { plan_id: planId } = req.body;

        if (!userId || !planId) {
            return res.status(400).json({ 
                error: 'Missing required fields' 
            });
        }
        
        const savedPlan = await Plan.createSavedPlan({
            userId,
            planId
        })
        return res.status(201).json({
            message: 'Plan saved successfully',
            planId
        });
        } catch (err) {
            console.error(err);
            res.status(500).json({
                error: 'Failed to create plan'
        });
    
    }
}

exports.viewSavedPlan = async (req, res) => {
    try {
        const { userId } = req.user;

        const saved = await Plan.viewSavedPlan(userId);

        return res.status(200).json({ saved });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: 'Failed to fetch saved plans'
        });
    }
};

exports.viewDashboardData = async (req, res) => {
    try {
        const { userId } = req.user;

        const data = await Plan.getDashboardData(userId);

        return res.status(200).json({ data });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Failed to fetch data'
        });
    }
};

exports.fetchRecentPlan = async (req, res) => {
    try {
        const { userId } = req.user;

        const recent = await Plan.getRecentPlan(userId);

        return res.status(200).json({ recent });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Failed to fetch recent plans'  
        });
    }
};

exports.viewInterest = async (req, res) => {
    try {
        const interestsData = await Plan.getInterests();

        // Safely extract names or fallback to an empty array
        const interestNames = Array.isArray(interestsData)
            ? interestsData.map(item => typeof item === 'string' ? item : item?.interest_name).filter(Boolean)
            : [];

        return res.status(200).json({ interests: interestNames });
    } catch (err) {
        console.error('Error in viewInterest:', err);
        return res.status(500).json({
            error: 'Failed to fetch interests'  
        });
    }
};


exports.deleteSaved = async (req,res) => {
    try {
        const { userId } = req.user;
         const savedId = req.params.planId;

        const saved = await Plan.deleteSaved(userId, savedId);
        console.log(`deleting ${saved}`);
        return res.status(200).json({saved})

    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: 'Failed to delete'  
        });
    }
}