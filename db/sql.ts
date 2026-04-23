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
  selectExerciseCatalog: `
  SELECT
    e.id,
    e.name,
    eq.name AS equipment,
    mg.name AS muscleGroup
  FROM exercise AS e
  LEFT JOIN equipment AS eq
    ON eq.id = e.equipment_id
  LEFT JOIN muscle_group AS mg
    ON mg.id = e.muscle_group_id
  ORDER BY e.name ASC
  LIMIT 100
  `,
};
