import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { parse } from 'csv-parse/sync';

interface RawExerciseRow {
  bodyPart: string;
  equipment: string;
  name: string;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const rawCsvPath = path.join(projectRoot, 'db', 'raw', 'exercises.csv');
const outputSqlPath = path.join(
  projectRoot,
  'db',
  'sql',
  'scripts',
  'load_raw_data.sql'
);

function sqlString(value: string) {
  return `'${value.replaceAll('\\', '\\\\').replaceAll("'", "''")}'`;
}

function tuple(values: string[]) {
  return `  (${values.map(sqlString).join(', ')})`;
}

function toTitleCase(value: string) {
  return value.toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const csv = readFileSync(rawCsvPath, 'utf8');
const rows = parse(csv, {
  bom: true,
  columns: true,
  skip_empty_lines: true,
  trim: true,
}) as RawExerciseRow[];

const exercises = rows.map((row) => ({
  muscleGroup: toTitleCase(row.bodyPart),
  equipment: toTitleCase(row.equipment),
  name: toTitleCase(row.name),
}));

const equipment = Array.from(
  new Set(exercises.map((exercise) => exercise.equipment))
).sort((a, b) => a.localeCompare(b));

const muscleGroups = Array.from(
  new Set(exercises.map((exercise) => exercise.muscleGroup))
).sort((a, b) => a.localeCompare(b));

const sql = `USE MESOCYCLE_PLANNER;

START TRANSACTION;

CREATE TEMPORARY TABLE raw_exercise_import (
  raw_exercise_import_id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  equipment_name VARCHAR(150) NOT NULL,
  muscle_group_name VARCHAR(50) NOT NULL
);

INSERT INTO equipment (name)
VALUES
${equipment.map((name) => tuple([name])).join(',\n')}
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO muscle_group (name)
VALUES
${muscleGroups.map((name) => tuple([name])).join(',\n')}
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO raw_exercise_import (name, equipment_name, muscle_group_name)
VALUES
${exercises
  .map((exercise) =>
    tuple([exercise.name, exercise.equipment, exercise.muscleGroup])
  )
  .join(',\n')};

INSERT INTO exercise (name, equipment_id, muscle_group_id)
SELECT
  raw.name,
  equipment.equipment_id,
  muscle_group.muscle_group_id
FROM raw_exercise_import AS raw
INNER JOIN equipment
  ON equipment.name = raw.equipment_name
INNER JOIN muscle_group
  ON muscle_group.name = raw.muscle_group_name
ON DUPLICATE KEY UPDATE name = VALUES(name);

DROP TEMPORARY TABLE raw_exercise_import;

COMMIT;
`;

mkdirSync(path.dirname(outputSqlPath), { recursive: true });
writeFileSync(outputSqlPath, sql);

console.log(
  `Wrote ${exercises.length} exercises, ${equipment.length} equipment types, and ${muscleGroups.length} muscle groups to ${path.relative(projectRoot, outputSqlPath)}.`
);
