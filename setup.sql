CREATE DATABASE paete_budget;
USE paete_budget;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'staff') DEFAULT 'staff'
);

-- Passwords are encrypted '12345'
INSERT INTO users (username, password, role) VALUES 
('admin', '$2y$10$8W3Y6uR5Wf2zG8pYqO/7e.H0Jm3k6R9T1qX9zE0fU5vO/pE/6Q7aO', 'admin'),
('staff', '$2y$10$8W3Y6uR5Wf2zG8pYqO/7e.H0Jm3k6R9T1qX9zE0fU5vO/pE/6Q7aO', 'staff');