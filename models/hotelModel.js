import pool from '../database/db.js';
import bcrypt from 'bcryptjs';


// Find hotel by owner's name
export const findUserByOwner = async (name) => {
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
export const findHotelByEmail = async (email) => {
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
export const register = async (owner, email, phone, country, nic, username, password, hotelname, description, regno, address, docurl) => {
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
export const getAllHotels = async () => {
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
export const getHotelById = async (id) => {
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
  FROM hotels ho  WHERE ho.id = $1`
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// Delete hotel
export const deleteHotel = async (id) => {
    try {
        const query = 'DELETE FROM hotels WHERE id = $1';
        await pool.query(query, [id]);
    } catch (err) {
        throw err;
    }
};

// Upload hotel images
export const uploadHotelImages = async (hotelId, imageUrl) => {
    try {
        const query = 'INSERT INTO hotel_images (hotel_id, image_url) VALUES ($1, $2)';
        await pool.query(query, [hotelId, imageUrl]);
    } catch (err) {
        throw err;
    }
};
export const deleteHotelImages = async (hotelId) => {
    try {
        const query = `DELETE FROM hotel_images WHERE hotel_id = $1`;
        await pool.query(query, [hotelId]);
    } catch (err) {
        throw err;
    }
};

// Update hotel
export const updateHotel = async (id, owner, email, phone, hotelname, address) => {
    try {
        const query = `
            UPDATE hotels 
            SET owner = $1, email = $2, phone = $3, hotelname = $4, address = $5
            WHERE id = $6 RETURNING *
        `;
        const values = [owner, email, phone, hotelname, address, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

