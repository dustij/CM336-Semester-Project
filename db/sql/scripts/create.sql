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
);


CREATE TABLE performed_exercise (
  performed_exercise_id INT AUTO_INCREMENT PRIMARY KEY,
  planned_exercise_id INT NULL,
  exercise_id INT NOT NULL,
  instance_day_id INT NOT NULL,
  exercise_order TINYINT NOT NULL,
  STATUS ENUM(
    'COMPLETED',
    'SWAPPED',
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
