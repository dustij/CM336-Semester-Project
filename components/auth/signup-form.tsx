'use client';

import Link from 'next/link';

import { signup } from '@/app/signup/actions';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { PasswordField } from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { useActionState, useState } from 'react';
import { ErrorMessage } from './error-message';

export function SignupForm() {
  const [state, action, pending] = useActionState(signup, undefined);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);

  return (
    <AuthPageShell description="Lets create your free account">
      <form className="mx-1 flex flex-1 flex-col" action={action}>
        <div className="mt-10 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name" className="text-[13px] text-slate-600">
              First Name
            </Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className={cn(
                'h-10 rounded-xl border-slate-200 shadow-none',
                state?.errors?.name && 'border-red-500'
              )}
            />
            {state?.errors?.name && (
              <ErrorMessage message={state.errors.name[0]} />
            )}
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[13px] text-slate-600">
              Email
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className={cn(
                'h-10 rounded-xl border-slate-200 shadow-none',
                state?.errors?.email && 'border-red-500'
              )}
            />
            {state?.errors?.email && (
              <ErrorMessage message={state.errors.email[0]} />
            )}
          </div>

          <PasswordField
            id="password"
            name="password"
            label="Password"
            value={password}
            visible={passwordVisible}
            onChange={setPassword}
            onToggle={() => setPasswordVisible((value) => !value)}
            className={
              (state?.errors?.password || state?.errors?.confirmPassword) &&
              'border-red-500'
            }
          />

          <PasswordField
            id="confirm-password"
            name="confirmPassword"
            label="Confirm Password"
            value={confirmPassword}
            visible={confirmPasswordVisible}
            onChange={setConfirmPassword}
            onToggle={() => setConfirmPasswordVisible((value) => !value)}
            className={
              (state?.errors?.confirmPassword || state?.errors?.password) &&
              'border-red-500'
            }
          />

          {state?.errors?.password ? (
            <div className="text-xs text-red-500">
              <p>Password must:</p>
              <ul>
                {state.errors.password.map((error) => (
                  <li key={error}>- {error}</li>
                ))}
              </ul>
            </div>
          ) : state?.errors?.confirmPassword ? (
            <ErrorMessage message={state.errors.confirmPassword[0]} />
          ) : null}
        </div>

        <div className="mt-[60px]">
          {state?.message && (
            <div className="mb-4">
              <ErrorMessage message={state.message} />
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-10 w-full cursor-pointer rounded-xl"
          >
            {pending ? 'Creating Account...' : 'Create Account'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            asChild
            className="mt-4 h-10 w-full rounded-xl"
          >
            <Link href="/login">Back To Login</Link>
          </Button>
        </div>
      </form>
    </AuthPageShell>
  );
}
