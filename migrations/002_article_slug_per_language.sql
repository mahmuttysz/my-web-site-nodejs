-- Unique slug per language (same slug allowed in tr and en).
-- DROP INDEX IF EXISTS: existing DBs still have uk_slug from 001_init.

ALTER TABLE `articles` DROP INDEX IF EXISTS `uk_slug`;

CREATE UNIQUE INDEX IF NOT EXISTS `uk_lang_slug` ON `articles` (`language`, `slug`);
