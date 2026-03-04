const db = require('../config/database');

class RSVP {
  static async create(data) {
    const { guest_name, email, phone, attendance, number_of_guests, dietary_restrictions, special_requests } = data;
    
    const query = `
      INSERT INTO rsvp (guest_name, email, phone, attendance, number_of_guests, dietary_restrictions, special_requests)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      guest_name,
      email,
      phone || null,
      attendance,
      number_of_guests || 1,
      dietary_restrictions || null,
      special_requests || null
    ]);
    
    return result.insertId;
  }

  static async findAll() {
    const query = 'SELECT * FROM rsvp ORDER BY created_at DESC';
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM rsvp WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_responses,
        SUM(CASE WHEN attendance = 'attending' THEN 1 ELSE 0 END) as attending_count,
        SUM(CASE WHEN attendance = 'not_attending' THEN 1 ELSE 0 END) as not_attending_count,
        SUM(CASE WHEN attendance = 'attending' THEN number_of_guests ELSE 0 END) as total_guests
      FROM rsvp
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }

  static async delete(id) {
    const query = 'DELETE FROM rsvp WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = RSVP;
