const db = require('../config/database');

class Seating {
  static async create(data) {
    const { table_number, table_name, capacity, notes } = data;
    
    const query = `
      INSERT INTO seating_tables (table_number, table_name, capacity, notes)
      VALUES (?, ?, ?, ?)
    `;
    
    const [result] = await db.execute(query, [
      table_number,
      table_name || null,
      capacity || 10,
      notes || null
    ]);
    
    return result.insertId;
  }

  static async findAll() {
    const query = `
      SELECT st.*, 
        (SELECT COUNT(*) FROM guest_list WHERE table_number = st.table_number) as assigned_guests
      FROM seating_tables st 
      ORDER BY st.table_number ASC
    `;
    const [rows] = await db.execute(query);
    return rows;
  }

  static async findByTableNumber(tableNumber) {
    const query = 'SELECT * FROM seating_tables WHERE table_number = ?';
    const [rows] = await db.execute(query, [tableNumber]);
    return rows[0];
  }

  static async getGuestsByTable(tableNumber) {
    const query = 'SELECT * FROM guest_list WHERE table_number = ?';
    const [rows] = await db.execute(query, [tableNumber]);
    return rows;
  }

  static async assignGuestToTable(guestId, tableNumber) {
    const query = 'UPDATE guest_list SET table_number = ? WHERE id = ?';
    const [result] = await db.execute(query, [tableNumber, guestId]);
    return result.affectedRows > 0;
  }

  static async update(tableNumber, data) {
    const fields = [];
    const values = [];

    Object.keys(data).forEach(key => {
      if (data[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(data[key]);
      }
    });

    if (fields.length === 0) return false;

    values.push(tableNumber);
    const query = `UPDATE seating_tables SET ${fields.join(', ')} WHERE table_number = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(tableNumber) {
    // Unassign guests first
    await db.execute('UPDATE guest_list SET table_number = NULL WHERE table_number = ?', [tableNumber]);
    
    const query = 'DELETE FROM seating_tables WHERE table_number = ?';
    const [result] = await db.execute(query, [tableNumber]);
    return result.affectedRows > 0;
  }

  static async getStats() {
    const query = `
      SELECT 
        COUNT(*) as total_tables,
        SUM(capacity) as total_capacity,
        (SELECT COUNT(*) FROM guest_list WHERE table_number IS NOT NULL) as assigned_guests,
        (SELECT COUNT(*) FROM guest_list WHERE table_number IS NULL) as unassigned_guests
      FROM seating_tables
    `;
    const [rows] = await db.execute(query);
    return rows[0];
  }
}

module.exports = Seating;
