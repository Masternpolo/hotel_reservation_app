const pool = require('../database/db');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// search for user by email in the database
exports.findUserByUsername = async (username) => {
    try {
        const query = 'SELECT * FROM users WHERE username = $1';
        const value = [username];
        const result = await pool.query(query, value);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null;
    } catch (err) {
        throw err
    }
};

exports.findUserByResetToken = async (resetToken) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
        const value = [hashedToken];
        const query = 'SELECT * FROM password_resets WHERE token = $1 AND expires_at > NOW()';
        const result = await pool.query(query, value);
        if (result.rows.length > 0) {
            const user = await exports.getUserById(result.rows[0].user_id);
            return user;
        }
        return null;
    } catch (err) {
        throw err
    }
};

exports.findUserByEmail = async (email) => {
    try {
        const query = 'SELECT firstname, lastname, email, username FROM users WHERE email = $1';
        const values = [email];
        const result = await pool.query(query, values);
        if (result.rows.length > 0) {
            return result.rows[0];
        }
        return null;
    } catch (err) {
        throw err
    }
};

// register a new user in the database
exports.register = async (firstname, lastname, email, phone, username, password) => {
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (firstname, lastname, email, phone, username, password) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, firstname, lastname, email, username, role, created_at';
        const values = [firstname, lastname, email, phone, username, hashedPassword];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err; 
    }
};


// get all users from the database
exports.getAllUsers = async () => {
    try {
        const query = 'SELECT id, username, email, created_at FROM users';
        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        throw err;
    }
}

// get user from the database using id
exports.getUserById = async (id) => {
    try {
        const query = 'SELECT id, email, password, role FROM users WHERE id = $1 ';
        const values = [id];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// delete user form the database using id
exports.deleteUser = async (id) => {
    try {
        const query = 'DELETE FROM users WHERE id = $1';
        const values = [id];
        await pool.query(query, values);
    } catch (err) {
        throw err;
    }
}

// update user in the database using id 
exports.updateUser = async (id, firstname, lastname, email, phone, username) => {
    try {
        const query = 'UPDATE users SET firstname = $1, lastname = $2, email = $3, phone = $4, username = $5 WHERE id = $6';
        const values = [firstname, lastname, email, phone, username, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// update user password in the database using id 
exports.updateUserPassword = async (password, userId) => {
    try {

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'UPDATE users SET password = $1, password_changed_at = NOW() WHERE id = $2';
        const values = [hashedPassword, userId];
        await pool.query(query, values);
    } catch (err) {
        throw err;
    }
};

exports.createPasswordresetToken = () => {
    const resetToken = crypto.randomBytes(32).toString('hex');
    return resetToken;
}

exports.saveResetToken = async (userId, resetToken) => {
    try {
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    const passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000);

    const sql = 'INSERT INTO password_resets (user_id, token, expires_at) VALUES ($1, $2, $3)'
    const values = [userId, hashedToken, passwordResetExpires];
    await pool.query(sql, values);
    } catch (err) {
        throw err
    }
}

exports.deleteResetToken = async (userId) => {
    const query = 'DELETE FROM password_resets WHERE user_id = $1';
    const values = [userId];
    await pool.query(query, values);
}