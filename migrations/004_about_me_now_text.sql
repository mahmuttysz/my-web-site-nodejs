-- Optional homepage "what I'm working on" blurb. Empty = section hidden.

ALTER TABLE `about_me`
  ADD COLUMN IF NOT EXISTS `now_text` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL AFTER `description`;
