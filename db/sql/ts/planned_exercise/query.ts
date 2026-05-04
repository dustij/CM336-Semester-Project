export const insertPlannedExercise = `
INSERT INTO planned_exercise (exercise_id, template_day_id, exercise_order)
VALUES (?, ?, ?)
`;
