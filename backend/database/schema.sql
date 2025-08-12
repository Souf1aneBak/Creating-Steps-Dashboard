DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  fullName VARCHAR(100),
  email VARCHAR(100),
  password VARCHAR(100),
  role VARCHAR(50)
);
CREATE TABLE forms (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT ,
  createdBy VARCHAR(255) NOT NULL,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE sections (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  section_id VARCHAR(255) NOT NULL,
  title VARCHAR(255) NOT NULL,
  FOREIGN KEY (form_id) REFERENCES forms(id) ON DELETE CASCADE
);

CREATE TABLE fields (
  id INT AUTO_INCREMENT PRIMARY KEY,
  section_id INT NOT NULL,
  field_id VARCHAR(255) NOT NULL,
  label VARCHAR(255) NOT NULL,
  type VARCHAR(100),
  required BOOLEAN DEFAULT FALSE,
  showOtherOption BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (section_id) REFERENCES sections(id) ON DELETE CASCADE
);

CREATE TABLE field_options (
  id INT AUTO_INCREMENT PRIMARY KEY,
  field_id INT NOT NULL,
  option_text VARCHAR(255) NOT NULL,
  FOREIGN KEY (field_id) REFERENCES fields(id) ON DELETE CASCADE
);

CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    siteName VARCHAR(255) DEFAULT 'EZZA',
    footerText VARCHAR(255) DEFAULT '© 2025 Tous droits réservés.',
    contactEmail VARCHAR(255),
    phone VARCHAR(50),
    address VARCHAR(255),
    facebook VARCHAR(255),
    instagram VARCHAR(255),
    twitter VARCHAR(255),
    linkedin VARCHAR(255)
);
ALTER TABLE settings ADD COLUMN logoUrl VARCHAR(255);

CREATE TABLE form_responses (
  id INT AUTO_INCREMENT PRIMARY KEY,
  form_id INT NOT NULL,
  submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  answers JSON NOT NULL
);
ALTER TABLE form_responses
ALTER TABLE form_responses ADD COLUMN status VARCHAR(50) DEFAULT 'pending';

CREATE TABLE clients (
  id INT AUTO_INCREMENT PRIMARY KEY,
  companyName VARCHAR(255),
  legalForm VARCHAR(100),
  registrationNumber VARCHAR(100),
  vatNumber VARCHAR(100),
  industry VARCHAR(100),
  foundingDate DATE,
  address TEXT,
  city VARCHAR(100),
  postalCode VARCHAR(50),
  country VARCHAR(100),
  phone VARCHAR(50),
  email VARCHAR(100),
  website VARCHAR(255),
  description TEXT,
  employees VARCHAR(50),
  revenue VARCHAR(50),
  ceoName VARCHAR(100),
  contactPerson VARCHAR(100)
);

ALTER TABLE form_responses
ADD COLUMN client_id INT,
ADD FOREIGN KEY (client_id) REFERENCES clients(id);
