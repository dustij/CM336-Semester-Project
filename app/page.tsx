"use client";

import { type FormEvent, useState } from "react";

type Status = {
  type: "idle" | "error" | "success";
  message: string;
};

type Screen = "login" | "signup";

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="h-4 w-4"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.6 10.7a2 2 0 0 0 2.7 2.7" />
      <path d="M9.4 5.3A11.2 11.2 0 0 1 12 5c6.5 0 10 7 10 7a17.6 17.6 0 0 1-3.1 4" />
      <path d="M6.6 6.7C3.9 8.3 2 12 2 12a17.6 17.6 0 0 0 10 7 11.3 11.3 0 0 0 5.4-1.3" />
    </svg>
  );
}

function PasswordField({
  id,
  label,
  value,
  onChange,
  visible,
  onToggle,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  visible: boolean;
  onToggle: () => void;
}) {
  return (
    <label className="flex flex-col gap-2 text-[13px] text-slate-600" htmlFor={id}>
      <span>{label}</span>
      <div className="flex items-center rounded-xl border border-slate-200 bg-white px-3 shadow-[0_8px_24px_rgba(15,23,42,0.04)] transition focus-within:border-red-300 focus-within:ring-4 focus-within:ring-red-100">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full bg-transparent text-sm text-slate-900 outline-none"
        />
        <button
          type="button"
          onClick={onToggle}
          className="ml-2 inline-flex h-7 w-7 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <EyeIcon open={visible} />
        </button>
      </div>
    </label>
  );
}

function StatusMessage({ status }: { status: Status }) {
  if (status.type === "idle") {
    return <div className="h-5" />;
  }

  return (
    <p
      className={`min-h-5 text-xs ${
        status.type === "success" ? "text-emerald-600" : "text-red-500"
      }`}
    >
      {status.message}
    </p>
  );
}

export default function Home() {
  const [activeScreen, setActiveScreen] = useState<Screen>("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [signupConfirmPassword, setSignupConfirmPassword] = useState("");
  const [loginPasswordVisible, setLoginPasswordVisible] = useState(false);
  const [signupPasswordVisible, setSignupPasswordVisible] = useState(false);
  const [signupConfirmVisible, setSignupConfirmVisible] = useState(false);
  const [loginStatus, setLoginStatus] = useState<Status>({
    type: "idle",
    message: "",
  });
  const [signupStatus, setSignupStatus] = useState<Status>({
    type: "idle",
    message: "",
  });

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!loginEmail.trim() || !loginPassword.trim()) {
      setLoginStatus({
        type: "error",
        message: "Email and password are required.",
      });
      return;
    }

    setLoginStatus({
      type: "success",
      message: "Login succeeded for the frontend prototype.",
    });
  };

  const handleSignup = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (
      !signupEmail.trim() ||
      !signupPassword.trim() ||
      !signupConfirmPassword.trim()
    ) {
      setSignupStatus({
        type: "error",
        message: "Please fill out every field.",
      });
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupStatus({
        type: "error",
        message: "Passwords do not match.",
      });
      return;
    }

    setSignupStatus({
      type: "success",
      message: "Account created for the frontend prototype.",
    });
  };

  return (
    <main className="min-h-screen bg-white">
      <div className="mx-auto flex min-h-screen w-full max-w-[393px] flex-col px-6 py-6">
        {activeScreen === "signup" ? (
          <form className="flex flex-1 flex-col pt-32" onSubmit={handleSignup}>
            <div>
              <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-950">
                Mesocycle Planner
              </h1>
              <p className="mt-4 text-[15px] text-slate-500">
                Lets create your free account
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <label
                className="flex flex-col gap-2 text-[13px] text-slate-600"
                htmlFor="signup-email"
              >
                <span>Email</span>
                <input
                  id="signup-email"
                  type="email"
                  value={signupEmail}
                  onChange={(event) => setSignupEmail(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                />
              </label>

              <PasswordField
                id="signup-password"
                label="Password"
                value={signupPassword}
                onChange={setSignupPassword}
                visible={signupPasswordVisible}
                onToggle={() => setSignupPasswordVisible((value) => !value)}
              />

              <PasswordField
                id="signup-confirm-password"
                label="Confirm Password"
                value={signupConfirmPassword}
                onChange={setSignupConfirmPassword}
                visible={signupConfirmVisible}
                onToggle={() => setSignupConfirmVisible((value) => !value)}
              />
            </div>

            <div className="mt-auto pt-6">
              <StatusMessage status={signupStatus} />
              <button
                type="submit"
                className="mt-4 h-10 w-full rounded-xl bg-[#ff3945] text-sm font-semibold text-white transition hover:bg-[#f12f3a]"
              >
                Create Account
              </button>
              <button
                type="button"
                onClick={() => setActiveScreen("login")}
                className="mt-4 h-10 w-full rounded-xl bg-[#fff2f2] text-sm font-semibold text-[#b33d43] transition hover:bg-[#ffe7e7]"
              >
                Back To Login
              </button>
            </div>
          </form>
        ) : (
          <form className="flex flex-1 flex-col pt-32" onSubmit={handleLogin}>
            <div>
              <h1 className="text-[2rem] font-semibold leading-none tracking-[-0.03em] text-slate-950">
                Mesocycle Planner
              </h1>
              <p className="mt-4 text-[15px] text-slate-500">
                Please log in to your account
              </p>
            </div>

            <div className="mt-12 space-y-4">
              <label
                className="flex flex-col gap-2 text-[13px] text-slate-600"
                htmlFor="login-email"
              >
                <span>Email</span>
                <input
                  id="login-email"
                  type="email"
                  value={loginEmail}
                  onChange={(event) => setLoginEmail(event.target.value)}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-red-300 focus:ring-4 focus:ring-red-100"
                />
              </label>

              <div>
                <PasswordField
                  id="login-password"
                  label="Password"
                  value={loginPassword}
                  onChange={setLoginPassword}
                  visible={loginPasswordVisible}
                  onToggle={() => setLoginPasswordVisible((value) => !value)}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    type="button"
                    className="text-xs text-slate-400 underline decoration-slate-300 underline-offset-4 transition hover:text-slate-600"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-auto pt-6">
              <StatusMessage status={loginStatus} />
              <button
                type="submit"
                className="mt-4 h-10 w-full rounded-xl bg-[#ff3945] text-sm font-semibold text-white transition hover:bg-[#f12f3a]"
              >
                Log In
              </button>
              <button
                type="button"
                onClick={() => setActiveScreen("signup")}
                className="mt-4 h-10 w-full rounded-xl bg-[#fff2f2] text-sm font-semibold text-[#b33d43] transition hover:bg-[#ffe7e7]"
              >
                Sign Up
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
