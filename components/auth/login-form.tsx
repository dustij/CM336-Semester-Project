"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import Link from "next/link";

import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { ErrorMessage } from "@/components/auth/error-message";
import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Email and password are required.");
      return;
    }

    setError("");
    router.push("/dashboard");
  };

  return (
    <AuthPageShell description="Please log in to your account">
      <form className="flex flex-1 flex-col" onSubmit={handleSubmit}>
        <div className="mt-10 grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="email" className="text-[13px] text-slate-600">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="h-10 rounded-xl border-slate-200 shadow-none"
            />
          </div>

          <div className="grid gap-2">
            <PasswordField
              id="password"
              label="Password"
              value={password}
              visible={passwordVisible}
              onChange={setPassword}
              onToggle={() => setPasswordVisible((value) => !value)}
            />
            <div className="flex justify-end">
              <Button
                type="button"
                variant="link"
                className="h-auto px-0 text-xs text-slate-400 hover:text-slate-600"
              >
                Forgot Password?
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-[60px]">
          <Button
            type="submit"
            className="h-10 w-full rounded-xl bg-[#ff3945] text-white hover:bg-[#f12f3a]"
          >
            Log In
          </Button>
          <Button
            type="button"
            variant="secondary"
            asChild
            className="mt-4 h-10 w-full rounded-xl bg-[#fff2f2] text-[#b33d43] hover:bg-[#ffe7e7]"
          >
            <Link href="/signup">Sign Up</Link>
          </Button>
          <ErrorMessage message={error} />
        </div>
      </form>
    </AuthPageShell>
  );
}
