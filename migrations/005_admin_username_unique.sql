-- One login name per admin. Existing DBs may still lack uk_username from 001.

CREATE UNIQUE INDEX IF NOT EXISTS `uk_username` ON `admin_users` (`username`);
