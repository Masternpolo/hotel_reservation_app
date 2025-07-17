import pool from '../database/db.js';
import bcrypt from 'bcryptjs';


// Register room
export const register = async (name, type, description,
    price, hotelId) => {
    try {
        const query = `
            INSERT INTO rooms 
                (name, type, description, price, hotel_id)
            VALUES 
                ($1, $2, $3, $4, $5)
            RETURNING *`;
        const values = [name, type, description,
            price, hotelId];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// Get all rooms
export const getAllrooms = async () => {
    try {
        const query = `
  SELECT 
    ro.Id,
    ro.name,
    ro.type,
    ro.description,
    ro.price, 
    ro.hotel_id,
    COALESCE(
      ARRAY(
        SELECT img.image_url
        FROM room_images img
        WHERE img.room_id = ro.id
      ),
      ARRAY[]::TEXT[]
    ) AS images
  FROM rooms ro
`;

        const result = await pool.query(query);
        return result.rows;
    } catch (err) {
        throw err;
    }
};

// Get room by ID
export const getRoomById = async (id) => {
    try {
        const query = `
      SELECT 
    ro.Id,
    ro.name,
    ro.type,
    ro.description,
    ro.price, 
    ro.hotel_id,
    COALESCE(
      ARRAY(
        SELECT img.image_url
        FROM room_images img
        WHERE img.room_id = ro.id
      ),
      ARRAY[]::TEXT[]
    ) AS images
    FROM rooms ro WHERE id = $1
    `;
        const result = await pool.query(query, [id]);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};

// Delete room
export const deleteRoom = async (id) => {
    try {
        const query = 'DELETE FROM rooms WHERE id = $1';
        await pool.query(query, [id]);
    } catch (err) {
        throw err;
    }
};
// Delete room images
export const deleteRoomImages = async (roomId) => {
    try {
        const query = 'DELETE FROM room_images WHERE room_id = $1';
        await pool.query(query, [roomId]);
    } catch (err) {
        throw err;
    }
};

// Upload room images
export const uploadRoomImages = async (roomId, imageUrl) => {
    try {
        const query = 'INSERT INTO room_images (room_id, image_url) VALUES ($1, $2)';
        await pool.query(query, [roomId, imageUrl]);
    } catch (err) {
        throw err;
    }
};

// Update room
export const updateRoom = async (id, name, type, description,
    price, hotelId) => {
    try {
        console.log('inside update room');
        
        let query = `
            UPDATE rooms 
            SET name = $1, type = $2, description = $3, price = $4, 
            hotel_id = $5 WHERE id = $6 RETURNING *
        `;
        const values = [name, type, description, price, hotelId, id];
        const result = await pool.query(query, values);
        return result.rows[0];
    } catch (err) {
        throw err;
    }
};
