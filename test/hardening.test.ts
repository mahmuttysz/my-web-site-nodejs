import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { parseMessageIds } from '../src/utils/messageIds';

describe('w5 hardening', () => {
    it('parses only positive integer message ids', () => {
        assert.deepEqual(parseMessageIds(['3', '3', '0', '-1', 'x', 8]), [3, 8]);
        assert.deepEqual(parseMessageIds('12'), [12]);
        assert.deepEqual(parseMessageIds(undefined), []);
    });

    it('does not mark every contact read on list', () => {
        const db = fs.readFileSync(path.join('src', 'config', 'db.ts'), 'utf8');
        const controller = fs.readFileSync(
            path.join('src', 'controllers', 'admin', 'messagesController.ts'),
            'utf8'
        );

        assert.equal(db.includes('markedAsRead'), false);
        assert.equal(controller.includes('markedAsRead'), false);
        assert.match(db, /UPDATE contacts SET is_read = 1 WHERE id = \?/);
        assert.match(controller, /WHERE id IN \(/);
    });

    it('logs in only active usernames and unique-indexes them', () => {
        const init = fs.readFileSync(path.join('migrations', '001_init.sql'), 'utf8');
        const alter = fs.readFileSync(
            path.join('migrations', '005_admin_username_unique.sql'),
            'utf8'
        );
        const db = fs.readFileSync(path.join('src', 'config', 'db.ts'), 'utf8');
        const login = fs.readFileSync(
            path.join('src', 'controllers', 'admin', 'loginController.ts'),
            'utf8'
        );

        assert.match(init, /UNIQUE INDEX `uk_username`\(`username` ASC\)/);
        assert.match(alter, /uk_username/);
        assert.match(db, /WHERE username = \? AND status = 1/);
        assert.match(login, /getActiveByUsername/);
    });

    it('applies helmet before express.static and drops DumpSQL.sql', () => {
        const app = fs.readFileSync(path.join('src', 'app.ts'), 'utf8');
        const helmetAt = app.indexOf('app.use(helmet(');
        const staticAt = app.indexOf('express.static(');
        const healthAt = app.indexOf('app.use(healthRouter)');
        const sessionAt = app.indexOf('app.use(session(');

        assert.ok(helmetAt > 0 && helmetAt < staticAt);
        assert.ok(app.includes('assignNonce'));
        assert.ok(healthAt > 0 && healthAt < sessionAt);
        assert.equal(fs.existsSync(path.join('DumpSQL.sql')), false);
    });

    it('lists table columns and keeps password_hash off non-auth reads', () => {
        const db = fs.readFileSync(path.join('src', 'config', 'db.ts'), 'utf8');
        const publicList = db.match(/adminUsers:\s*'([^']+)'/)?.[1] ?? '';
        const authList = db.match(/adminUsersAuth:\s*'([^']+)'/)?.[1] ?? '';

        assert.equal(/\bSELECT \*/.test(db), false);
        assert.equal(publicList.includes('password_hash'), false);
        assert.equal(authList.includes('password_hash'), true);
        assert.match(db, /getAll: `SELECT \$\{cols\.adminUsers\} FROM admin_users`/);
        assert.match(db, /getActiveByUsername: `SELECT \$\{cols\.adminUsersAuth\}/);
    });

    it('deploys a CI artifact instead of git pull on the VPS', () => {
        const workflow = fs.readFileSync(path.join('.github', 'workflows', 'deploy.yml'), 'utf8');

        assert.equal(workflow.includes('git pull'), false);
        assert.match(workflow, /release\.tar\.gz/);
        assert.match(workflow, /npm ci --omit=dev/);
        assert.match(workflow, /node dist\/scripts\/migrate\.js/);
        assert.match(workflow, /appleboy\/scp-action@v1/);
    });
});
