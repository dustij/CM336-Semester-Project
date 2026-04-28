export const createMesocycleInstanceTable = `
CREATE TABLE mesocycle_instance (
  instance_id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  user_id INT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NULL,
  is_current BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_instance_template FOREIGN KEY (template_id) REFERENCES mesocycle_template(template_id),
  CONSTRAINT fk_instance_user FOREIGN KEY (user_id) REFERENCES users(user_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_instance_dates CHECK (
    end_date IS NULL
    OR end_date >= start_date
  )
)
`;
