const bcrypt = require('bcrypt');
const { pool, dbTables } = require('../config/db'); // Hazırladığımız MariaDB havuzu

async function createAdmin() {
    const name = process.env.ADMIN_NAME || 'Mahmut';
    const surname = process.env.ADMIN_SURNAME || 'Tüysüz';
    const username = process.env.ADMIN_USERNAME || 'mahmut';
    const rawPassword = process.env.ADMIN_PASSWORD || 'FB1907';
    try {
        console.log('🔄 Admin kullanıcısı oluşturuluyor...');
        const existingUsers = await pool.query(
            'SELECT id FROM admin_users WHERE username = ?',
            [username]
        );

        if (existingUsers.length > 0) {
            console.log(`⚠️ '${username}' adında bir kullanıcı zaten veritabanında mevcut! İşlem durduruldu.`);
            process.exit(0);
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(rawPassword, saltRounds);
        await pool.query(
            'INSERT INTO admin_users (name, surname, username, password_hash) VALUES (?, ?, ?, ?)',
            [name, surname, username, passwordHash]
        );

        console.log('----------------------------------------------------');
        console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
        console.log(`👤 Kullanıcı Adı: ${username}`);
        console.log(`🔑 Şifre        : ${rawPassword}`);
        console.log('----------------------------------------------------');
        console.log('💡 Not: Giriş yaptıktan sonra varsayılan şifreyi güncellemeyi unutmayın.');

    } catch (error) {
        console.error('❌ Admin kullanıcısı oluşturulurken hata oluştu:', error);
    } finally {
        process.exit(0);
    }
}

createAdmin();