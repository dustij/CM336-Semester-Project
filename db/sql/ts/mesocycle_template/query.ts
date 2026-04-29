export const insertMesocycleTemplate = `
INSERT INTO mesocycle_template (created_by_user_id, title, duration_weeks)
VALUES (?, ?, ?)
`;

export const selectMesocycleListByUser = `
SELECT
  template_id AS id,
  title,
  duration_weeks,
  getDaysPerWeekInTemplate(template_id) as days_per_week
FROM mesocycle_template mt
WHERE created_by_user_id = ?
  AND is_deleted = FALSE
ORDER BY template_id DESC
`;
