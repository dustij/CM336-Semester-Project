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
    'ABANDONED'
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

  # ensure template belongs to user
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

  # get the first day in the template
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

  # set existing current instance for user to false
  UPDATE mesocycle_instance
  SET
    is_current = FALSE,
    end_date = COALESCE(end_date, CURRENT_DATE())
  WHERE user_id = p_user_id
    AND is_current = TRUE;

  # Now we can safely insert a new instance and set it as current for user
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

  # Insert the first instance day (following days are added after user completes each instance day)
  INSERT INTO instance_day (
    template_day_id,
    instance_id,
    week_number
  ) VALUES (
    var_template_day_id,
    var_instance_id,
    1
  );

  # implementation notes:
  # performed exercises are inserted as soon as at least one set is completed
  # instance days are inserted once the previous day as been comleted
  # instance days for the same template day but on following weeks populate sets from previous week
  
  COMMIT;

END $
DELIMITER ;


SHOW TABLES;

-- // TODO: create trigger in create.sql
-- // When the current instance_day is updated to either COMPLETED or ABANDONED, the
-- // database should create the next instance_day for the same mesocycle_instance.
-- // The next day is determined from the template_day ordering:

-- // - If there is another template_day later in the same week, create an
-- // instance_day for that template_day with the same week_number.

-- // - If the current day is the last template_day of the week and the mesocycle has
-- // more weeks remaining, create an instance_day for the first template_day with
-- // week_number + 1.

-- // - If the current day is the last template_day of the final week, no new
-- // instance_day is created and the mesocycle_instance can be considered complete.