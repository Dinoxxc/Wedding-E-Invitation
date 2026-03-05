const db = require('../config/database');

class Gift {
  static async create(data) {
    const { guest_name, gift_type, amount, description, received_date } = data;
    
    const query = `
      INSERT INTO gifts (guest_name, gift_type, amount, description, received_date)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      guest_name,
      gift_type,
      amount || null,
      description || null,
      received_date || new Date()
    ]);
    
    return result.insertId;
  }

  static async findAll(filters = {}) {
    let query = 'SELECT * FROM gifts WHERE 1=1';
    const params = [];

    if (filters.gift_type) {
      query += ' AND gift_type = ?';
      params.push(filters.gift_type);
    }

    if (filters.search) {
      query += ' AND (guest_name LIKE ? OR description LIKE ?)';
      const searchTerm = `%${filters.search}%`;
      params.push(searchTerm, searchTerm);
    }

    query += ' ORDER BY received_date DESC';

    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM gifts WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
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
    const query = `UPDATE gifts SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM gifts WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_gifts,
        SUM(CASE WHEN gift_type = 'cash' THEN 1 ELSE 0 END) as cash_count,
        SUM(CASE WHEN gift_type = 'physical' THEN 1 ELSE 0 END) as physical_count,
        SUM(CASE WHEN amount IS NOT NULL THEN amount ELSE 0 END) as total_amount
      FROM gifts
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }
}

module.exports = Gift;
