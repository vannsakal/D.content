const db = require('../config/db');

class User {
    static async createUser(data) {
        const result = await db.query(
            "INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1,$2,$3,$4) RETURNING user_id",
            [data.email, data.passwordHash, data.firstName, data.lastName]
        );
        return result.rows[0].user_id;
    }

    static async findByEmail(email) {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        return result.rows[0] || null;
    }

    static async findById(userId) {
        const result = await db.query(
            `SELECT user_id, email, first_name, last_name FROM users WHERE user_id = $1`,
            [userId]
        );
        return result.rows[0] || null;
    }

    static async updatePassword(userId, newPassword) {
        await db.query(
            'UPDATE users SET password_hash = $1 WHERE user_id = $2',
            [newPassword, userId]
        );
    }

    static async getPasswordById(userId) {
        const result = await db.query(
            'SELECT password_hash FROM users WHERE user_id = $1',
            [userId]
        );
        return result.rows[0]?.password_hash ?? null;
    }
}

module.exports = User;
