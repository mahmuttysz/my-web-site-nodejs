-- Unlisted draft preview URLs. Multiple NULLs are allowed until backfill runs.

ALTER TABLE `articles`
  ADD COLUMN IF NOT EXISTS `preview_token` char(64) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL AFTER `slug`;

UPDATE `articles`
SET `preview_token` = LOWER(SHA2(CONCAT(id, '-', UUID()), 256))
WHERE `preview_token` IS NULL OR `preview_token` = '';

CREATE UNIQUE INDEX IF NOT EXISTS `uk_preview_token` ON `articles` (`preview_token`);
