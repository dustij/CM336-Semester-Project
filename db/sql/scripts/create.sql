DROP DATABASE IF EXISTS MESOCYCLE_PLANNER;
CREATE DATABASE MESOCYCLE_PLANNER;
USE MESOCYCLE_PLANNER;


CREATE TABLE users (
  user_id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  display_name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);


CREATE TABLE equipment (
  equipment_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL UNIQUE
);


CREATE TABLE muscle_group (
  muscle_group_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(50) NOT NULL UNIQUE
);


CREATE TABLE exercise (
  exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  equipment_id INT NOT NULL,
  muscle_group_id INT NOT NULL,
  created_by_user_id INT NULL,
  name VARCHAR(150) NOT NULL,
  CONSTRAINT fk_exercise_equipment FOREIGN KEY (equipment_id) REFERENCES equipment(equipment_id),
  CONSTRAINT fk_exercise_muscle_group FOREIGN KEY (muscle_group_id) REFERENCES muscle_group(muscle_group_id),
  CONSTRAINT fk_exercise_created_by_user FOREIGN KEY (created_by_user_id) REFERENCES users(user_id) 
    ON DELETE SET NULL,
  CONSTRAINT uq_exercise_name_equipment_muscle_group UNIQUE (name, equipment_id, muscle_group_id)
);


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
);


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
);


CREATE TABLE planned_exercise (
  planned_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  exercise_id INT NOT NULL,
  template_day_id INT NOT NULL,
  exercise_order TINYINT NOT NULL,
  CONSTRAINT fk_planned_exercise_exercise FOREIGN KEY (exercise_id) REFERENCES exercise(exercise_id),
  CONSTRAINT fk_planned_exercise_template_day FOREIGN KEY (template_day_id) REFERENCES template_day(template_day_id) 
    ON DELETE CASCADE,
  CONSTRAINT uq_planned_exercise_order UNIQUE (template_day_id, exercise_order)
);


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
);


CREATE TABLE instance_day (
  instance_day_id INT AUTO_INCREMENT PRIMARY KEY,
  template_day_id INT NULL,
  instance_id INT NOT NULL,
  week_number TINYINT NOT NULL,
  end_date DATE NULL,
  status ENUM(
    'PLANNED',
    'COMPLETED',
    'SKIPPED'
  ) NOT NULL DEFAULT 'PLANNED',
  CONSTRAINT fk_instance_day_template_day FOREIGN KEY (template_day_id) REFERENCES template_day(template_day_id) 
    ON DELETE SET NULL,
  CONSTRAINT fk_instance_day_instance FOREIGN KEY (instance_id) REFERENCES mesocycle_instance(instance_id) 
    ON DELETE CASCADE,
  CONSTRAINT chk_instance_day_week_number CHECK (week_number >= 1),
  CONSTRAINT uq_instance_template_day_week UNIQUE (instance_id, template_day_id, week_number)
);


CREATE TABLE performed_exercise (
  performed_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  planned_exercise_id INT NULL,
  exercise_id INT NOT NULL,
  instance_day_id INT NOT NULL,
  exercise_order TINYINT NOT NULL,
  repeat_until_mesocycle_end BOOLEAN NOT NULL DEFAULT FALSE,
  status ENUM(
    'COMPLETED',
    'REPLACED',
    'SKIPPED',
    'ADDED'
  ) NOT NULL DEFAULT 'COMPLETED',
  CONSTRAINT fk_performed_exercise_planned FOREIGN KEY (planned_exercise_id) REFERENCES planned_exercise(planned_exercise_id) 
    ON DELETE SET NULL,
  CONSTRAINT fk_performed_exercise_exercise FOREIGN KEY (exercise_id) REFERENCES exercise(exercise_id),
  CONSTRAINT fk_performed_exercise_instance_day FOREIGN KEY (instance_day_id) REFERENCES instance_day(instance_day_id) 
    ON DELETE CASCADE,
  CONSTRAINT chk_performed_exercise_order CHECK (exercise_order >= 0)
);


CREATE TABLE performed_set (
  set_id INT AUTO_INCREMENT PRIMARY KEY,
  performed_exercise_id INT NOT NULL,
  set_order TINYINT NOT NULL,
  weight INT NOT NULL,
  reps TINYINT NOT NULL,
  is_completed BOOLEAN NOT NULL DEFAULT FALSE,
  CONSTRAINT fk_performed_set_exercise FOREIGN KEY (performed_exercise_id) REFERENCES performed_exercise(performed_exercise_id) 
    ON DELETE CASCADE,
  CONSTRAINT chk_performed_set_order CHECK (set_order >= 0),
  CONSTRAINT chk_performed_set_weight CHECK (weight >= 0),
  CONSTRAINT chk_performed_set_reps CHECK (reps >= 0),
  CONSTRAINT uq_performed_set_order UNIQUE (performed_exercise_id, set_order)
);


-- Get number of days per week in a template
DELIMITER $
CREATE FUNCTION getDaysPerWeekInTemplate
(
  p_template_id INT
)
RETURNS TINYINT
READS SQL DATA
BEGIN 
  DECLARE var_num_days TINYINT;

  SELECT COUNT(*)
  INTO var_num_days
  FROM template_day
  WHERE template_id = p_template_id;

  RETURN var_num_days;
END $
 DELIMITER ;


-- Create view of all template details (days, exercises, etc.)
CREATE VIEW mesocycle_template_details AS
SELECT
  mt.created_by_user_id AS created_by_user_id,
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
WHERE mt.is_deleted = FALSE;


-- Create view for workout flow
CREATE VIEW current_instance_flow_details AS
SELECT
  flow.user_id AS 'User ID',
  flow.is_current AS 'Is Current?',
  flow.template_id AS 'Template ID',
  flow.template_title AS 'Template Title',
  flow.instance_id AS 'Instance ID',
  flow.instance_day_status AS 'Instance Day Status',
  flow.duration_weeks AS 'Duration in Weeks',
  flow.week_number AS 'Instance Week --',
  flow.weekday AS 'Weekday',
  flow.planned_exercise AS 'Planned Exercise',
  flow.performed_exercise AS 'Performed Exercise',
  flow.exercise_order AS 'Exercise Order',
  flow.performed_status AS 'Performed Status',
  flow.repeat_until_end AS 'Repeat Until End?',
  flow.set_order AS 'Set Order',
  flow.set_weight AS 'Set Weight',
  flow.set_reps AS 'Set Reps',
  flow.set_completed AS 'Set Completed?'
FROM (
  -- Union two SELECT statements

  -- The first SELECT starts from planned_exercise
  --   - This allows every planned exercise to show, regardless if its been 
  --   - performed yet. These rows show up with Performed Exercise = NULL.
  --   - Attaching a performed exercise if one exists.

  -- The second SELECT starts from performed_exercise
  --   - This covers exercises added during the workout. Added exercises have
  --   - no matching planned_exercise row because planned_exercise_id is NULL.

  -- Together we get the entire picture for the mesocycle instance.
  SELECT
    mesocycle_instance.user_id,
    mesocycle_instance.is_current,
    mesocycle_template.template_id,
    mesocycle_template.title AS template_title,
    mesocycle_instance.instance_id,
    instance_day.status AS instance_day_status,
    mesocycle_template.duration_weeks,
    instance_day.week_number,
    template_day.day_of_week AS weekday,
    template_day.day_order,
    exercise_in_planned.name AS planned_exercise,
    exercise_in_performed.name AS performed_exercise,
    COALESCE(performed_exercise.exercise_order, planned_exercise.exercise_order) AS exercise_order,
    performed_exercise.status AS performed_status,
    performed_exercise.repeat_until_mesocycle_end AS repeat_until_end,
    performed_set.set_order,
    performed_set.weight AS set_weight,
    performed_set.reps AS set_reps,
    performed_set.is_completed AS set_completed
  FROM mesocycle_instance
  JOIN mesocycle_template
    ON mesocycle_instance.template_id = mesocycle_template.template_id
  JOIN instance_day
    ON instance_day.instance_id = mesocycle_instance.instance_id
  JOIN template_day
    ON instance_day.template_day_id = template_day.template_day_id
  JOIN planned_exercise
    ON template_day.template_day_id = planned_exercise.template_day_id
  LEFT JOIN performed_exercise
    ON performed_exercise.instance_day_id = instance_day.instance_day_id
    AND performed_exercise.planned_exercise_id = planned_exercise.planned_exercise_id
  JOIN exercise exercise_in_planned
    ON exercise_in_planned.exercise_id = planned_exercise.exercise_id
  LEFT JOIN exercise exercise_in_performed
    ON exercise_in_performed.exercise_id = performed_exercise.exercise_id
  LEFT JOIN performed_set 
    ON performed_set.performed_exercise_id = performed_exercise.performed_exercise_id

  UNION ALL

  SELECT
    mesocycle_instance.user_id,
    mesocycle_instance.is_current,
    mesocycle_template.template_id,
    mesocycle_template.title AS template_title,
    mesocycle_instance.instance_id,
    instance_day.status AS instance_day_status,
    mesocycle_template.duration_weeks,
    instance_day.week_number,
    template_day.day_of_week AS weekday,
    template_day.day_order,
    NULL AS planned_exercise,
    exercise_in_performed.name AS performed_exercise,
    performed_exercise.exercise_order,
    performed_exercise.status AS performed_status,
    performed_exercise.repeat_until_mesocycle_end AS repeat_until_end,
    performed_set.set_order,
    performed_set.weight AS set_weight,
    performed_set.reps AS set_reps,
    performed_set.is_completed AS set_completed
  FROM mesocycle_instance
  JOIN mesocycle_template
    ON mesocycle_instance.template_id = mesocycle_template.template_id
  JOIN instance_day
    ON instance_day.instance_id = mesocycle_instance.instance_id
  JOIN template_day
    ON instance_day.template_day_id = template_day.template_day_id
  JOIN performed_exercise
    ON performed_exercise.instance_day_id = instance_day.instance_day_id
    AND performed_exercise.planned_exercise_id IS NULL
  JOIN exercise exercise_in_performed
    ON exercise_in_performed.exercise_id = performed_exercise.exercise_id
  LEFT JOIN performed_set 
    ON performed_set.performed_exercise_id = performed_exercise.performed_exercise_id
) AS flow
ORDER BY
  flow.user_id ASC,
  flow.is_current DESC,
  flow.template_id ASC,
  flow.instance_id ASC,
  flow.week_number ASC,
  flow.day_order ASC,
  flow.exercise_order ASC,
  flow.set_order ASC;



-- Procedure: Set a new current instance for user
DELIMITER $
CREATE PROCEDURE set_new_current_for_user(
  IN p_template_id INT,
  IN p_user_id INT
)
BEGIN
  DECLARE var_template_count INT DEFAULT 0;
  DECLARE var_template_day_id INT DEFAULT NULL;
  DECLARE var_instance_id INT DEFAULT NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  START TRANSACTION;

  -- ensure template belongs to user
  SELECT COUNT(*)
  INTO var_template_count
  FROM mesocycle_template
  WHERE template_id = p_template_id
    AND created_by_user_id = p_user_id
    AND is_deleted = FALSE;

  IF var_template_count = 0 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Mesocycle template not found for user.';
  END IF;

  -- get the first day in the template
  SELECT (
    SELECT template_day_id
    FROM template_day
    WHERE template_id = p_template_id
    ORDER BY day_order ASC
    LIMIT 1
  )
  INTO var_template_day_id;

  IF var_template_day_id IS NULL THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Mesocycle template must have at least one day.';
  END IF;

  -- set existing current instance for user to false
  UPDATE mesocycle_instance
  SET
    is_current = FALSE,
    end_date = COALESCE(end_date, CURRENT_DATE())
  WHERE user_id = p_user_id
    AND is_current = TRUE;

  -- Now we can safely insert a new instance and set it as current for user
  INSERT INTO mesocycle_instance (
    template_id,
    user_id,
    start_date,
    end_date,
    is_current
  ) VALUES (
    p_template_id,
    p_user_id,
    CURRENT_DATE(),
    NULL,
    TRUE
  );

  SET var_instance_id = LAST_INSERT_ID();

  -- Insert the first instance day (following days are added after user completes each instance day)
  INSERT INTO instance_day (
    template_day_id,
    instance_id,
    week_number
  ) VALUES (
    var_template_day_id,
    var_instance_id,
    1
  );
  
  COMMIT;

END $
DELIMITER ;


-- Procedure: Orchestrate comleting instance day
-- * MySQL/MariaDB does not allow an instance_day trigger to insert the next row
-- into instance_day, so this procedure handles the status update, end_date, and
-- next-day creation in one transaction.
DELIMITER $
CREATE PROCEDURE complete_current_instance_day(
  IN p_user_id INT,
  IN p_instance_day_id INT,
  IN p_status VARCHAR(20),
  IN p_performed_exercises_json JSON
)
BEGIN
  DECLARE var_instance_id INT DEFAULT NULL;
  DECLARE var_template_id INT DEFAULT NULL;
  DECLARE var_template_day_id INT DEFAULT NULL;
  DECLARE var_next_template_day_id INT DEFAULT NULL;
  DECLARE var_week_number TINYINT DEFAULT NULL;
  DECLARE var_day_order TINYINT DEFAULT NULL;
  DECLARE var_duration_weeks TINYINT DEFAULT NULL;
  DECLARE var_status VARCHAR(20) DEFAULT NULL;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    RESIGNAL;
  END;

  IF p_status IS NULL OR p_status NOT IN ('COMPLETED', 'SKIPPED') THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Instance day status must be COMPLETED or SKIPPED.';
  END IF;

  IF p_performed_exercises_json IS NULL
    OR JSON_VALID(p_performed_exercises_json) = 0
    OR JSON_TYPE(p_performed_exercises_json) <> 'ARRAY' THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed exercises payload must be a JSON array.';
  END IF;

  START TRANSACTION;

  DROP TEMPORARY TABLE IF EXISTS tmp_current_day_performed_exercise;
  DROP TEMPORARY TABLE IF EXISTS tmp_current_day_performed_set;

  CREATE TEMPORARY TABLE tmp_current_day_performed_exercise (
    tmp_performed_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
    planned_exercise_id INT NULL,
    exercise_id INT NOT NULL,
    exercise_order INT NOT NULL,
    repeat_until_mesocycle_end BOOLEAN NOT NULL,
    status VARCHAR(20) NOT NULL
  );

  CREATE TEMPORARY TABLE tmp_current_day_performed_set (
    tmp_performed_set_id INT AUTO_INCREMENT PRIMARY KEY,
    exercise_order INT NOT NULL,
    set_order INT NOT NULL,
    weight INT NOT NULL,
    reps INT NOT NULL,
    is_completed BOOLEAN NOT NULL
  );

  SELECT
    iday.instance_id,
    iday.template_day_id,
    iday.week_number,
    iday.status,
    tday.template_id,
    tday.day_order,
    mt.duration_weeks
  INTO
    var_instance_id,
    var_template_day_id,
    var_week_number,
    var_status,
    var_template_id,
    var_day_order,
    var_duration_weeks
  FROM instance_day AS iday
  JOIN mesocycle_instance AS mi
    ON mi.instance_id = iday.instance_id
  JOIN template_day AS tday
    ON tday.template_day_id = iday.template_day_id
  JOIN mesocycle_template AS mt
    ON mt.template_id = tday.template_id
  WHERE iday.instance_day_id = p_instance_day_id
    AND mi.user_id = p_user_id
    AND mi.is_current = TRUE
  LIMIT 1
  FOR UPDATE;

  IF var_instance_id IS NULL THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Current instance day not found for user.';
  END IF;

  IF var_status <> 'PLANNED' THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Current instance day is not planned.';
  END IF;

  INSERT INTO tmp_current_day_performed_exercise (
    planned_exercise_id,
    exercise_id,
    exercise_order,
    repeat_until_mesocycle_end,
    status
  )
  SELECT
    payload.planned_exercise_id,
    payload.exercise_id,
    payload.exercise_order,
    COALESCE(payload.repeat_until_mesocycle_end, FALSE),
    payload.status
  FROM JSON_TABLE(
    p_performed_exercises_json,
    '$[*]' COLUMNS (
      planned_exercise_id INT PATH '$.plannedExerciseId' NULL ON EMPTY,
      exercise_id INT PATH '$.exerciseId',
      exercise_order INT PATH '$.exerciseOrder',
      repeat_until_mesocycle_end BOOLEAN PATH '$.repeatUntilMesocycleEnd' NULL ON EMPTY,
      status VARCHAR(20) PATH '$.status'
    )
  ) AS payload;

  INSERT INTO tmp_current_day_performed_set (
    exercise_order,
    set_order,
    weight,
    reps,
    is_completed
  )
  SELECT
    payload.exercise_order,
    payload.set_order,
    payload.weight,
    payload.reps,
    payload.is_completed
  FROM JSON_TABLE(
    p_performed_exercises_json,
    '$[*]' COLUMNS (
      exercise_order INT PATH '$.exerciseOrder',
      NESTED PATH '$.performedSets[*]' COLUMNS (
        set_order INT PATH '$.setOrder',
        weight INT PATH '$.weight',
        reps INT PATH '$.reps',
        is_completed BOOLEAN PATH '$.isCompleted'
      )
    )
  ) AS payload
  WHERE payload.set_order IS NOT NULL;

  IF EXISTS (
    SELECT 1
    FROM tmp_current_day_performed_exercise
    WHERE exercise_id IS NULL
      OR exercise_order IS NULL
      OR exercise_order < 0
      OR status IS NULL
      OR status NOT IN ('COMPLETED', 'REPLACED', 'SKIPPED', 'ADDED')
      OR (
        repeat_until_mesocycle_end = TRUE
        AND NOT (
          (status = 'REPLACED' AND planned_exercise_id IS NOT NULL)
          OR (status = 'ADDED' AND planned_exercise_id IS NULL)
        )
      )
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed exercise payload contains invalid exercise data.';
  END IF;

  IF EXISTS (
    SELECT exercise_order
    FROM tmp_current_day_performed_exercise
    GROUP BY exercise_order
    HAVING COUNT(*) > 1
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed exercise payload contains duplicate exercise orders.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_current_day_performed_exercise AS perf
    LEFT JOIN exercise AS e
      ON e.exercise_id = perf.exercise_id
    WHERE e.exercise_id IS NULL
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed exercise payload references an unknown exercise.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_current_day_performed_exercise AS perf
    LEFT JOIN planned_exercise AS pe
      ON pe.planned_exercise_id = perf.planned_exercise_id
      AND pe.template_day_id = var_template_day_id
    WHERE perf.planned_exercise_id IS NOT NULL
      AND pe.planned_exercise_id IS NULL
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed exercise payload references an invalid planned exercise.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_current_day_performed_set
    WHERE set_order IS NULL
      OR set_order < 0
      OR weight IS NULL
      OR weight < 0
      OR reps IS NULL
      OR reps < 0
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed set payload contains invalid set data.';
  END IF;

  IF EXISTS (
    SELECT
      exercise_order,
      set_order
    FROM tmp_current_day_performed_set
    GROUP BY exercise_order, set_order
    HAVING COUNT(*) > 1
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed set payload contains duplicate set orders.';
  END IF;

  IF EXISTS (
    SELECT 1
    FROM tmp_current_day_performed_set AS pset
    LEFT JOIN tmp_current_day_performed_exercise AS perf
      ON perf.exercise_order = pset.exercise_order
    WHERE perf.exercise_order IS NULL
  ) THEN
    ROLLBACK;
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Performed set payload references an unknown performed exercise.';
  END IF;

  DELETE FROM performed_exercise
  WHERE instance_day_id = p_instance_day_id;

  INSERT INTO performed_exercise (
    planned_exercise_id,
    exercise_id,
    instance_day_id,
    exercise_order,
    repeat_until_mesocycle_end,
    status
  )
  SELECT
    planned_exercise_id,
    exercise_id,
    p_instance_day_id,
    exercise_order,
    repeat_until_mesocycle_end,
    status
  FROM tmp_current_day_performed_exercise
  ORDER BY exercise_order ASC;

  INSERT INTO performed_set (
    performed_exercise_id,
    set_order,
    weight,
    reps,
    is_completed
  )
  SELECT
    perf.performed_exercise_id,
    pset.set_order,
    pset.weight,
    pset.reps,
    pset.is_completed
  FROM tmp_current_day_performed_set AS pset
  JOIN performed_exercise AS perf
    ON perf.instance_day_id = p_instance_day_id
    AND perf.exercise_order = pset.exercise_order
  ORDER BY
    pset.exercise_order ASC,
    pset.set_order ASC;

  UPDATE instance_day
  SET
    status = p_status,
    end_date = COALESCE(end_date, CURRENT_DATE())
  WHERE instance_day_id = p_instance_day_id;

  SELECT template_day_id
  INTO var_next_template_day_id
  FROM template_day
  WHERE template_id = var_template_id
    AND day_order > var_day_order
  ORDER BY day_order ASC
  LIMIT 1;

  IF var_next_template_day_id IS NOT NULL THEN
    INSERT IGNORE INTO instance_day (
      template_day_id,
      instance_id,
      week_number
    ) VALUES (
      var_next_template_day_id,
      var_instance_id,
      var_week_number
    );
  ELSEIF var_week_number < var_duration_weeks THEN
    SELECT template_day_id
    INTO var_next_template_day_id
    FROM template_day
    WHERE template_id = var_template_id
    ORDER BY day_order ASC
    LIMIT 1;

    INSERT IGNORE INTO instance_day (
      template_day_id,
      instance_id,
      week_number
    ) VALUES (
      var_next_template_day_id,
      var_instance_id,
      var_week_number + 1
    );
  ELSE
    UPDATE mesocycle_instance
    SET
      end_date = CURRENT_DATE(),
      is_current = FALSE
    WHERE instance_id = var_instance_id;
  END IF;

  DROP TEMPORARY TABLE IF EXISTS tmp_current_day_performed_set;
  DROP TEMPORARY TABLE IF EXISTS tmp_current_day_performed_exercise;

  COMMIT;
END $
DELIMITER ;
