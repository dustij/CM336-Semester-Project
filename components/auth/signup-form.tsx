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

export function SignupForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill out every field.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    router.push("/login");
  };

  return (
    <AuthPageShell description="Lets create your free account">
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

          <PasswordField
            id="password"
            label="Password"
            value={password}
            visible={passwordVisible}
            onChange={setPassword}
            onToggle={() => setPasswordVisible((value) => !value)}
          />

          <PasswordField
            id="confirm-password"
            label="Confirm Password"
            value={confirmPassword}
            visible={confirmPasswordVisible}
            onChange={setConfirmPassword}
            onToggle={() => setConfirmPasswordVisible((value) => !value)}
          />
        </div>

        <div className="mt-[60px]">
          <Button
            type="submit"
            className="h-10 w-full rounded-xl bg-[#ff3945] text-white hover:bg-[#f12f3a]"
          >
            Create Account
          </Button>
          <Button
            type="button"
            variant="secondary"
            asChild
            className="mt-4 h-10 w-full rounded-xl bg-[#fff2f2] text-[#b33d43] hover:bg-[#ffe7e7]"
          >
            <Link href="/login">Back To Login</Link>
          </Button>
          <ErrorMessage message={error} />
        </div>
      </form>
    </AuthPageShell>
  );
}
