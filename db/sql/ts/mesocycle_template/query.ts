export const createMesocycleTemplateTable = `
CREATE TABLE mesocycle_template (
  template_id INT AUTO_INCREMENT PRIMARY KEY,
  created_by_user_id INT NULL,
  title VARCHAR(255) NOT NULL,
  duration_weeks TINYINT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_template_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES users(user_id)
    ON DELETE SET NULL,
  CONSTRAINT chk_template_duration_weeks CHECK (
    duration_weeks BETWEEN 1 AND 12
  )
)
`;
