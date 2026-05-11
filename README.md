# Mesocycle Planner

Mesocycle Planner is a full-stack fitness web app for building reusable mesocycle workout plans and tracking workout performance as those plans are run over time. It was created for CM336 Database Management Systems to demonstrate database analysis, normalization, implementation, and application integration in a realistic project.

## Intended Use

The app is designed for lifters who plan training in multi-week mesocycles. A user can sign up, create a workout template, choose training days and exercises, start a current mesocycle, and then record each workout from a phone while at the gym. During a workout, the user can complete, skip, replace, or add exercises and record set-level weight and reps.

## How to Use

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` with the required secrets:

   ```bash
   MYSQL_URI="mysql://..."
   SESSION_SECRET="replace-with-a-long-random-secret"
   ```

3. Initialize the MySQL database by connecting to the database and running:

   ```sql
   SOURCE setup.sql;
   ```

4. Start the app:

   ```bash
   npm run dev
   ```

5. Open the local Next.js URL, sign up or log in, create a mesocycle from the Mesocycles page, start it, and use the Current page to record workouts. The Exercises page provides a searchable and filterable exercise catalog.

Useful commands:

```bash
npm run test
npm run lint
npm run build
```

## Technologies

- Next.js 16 App Router, React 19, and TypeScript for the web application.
- Server Actions and server-side repository modules for backend workflows.
- MySQL, hosted with Aiven in the deployed version, accessed through `mysql2` prepared statements.
- Zod for form validation, bcrypt for password hashing, and signed HTTP-only cookies for sessions.
- Tailwind CSS, shadcn-style components, Base UI/Radix UI, and Lucide icons for the interface.
- Vercel for application hosting.

## Database Design

The database is normalized through at least 3NF and separates planning data from performance history:

- `users` stores account records.
- `mesocycle_template`, `template_day`, and `planned_exercise` store reusable workout plans.
- `mesocycle_instance`, `instance_day`, `performed_exercise`, and `performed_set` store an actual run of a template and the user performance data for each workout.
- `exercise`, `equipment`, and `muscle_group` normalize the exercise catalog and support filtering.

This design lets a template be reused many times while preserving separate workout histories. It also supports real workout changes: a performed exercise can reference the originally planned exercise while recording a different actual exercise when the user replaces it, or no planned exercise when the user adds something new.

The schema includes foreign keys, uniqueness constraints, and check constraints for integrity; views for template details and current workout debugging; a helper function for counting template training days; and stored procedures for starting a current mesocycle and completing the current workout day transactionally.
