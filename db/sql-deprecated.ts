export const queries = {
  // Dusti's
  createUsersTable: `
  CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    display_name VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
  )
  `,
  insertUser: `
  INSERT INTO users (email, display_name, password_hash)
  VALUES (?, ?, ?)
  `,
  selectUserCredentialsByEmail: `
  SELECT id, password_hash
  FROM users
  WHERE email = ?
  LIMIT 1
  `,
  selectUserById: `
  SELECT *
  FROM users
  WHERE id = ?
  LIMIT 1
  `,

  // Luke's Potential Statements
  createMesocycleTemplateTable: `
  CREATE TABLE IF NOT EXISTS mesocycle_template (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
    description TEXT NULL
    duration_weeks INT NOT NULL
    is_favorite BOOLEAN NULL
    `,
  insertMesocycleTemplate: `
  INSERT INTO mesocycle_template (title, description, duration_weeks, is_favorite)
  VALUES(?, ?, ?, ?)
  `,
};
