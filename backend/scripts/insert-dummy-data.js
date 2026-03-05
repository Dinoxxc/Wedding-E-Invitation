// ==========================================
// INSERT DUMMY DATA FOR TESTING
// ==========================================

require('dotenv').config();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

async function insertDummyData() {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  try {
    console.log('🔄 Starting to insert dummy data...\n');

    // ==========================================
    // 1. DUMMY RSVPs
    // ==========================================
    console.log('📝 Inserting RSVPs...');
    const rsvps = [
      ['Budi Santoso', 'budi@example.com', '081234567890', 'attending', 2, 'No peanuts', '2026-03-01 10:30:00'],
      ['Siti Nurhaliza', 'siti@example.com', '081234567891', 'attending', 1, null, '2026-03-01 11:00:00'],
      ['Ahmad Rizki', 'ahmad@example.com', '081234567892', 'not_attending', 1, null, '2026-03-01 14:20:00'],
      ['Dewi Lestari', 'dewi@example.com', '081234567893', 'attending', 3, 'Vegetarian', '2026-03-02 09:15:00'],
      ['Eko Prasetyo', 'eko@example.com', '081234567894', 'attending', 2, null, '2026-03-02 16:45:00'],
      ['Fitri Handayani', 'fitri@example.com', '081234567895', 'attending', 1, 'Gluten-free', '2026-03-03 08:30:00'],
      ['Gilang Ramadhan', 'gilang@example.com', '081234567896', 'not_attending', 1, null, '2026-03-03 13:00:00'],
      ['Hani Kusuma', 'hani@example.com', '081234567897', 'attending', 4, null, '2026-03-04 10:00:00'],
      ['Indra Wijaya', 'indra@example.com', '081234567898', 'attending', 2, 'Halal only', '2026-03-04 15:30:00'],
      ['Joko Widodo', 'joko@example.com', '081234567899', 'attending', 1, null, '2026-03-05 11:20:00']
    ];

    for (const rsvp of rsvps) {
      await connection.execute(
        'INSERT INTO rsvp (guest_name, email, phone, attendance, number_of_guests, dietary_restrictions, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
        rsvp
      );
    }
    console.log('✅ Inserted 10 RSVPs\n');

    // ==========================================
    // 2. DUMMY MESSAGES
    // ==========================================
    console.log('💬 Inserting Messages...');
    const messages = [
      ['Budi Santoso', 'Selamat menempuh hidup baru! Semoga langgeng sampai maut memisahkan 💑', true, '2026-03-01 10:35:00'],
      ['Siti Nurhaliza', 'Congratulations on your wedding! Wishing you both endless love and happiness! ❤️', true, '2026-03-01 11:05:00'],
      ['Dewi Lestari', 'Bahagia selalu untuk kedua mempelai! 🎉🎊', true, '2026-03-02 09:20:00'],
      ['Eko Prasetyo', 'Semoga menjadi keluarga sakinah mawaddah warahmah 🤲', false, '2026-03-02 16:50:00'],
      ['Fitri Handayani', 'Love is in the air! Congratulations! 💕', true, '2026-03-03 08:35:00'],
      ['Hani Kusuma', 'Selamat ya! Ditunggu undangan walimahan nya 😊', false, '2026-03-04 10:05:00'],
      ['Indra Wijaya', 'Semoga cepat dikasih momongan ya! Aamiin 👶', true, '2026-03-04 15:35:00'],
      ['Joko Widodo', 'Selamat dan sukses! Semoga menjadi pasangan yang harmonis 🥰', true, '2026-03-05 11:25:00']
    ];

    for (const message of messages) {
      await connection.execute(
        'INSERT INTO messages (guest_name, message, approved, created_at) VALUES (?, ?, ?, ?)',
        message
      );
    }
    console.log('✅ Inserted 8 Messages\n');

    // ==========================================
    // 3. DUMMY GUEST LIST
    // ==========================================
    console.log('👥 Inserting Guest List...');
    const guestList = [
      ['Budi Santoso', 'budi@example.com', '081234567890', 'Regular', 2, true, '2026-03-05 08:30:00'],
      ['Siti Nurhaliza', 'siti@example.com', '081234567891', 'Regular', 1, true, '2026-03-05 09:15:00'],
      ['Ahmad Rizki', 'ahmad@example.com', '081234567892', 'Regular', 1, false, null],
      ['Dewi Lestari', 'dewi@example.com', '081234567893', 'VIP', 3, true, '2026-03-05 10:00:00'],
      ['Eko Prasetyo', 'eko@example.com', '081234567894', 'Regular', 2, false, null],
      ['Fitri Handayani', 'fitri@example.com', '081234567895', 'VIP', 1, true, '2026-03-05 11:30:00'],
      ['Gilang Ramadhan', 'gilang@example.com', '081234567896', 'Regular', 1, false, null],
      ['Hani Kusuma', 'hani@example.com', '081234567897', 'VIP', 4, true, '2026-03-05 12:00:00'],
      ['Indra Wijaya', 'indra@example.com', '081234567898', 'Regular', 2, true, '2026-03-05 13:15:00'],
      ['Joko Widodo', 'joko@example.com', '081234567899', 'VIP', 1, true, '2026-03-05 14:00:00'],
      ['Kartika Sari', 'kartika@example.com', '081234567800', 'Regular', 2, false, null],
      ['Luki Hermawan', 'luki@example.com', '081234567801', 'Regular', 1, false, null],
      ['Maya Safitri', 'maya@example.com', '081234567802', 'Regular', 1, false, null],
      ['Nanda Pratama', 'nanda@example.com', '081234567803', 'Regular', 2, false, null],
      ['Olivia Putri', 'olivia@example.com', '081234567804', 'VIP', 3, false, null]
    ];

    for (const guest of guestList) {
      const uniqueCode = uuidv4();
      await connection.execute(
        'INSERT INTO guest_list (name, email, phone, invitation_type, max_guests, unique_code, checked_in, check_in_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [...guest.slice(0, 4), guest[4], uniqueCode, guest[5], guest[6]]
      );
    }
    console.log('✅ Inserted 15 Guests\n');

    // ==========================================
    // 4. DUMMY GIFTS
    // ==========================================
    console.log('🎁 Inserting Gifts...');
    const gifts = [
      ['Budi Santoso', 'cash', 500000, 'Amplop dari keluarga Budi', '2026-03-05 08:35:00'],
      ['Siti Nurhaliza', 'cash', 300000, null, '2026-03-05 09:20:00'],
      ['Dewi Lestari', 'cash', 1000000, 'Hadiah dari keluarga', '2026-03-05 10:05:00'],
      ['Fitri Handayani', 'physical', null, 'Panci set lengkap', '2026-03-05 11:35:00'],
      ['Hani Kusuma', 'cash', 750000, 'Dari saudara', '2026-03-05 12:05:00'],
      ['Indra Wijaya', 'physical', null, 'Dinner set keramik', '2026-03-05 13:20:00'],
      ['Joko Widodo', 'cash', 2000000, 'Hadiah pernikahan', '2026-03-05 14:05:00'],
      ['Kartika Sari', 'cash', 250000, null, '2026-03-05 15:00:00'],
      ['Maya Safitri', 'physical', null, 'Blender Philips', '2026-03-05 16:30:00'],
      ['Nanda Pratama', 'cash', 400000, 'Selamat ya!', '2026-03-05 17:00:00'],
      ['Olivia Putri', 'cash', 1500000, 'Love & Blessings', '2026-03-05 18:00:00']
    ];

    for (const gift of gifts) {
      await connection.execute(
        'INSERT INTO gifts (guest_name, gift_type, amount, description, created_at) VALUES (?, ?, ?, ?, ?)',
        gift
      );
    }
    console.log('✅ Inserted 11 Gifts\n');

    // ==========================================
    // 5. DUMMY SEATING TABLES
    // ==========================================
    console.log('🪑 Inserting Seating Tables...');
    const tables = [
      [1, 'Main Hall - Front', 8, 'Near stage', '2026-03-01 10:00:00'],
      [2, 'Main Hall - Front', 8, 'Near stage', '2026-03-01 10:00:00'],
      [3, 'Main Hall - Center', 8, 'Center area', '2026-03-01 10:00:00'],
      [4, 'Main Hall - Center', 8, 'Center area', '2026-03-01 10:00:00'],
      [5, 'Main Hall - Back', 10, 'Back area', '2026-03-01 10:00:00'],
      [6, 'Main Hall - Back', 10, 'Back area', '2026-03-01 10:00:00'],
      [7, 'VIP Garden', 6, 'Garden area', '2026-03-01 10:00:00'],
      [8, 'VIP Garden', 6, 'Garden area', '2026-03-01 10:00:00'],
      [9, 'Family Area', 12, 'Near stage', '2026-03-01 10:00:00'],
      [10, 'Kids Area', 8, 'Near playground', '2026-03-01 10:00:00']
    ];

    for (const table of tables) {
      await connection.execute(
        'INSERT INTO seating_tables (table_number, table_name, capacity, notes, created_at) VALUES (?, ?, ?, ?, ?)',
        table
      );
    }
    console.log('✅ Inserted 10 Tables\n');

    // ==========================================
    // 6. DUMMY PHOTOS (Placeholder URLs)
    // ==========================================
    console.log('📸 Inserting Photos...');
    const photos = [
      ['photo-1.jpg', 'Budi Santoso', 'Beautiful couple!', true, '2026-03-05 09:00:00'],
      ['photo-2.jpg', 'Siti Nurhaliza', 'Congratulations! 🎉', true, '2026-03-05 10:00:00'],
      ['photo-3.jpg', 'Dewi Lestari', 'Love this moment ❤️', true, '2026-03-05 11:00:00'],
      ['photo-4.jpg', 'Fitri Handayani', 'Amazing decoration!', false, '2026-03-05 12:00:00'],
      ['photo-5.jpg', 'Hani Kusuma', 'Perfect venue!', true, '2026-03-05 13:00:00'],
      ['photo-6.jpg', 'Indra Wijaya', 'Great food!', false, '2026-03-05 14:00:00'],
      ['photo-7.jpg', 'Joko Widodo', 'Memorable day!', true, '2026-03-05 15:00:00'],
      ['photo-8.jpg', 'Guest Anonymous', 'Beautiful ceremony', true, '2026-03-05 16:00:00']
    ];

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const placeholderPath = `/uploads/photos/${photo[0]}`;
      await connection.execute(
        'INSERT INTO photos (filename, path, uploaded_by, caption, approved, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [photo[0], placeholderPath, photo[1], photo[2], photo[3], photo[4]]
      );
    }
    console.log('✅ Inserted 8 Photos\n');

    console.log('🎉 All dummy data inserted successfully!\n');
    console.log('📊 Summary:');
    console.log('   - 10 RSVPs (7 attending, 2 not attending)');
    console.log('   - 8 Messages (6 approved, 2 pending)');
    console.log('   - 15 Guests (6 checked-in, 9 not checked-in)');
    console.log('   - 11 Gifts (Rp 6,700,000 cash + 3 physical gifts)');
    console.log('   - 10 Tables (84 total capacity)');
    console.log('   - 8 Photos (6 approved, 2 pending)\n');

  } catch (error) {
    console.error('❌ Error inserting dummy data:', error);
  } finally {
    await connection.end();
  }
}

// Run the script
insertDummyData();
