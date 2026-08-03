const bcrypt = require('bcrypt');
const { pool, dbTables } = require('../config/db');
const { env } = require('../config/env');

async function createAdmin() {
    const name = env.ADMIN_NAME || 'Mahmut';
    const surname = env.ADMIN_SURNAME || 'Tüysüz';
    const username = env.ADMIN_USERNAME || 'mahmut';
    const rawPassword = env.ADMIN_PASSWORD || 'pwd123';
    try {
        console.log('🔄 Admin kullanıcısı oluşturuluyor...');
        const existingUsers = await pool.query(dbTables.adminUsers.getByUsername, [username]);

        if (existingUsers.length > 0) {
            console.log(`⚠️ '${username}' adında bir kullanıcı zaten veritabanında mevcut! İşlem durduruldu.`);
            process.exit(0);
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(rawPassword, saltRounds);
        await pool.query(dbTables.adminUsers.add, [name, surname, username, passwordHash]);

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