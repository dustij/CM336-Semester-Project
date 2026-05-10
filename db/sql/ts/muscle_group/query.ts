export const selectAllMuscleGroups = `
SELECT
  muscle_group_id AS id,
  name
FROM muscle_group
ORDER BY name ASC
`;
