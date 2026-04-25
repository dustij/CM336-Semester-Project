export const createMuscleGroupTable = `
CREATE TABLE muscle_group (
  muscle_group_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
)
`;

// TODO: selectAllMuscleGroups
