"use client";

import { FormInput } from "../form-input";
import { PasswordToggle } from "../password-toggle";
import LoadingButton from "@/components/LoadingButton";
import { Lock, Mail } from "lucide-react";
import Link from "next/link";
import ErrorMessage from "../error-message";
import { useLogin } from "./useLogin";

export default function LoginForm() {
  const {
    formData,
    updateFormData,
    showPassword,
    setShowPassword,
    handleLogin,
    isLoading,
    errors,
  } = useLogin();

  return (
    <>
      <ErrorMessage message={errors.general} />

      <form onSubmit={handleLogin} className="space-y-4">
        <div className="space-y-4">
          <FormInput
            id="email"
            label="Email"
            type="text"
            value={formData.email}
            onChange={(value) => updateFormData("email", value)}
            placeholder="you@company.com"
            icon={Mail}
            hasError={errors.email}
          />

          <div>
            <FormInput
              id="password"
              label="Password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={(value) => updateFormData("password", value)}
              placeholder="••••••••"
              icon={Lock}
              hasError={errors.password}
              className="placeholder:tracking-wider "
              rightElement={
                <PasswordToggle
                  showPassword={showPassword}
                  onToggle={() => setShowPassword((prev) => !prev)}
                />
              }
            />
          </div>

          <div>
            <LoadingButton
              type="submit"
              isLoading={isLoading}
              loadingText="Logging in..."
              className="w-full uppercase"
              disabled={isLoading}
            >
              LOG IN
            </LoadingButton>
          </div>

          <div>
            <div className="text-center text-sm text-gray-600">
              Don&apos;t have an account?{" "}
              <Link
                prefetch
                href="/auth/signup"
                className="text-gradient2 hover:underline font-bold"
              >
                Register
              </Link>
            </div>
          </div>
        </div>
      </form>
    </>
  );
}
