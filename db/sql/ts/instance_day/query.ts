export const createInstanceDayTable = `
CREATE TABLE instance_day (
  instance_day_id INT AUTO_INCREMENT PRIMARY KEY,
  template_day_id INT NULL,
  instance_id INT NOT NULL,
  week_number TINYINT NOT NULL,
  end_date DATE NULL,
  STATUS ENUM(
    'PLANNED',
    'IN_PROGRESS',
    'COMPLETED',
    'SKIPPED'
  ) NOT NULL DEFAULT 'PLANNED',
  CONSTRAINT fk_instance_day_template_day FOREIGN KEY (template_day_id) REFERENCES template_day(template_day_id)
    ON DELETE SET NULL,
  CONSTRAINT fk_instance_day_instance FOREIGN KEY (instance_id) REFERENCES mesocycle_instance(instance_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_instance_day_week_number CHECK (week_number >= 1),
  CONSTRAINT uq_instance_template_day_week UNIQUE (instance_id, template_day_id, week_number)
)
`;
