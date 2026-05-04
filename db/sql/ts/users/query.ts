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
