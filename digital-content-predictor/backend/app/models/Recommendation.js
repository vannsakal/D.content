const db = require('../config/db');

const clip = (value, max) => String(value ?? '').slice(0, max);

class Recommendation {
    static async _assemble(rec) {
        const recId = rec.recommendation_id;

        const [
            captions,
            platforms,
            ideas,
            alternates
        ] = await Promise.all([
            db.query(
                `SELECT caption_id, platform, caption, hashtag
                 FROM Caption
                 WHERE recommendation_id = $1
                 ORDER BY caption_id`,
                [recId]
            ),
            db.query(
                `SELECT platform_id, platform, prediction
                 FROM Platform
                 WHERE recommendation_id = $1
                 ORDER BY platform_id`,
                [recId]
            ),
            db.query(
                `SELECT idea_id, idea_name, content_type
                 FROM Idea
                 WHERE recommendation_id = $1
                 ORDER BY idea_id`,
                [recId]
            ),
            db.query(
                `SELECT a.alternate_id, a.idea_id, a.idea_name, a.content_type
                 FROM alternate a
                 JOIN Idea i ON a.idea_id = i.idea_id
                 WHERE i.recommendation_id = $1
                 ORDER BY a.alternate_id`,
                [recId]
            )
        ]);

        const structuredIdeas = ideas.map((idea) => ({
            ...idea,
            alternates: alternates.filter((alt) => alt.idea_id === idea.idea_id)
        }));

        return {
            recommendation_id: rec.recommendation_id,
            plan_id: rec.plan_id,
            idea: rec.idea,
            platform: rec.platform,
            title: rec.title,
            performance: rec.performance,
            time: rec.time,
            captions,
            platform_predictions: platforms,
            ideas: structuredIdeas
        };
    }

    static async getRecommendation(userId) {
        const result = await db.query(
            `SELECT
                r.recommendation_id,
                r.plan_id,
                r.idea,
                r.platform,
                r.title,
                r.performance,
                r.time
             FROM Recommendation r
             JOIN Plan p ON r.plan_id = p.plan_id
             WHERE p.user_id = $1
             ORDER BY r.created_at DESC, r.recommendation_id DESC
             LIMIT 1`,
            [userId]
        );

        if (!result.rows || result.rows.length === 0) return null;
        return Recommendation._assemble(result.rows[0]);
    }

    static async getRecommendationByPlan(planId) {
        const result = await db.query(
            `SELECT
                r.recommendation_id,
                r.plan_id,
                r.idea,
                r.platform,
                r.title,
                r.performance,
                r.time
             FROM Recommendation r
             WHERE r.plan_id = $1
             ORDER BY r.created_at DESC, r.recommendation_id DESC
             LIMIT 1`,
            [planId]
        );

        if (!result.rows || result.rows.length === 0) return null;
        return Recommendation._assemble(result.rows[0]);
    }

    static async create(userId, plan, ml, ai) {
        const client = await db.connect();
        let planId;

        try {
            await client.query('BEGIN');

            // Plan
            const planResult = await client.query(
                `INSERT INTO Plan
                    (user_id, plan_purpose, product_name, product_category, product_description,
                     demographics_age, demographics_gender, audience_description, plan_goal, plan_channel)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                 RETURNING plan_id`,
                [
                    userId,
                    plan.plan_purpose,
                    plan.product_name,
                    plan.product_category,
                    plan.product_description ?? null,
                    plan.demographics_age,
                    plan.demographics_gender ?? 'All',
                    plan.audience_description ?? null,
                    plan.plan_goal,
                    plan.plan_channel
                ]
            );
            planId = planResult.rows[0].plan_id;

            // Interests
            const interestNames = [...new Set(plan.interests.map((i) => String(i).trim()).filter(Boolean))];
            for (const name of interestNames) {
                const interestResult = await client.query(
                    `INSERT INTO Interest (interest_name) VALUES ($1)
                     ON CONFLICT (interest_name) DO UPDATE SET interest_name = EXCLUDED.interest_name
                     RETURNING interest_id`,
                    [name]
                );
                const interestId = interestResult.rows[0].interest_id;

                await client.query(
                    'INSERT INTO PlanInterest (plan_id, interest_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
                    [planId, interestId]
                );
            }

            // Recommendation
            const recResult = await client.query(
                `INSERT INTO Recommendation (plan_id, idea, platform, title, performance, time)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING recommendation_id`,
                [
                    planId,
                    clip(ai.idea, 255),
                    clip(ml.platform, 16),
                    clip(ai.title, 50),
                    clip(ml.performance, 10),
                    clip(ml.time, 50)
                ]
            );
            const recommendationId = recResult.rows[0].recommendation_id;

            // Captions
            for (const c of ai.captions || []) {
                await client.query(
                    'INSERT INTO Caption (recommendation_id, platform, caption, hashtag) VALUES ($1, $2, $3, $4)',
                    [recommendationId, clip(c.platform, 16), c.caption, clip(c.hashtag, 255)]
                );
            }

            // Platform predictions
            for (const p of ml.platform_predictions || []) {
                await client.query(
                    'INSERT INTO Platform (recommendation_id, platform, prediction) VALUES ($1, $2, $3)',
                    [recommendationId, clip(p.platform, 16), clip(p.prediction, 16)]
                );
            }

            // Ideas + alternates
            for (const idea of ai.ideas || []) {
                const ideaResult = await client.query(
                    'INSERT INTO Idea (recommendation_id, idea_name, content_type) VALUES ($1, $2, $3) RETURNING idea_id',
                    [recommendationId, clip(idea.idea_name, 255), clip(idea.content_type, 50)]
                );
                const ideaId = ideaResult.rows[0].idea_id;

                for (const alt of idea.alternates || []) {
                    await client.query(
                        'INSERT INTO alternate (idea_id, idea_name, content_type) VALUES ($1, $2, $3)',
                        [ideaId, clip(alt.idea_name, 255), clip(alt.content_type, 50)]
                    );
                }
            }

            await client.query('COMMIT');
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }

        return Recommendation.getRecommendationByPlan(planId);
    }
}

module.exports = Recommendation;
