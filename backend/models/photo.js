const db = require('../config/database');

class Photo {
  static async create(data) {
    const { filename, path, uploaded_by, caption, approved } = data;
    
    const query = `
      INSERT INTO photos (filename, path, uploaded_by, caption, approved)
      VALUES (?, ?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      filename,
      path,
      uploaded_by || 'Anonymous',
      caption || null,
      approved !== undefined ? approved : true
    ]);
    
    return result.insertId;
  }

  static async findAll(onlyApproved = true) {
    let query = 'SELECT * FROM photos';
    if (onlyApproved) {
      query += ' WHERE approved = 1';
    }
    query += ' ORDER BY created_at DESC';
    
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findById(id) {
    const query = 'SELECT * FROM photos WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async approve(id) {
    const query = 'UPDATE photos SET approved = 1 WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM photos WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }

  static async getCount() {
    const query = 'SELECT COUNT(*) as count FROM photos WHERE approved = 1';
    const [rows] = await db.execute(query);
    return rows[0].count;
  }

  static async updateCaption(id, caption) {
    const query = 'UPDATE photos SET caption = ? WHERE id = ?';
    const [result] = await db.execute(query, [caption, id]);
    return result.affectedRows > 0;
  }
}

module.exports = Photo;
