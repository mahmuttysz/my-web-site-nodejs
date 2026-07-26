/*
 Navicat Premium Dump SQL

 Source Server         : MariaDBServer
 Source Server Type    : MariaDB
 Source Server Version : 110808 (11.8.8-MariaDB)
 Source Schema         : website

 Target Server Type    : MariaDB
 Target Server Version : 110808 (11.8.8-MariaDB)
 File Encoding         : 65001

 Date: 26/07/2026 04:27:08
*/

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ----------------------------
-- Table structure for about_me
-- ----------------------------
DROP TABLE IF EXISTS `about_me`;
CREATE TABLE `about_me`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `meta_description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) NULL DEFAULT NULL,
  `language` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'tr',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `active` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 3 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of about_me
-- ----------------------------
INSERT INTO `about_me` VALUES (1, 'Hakkımda', 'Kıdemli Yazılım Geliştirme Uzmanı olarak, 10 yılı aşan kapsamlı deneyimimle yazılım\r\ngeliştirme süreçlerinde derin bir uzmanlık sunmaktayım. Yenilikçi çözümler\r\ngeliştirme ve karmaşık projeleri yönetme konusundaki yetkinliğim, ekipler arası iş\r\nbirliğini güçlendirirken yüksek kaliteli yazılım ürünlerinin zamanında teslim\r\nedilmesini sağlamaktadır.\r\nTeknolojik gelişmelere ayak uydurarak sürekli öğrenme ve kendimi geliştirme\r\ntutkum, sektördeki en iyi uygulamaları uygulamamı ve projelere değer katmamı\r\nmümkün kılmaktadır.', '10+ yıllık deneyimimle Kıdemli Yazılım Geliştirme & DevOps Uzmanı olarak ölçeklenebilir sistemler, modern web teknolojileri ve güçlü altyapılar geliştiriyorum.', 1, 1, 'tr', '2023-10-10 00:02:25', '2026-07-25 06:01:55', b'1');
INSERT INTO `about_me` VALUES (2, 'About Me', 'As a Senior Software Development Specialist with over 10 years of extensive experience, I offer deep expertise in software development processes. My proficiency in developing innovative solutions and managing complex projects ensures the timely delivery of high-quality software products while fostering cross-team collaboration.\r\nMy passion for continuous learning and professional growth—keeping pace with technological advancements—enables me to implement industry best practices and add value to projects.', 'With 10+ years of experience as a Senior Software Developer & DevOps Specialist, I build scalable systems, modern web tools, and robust infrastructure.', 1, 1, 'en', '2023-10-10 00:03:45', '2026-07-25 06:02:32', b'1');

-- ----------------------------
-- Table structure for contacts
-- ----------------------------
DROP TABLE IF EXISTS `contacts`;
CREATE TABLE `contacts`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `subject` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `full_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `email` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `message` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `ip` varchar(150) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `mail_log` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `language` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'tr',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 1 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;


-- ----------------------------
-- Table structure for experiences
-- ----------------------------
DROP TABLE IF EXISTS `experiences`;
CREATE TABLE `experiences`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `begin_date` date NOT NULL,
  `end_date` date NULL DEFAULT NULL,
  `language` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'tr',
  `created_by` int(11) NOT NULL,
  `updated_by` int(11) NULL DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `active` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 13 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of experiences
-- ----------------------------
INSERT INTO `experiences` VALUES (1, 'Serbest', 'Kıdemli Yazılım Geliştirme Uzmanı', 'Serbest zamanlı olarak proje bazlı veya kendi yaptığım projelerde sıfırdan projeyi\r\noluşturma veya söz konusu projeye ek web api ya da masaüstü yazılım\r\noluştuyorum.', '2013-01-13', NULL, 'tr', 1, 1, '2024-01-09 00:19:33', '2024-01-21 03:34:09', b'1');
INSERT INTO `experiences` VALUES (2, 'Mini Bilişim Hizmetleri Ltd. Şti.', 'Tam Yığın Geliştirici', 'Klasik PHP, OOP PHP ve CodeIgniter Framework kullanarak kişi ve kurumlara özel\r\nweb uygulamaları geliştirme ve yazılım çözümleri sunma konusunda deneyim\r\nkazandım. HTML5, JavaScript, jQuery, JSON, AJAX, Bootstrap ve CSS kullanarak\r\nweb sitesi tasarımı yaparak full-stack geliştirme çalışmaları gerçekleştirdim.\r\nMySQL ve Microsoft SQL Server üzerinde veritabanı yönetimi yaparak Netsis ile\r\nentegre yazılım çözümleri geliştirdim ve bu süreçte çeşitli optimizasyon çalışmaları\r\nyürüttüm. Ayrıca C# kullanarak Windows Forms ve ASP.NET uygulamaları\r\ntasarlayıp geliştirdim.', '2020-11-01', '2021-03-02', 'tr', 1, 1, '2024-01-09 00:19:37', '2024-01-09 01:48:06', b'1');
INSERT INTO `experiences` VALUES (3, 'Egegen', 'Back-End Geliştirici', 'PHP CodeIgniter Framework kullanarak e-ticaret ve otomasyon sistemli paneller ile\r\nkurumsal web sitesi projelerinde Back-End Geliştirici olarak görev aldım. Projelerin\r\nihtiyaçlarına göre .NET tabanlı Web API’ler de geliştirdim.\r\nBu süreçte kullanıcı deneyimini iyileştirmek ve sistem performansını artırmak\r\namacıyla çeşitli optimizasyonlar gerçekleştirdim. E-ticaret projelerinde ödeme\r\nsistemleri entegrasyon süreçlerini planlayarak bizzat uyguladım.\r\nBazı spesifik e-ticaret projelerinde ödeme sistemi entegrasyonlarının yanı sıra\r\nNetsis gibi uygulamalara ek modüller (NetOpenX) geliştirdim. Takım çalışması ve\r\nproje yönetimi becerilerimle projelerin zamanında ve başarılı bir şekilde\r\ntamamlanmasına katkı sağladım.', '2021-03-04', '2021-10-01', 'tr', 1, 1, '2024-01-09 00:19:41', '2024-01-09 01:22:39', b'1');
INSERT INTO `experiences` VALUES (4, 'Miya Barkod, Yazılım ve Otomasyon Ltd. Şti.', 'Kıdemlı Yazılım Geliştirme Uzmanı', 'C# tabanlı NetOpenX altyapısını kullanarak Netsis kullanan müşterilere özel\r\nWindows Forms ve DevExpress uygulamaları geliştirdim. Panorama Web Servis ile\r\nmüşteri isteklerine uygun ASP.NET Core, Angular veya Windows Forms\r\nuygulamaları tasarladım.\r\nKişi ve kurumlara özel web veya Windows Forms tabanlı CRM ve ERP yazılımları\r\ngeliştirdim. Angular ile geliştirilmiş projelerde front-end tarafında da aktif olarak\r\ngeliştirmeler yaptım. Ayrıca Angular kullanarak Univera ile Netsis (NetOpenX)\r\narasında veri aktarımı sağlayan çift yönlü entegrasyon arayüzü ve altyapısı\r\noluşturdum.', '2021-12-13', '2022-03-31', 'tr', 1, NULL, '2024-01-09 00:19:46', NULL, b'1');
INSERT INTO `experiences` VALUES (5, 'Miya Barkod, Yazılım ve Otomasyon Ltd. Şti.', 'Senior Software Developer Specialist', 'Using the C#-based NetOpenX infrastructure, I developed custom Windows Forms and DevExpress applications for clients using Netsis. I designed ASP.NET Core, Angular, and Windows Forms applications tailored to customer requirements using Panorama Web Services.\r\nI also developed custom web and Windows Forms-based CRM and ERP software solutions for individuals and organizations. In Angular-based projects, I actively contributed to front-end development as well. Additionally, I built integration interfaces and infrastructure using Angular to enable bidirectional data transfer between Univera and Netsis (NetOpenX).', '2021-12-13', '2022-03-31', 'en', 1, NULL, '2024-01-09 00:19:48', NULL, b'1');
INSERT INTO `experiences` VALUES (6, 'Freelance', 'Senior Software Developer Specialist', 'As a freelance developer, I work on both project-based assignments and my own independent projects, building applications from scratch or developing additional Web APIs and desktop software solutions for existing systems.', '2013-01-13', NULL, 'en', 1, NULL, '2024-01-09 00:19:51', NULL, b'1');
INSERT INTO `experiences` VALUES (7, 'Mini Bilişim Hizmetleri Ltd. Şti.', 'Full Stack Developer', 'I gained experience in developing custom web applications and providing software solutions for individuals and organizations using Classic PHP, OOP PHP, and the CodeIgniter Framework. I carried out full-stack development by designing websites using HTML5, JavaScript, jQuery, JSON, AJAX, Bootstrap, and CSS.\r\nI managed databases on MySQL and Microsoft SQL Server and developed software solutions integrated with Netsis, while also performing various optimization improvements throughout the process. In addition, I designed and developed Windows Forms and ASP.NET applications using C#.', '2020-11-01', '2021-03-02', 'en', 1, NULL, '2024-01-09 00:19:55', NULL, b'1');
INSERT INTO `experiences` VALUES (8, 'Egegen', 'Back-End Developer', 'As a Back-End Developer, I worked on e-commerce platforms, automation system panels, and corporate website projects using the PHP CodeIgniter Framework. Depending on project requirements, I also developed .NET-based Web APIs.\r\nIn this process, I implemented various optimizations to improve user experience and enhance system performance. For e-commerce projects, I planned and directly implemented payment system integration processes.\r\nIn some specific e-commerce projects, in addition to payment integrations, I developed additional modules (NetOpenX) for enterprise systems such as Netsis. Through teamwork and project management skills, I contributed to the timely and successful completion of projects.', '2021-03-04', '2021-10-01', 'en', 1, NULL, '2024-01-09 00:20:00', NULL, b'1');
INSERT INTO `experiences` VALUES (9, 'Dokare Teknoloji ve Yazılım Ltd. Şti.', 'Kıdemlı Yazılım Geliştirme Uzmanı', 'Firmalara özel CRM ve ERP yazılım çözümleri geliştirmekteyim. Danışmanlık\r\nhizmetleri sunarak C# ASP.NET Core ve Entity Framework Core teknolojilerini\r\nkullanarak etkili ve ölçeklenebilir uygulamalar tasarlıyorum. Ayrıca PHP OOP,\r\nLaravel ve CodeIgniter Framework ile Vue.js kullanarak dinamik web uygulamaları\r\ngeliştiriyorum.\r\niyzico, PAYTR ve Paratika gibi ödeme platformlarıyla entegre ödeme çözümleri\r\niçeren projeler de geliştirdim. Bu süreçte müşteri ihtiyaçlarını analiz ederek\r\nprojelerin zamanında ve bütçe dahilinde tamamlanmasını sağlıyorum.', '2022-04-01', '2024-01-31', 'tr', 1, 1, '2024-01-09 00:20:03', '2024-02-12 15:15:26', b'1');
INSERT INTO `experiences` VALUES (10, 'Dokare Teknoloji ve Yazılım Ltd. Şti.', 'Senior Software Developer Specialist', 'develop custom CRM and ERP software solutions for companies. By providing consulting services, I design efficient and scalable applications using C# ASP.NET Core and Entity Framework Core technologies. In addition, I develop dynamic web applications using PHP OOP, Laravel, CodeIgniter Framework, and Vue.js.\r\nI have also developed projects that include integrated payment solutions with platforms such as iyzico, PAYTR, and Paratika. Throughout this process, I analyze customer requirements and ensure that projects are delivered on time and within budget.', '2022-04-01', '2024-01-31', 'en', 1, 1, '2024-01-09 00:20:06', '2024-02-12 15:19:34', b'1');
INSERT INTO `experiences` VALUES (11, 'LTA Yazılım A.Ş.', 'Kıdemli Yazılım Geliştirici', 'Kıdemli Yazılım Geliştirme Uzmanı olarak LTA Teknoloji AŞ’de PHP Laravel\r\nFramework, Vue.js, Inertia.js ve Node.js kullanarak web tabanlı online eğitim\r\nsistemine yeni özellikler ekleme ve mevcut hataları giderme süreçlerini yönettim.\r\n.NET Core ve Entity Framework Core kullanarak web uygulamaları, Web API’leri ve\r\nWindows Forms uygulamaları geliştirdim.\r\nProjelerin zamanında ve yüksek kalitede tamamlanmasını sağlamak amacıyla ekip\r\niçinde etkin iş birliği gerçekleştirdim ve teknik sorunları çözerek sistem\r\nperformansını artırdım. DevOps alanında Linux tabanlı (CentOS, Rocky Linux)\r\nsunucularda yazılım projelerinin yayınlanma süreçlerini yönettim. Docker\r\nteknolojisini kullanarak projeleri daha yönetilebilir ve ölçeklenebilir hale getirdim.\r\nAyrıca Windows sunucular için IIS web dağıtım yapılandırmaları oluşturarak .NET\r\nCore Web API’lerinin daha verimli şekilde yayına alınmasını sağladım. Nginx ile ilgili\r\nyapılandırmaları sunucu içinde gerçekleştirdim.\r\nİki yıllık deneyimim boyunca kullanıcı ihtiyaçlarını karşılayan yenilikçi çözümler\r\nsunarak şirketin dijital dönüşümüne önemli katkılarda bulundum.', '2024-02-01', '2026-07-31', 'tr', 1, NULL, '2024-02-12 15:14:36', '2025-05-28 01:59:40', b'1');
INSERT INTO `experiences` VALUES (12, 'LTA Yazılım A.Ş.', 'Senior Software Developer', 'As a Senior Software Development Specialist at LTA Teknoloji AŞ, I managed the processes of adding new features and fixing existing issues for a web-based online education system using PHP Laravel Framework, Vue.js, Inertia.js, and Node.js. I also developed web applications, Web APIs, and Windows Forms applications using .NET Core and Entity Framework Core.\r\nTo ensure projects were completed on time and with high quality, I worked in close collaboration with the team and improved system performance by resolving technical issues. In the DevOps domain, I managed the deployment processes of software projects on Linux-based servers (CentOS, Rocky Linux). I made projects more manageable and scalable using Docker technology. Additionally, I configured IIS deployment structures for Windows servers, enabling more efficient deployment of .NET Core Web APIs. I also handled Nginx configurations on the server side.\r\nThroughout my two years of experience, I made significant contributions to the company’s digital transformation by delivering innovative solutions that met user needs.', '2024-02-01', '2026-07-31', 'en', 1, NULL, '2024-02-12 15:16:17', NULL, b'1');

-- ----------------------------
-- Table structure for projects
-- ----------------------------
DROP TABLE IF EXISTS `projects`;
CREATE TABLE `projects`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `description` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `link_text` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `link_url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `tags` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin NULL DEFAULT NULL CHECK (json_valid(`tags`)),
  `turn` tinyint(4) NULL DEFAULT 1,
  `language` char(2) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL DEFAULT 'tr',
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `active` bit(1) NULL DEFAULT b'1',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 15 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of projects
-- ----------------------------
INSERT INTO `projects` VALUES (1, 'Kişisel Web Sitem', 'Node.js, Express.js ile geliştirilmiş, kişisel web siteme ait kaynak kodları.', 'GitHub', 'https://github.com/mahmuttysz/my-web-site-nodejs', '[\"Node.js\", \"Express.js\", \"MariaDB\"]', 1, 'tr', '2026-07-25 01:37:49', '2026-07-26 04:01:17', b'1');
INSERT INTO `projects` VALUES (2, 'Personal Web Site', 'Source code for my personal website, developed using Node.js and Express.js.', 'GitHub', 'https://github.com/mahmuttysz/my-web-site-nodejs', '[\"Node.js\", \"Express.js\", \"MariaDB\"]', 1, 'en', '2026-07-25 01:38:07', '2026-07-26 04:01:18', b'1');
INSERT INTO `projects` VALUES (3, 'Panorama To Netsis', 'Panorama(Univera) platformundan Netsis platformuna veri aktarma modülüdür.', 'GitHub', 'https://github.com/mahmuttysz/PanoramaToNetsis', '[\"C#\", \".NET Framework\", \"Mssql\"]', 5, 'tr', '2026-07-26 02:11:31', '2026-07-26 04:04:23', b'1');
INSERT INTO `projects` VALUES (4, 'Panorama To Netsis', 'This is a module for transferring data from the Panorama (Univera) platform to the Netsis platform.', 'GitHub', 'https://github.com/mahmuttysz/PanoramaToNetsis', '[\"C#\", \".NET Framework\", \"Mssql\"]', 5, 'en', '2026-07-26 02:11:47', '2026-07-26 04:04:24', b'1');
INSERT INTO `projects` VALUES (5, 'Kişisel Web Sitem(PHP CodeIgniter3)', 'PHP CodeIgniter framework ile geliştirilmiş, kişisel web sitemin önceki versiyonuna ait kaynak kodları.', 'GitHub', 'https://github.com/mahmuttysz/MyWebSite', '[\"PHP\", \"CodeIgniter3\", \"MariaDB\"]', 4, 'tr', '2026-07-26 02:21:03', '2026-07-26 04:25:45', b'0');
INSERT INTO `projects` VALUES (6, 'Personal Web Site(PHP CodeIgniter3)', 'Source code for the previous version of my personal website, developed using the PHP CodeIgniter framework.', 'GitHub', 'https://github.com/mahmuttysz/MyWebSite', '[\"PHP\", \"CodeIgniter3\", \"MariaDB\"]', 4, 'en', '2026-07-26 02:21:20', '2026-07-26 04:25:47', b'0');
INSERT INTO `projects` VALUES (7, 'Hobi Uygulamam', 'Hobi uygulamam.(PC Shutdown Task)', 'GitHub', 'https://github.com/mahmuttysz/PcShutDownTask', '[\"C#\", \".NET Core\"]', 6, 'tr', '2026-07-26 02:27:12', '2026-07-26 04:04:27', b'1');
INSERT INTO `projects` VALUES (8, 'My Hobby App', 'My hobby app.(PC Shutdown Task)', 'GitHub', 'https://github.com/mahmuttysz/PcShutDownTask', '[\"C#\", \".NET Core\"]', 6, 'en', '2026-07-26 02:27:59', '2026-07-26 04:04:29', b'1');
INSERT INTO `projects` VALUES (9, 'Hobi Uygulamam', 'Hobi uygulamam.(Mail Bot Attack)', 'GitHub', 'https://github.com/mahmuttysz/FormAppDev', '[\"C#\", \".NET Core\"]', 7, 'tr', '2026-07-26 02:33:42', '2026-07-26 04:04:31', b'1');
INSERT INTO `projects` VALUES (10, 'My Hobby App', 'My hobby app.(Mail Bot Attack)', 'GitHub', 'https://github.com/mahmuttysz/FormAppDev', '[\"C#\", \".NET Core\"]', 7, 'en', '2026-07-26 02:34:10', '2026-07-26 04:04:32', b'1');
INSERT INTO `projects` VALUES (11, 'Mikro Servis Çalışmam', 'Mikro Servis Çalışmam', 'GitHub', 'https://github.com/mahmuttysz/MyMicroServiceApp', '[\"C#\", \".NET Core\", \"Mssql\"]', 3, 'tr', '2026-07-26 03:23:04', '2026-07-26 04:04:06', b'1');
INSERT INTO `projects` VALUES (12, 'My MicroService Work', 'My MicroService Work', 'GitHub', 'https://github.com/mahmuttysz/MyMicroServiceApp', '[\"C#\", \".NET Core\", \"Mssql\"]', 3, 'en', '2026-07-26 03:24:15', '2026-07-26 04:04:08', b'1');
INSERT INTO `projects` VALUES (13, 'Kişisel Web Sitem(ASP.NET Core)', 'ASP.NET Core ile geliştirilmiş, kişisel web sitemin önceki versiyonuna ait kaynak kodları.', 'GitHub', 'https://github.com/mahmuttysz/MyProject', '[\"C#\", \".NET Core\", \"Mssql\"]', 2, 'tr', '2026-07-26 03:54:32', '2026-07-26 04:03:57', b'1');
INSERT INTO `projects` VALUES (14, 'Personal Web Site(ASP.NET Core)', 'Source code for the previous version of my personal website, developed using ASP.NET Core.', 'GitHub', 'https://github.com/mahmuttysz/MyProject', '[\"C#\", \".NET Core\", \"Mssql\"]', 2, 'en', '2026-07-26 03:55:07', '2026-07-26 04:03:59', b'1');

-- ----------------------------
-- Table structure for social_medias
-- ----------------------------
DROP TABLE IF EXISTS `social_medias`;
CREATE TABLE `social_medias`  (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `username` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NOT NULL,
  `url` varchar(255) CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `icon` text CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci NULL DEFAULT NULL,
  `turn` tinyint(4) NULL DEFAULT 0,
  `created_at` datetime NOT NULL DEFAULT current_timestamp(),
  `updated_at` datetime NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
  `active` bit(1) NOT NULL DEFAULT b'1',
  PRIMARY KEY (`id`) USING BTREE
) ENGINE = InnoDB AUTO_INCREMENT = 7 CHARACTER SET = utf8mb4 COLLATE = utf8mb4_general_ci ROW_FORMAT = Dynamic;

-- ----------------------------
-- Records of social_medias
-- ----------------------------
INSERT INTO `social_medias` VALUES (1, 'LinkedIn', 'mahmut-tuysuz', 'https://linkedin.com/in/mahmut-tuysuz', '<svg width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z\" /></svg>\r\n', 1, '2026-07-25 00:18:32', '2026-07-25 00:37:26', b'1');
INSERT INTO `social_medias` VALUES (2, 'GitHub', 'mahmuttysz', 'https://github.com/mahmuttysz', '<svg width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z\" /></svg>\r\n', 2, '2026-07-25 00:18:43', '2026-07-25 00:50:12', b'1');
INSERT INTO `social_medias` VALUES (3, 'X(Twitter)', 'mahmuttuysuz_', 'https://x.com/mahmuttuysuz_', '<svg width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M10.053,7.988l5.631,8.024h-1.497L8.566,7.988H10.053z M21,6v12	c0,1.657-1.343,3-3,3H6c-1.657,0-3-1.343-3-3V6c0-1.657,1.343-3,3-3h12C19.657,3,21,4.343,21,6z M17.538,17l-4.186-5.99L16.774,7	h-1.311l-2.704,3.16L10.552,7H6.702l3.941,5.633L6.906,17h1.333l3.001-3.516L13.698,17H17.538z\"></path>\r\n</svg>\r\n', 5, '2026-07-25 00:19:29', '2026-07-25 01:17:15', b'0');
INSERT INTO `social_medias` VALUES (4, 'Instagram', 'mahmuttuysuz_', 'https://instagram.com/mahmuttuysuz_', '<svg width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M 8 3 C 5.239 3 3 5.239 3 8 L 3 16 C 3 18.761 5.239 21 8 21 L 16 21 C 18.761 21 21 18.761 21 16 L 21 8 C 21 5.239 18.761 3 16 3 L 8 3 z M 18 5 C 18.552 5 19 5.448 19 6 C 19 6.552 18.552 7 18 7 C 17.448 7 17 6.552 17 6 C 17 5.448 17.448 5 18 5 z M 12 7 C 14.761 7 17 9.239 17 12 C 17 14.761 14.761 17 12 17 C 9.239 17 7 14.761 7 12 C 7 9.239 9.239 7 12 7 z M 12 9 A 3 3 0 0 0 9 12 A 3 3 0 0 0 12 15 A 3 3 0 0 0 15 12 A 3 3 0 0 0 12 9 z\"></path>\r\n</svg> ', 4, '2026-07-25 00:19:40', '2026-07-25 01:16:51', b'0');
INSERT INTO `social_medias` VALUES (5, 'Facebook', 'mahmuttuysuz45', 'https://facebook.com/mahmuttuysuz45', '<svg width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M12,2C6.477,2,2,6.477,2,12c0,5.013,3.693,9.153,8.505,9.876V14.65H8.031v-2.629h2.474v-1.749 c0-2.896,1.411-4.167,3.818-4.167c1.153,0,1.762,0.085,2.051,0.124v2.294h-1.642c-1.022,0-1.379,0.969-1.379,2.061v1.437h2.995 l-0.406,2.629h-2.588v7.247C18.235,21.236,22,17.062,22,12C22,6.477,17.523,2,12,2z\"></path>\r\n</svg>\r\n', 6, '2026-07-25 00:22:18', '2026-07-25 01:16:48', b'0');
INSERT INTO `social_medias` VALUES (6, 'WhatsApp', 'mahmuttuysuz', 'https://wa.me/905070422693', '<svg width=\"20\" height=\"20\" fill=\"currentColor\" viewBox=\"0 0 24 24\"><path d=\"M19.077,4.928C17.191,3.041,14.683,2.001,12.011,2c-5.506,0-9.987,4.479-9.989,9.985 c-0.001,1.76,0.459,3.478,1.333,4.992L2,22l5.233-1.237c1.459,0.796,3.101,1.215,4.773,1.216h0.004 c5.505,0,9.986-4.48,9.989-9.985C22.001,9.325,20.963,6.816,19.077,4.928z M16.898,15.554c-0.208,0.583-1.227,1.145-1.685,1.186 c-0.458,0.042-0.887,0.207-2.995-0.624c-2.537-1-4.139-3.601-4.263-3.767c-0.125-0.167-1.019-1.353-1.019-2.581 S7.581,7.936,7.81,7.687c0.229-0.25,0.499-0.312,0.666-0.312c0.166,0,0.333,0,0.478,0.006c0.178,0.007,0.375,0.016,0.562,0.431 c0.222,0.494,0.707,1.728,0.769,1.853s0.104,0.271,0.021,0.437s-0.125,0.27-0.249,0.416c-0.125,0.146-0.262,0.325-0.374,0.437 c-0.125,0.124-0.255,0.26-0.11,0.509c0.146,0.25,0.646,1.067,1.388,1.728c0.954,0.85,1.757,1.113,2.007,1.239 c0.25,0.125,0.395,0.104,0.541-0.063c0.146-0.166,0.624-0.728,0.79-0.978s0.333-0.208,0.562-0.125s1.456,0.687,1.705,0.812 c0.25,0.125,0.416,0.187,0.478,0.291C17.106,14.471,17.106,14.971,16.898,15.554z\"></path>\r\n</svg>\r\n', 3, '2026-07-25 00:23:20', '2026-07-25 01:16:47', b'0');


SET FOREIGN_KEY_CHECKS = 1;
