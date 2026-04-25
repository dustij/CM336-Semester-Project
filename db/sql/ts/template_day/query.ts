export const createTemplateDayTable = `
CREATE TABLE template_day (
  template_day_id INT AUTO_INCREMENT PRIMARY KEY,
  template_id INT NOT NULL,
  day_of_week ENUM(
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
  ) NOT NULL,
  day_order TINYINT NOT NULL,
  CONSTRAINT fk_template_day_template FOREIGN KEY (template_id) REFERENCES mesocycle_template(template_id)
    ON DELETE CASCADE,
  CONSTRAINT chk_template_day_order CHECK (
    day_order BETWEEN 0 AND 6
  ),
  CONSTRAINT uq_template_day_order UNIQUE (template_id, day_order),
  CONSTRAINT uq_template_day_weekday UNIQUE (template_id, day_of_week)
)
`;
