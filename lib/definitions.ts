import * as z from 'zod';

export const SignupFormSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, { error: 'Name must be at least 2 characters long.' }),
    email: z.email({ error: 'Please enter a valid email.' }).trim(),
    password: z
      .string()
      .trim()
      .min(8, { error: 'Be at least 8 characters long.' })
      .regex(/[a-zA-Z]/, { error: 'Contain at least one letter.' }),
    confirmPassword: z.string().trim(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: 'Passwords do not match.',
    path: ['confirmPassword'],
  });

export const LoginFormSchema = z.object({
  email: z.email({ error: 'Please enter a valid email.' }).trim(),
  password: z
    .string()
    .trim()
    .min(1, { error: 'Password is required.' }),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
      };
      message?: string;
    }
  | undefined;

export type LoginFormState =
  | {
      errors?: {
        email?: string[];
        password?: string[];
      };
      error?: string;
    }
  | undefined;
