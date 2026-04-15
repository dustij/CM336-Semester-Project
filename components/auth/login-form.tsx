'use client';

import Link from 'next/link';
import { useActionState, useState } from 'react';

import { loginAuth } from '@/app/login/actions';
import { AuthPageShell } from '@/components/auth/auth-page-shell';
import { ErrorMessage } from '@/components/auth/error-message';
import { PasswordField } from '@/components/auth/password-field';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export function LoginForm() {
  const [state, formAction, pending] = useActionState(loginAuth, {});
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);

  return (
    <AuthPageShell description='Please log in to your account'>
      <form className='mx-1 flex flex-1 flex-col' action={formAction}>
        <div className='mt-10 grid gap-4'>
          <div className='grid gap-2'>
            <Label htmlFor='email' className='text-[13px] text-slate-600'>
              Email
            </Label>
            <Input
              id='email'
              name='email'
              type='email'
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className='h-10 rounded-xl border-slate-200 shadow-none'
            />
          </div>

          <div className='grid gap-2'>
            <PasswordField
              id='password'
              label='Password'
              value={password}
              name='password'
              visible={passwordVisible}
              onChange={setPassword}
              onToggle={() => setPasswordVisible((value) => !value)}
            />
            <div className='flex justify-end'>
              <Button
                type='button'
                variant='link'
                className='h-auto px-0 text-xs text-slate-400 hover:text-slate-600'
              >
                Forgot Password?
              </Button>
            </div>
          </div>
        </div>

        <div className='mt-[60px]'>
          <Button
            type='submit'
            disabled={pending}
            className='h-10 w-full rounded-xl cursor-pointer'
          >
            {pending ? 'Logging In...' : 'Log In'}
          </Button>
          <Button
            type='button'
            variant='secondary'
            asChild
            className='mt-4 h-10 w-full rounded-xl'
          >
            <Link href='/signup'>Sign Up</Link>
          </Button>
          <ErrorMessage message={state.error ?? ''} />
        </div>
      </form>
    </AuthPageShell>
  );
}
