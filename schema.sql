CREATE DATABASE IF NOT EXISTS upcat_crawler;

USE upcat_crawler;

CREATE TABLE IF NOT EXISTS passers (
    name varchar(256) DEFAULT NULL,
    campus varchar(32) DEFAULT NULL,
    course varchar(128) DEFAULT NULL,
    is_pending boolean NOT NULL DEFAULT 0
);

