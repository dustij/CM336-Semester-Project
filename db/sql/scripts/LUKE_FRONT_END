USE MESOCYCLE_PLANNER;

SELECT *
FROM users
WHERE user_id = ?;

SELECT *
FROM user u, mesocycle_template m
WHERE u.user_id = m.created_by_user_id
AND m.template_id = ?;

SELECT * 
FROM planned_exercise pl, performed exercise pf
WHERE pf.status = ?;

SELECT *
FROM mesocycle_template
WHERE duration_weeks = ?;

SELECT *, COUNT(eq.equipment_id)
FROM exercise e, equipment eq
WHERE e.equipment_id = eq.equipment_id
GROUP BY eq.equipment_id;

SELECT *, COUNT(m.muscle_group_id)
FROM exercise e, muscle_group m
WHERE e.muscle_group_id = m.muscle_group_id
GROUP BY m.muscle_group_id;

SELECT e.exercise_id, COUNT(e.exercise_id)
FROM planned_exercise p, exercise e
WHERE e.exercise_id = p.exercise_id
GROUP BY e.exercise_id

SELECT e.exercise_id, COUNT(e.exercise_id)
FROM performed_exercise p, exercise e
WHERE e.exercise_id = p.exercise_id
AND p.status = ?
GROUP BY e.exercise_id

SELECT *
FROM user u, mesocycle_instance m
WHERE u.user_id = m.user_id
AND m.template_id = ?;

SELECT *, COUNT(p.planned_exercise_id)
FROM template_day t, planned_exercise p
WHERE t.template_day_id = p.template_day_id
GROUP BY p.planned_exercise_id;

SELECT *, COUNT(i.instance_day_id)
FROM template_day t, instance_day i
WHERE t.template_day_id = i.instance_day_id
GROUP BY i.instance_day_id;

SELECT *, COUNT(i.instance_id)
FROM mesocycle_template t, mesocycle_instance i
WHERE t.template_id = i.template_id
GROUP BY i.instance_id;

SELECT *, COUNT(e.exercise_id)
FROM user u, exercise e
WHERE u.user_id = e.created_by_user_id
GROUP BY e.exercise_id;

SELECT *, COUNT(e.muscle_group_id)
FROM user u, exercise e
WHERE u.user_id = e.created_by_user_id
GROUP BY e.muscle_group_id;

SELECT *, COUNT(e.equipment_id)
FROM user u, exercise e
WHERE u.user_id = e.created_by_user_id
GROUP BY e.equipment_id;

SELECT *, COUNT(p.performed_exercise_id)
FROM instance_day i, performed_exercise p
WHERE i.instance_day_id = p.instance_day_id
GROUP BY p.performed_exercise_id;

SELECT *, COUNT(i.instance_day_id)
FROM mesocycle_instance m, instance_day i
WHERE m.instance_id = i.instance_id
GROUP BY i.instance_day_id;
