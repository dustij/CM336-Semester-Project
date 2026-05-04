SELECT 
  planned.exercise_id, 
  planned_ex.name, 
  performed.exercise_id, 
  performed_ex.name 
FROM performed_exercise performed 
JOIN planned_exercise planned 
  ON planned.planned_exercise_id = performed.planned_exercise_id 
JOIN exercise planned_ex 
  ON planned_ex.exercise_id = planned.exercise_id 
JOIN exercise performed_ex 
  ON performed.exercise_id = performed_ex.exercise_id;


SELECT * FROM current_instance_flow_details;