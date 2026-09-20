const db = require('../config/db');

class Plan {
    static async createPlan(data) {
        const result = await db.query(
            `INSERT INTO Plan 
                (user_id, plan_purpose, product_name, product_category, product_description, 
                 demographics_age, demographics_gender, audience_description, plan_goal, plan_channel) 
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) 
             RETURNING plan_id`,
            [
                data.userId,
                data.planPurpose,
                data.productName,
                data.productCategory,
                data.productDescription,
                data.demographicsAge,
                data.demographicsGender,
                data.audienceDescription,
                data.planGoal,
                data.planChannel,
            ]
        );

        const planId = result.rows[0].plan_id;

        if (Array.isArray(data.interests) && data.interests.length > 0) {
            await this.addPlanInterests(planId, data.interests);
        }

        return planId;
    }

    static async addPlanInterests(planId, interests) {
        const uniqueInterests = [...new Set(interests.map((item) => String(item).trim()).filter(Boolean))];

        for (const interestName of uniqueInterests) {
            const result = await db.query(
                "SELECT interest_id FROM Interest WHERE interest_name = $1",
                [interestName]
            );

            let interestId = result.rows[0]?.interest_id;

            if (!interestId) {
                const insertResult = await db.query(
                    "INSERT INTO Interest (interest_name) VALUES ($1) RETURNING interest_id",
                    [interestName]
                );
                interestId = insertResult.rows[0].interest_id;
            }

            await db.query(
                "INSERT INTO PlanInterest (plan_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
                [planId, interestId]
            );
        }
    }

    static async getPlanById(planId) {
        const result = await db.query(
            "SELECT * FROM Plan WHERE plan_id = $1",
            [planId]
        );
        return result.rows[0] || null;
    }

    static async getPlanByUser(userId) {
        const result = await db.query(
            `SELECT * FROM Plan WHERE user_id = $1 ORDER BY created_at DESC`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) return [];

        const planIds = result.rows.map(p => p.plan_id);

        const [
            recommendations,
            captions,
            platforms,
            ideas,
            alternates
        ] = await Promise.all([
            db.query(
                `SELECT * FROM Recommendation WHERE plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT c.* FROM Caption c 
                 JOIN Recommendation r ON c.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT pl.* FROM Platform pl 
                 JOIN Recommendation r ON pl.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT i.* FROM Idea i 
                 JOIN Recommendation r ON i.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT a.* FROM alternate a 
                 JOIN Idea i ON a.idea_id = i.idea_id 
                 JOIN Recommendation r ON i.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            )
        ]);

        return result.rows.map(plan => {
            const planRecs = recommendations.filter(r => r.plan_id === plan.plan_id);

            const formattedRecs = planRecs.map(rec => {
                const recId = rec.recommendation_id;

                const recIdeas = ideas
                    .filter(i => i.recommendation_id === recId)
                    .map(idea => ({
                        ...idea,
                        alternates: alternates.filter(alt => alt.idea_id === idea.idea_id)
                    }));

                return {
                    ...rec,
                    captions: captions.filter(c => c.recommendation_id === recId),
                    platform_predictions: platforms.filter(p => p.recommendation_id === recId),
                    ideas: recIdeas
                };
            });

            return {
                ...plan,
                recommendations: formattedRecs
            };
        });
    }

    static async createSavedPlan(data) {
        const result = await db.query(
            'INSERT INTO "SavedPlan" (user_id, plan_id) VALUES ($1, $2) RETURNING *',
            [data.userId, data.planId]
        );
        return result.rows[0];
    }

    static async viewSavedPlan(userId) {
        const result = await db.query(
            `SELECT p.*, s.* FROM SavedPlan s JOIN Plan p ON s.plan_id = p.plan_id WHERE s.user_id = $1 ORDER BY s.created_at DESC`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) return [];

        const planIds = result.rows.map(p => p.plan_id);

        const [
            recommendations,
            captions,
            platforms,
            ideas,
            alternates
        ] = await Promise.all([
            db.query(
                `SELECT * FROM Recommendation WHERE plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT c.* FROM Caption c 
                 JOIN Recommendation r ON c.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT pl.* FROM Platform pl 
                 JOIN Recommendation r ON pl.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT i.* FROM Idea i 
                 JOIN Recommendation r ON i.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            ),
            db.query(
                `SELECT a.* FROM alternate a 
                 JOIN Idea i ON a.idea_id = i.idea_id 
                 JOIN Recommendation r ON i.recommendation_id = r.recommendation_id 
                 WHERE r.plan_id = ANY($1::int[])`,
                [planIds]
            )
        ]);

        return result.rows.map(plan => {
            const planRecs = recommendations.filter(r => r.plan_id === plan.plan_id);

            const formattedRecs = planRecs.map(rec => {
                const recId = rec.recommendation_id;

                const recIdeas = ideas
                    .filter(i => i.recommendation_id === recId)
                    .map(idea => ({
                        ...idea,
                        alternates: alternates.filter(alt => alt.idea_id === idea.idea_id)
                    }));

                return {
                    ...rec,
                    captions: captions.filter(c => c.recommendation_id === recId),
                    platform_predictions: platforms.filter(p => p.recommendation_id === recId),
                    ideas: recIdeas
                };
            });

            return {
                ...plan,
                recommendations: formattedRecs
            };
        });
    }

    static async getInterests() {
        const result = await db.query("SELECT * FROM Interest");
        return result.rows || [];
    }

    static async getDashboardData(userId) {
        const result = await db.query(
            `SELECT 
                (SELECT COUNT(*) FROM "Plan" WHERE user_id = $1)::integer AS "planCount",
                (SELECT COUNT(*) FROM "SavedPlan" WHERE user_id = $1)::integer AS "savedCount"`,
            [userId]
        );
        return result.rows[0] || null;
    }

    static async getRecentPlan(userId) {
        const result = await db.query(
            `SELECT 
                p.plan_id,
                p.user_id,
                p.plan_purpose,
                p.product_name,
                p.product_category,
                p.product_description,
                p.demographics_age,
                p.demographics_gender,
                p.audience_description,
                p.plan_goal,
                p.plan_channel,
                p.created_at,
                plat.platform_id,
                plat.platform,
                plat.prediction
             FROM Plan p
             LEFT JOIN Recommendation r ON p.plan_id = r.plan_id
             LEFT JOIN Platform plat ON r.recommendation_id = plat.recommendation_id
             WHERE p.user_id = $1
             ORDER BY p.created_at DESC`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) return [];

        const plansMap = new Map();

        for (const row of result.rows) {
            if (!plansMap.has(row.plan_id)) {
                if (plansMap.size === 2) break;

                plansMap.set(row.plan_id, {
                    plan_id: row.plan_id,
                    user_id: row.user_id,
                    plan_purpose: row.plan_purpose,
                    product_name: row.product_name,
                    product_category: row.product_category,
                    product_description: row.product_description,
                    demographics_age: row.demographics_age,
                    demographics_gender: row.demographics_gender,
                    audience_description: row.audience_description,
                    plan_goal: row.plan_goal,
                    plan_channel: row.plan_channel,
                    created_at: row.created_at,
                    platform_predictions: []
                });
            }

            if (row.platform_id) {
                plansMap.get(row.plan_id).platform_predictions.push({
                    platform_id: row.platform_id,
                    platform: row.platform,
                    prediction: row.prediction
                });
            }
        }

        return Array.from(plansMap.values());
    }

    static async deleteSaved(userId, savedId) {
        await db.query(
            `DELETE FROM SavedPlan WHERE user_id = $1 AND plan_id = $2`,
            [userId, savedId]
        );
    }
}

module.exports = Plan;
