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

export const selectMesocycleTemplateById = `
SELECT
  mt.template_id AS template_id,
  mt.title AS title,
  mt.duration_weeks AS duration_weeks,
  td.template_day_id AS template_day_id,
  td.day_of_week AS day_of_week,
  td.day_order AS day_order,
  pe.planned_exercise_id AS planned_exercise_id,
  pe.exercise_order AS exercise_order,
  e.exercise_id AS exercise_id,
  e.name AS exercise_name,
  eq.name AS equipment,
  mg.name AS muscle_group
FROM mesocycle_template AS mt
LEFT JOIN template_day AS td
  ON td.template_id = mt.template_id
LEFT JOIN planned_exercise AS pe
  ON pe.template_day_id = td.template_day_id
LEFT JOIN exercise AS e
  ON e.exercise_id = pe.exercise_id
LEFT JOIN equipment AS eq
  ON eq.equipment_id = e.equipment_id
LEFT JOIN muscle_group AS mg
  ON mg.muscle_group_id = e.muscle_group_id
WHERE mt.template_id = ?
  AND mt.created_by_user_id = ?
  AND mt.is_deleted = FALSE
ORDER BY td.day_order ASC, pe.exercise_order ASC
`;

export const updateMesocycleTemplateTitle = `
UPDATE mesocycle_template
SET title = ?
WHERE template_id = ?
  AND created_by_user_id = ?
  AND is_deleted = FALSE
`;
