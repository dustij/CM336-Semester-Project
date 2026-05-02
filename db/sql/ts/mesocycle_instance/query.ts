export const selectCurrentInstanceByUserId = `
WITH current_instance AS (
  SELECT
    instance_id,
    template_id,
    user_id,
    start_date,
    end_date,
    is_current
  FROM mesocycle_instance
  WHERE user_id = ?
    AND is_current = TRUE
)
SELECT
  ci.instance_id,
  ci.template_id,
  ci.user_id,
  ci.start_date AS instance_start_date,
  ci.end_date AS instance_end_date,
  ci.is_current,

  mt.title,
  mt.duration_weeks,

  iday.instance_day_id,
  iday.week_number,
  iday.end_date AS instance_day_end_date,
  iday.status,

  tday.template_day_id,
  tday.day_of_week,
  tday.day_order,

  pe.planned_exercise_id,
  pe.exercise_order AS planned_exercise_order,
  e.exercise_id,
  e.name AS exercise_name,
  eq.name AS equipment,
  mg.name AS muscle_group,

  current_perf.performed_exercise_id AS current_performed_exercise_id,
  current_perf.exercise_id AS current_performed_exercise_exercise_id,
  current_perf.exercise_order AS current_performed_exercise_order,
  current_perf.status AS current_performed_exercise_status,
  current_e.name AS current_performed_exercise_name,
  current_eq.name AS current_performed_exercise_equipment,
  current_mg.name AS current_performed_exercise_muscle_group,
  current_set.set_id AS current_set_id,
  current_set.set_order AS current_set_order,
  current_set.weight AS current_set_weight,
  current_set.reps AS current_set_reps,
  current_set.is_completed AS current_set_is_completed,

  prev_iday.instance_day_id AS previous_instance_day_id,
  prev_perf.performed_exercise_id AS previous_performed_exercise_id,
  prev_perf.exercise_id AS previous_performed_exercise_exercise_id,
  prev_perf.exercise_order AS previous_performed_exercise_order,
  prev_perf.status AS previous_performed_exercise_status,
  prev_e.name AS previous_performed_exercise_name,
  prev_eq.name AS previous_performed_exercise_equipment,
  prev_mg.name AS previous_performed_exercise_muscle_group,
  prev_set.set_id AS previous_set_id,
  prev_set.set_order AS previous_set_order,
  prev_set.weight AS previous_set_weight,
  prev_set.reps AS previous_set_reps,
  prev_set.is_completed AS previous_set_is_completed
FROM current_instance AS ci
JOIN mesocycle_template AS mt
  ON mt.template_id = ci.template_id
JOIN instance_day AS iday
  ON iday.instance_id = ci.instance_id
JOIN template_day AS tday
  ON tday.template_day_id = iday.template_day_id
LEFT JOIN planned_exercise AS pe
  ON pe.template_day_id = tday.template_day_id
LEFT JOIN exercise AS e
  ON e.exercise_id = pe.exercise_id
LEFT JOIN equipment AS eq
  ON eq.equipment_id = e.equipment_id
LEFT JOIN muscle_group AS mg
  ON mg.muscle_group_id = e.muscle_group_id
LEFT JOIN performed_exercise AS current_perf
  ON current_perf.instance_day_id = iday.instance_day_id
  AND current_perf.planned_exercise_id = pe.planned_exercise_id
LEFT JOIN exercise AS current_e
  ON current_e.exercise_id = current_perf.exercise_id
LEFT JOIN equipment AS current_eq
  ON current_eq.equipment_id = current_e.equipment_id
LEFT JOIN muscle_group AS current_mg
  ON current_mg.muscle_group_id = current_e.muscle_group_id
LEFT JOIN performed_set AS current_set
  ON current_set.performed_exercise_id = current_perf.performed_exercise_id
LEFT JOIN instance_day AS prev_iday
  ON prev_iday.instance_id = iday.instance_id
  AND prev_iday.template_day_id = iday.template_day_id
  AND prev_iday.week_number = iday.week_number - 1
  AND prev_iday.status IN ('COMPLETED', 'SKIPPED')
LEFT JOIN performed_exercise AS prev_perf
  ON prev_perf.instance_day_id = prev_iday.instance_day_id
  AND prev_perf.planned_exercise_id = pe.planned_exercise_id
LEFT JOIN exercise AS prev_e
  ON prev_e.exercise_id = prev_perf.exercise_id
LEFT JOIN equipment AS prev_eq
  ON prev_eq.equipment_id = prev_e.equipment_id
LEFT JOIN muscle_group AS prev_mg
  ON prev_mg.muscle_group_id = prev_e.muscle_group_id
LEFT JOIN performed_set AS prev_set
  ON prev_set.performed_exercise_id = prev_perf.performed_exercise_id
ORDER BY
  iday.week_number ASC,
  tday.day_order ASC,
  pe.exercise_order ASC,
  current_set.set_order ASC,
  prev_set.set_order ASC
`;

export const selectCurrentAddedPerformedExercisesByUserId = `
WITH current_instance AS (
  SELECT
    instance_id,
    user_id,
    is_current
  FROM mesocycle_instance
  WHERE user_id = ?
    AND is_current = TRUE
)
SELECT
  iday.instance_day_id,
  perf.performed_exercise_id,
  perf.exercise_id,
  perf.exercise_order,
  perf.status,
  e.name AS exercise_name,
  eq.name AS equipment,
  mg.name AS muscle_group,
  pset.set_id,
  pset.set_order,
  pset.weight,
  pset.reps,
  pset.is_completed
FROM current_instance AS ci
JOIN instance_day AS iday
  ON iday.instance_id = ci.instance_id
JOIN performed_exercise AS perf
  ON perf.instance_day_id = iday.instance_day_id
  AND perf.planned_exercise_id IS NULL
JOIN exercise AS e
  ON e.exercise_id = perf.exercise_id
LEFT JOIN equipment AS eq
  ON eq.equipment_id = e.equipment_id
LEFT JOIN muscle_group AS mg
  ON mg.muscle_group_id = e.muscle_group_id
LEFT JOIN performed_set AS pset
  ON pset.performed_exercise_id = perf.performed_exercise_id
ORDER BY
  iday.week_number ASC,
  perf.exercise_order ASC,
  pset.set_order ASC
`;

// TODO: create trigger in create.sql
// When the current instance_day is updated to either COMPLETED or SKIPPED, the
// database should create the next instance_day for the same mesocycle_instance.
// The next day is determined from the template_day ordering:

// - If there is another template_day later in the same week, create an
// instance_day for that template_day with the same week_number.

// - If the current day is the last template_day of the week and the mesocycle has
// more weeks remaining, create an instance_day for the first template_day with
// week_number + 1.

// - If the current day is the last template_day of the final week, no new
// instance_day is created and the mesocycle_instance can be considered complete.
