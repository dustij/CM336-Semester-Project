export const createPerformedExerciseTable = `
CREATE TABLE performed_exercise (
  performed_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  planned_exercise_id INT NULL,
  exercise_id INT NOT NULL,
  instance_day_id INT NOT NULL,
  exercise_order TINYINT NOT NULL,
  STATUS ENUM(
    'COMPLETED',
    'SWAPPED',
    'SKIPPED',
    'ADDED'
  ) NOT NULL DEFAULT 'COMPLETED',
  CONSTRAINT fk_performed_exercise_planned FOREIGN KEY (planned_exercise_id) REFERENCES planned_exercise(planned_exercise_id)
    ON DELETE SET NULL,
  CONSTRAINT fk_performed_exercise_exercise FOREIGN KEY (exercise_id) REFERENCES exercise(exercise_id),
  CONSTRAINT fk_performed_exercise_instance_day FOREIGN KEY (instance_day_id) REFERENCES instance_day(instance_day_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_performed_exercise_order CHECK (exercise_order >= 0)
)
`;
