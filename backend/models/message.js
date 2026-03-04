const db = require('../config/database');

class Message {
  static async create(data) {
    const { guest_name, message, approved = true } = data;
    
    const query = `
      INSERT INTO messages (guest_name, message, approved)
      VALUES (?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [guest_name, message, approved]);
    return result.insertId;
  }

  static async findAll(approvedOnly = false) {
    let query = 'SELECT * FROM messages';
    if (approvedOnly) {
      query += ' WHERE approved = true';
    }
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM messages WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async approve(id) {
    const query = 'UPDATE messages SET approved = true WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM messages WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async getCount() {
    const query = 'SELECT COUNT(*) as total FROM messages WHERE approved = true';
    const [rows] = await db.execute(query);
    return rows[0].total;
  }
}

module.exports = Message;
