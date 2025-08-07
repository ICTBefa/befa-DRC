-- --------------------------------------------------------
-- Host:                         localhost
-- Server version:               10.4.19-MariaDB - mariadb.org binary distribution
-- Server OS:                    Win64
-- HeidiSQL Version:             11.3.0.6295
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

-- Dumping structure for table befa_etest.company
CREATE TABLE IF NOT EXISTS `company` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `company_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `active` (`active`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Dumping data for table befa_etest.company: ~3 rows (approximately)
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
INSERT IGNORE INTO `company` (`id`, `company_name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
	(1, 'PT Bekasi Fajar Industrial Estate Tbk', 1, '2021-05-10 14:26:39', '2021-05-10 14:26:39', 1, NULL),
	(2, 'PT Bekasi Surya Pratama', 1, '2021-05-10 14:26:53', '2021-05-10 14:26:53', 1, NULL),
	(3, 'PT Bekasi Matra', 1, '2021-05-10 14:27:15', '2021-05-10 14:27:15', 1, NULL);
/*!40000 ALTER TABLE `company` ENABLE KEYS */;

-- Dumping structure for table befa_etest.email_db
CREATE TABLE IF NOT EXISTS `email_db` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `email_address` varchar(255) DEFAULT NULL,
  `email_password` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` bigint(20) DEFAULT NULL,
  `updated_by` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`)
) ENGINE=InnoDB AUTO_INCREMENT=51 DEFAULT CHARSET=utf8mb4;

-- Dumping data for table befa_etest.email_db: ~1 rows (approximately)
/*!40000 ALTER TABLE `email_db` DISABLE KEYS */;
INSERT IGNORE INTO `email_db` (`id`, `email_address`, `email_password`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
	(1, 'ivan.halim@befa.id', 'Befa2021', '2022-09-14 15:18:51', '2022-09-20 10:49:48', 1, 1);
/*!40000 ALTER TABLE `email_db` ENABLE KEYS */;

-- Dumping structure for table befa_etest.level_akses
CREATE TABLE IF NOT EXISTS `level_akses` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `level_akses_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `psikotes` tinyint(3) NOT NULL DEFAULT 0,
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `active` (`active`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table befa_etest.level_akses: ~4 rows (approximately)
/*!40000 ALTER TABLE `level_akses` DISABLE KEYS */;
INSERT IGNORE INTO `level_akses` (`id`, `level_akses_name`, `psikotes`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
	(1, 'Admin', 1, 1, '2021-03-19 18:52:18', '2022-08-04 14:04:22', 1, 1),
	(2, 'Guest User', 0, 0, '2021-03-19 18:52:18', '2022-09-28 10:03:36', 1, 1),
	(3, 'Psikotes User', 1, 0, '2022-08-04 14:03:03', '2022-09-28 10:04:11', 1, 1),
	(4, 'Psikotes User (2 x 24 jam)', 1, 1, '2022-08-04 14:03:03', '2022-09-01 11:44:50', 1, 1);
/*!40000 ALTER TABLE `level_akses` ENABLE KEYS */;

-- Dumping structure for table befa_etest.location
CREATE TABLE IF NOT EXISTS `location` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `location_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `active` (`active`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci ROW_FORMAT=DYNAMIC;

-- Dumping data for table befa_etest.location: ~3 rows (approximately)
/*!40000 ALTER TABLE `location` DISABLE KEYS */;
INSERT IGNORE INTO `location` (`id`, `location_name`, `active`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
	(1, 'WAM', 1, '2021-05-07 08:35:09', '2021-05-07 08:35:09', 1, NULL),
	(2, 'Bekasi', 1, '2021-05-07 08:35:18', '2021-05-07 08:35:18', 1, NULL),
	(3, 'MM2100', 1, '2021-05-07 08:35:32', '2021-05-07 08:35:32', 1, NULL);
/*!40000 ALTER TABLE `location` ENABLE KEYS */;

-- Dumping structure for table befa_etest.user
CREATE TABLE IF NOT EXISTS `user` (
  `id` bigint(20) unsigned NOT NULL AUTO_INCREMENT,
  `active` tinyint(3) unsigned NOT NULL DEFAULT 1,
  `level_akses_id` bigint(20) unsigned NOT NULL,
  `company_id` bigint(20) unsigned NOT NULL,
  `location_id` bigint(20) unsigned NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `real_password` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nik` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `position` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `division` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fullname` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `reactivate_count` tinyint(3) unsigned NOT NULL DEFAULT 0,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `created_by` bigint(20) unsigned DEFAULT NULL,
  `updated_by` bigint(20) unsigned DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `role_id` (`level_akses_id`),
  KEY `active` (`active`),
  KEY `created_by` (`created_by`),
  KEY `updated_by` (`updated_by`),
  KEY `company_id` (`company_id`),
  KEY `location_id` (`location_id`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table befa_etest.user: ~1 rows (approximately)
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT IGNORE INTO `user` (`id`, `active`, `level_akses_id`, `company_id`, `location_id`, `username`, `password`, `real_password`, `nik`, `position`, `division`, `fullname`, `email`, `reactivate_count`, `created_at`, `updated_at`, `created_by`, `updated_by`) VALUES
	(1, 1, 1, 1, 1, 'admin', '21232f297a57a5a743894a0e4a801fc3', '', '-', 'Admin', 'Admin', 'Admin', 'ivan.halim@befa.id', 0, '2021-03-19 18:54:48', '2022-10-07 13:49:12', 1, 1);
/*!40000 ALTER TABLE `user` ENABLE KEYS */;

/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
