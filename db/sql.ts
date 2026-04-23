export const queries = {
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

  // Mesocycle Template Statements!
  createMesocycleTemplateTable: `
  CREATE TABLE IF NOT EXISTS mesocycle_template (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL
    description TEXT NULL
    duration_weeks INT NOT NULL
    is_favorite BOOLEAN NOT NULL
    )`,
  insertMesocycleTemplate: `
  INSERT INTO mesocycle_template (title, description, duration_weeks, is_favorite)
  VALUES(?, ?, ?, ?)
  `,
  selectTemplatesByFavorite: `
  SELECT id, title, duration_weeks
  FROM mesocycle_template
  WHERE is_favorite = TRUE
  `,
  selectTemplateById: `
  SELECT *
  FROM mesocycle_template
  WHERE id = ?
  LIMIT 1
  `,

  // User Template Statments
  createUserTemplateTable: `
  CREATE TABLE IF NOT EXISTS user_template (
    user_id INT
    template_id INT
  ) `
};
