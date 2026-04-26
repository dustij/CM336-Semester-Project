export const createMuscleGroupTable = `
CREATE TABLE muscle_group (
  muscle_group_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
)
`;

export const selectAllMuscleGroups = `SELECT name FROM muscle_group`;
