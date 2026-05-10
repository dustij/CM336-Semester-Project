USE MESOCYCLE_PLANNER;

SHOW FULL TABLES;

SHOW PROCEDURE STATUS
WHERE Db = 'MESOCYCLE_PLANNER';

SHOW FUNCTION STATUS
WHERE Db = 'MESOCYCLE_PLANNER';

SELECT 'USERS' AS `Table Name`;
DESCRIBE users;

SELECT 'EQUIPMENT' AS `Table Name`;
DESCRIBE equipment;

SELECT 'MUSCLE_GROUP' AS `Table Name`;
DESCRIBE muscle_group;

SELECT 'EXERCISE' AS `Table Name`;
DESCRIBE exercise;

SELECT 'MESOCYCLE_TEMPLATE' AS `Table Name`;
DESCRIBE mesocycle_template;

SELECT 'TEMPLATE_DAY' AS `Table Name`;
DESCRIBE template_day;

SELECT 'PLANNED_EXERCISE' AS `Table Name`;
DESCRIBE planned_exercise;

SELECT 'MESOCYCLE_INSTANCE' AS `Table Name`;
DESCRIBE mesocycle_instance;

SELECT 'INSTANCE_DAY' AS `Table Name`;
DESCRIBE instance_day;

SELECT 'PERFORMED_EXERCISE' AS `Table Name`;
DESCRIBE performed_exercise;

SELECT 'PERFORMED_SET' AS `Table Name`;
DESCRIBE performed_set;

SELECT 'MESOCYCLE_TEMPLATE_DETAILS (view)' AS `Table Name`;
DESCRIBE mesocycle_template_details;

SELECT 'CURRENT_INSTANCE_FLOW_DETAILS (view)' AS `Table Name`;
DESCRIBE current_instance_flow_details;