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
  tday.day_order
FROM current_instance AS ci
JOIN mesocycle_template AS mt
  ON mt.template_id = ci.template_id
JOIN instance_day AS iday
  ON iday.instance_id = ci.instance_id
JOIN template_day AS tday
  ON tday.template_day_id = iday.template_day_id
ORDER BY iday.week_number ASC, tday.day_order ASC
`;

// TODO: create trigger in create.sql
// When the current instance_day is updated to either COMPLETED or ABANDONED, the
// database should create the next instance_day for the same mesocycle_instance.
// The next day is determined from the template_day ordering:

// - If there is another template_day later in the same week, create an
// instance_day for that template_day with the same week_number.

// - If the current day is the last template_day of the week and the mesocycle has
// more weeks remaining, create an instance_day for the first template_day with
// week_number + 1.

// - If the current day is the last template_day of the final week, no new
// instance_day is created and the mesocycle_instance can be considered complete.
