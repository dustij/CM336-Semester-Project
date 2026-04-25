export const createUsersTable = `
CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
)
`;

export const insertUser = `
INSERT INTO users (email, display_name, password_hash)
VALUES (?, ?, ?)
`;

export const selectUserCredentialsByEmail = `
SELECT user_id AS id, password_hash
FROM users
WHERE email = ?
LIMIT 1
`;

export const selectUserById = `
SELECT *
FROM users
WHERE user_id = ?
LIMIT 1
`;
