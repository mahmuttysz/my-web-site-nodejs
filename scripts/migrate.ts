import fs from 'node:fs/promises';
import path from 'node:path';
import { pool } from '../src/config/db';

const MIGRATIONS_DIR = path.resolve(process.cwd(), 'migrations');
const LOCK_NAME = 'schema_migrate';
const FILE_PATTERN = /^(\d+)_.+\.sql$/;

const splitSql = (sql: string): string[] => {
    const withoutBlocks = sql.replace(/\/\*[\s\S]*?\*\//g, '');
    const withoutLineComments = withoutBlocks
        .split('\n')
        .filter((line) => !line.trim().startsWith('--'))
        .join('\n');

    return withoutLineComments
        .split(';')
        .map((statement) => statement.trim())
        .filter(Boolean);
};

const lockValue = (rows: unknown): number => {
    const row = Array.isArray(rows) ? (rows[0] as Record<string, unknown> | undefined) : undefined;
    const value = row?.locked;
    return typeof value === 'bigint' ? Number(value) : Number(value ?? 0);
};

async function migrate(): Promise<void> {
    const conn = await pool.getConnection();
    let locked = false;

    try {
        const lockRows = await conn.query('SELECT GET_LOCK(?, 10) AS locked', [LOCK_NAME]);
        if (lockValue(lockRows) !== 1) {
            throw new Error('Başka bir migrate işlemi çalışıyor (GET_LOCK zaman aşımı).');
        }
        locked = true;

        await conn.query(`
            CREATE TABLE IF NOT EXISTS schema_migrations (
                id VARCHAR(255) NOT NULL,
                applied_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                PRIMARY KEY (id)
            )
        `);

        const appliedRows = await conn.query('SELECT id FROM schema_migrations') as Array<{ id: string }>;
        const applied = new Set(appliedRows.map((row) => row.id));

        const files = (await fs.readdir(MIGRATIONS_DIR))
            .filter((name) => FILE_PATTERN.test(name))
            .sort((a, b) => a.localeCompare(b, 'en', { numeric: true }));

        if (files.length === 0) {
            console.log('Uygulanacak migration dosyası yok.');
            return;
        }

        let appliedCount = 0;

        for (const file of files) {
            if (applied.has(file)) {
                console.log(`- atlandı (uygulanmış): ${file}`);
                continue;
            }

            const sql = await fs.readFile(path.join(MIGRATIONS_DIR, file), 'utf8');
            const statements = splitSql(sql);

            if (statements.length === 0) {
                throw new Error(`${file} boş veya yalnızca yorum içeriyor.`);
            }

            for (const statement of statements) {
                await conn.query(statement);
            }

            await conn.query('INSERT INTO schema_migrations (id) VALUES (?)', [file]);
            appliedCount += 1;
            console.log(`+ uygulandı: ${file}`);
        }

        if (appliedCount === 0) {
            console.log('Şema güncel.');
        } else {
            console.log(`Tamam: ${appliedCount} migration uygulandı.`);
        }
    } finally {
        if (locked) {
            try {
                await conn.query('SELECT RELEASE_LOCK(?)', [LOCK_NAME]);
            } catch (err) {
                console.error('RELEASE_LOCK hatası:', err);
            }
        }
        conn.release();
    }
}

migrate()
    .then(async () => {
        await pool.end();
        process.exit(0);
    })
    .catch(async (err) => {
        console.error('Migration hatası:', err);
        try {
            await pool.end();
        } catch {
            /* havuz zaten kapalıysa yut */
        }
        process.exit(1);
    });
