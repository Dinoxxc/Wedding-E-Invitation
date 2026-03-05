const db = require('../config/database');

class GuestList {
  static async create(data) {
    const { 
      name, 
      email, 
      phone, 
      invitation_type, 
      max_guests, 
      qr_code, 
      unique_code,
      table_number,
      notes 
    } = data;
    
    const query = `
      INSERT INTO guest_list 
      (name, email, phone, invitation_type, max_guests, qr_code, unique_code, table_number, notes)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      name,
      email || null,
      phone || null,
      invitation_type,
      max_guests || 1,
      qr_code,
      unique_code,
      table_number || null,
      notes || null
    ]);
    
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM guest_list WHERE 1=1';
    const params = [];

    if (filters.invitation_type) {
      query += ' AND invitation_type = ?';
      params.push(filters.invitation_type);
    }

    if (filters.checked_in !== undefined) {
      query += ' AND checked_in = ?';
      params.push(filters.checked_in);
    }

    if (filters.search) {
      query += ' AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY created_at DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM guest_list WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async findByUniqueCode(code) {
    const query = 'SELECT * FROM guest_list WHERE unique_code = ?';
    const [rows] = await db.execute(query, [code]);
    return rows[0];
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM guest_list WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async update(id, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(id);
    const query = `UPDATE guest_list SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async checkIn(uniqueCode) {
    const query = `
      UPDATE guest_list 
      SET checked_in = 1, check_in_time = NOW() 
      WHERE unique_code = ? AND checked_in = 0
    `;
    const [result] = await db.execute(query, [uniqueCode]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM guest_list WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_guests,
        SUM(CASE WHEN invitation_type = 'VIP' THEN 1 ELSE 0 END) as vip_count,
        SUM(CASE WHEN invitation_type = 'Regular' THEN 1 ELSE 0 END) as regular_count,
        SUM(CASE WHEN checked_in = 1 THEN 1 ELSE 0 END) as checked_in_count,
        SUM(max_guests) as total_capacity
      FROM guest_list
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }

  static async bulkCreate(guests) {
    const query = `
      INSERT INTO guest_list 
      (name, email, phone, invitation_type, max_guests, qr_code, unique_code, table_number, notes)
      VALUES ?
    `;
    
    const values = guests.map(g => [
      g.name,
      g.email || null,
      g.phone || null,
      g.invitation_type,
      g.max_guests || 1,
      g.qr_code,
      g.unique_code,
      g.table_number || null,
      g.notes || null
    ]);

    const [result] = await db.query(query, [values]);
    return result.affectedRows;
  }
}

module.exports = GuestList;
