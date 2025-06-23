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
exports.register = async (owner, email, phone, country, nic, username, password, hotelname, description, regno, address, docurl) => {
    try {

        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO hotels 
                (owner, email, phone, country, nic, username, password, hotelname, hotel_description, regno, address, docurl)
            VALUES 
                ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
            RETURNING 
                id, owner, email, phone, country, nic, username, hotelname, hotel_description, regno, address, docurl, created_at
        `;
        const values = [owner, email, phone, country, nic, username, hashedPassword, hotelname, description, regno, address, docurl];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// Get all hotels
exports.getAllHotels = async () => {
    try {
        const query = `
  SELECT 
    ho.id,
    ho.owner,
    ho.email,
    ho.phone,
    ho.docurl,
    ho.created_at,
    COALESCE(
      ARRAY(
        SELECT img.image_url
        FROM hotel_images img
        WHERE img.hotel_id = ho.id
      ),
      ARRAY[]::TEXT[]
    ) AS images
  FROM hotels ho
`;

        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        throw err;
    }
};

// Get hotel by ID
exports.getHotelById = async (id) => {
    try {
        const query = `
      SELECT 
        ho.id,
        ho.full_name,
        ho.email,
        ho.phone,
        ho.registration_file_url,
        ho.created_at,
        COALESCE(
          ARRAY(
            SELECT img.image_url
            FROM hotel_owner_images img
            WHERE img.hotel_id = ho.id
          ),
          ARRAY[]::TEXT[]
        ) AS images
      FROM hotels ho
      WHERE ho.id = $1`
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// Delete hotel
exports.deleteHotel = async (id) => {
    try {
        const query = 'DELETE FROM hotels WHERE id = $1';
        await pool.query(query, [id]);
    } catch (err) {
        throw err;
    }
};

// Upload hotel images
exports.uploadHotelImages = async (hotelId, imageUrl) => {
    try {
        const query = 'INSERT INTO hotel_images (hotel_id, image_url) VALUES ($1, $2)';
        await pool.query(query, [hotelId, imageUrl]);
    } catch (err) {
        throw err;
    }
};

// Update hotel
exports.updateHotel = async (id, owner, hotelname, address, imgurl) => {
    try {
        const query = `
            UPDATE hotels 
            SET owner = $1, hotelname = $2, address = $3, imgurl = $4 
            WHERE id = $5 RETURNING *
        `;
        const values = [owner, hotelname, address, imgurl, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};
