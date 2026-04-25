# Entities

#### `USERS`

stores account-level information such as email, password hash, display name, and timestamps. This is the root entity because templates, mesocycle instances, and exercise history all belong to a specific user.

---

#### `MESOCYCLE_TEMPLATE`

represents a reusable workout plan. It stores the template title and duration in weeks. This entity does not represent a workout that has happened yet. It only describes the planned structure the user intends to follow.

---

#### `TEMPLATE_DAY`

represents one planned training day inside a mesocycle template. It includes day_of_week for the label, such as Monday or Friday, and day_order because the actual sequence should be controlled numerically rather than by the weekday name.

---

#### `PLANNED_EXERCISE`

represents an exercise placed inside a template day. It stores _exercise_order_ so exercises can be displayed in the intended order. It does not store weight, \_eps, or sets because it represents the plan, not the workout result.

---

#### `MESOCYCLE_INSTANCE`

represents one actual run of a template. This exists because the same template may be reused multiple times. It stores start_date, end_date, and is_current so the app can track when the cycle happened and which one the user is actively following.

---

#### `INSTANCE_DAY`

represents an actual training day generated from a template day during a mesocycle instance. It stores week_number, date information, and status so the app can track whether a day is planned, completed, skipped, or modified.

---

#### `PERFORMED_EXERCISE`

represents an exercise as it was actually performed during a workout. It stores exercise_order and status because the user may complete, skip, swap, delete, or add exercises during training.

---

#### `PERFORMED_SET`

stores the most detailed workout history: set number, weight, reps, and whether the set was completed. This entity is separated because one performed exercise can have many sets.

---

#### `EXERCISE`

is the exercise catalog. It stores reusable exercise definitions like exercise name. This avoids repeating exercise names throughout planned and performed records.

---

#### `EQUIPMENT` and `MUSCLE_GROUP`

are lookup entities. They normalize repeated values such as “barbell,” “dumbbell,” “chest,” or “back,” making the database cleaner and easier to filter.

---

# Relationships

A **user can have many mesocycle templates**, but each template belongs to one user. This allows each user to build their own library of reusable workout plans.

A **user can have many mesocycle instances**, but each instance belongs to one user. This tracks every time the user actually runs a mesocycle.

A **mesocycle template can have many template days**, but each template day belongs to one template. This supports routines with one to seven planned training days.

A **template day can have many planned exercises,** but each planned exercise belongs to one template day. This allows each day to contain a sequence of planned exercises.

A **mesocycle template can have many mesocycle instances**, but each instance is based on one template. This supports reusing the same plan multiple times while preserving separate workout histories.

A **mesocycle instance can have many instance days**, but each instance day belongs to one mesocycle instance. This represents the actual scheduled training days across the cycle.

A **template day can be referenced by many instance days**, because the same planned day can occur once per week across a multi-week mesocycle.

A **planned exercise can be referenced by many performed exercises**, but the relationship should be optional. This lets the app record whether a performed exercise came from the original plan. If the user adds a new exercise during a workout, the performed exercise may not have a matching planned exercise.

A **performed exercise can have many performed sets**, but each performed set belongs to one performed exercise. This keeps set-level data separate and avoids repeating exercise information for every set.

An **exercise can appear in many planned exercises** and many performed exercises. This is why PLANNED_EXERCISE and PERFORMED_EXERCISE reference EXERCISE instead of storing the exercise name directly.

Each **exercise belongs to one equipment type** and one muscle group in this simplified model. Each equipment type or muscle group can be associated with many exercises.

---

## Examples

the user followed the planned exercise:

```
planned_exercise_id = 12
exercise_id = 4
status = completed
```

the user replaced the planned exercise with another exercise:

```
planned_exercise_id = 12
exercise_id = 9
status = swapped
```

the planned exercise existed but was skipped:

```
planned_exercise_id = 12
exercise_id = 4
status = skipped
```

the user added an exercise that was not part of the template:

```
planned_exercise_id = null
exercise_id = 15
status = added
```
