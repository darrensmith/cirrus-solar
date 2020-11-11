CREATE DATABASE  IF NOT EXISTS `industryswarm_company` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */ /*!80016 DEFAULT ENCRYPTION='N' */;
USE `industryswarm_company`;
-- ------------------------------------------------------
-- Database: industryswarm_company
-- ------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
 SET NAMES utf8 ;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `settings`
--

DROP TABLE IF EXISTS `settings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `settings` (
  `id` int NOT NULL AUTO_INCREMENT,
  `settingName` varchar(255) DEFAULT NULL,
  `description` varchar(500) DEFAULT NULL,
  `settingValue` varchar(255) DEFAULT NULL,
  `dateCreated` datetime DEFAULT NULL,
  `dateLastModified` datetime DEFAULT NULL,
  `authorId` int DEFAULT NULL,
  `lastModifiedById` int DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  `settingIdString` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;


--
-- Table structure for table `sessions`
--

DROP TABLE IF EXISTS `sessions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `sessions` (
  `id` int NOT NULL AUTO_INCREMENT,
  `sessionToken` varchar(100) DEFAULT NULL,
  `identityAccessToken` varchar(100) DEFAULT NULL,
  `identityRefreshToken` varchar(100) DEFAULT NULL,
  `dateCreated` datetime DEFAULT NULL,
  `dateLastModified` datetime DEFAULT NULL,
  `authorId` int DEFAULT NULL,
  `lastModifiedById` int DEFAULT NULL,
  `ownerUserId` int DEFAULT NULL,
  `sessionData` mediumtext,
  `uuid` varchar(36) DEFAULT NULL,
  `identityTokenType` varchar(45) DEFAULT NULL,
  `identityDateExpires` datetime DEFAULT NULL,
  `identityScope` varchar(1000) DEFAULT NULL,
  `isActive` tinyint(1) DEFAULT NULL,
  `isDeleted` tinyint(1) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;



--
-- Table structure for table `schemaChangeLog`
--

DROP TABLE IF EXISTS `schemaChangeLog`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
 SET character_set_client = utf8mb4 ;
CREATE TABLE `schemaChangeLog` (
  `id` INT NOT NULL,
  `majorReleaseNumber` VARCHAR(2) NULL,
  `minorReleaseNumber` VARCHAR(2) NULL,
  `pointReleaseNumber` VARCHAR(4) NULL,
  `scriptName` VARCHAR(100) NULL,
  `dateApplied` DATETIME NULL,
  PRIMARY KEY (`id`));
/*!40101 SET character_set_client = @saved_cs_client */;


/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;
/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;