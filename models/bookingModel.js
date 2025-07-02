const pool = require('../database/db');
const bcrypt = require('bcryptjs');

// Find hotel by owner's name
exports.findUserByOwner = async (name) => {
    try {
        const query = 'SELECT * FROM hotels WHERE owner = $1';
        const value = [name];
        const result = await pool.query(query, value);
        return result.rows[0] || null;
    } catch (err) {
        throw err;
    }
};

// Find hotel by email
exports.findHotelByEmail = async (email) => {
    try {
        const query = 'SELECT * FROM hotels WHERE email = $1';
        const values = [email];
        const result = await pool.query(query, values);
        return result.rows[0] || null;
    } catch (err) {
        throw err;
    }
};

// Register hotel
exports.register = async (duration, checkin, checkout, email, name, initial, total, balance, roomname, roomtpye) => {
    try {
        const query = `
            INSERT INTO hotels 
                (duration, checkin, checkout, email, name, initial, total, balance, roomname, roomtpye)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8)
            RETURNING 
                id, duration, checkin, checkout, email, name, initial, total, balance, roomname, roomtpye
        `;
        const values = [duration, checkin, checkout, email, name, initial, total, balance, roomname, roomtpye];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// Get all hotels
exports.getAllBookings = async () => {
    try {
        const query = `SELECT * FROM boookings`;

        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        throw err;
    }
};

// Get hotel by ID
exports.getBookingById = async (id) => {
    try {
        const query = `
      SELECT 
      FROM hotels ho
      WHERE ho.id = $1`
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// Delete hotel
exports.deleteBooking = async (id) => {
    try {
        const query = 'DELETE FROM booking WHERE id = $1';
        await pool.query(query, [id]);
    } catch (err) {
        throw err;
    }
};

// Update hotel
exports.updateBooking = async (id, owner, hotelname, address, imgurl) => {
    // try {
    //     const query = `
    //         UPDATE hotels 
    //         SET owner = $1, hotelname = $2, address = $3, imgurl = $4 
    //         WHERE id = $5 RETURNING *
    //     `;
    //     const values = [owner, hotelname, address, imgurl, id];
    //     const result = await pool.query(query, values);
    //     return result.rows[0];
    // } catch (err) {
    //     throw err;
    // }
};
