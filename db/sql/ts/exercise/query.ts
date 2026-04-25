export const createExerciseTable = `
CREATE TABLE exercise (
  exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  muscle_group_id INT NOT NULL,
  created_by_user_id INT NULL,
  name VARCHAR(150) NOT NULL,
  CONSTRAINT fk_exercise_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
  CONSTRAINT fk_exercise_muscle_group FOREIGN KEY (muscle_group_id) REFERENCES muscle_group(muscle_group_id),
  CONSTRAINT fk_exercise_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
    ON DELETE SET NULL,
  CONSTRAINT uq_exercise_name_equipment_muscle_group UNIQUE (name, equipment_id, muscle_group_id)
)
`;

function toSqlLimit(value: number, label: string) {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`);
  }

  return value;
}

export function selectExerciseCatalog(limit: number, offset: number) {
  const safeLimit = toSqlLimit(limit, 'limit');
  const safeOffset = toSqlLimit(offset, 'offset');

  return `
SELECT
  e.exercise_id AS id,
  e.name,
  eq.name AS equipment,
  mg.name AS muscleGroup
FROM exercise AS e
LEFT JOIN equipment AS eq
  ON eq.equipment_id = e.equipment_id
LEFT JOIN muscle_group AS mg
  ON mg.muscle_group_id = e.muscle_group_id
ORDER BY e.name ASC, e.exercise_id ASC
LIMIT ${safeLimit} OFFSET ${safeOffset};
`;
}
