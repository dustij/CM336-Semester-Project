export const createPerformedSetTable = `
CREATE TABLE performed_set (
  set_id INT AUTO_INCREMENT PRIMARY KEY,
  performed_exercise_id INT NOT NULL,
  set_order TINYINT NOT NULL,
  weight INT NOT NULL,
  reps TINYINT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_performed_set_exercise FOREIGN KEY (performed_exercise_id) REFERENCES performed_exercise(performed_exercise_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_performed_set_order CHECK (set_order >= 0),
  CONSTRAINT chk_performed_set_weight CHECK (weight >= 0),
  CONSTRAINT chk_performed_set_reps CHECK (reps >= 0),
  CONSTRAINT uq_performed_set_order UNIQUE (performed_exercise_id, set_order)
)
`;
