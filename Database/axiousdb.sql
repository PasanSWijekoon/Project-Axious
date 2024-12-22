-- --------------------------------------------------------
-- Host:                         127.0.0.1
-- Server version:               8.0.30 - MySQL Community Server - GPL
-- Server OS:                    Win64
-- HeidiSQL Version:             12.1.0.6537
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Dumping database structure for axiousdb
CREATE DATABASE IF NOT EXISTS `axiousdb` /*!40100 DEFAULT CHARACTER SET utf8mb3 */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `axiousdb`;

-- Dumping structure for table axiousdb.employees
CREATE TABLE IF NOT EXISTS `employees` (
  `empid` int NOT NULL AUTO_INCREMENT,
  `first_name` varchar(50) NOT NULL,
  `last_name` varchar(50) NOT NULL,
  `mobile` varchar(10) NOT NULL,
  `nic` varchar(45) NOT NULL,
  `registered_date` datetime NOT NULL,
  `Supervisor_id` int NOT NULL,
  PRIMARY KEY (`empid`),
  KEY `fk_employees_Supervisor1_idx` (`Supervisor_id`),
  CONSTRAINT `fk_employees_Supervisor1` FOREIGN KEY (`Supervisor_id`) REFERENCES `supervisor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=1015 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table axiousdb.employees: ~5 rows (approximately)
INSERT INTO `employees` (`empid`, `first_name`, `last_name`, `mobile`, `nic`, `registered_date`, `Supervisor_id`) VALUES
	(1005, 'Charitha', 'Attalage', '0719376446', '200001511027', '2024-11-19 10:38:39', 1),
	(1007, 'Daniel', 'Hope', '0789389667', '200178119025', '2024-11-19 14:00:01', 1),
	(1008, 'Luffy', 'Silva', '0765498828', '200301566717', '2024-11-19 22:11:13', 1),
	(1013, 'Elon', 'Musk', '0775556863', '200301522045', '2024-12-21 01:36:39', 1),
	(1014, 'David', 'Peris', '0785523698', '200201544045', '2024-12-21 11:42:10', 1);

-- Dumping structure for table axiousdb.save_weights
CREATE TABLE IF NOT EXISTS `save_weights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weight_value` float NOT NULL,
  `timestamp` datetime NOT NULL,
  `employees_empid` int NOT NULL,
  `order_id` varchar(45) NOT NULL,
  `Supervisor_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_save_weights_employees1_idx` (`employees_empid`),
  KEY `fk_save_weights_Supervisor1_idx` (`Supervisor_id`),
  CONSTRAINT `fk_save_weights_employees1` FOREIGN KEY (`employees_empid`) REFERENCES `employees` (`empid`),
  CONSTRAINT `fk_save_weights_Supervisor1` FOREIGN KEY (`Supervisor_id`) REFERENCES `supervisor` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table axiousdb.save_weights: ~17 rows (approximately)
INSERT INTO `save_weights` (`id`, `weight_value`, `timestamp`, `employees_empid`, `order_id`, `Supervisor_id`) VALUES
	(6, 140, '2024-11-20 00:10:46', 1005, 'ORD1732041646282', 1),
	(7, 70, '2024-11-20 00:10:46', 1007, 'ORD1732041646282', 1),
	(8, 70, '2024-11-20 00:11:30', 1007, 'ORD1732041689688', 1),
	(9, 210, '2024-11-20 01:16:17', 1005, 'ORD1732045576958', 1),
	(10, 70, '2024-11-20 01:16:17', 1007, 'ORD1732045576958', 1),
	(11, 140, '2024-11-20 01:16:17', 1008, 'ORD1732045576958', 1),
	(12, 1019.73, '2024-12-19 22:35:23', 1005, 'ORD1734627922833', 1),
	(13, 524.39, '2024-12-19 22:35:23', 1007, 'ORD1734627922833', 1),
	(14, 1.02, '2024-12-20 20:32:21', 1005, 'ORD1734706941169', 1),
	(15, 1.27, '2024-12-20 20:32:21', 1008, 'ORD1734706941169', 1),
	(16, 1.98, '2024-12-21 01:29:23', 1005, 'ORD1734724762918', 1),
	(17, 0.99, '2024-12-21 01:29:23', 1007, 'ORD1734724762918', 1),
	(18, 0.99, '2024-12-21 01:29:23', 1008, 'ORD1734724762918', 1),
	(19, 0.99, '2024-12-21 10:54:35', 1005, 'ORD1734758674466', 1),
	(20, 4.2, '2024-12-21 10:54:35', 1013, 'ORD1734758674466', 1),
	(21, 11.5, '2024-12-21 11:44:10', 1014, 'ORD1734761650105', 1),
	(22, 5.75, '2024-12-21 11:44:10', 1005, 'ORD1734761650105', 1);

-- Dumping structure for table axiousdb.supervisor
CREATE TABLE IF NOT EXISTS `supervisor` (
  `id` int NOT NULL AUTO_INCREMENT,
  `mobile` varchar(10) NOT NULL,
  `first_name` varchar(45) NOT NULL,
  `last_name` varchar(45) NOT NULL,
  `password` varchar(45) NOT NULL,
  `registered_date` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table axiousdb.supervisor: ~0 rows (approximately)
INSERT INTO `supervisor` (`id`, `mobile`, `first_name`, `last_name`, `password`, `registered_date`) VALUES
	(1, '0775512782', 'David', 'Williams', 'Java@8828', '2024-11-19 10:35:20');

-- Dumping structure for table axiousdb.weights
CREATE TABLE IF NOT EXISTS `weights` (
  `id` int NOT NULL AUTO_INCREMENT,
  `weight_value` float NOT NULL,
  `timestamp` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=54 DEFAULT CHARSET=utf8mb3;

-- Dumping data for table axiousdb.weights: ~45 rows (approximately)
INSERT INTO `weights` (`id`, `weight_value`, `timestamp`) VALUES
	(1, 4, '2024-11-19 11:33:17'),
	(2, 12, '2024-11-19 11:59:35'),
	(3, 12.2, '2024-11-19 12:33:57'),
	(4, 16.2, '2024-11-19 12:34:34'),
	(5, 20, '2024-11-19 12:34:49'),
	(8, 70, '2024-11-19 12:36:31'),
	(9, 12.34, '2024-12-19 20:52:36'),
	(10, 12.34, '2024-12-19 21:04:21'),
	(11, -10.79, '2024-12-19 21:11:36'),
	(12, 1813.35, '2024-12-19 21:11:57'),
	(13, -10.89, '2024-12-19 21:16:22'),
	(14, 698.5, '2024-12-19 21:16:58'),
	(15, -8.5, '2024-12-19 22:31:58'),
	(16, -16.37, '2024-12-19 22:32:02'),
	(17, 1019.73, '2024-12-19 22:34:26'),
	(18, 524.39, '2024-12-19 22:35:15'),
	(19, 0, '2024-12-20 19:04:56'),
	(20, 0, '2024-12-20 19:05:59'),
	(21, 0, '2024-12-20 19:13:16'),
	(22, 0, '2024-12-20 19:13:29'),
	(23, 0, '2024-12-20 19:13:41'),
	(24, 0, '2024-12-20 19:13:53'),
	(25, 0, '2024-12-20 19:14:06'),
	(26, 0, '2024-12-20 19:14:19'),
	(27, 0, '2024-12-20 19:14:31'),
	(28, 0, '2024-12-20 19:14:44'),
	(29, 0, '2024-12-20 19:30:15'),
	(30, 0, '2024-12-20 19:30:37'),
	(31, 0, '2024-12-20 19:32:19'),
	(32, 0, '2024-12-20 19:32:41'),
	(33, 0, '2024-12-20 19:34:47'),
	(34, 0.01, '2024-12-20 19:40:17'),
	(35, 0, '2024-12-20 19:41:08'),
	(36, 0.01, '2024-12-20 19:42:43'),
	(37, 0, '2024-12-20 19:42:55'),
	(38, 0, '2024-12-20 20:03:34'),
	(39, 0, '2024-12-20 20:08:13'),
	(40, 0, '2024-12-20 20:18:51'),
	(41, 0.01, '2024-12-20 20:19:04'),
	(42, 0.01, '2024-12-20 20:19:16'),
	(43, 0, '2024-12-20 20:19:39'),
	(44, 0, '2024-12-20 20:21:21'),
	(45, 0, '2024-12-20 20:21:44'),
	(46, 0, '2024-12-20 20:21:57'),
	(47, 0.98, '2024-12-20 20:26:05'),
	(48, 1.02, '2024-12-20 20:31:10'),
	(49, 1.27, '2024-12-20 20:32:08'),
	(50, 0.98, '2024-12-20 20:37:31'),
	(51, 0.99, '2024-12-20 20:38:01'),
	(52, 4.2, '2024-12-21 10:50:40'),
	(53, 5.75, '2024-12-21 10:56:37');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
