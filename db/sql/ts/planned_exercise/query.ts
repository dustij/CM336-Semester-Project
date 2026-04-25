export const createPlannedExerciseTable = `
CREATE TABLE planned_exercise (
  planned_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  exercise_id INT NOT NULL,
  template_day_id INT NOT NULL,
  exercise_order TINYINT NOT NULL,
  CONSTRAINT fk_planned_exercise_exercise FOREIGN KEY (exercise_id) REFERENCES exercise(exercise_id),
  CONSTRAINT fk_planned_exercise_template_day FOREIGN KEY (template_day_id) REFERENCES template_day(template_day_id)
    ON DELETE CASCADE,
  CONSTRAINT uq_planned_exercise_order UNIQUE (template_day_id, exercise_order)
)
`;
