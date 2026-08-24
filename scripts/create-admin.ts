import bcrypt from 'bcrypt';
import { query, queryOne, dbQueries } from '../src/config/db';
import { env } from '../src/config/env';
import AdminUsers from '../src/types/dbTables/adminUsers';

async function createAdmin() {
    const args = process.argv.slice(2);

    const username = args[0] || env.ADMIN_USERNAME || 'mahmut';
    const rawPassword = args[1] || env.ADMIN_PASSWORD || 'pwd123';
    const name = env.ADMIN_NAME || 'Mahmut';
    const surname = env.ADMIN_SURNAME || 'Tüysüz';

    let exitCode = 0;

    try {
        console.log('🔄 Admin kullanıcısı oluşturuluyor...');

        const existingUsers = await queryOne<AdminUsers>(dbQueries.adminUsers.getByUsername, [username]);

        if (existingUsers !== null) {
            console.log(`⚠️ '${username}' adında bir kullanıcı zaten veritabanında mevcut! İşlem durduruldu.`);
            return;
        }

        const saltRounds = 10;
        const passwordHash = await bcrypt.hash(rawPassword, saltRounds);

        await query(dbQueries.adminUsers.add, [name, surname, username, passwordHash]);

        console.log('----------------------------------------------------');
        console.log('✅ Admin kullanıcısı başarıyla oluşturuldu!');
        console.log(`👤 Kullanıcı Adı: ${username}`);
        console.log(`🔑 Şifre        : ${rawPassword}`);
        console.log('----------------------------------------------------');
        console.log('💡 Not: Giriş yaptıktan sonra varsayılan şifreyi güncellemeyi unutmayın.');

    } catch (error) {
        console.error('❌ Admin kullanıcısı oluşturulurken hata oluştu:', error);
        exitCode = 1;
    } finally {
        process.exit(exitCode);
    }
}

createAdmin();