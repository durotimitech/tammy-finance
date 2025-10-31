"use client";

import { motion } from "framer-motion";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import { login } from "../../../lib/auth/login";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { NotificationBanner } from "@/components/ui/NotificationBanner";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      loading={pending}
      variant="default"
      size="lg"
      className="w-full bg-black hover:bg-gray-800 text-white "
    >
      Sign In
    </Button>
  );
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [state, formAction] = useFormState(login, null);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Orange Background with Centered Image */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden"
        style={{ backgroundColor: "#ff5722" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Centered Image Container */}
        <div className="relative w-full h-full flex items-center justify-center p-12">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative w-full max-w-2xl"
          >
            <Image
              src="/auth_hero.png"
              alt="Net Worth Tracker Dashboard"
              width={800}
              height={600}
              className="w-full h-auto rounded-lg shadow-2xl"
              priority
            />
          </motion.div>
        </div>
      </motion.div>

      {/* Right side - Login Form */}
      <motion.div
        className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12 bg-gray-50"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-2">
              <span className="text-xl font-semibold font-pirata text-secondary">
                tammy
              </span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-8">
            Enter your email and password to access your account
          </p>

          <form action={formAction} className="space-y-6">
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="pr-12"
                />
                <Button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  variant="default"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Forgot Password
              </Link>
            </div>

            {state?.error && (
              <NotificationBanner
                message={state.error}
                type="error"
                onClose={() => {}}
              />
            )}
            {state?.success && (
              <NotificationBanner
                message="Login successful! Redirecting..."
                type="success"
                onClose={() => {}}
              />
            )}

            <SubmitButton />
          </form>
          <p className="text-center text-sm text-gray-600 mt-8">
            Don&apos;t have an account?{" "}
            <Link
              href="/auth/signup"
              className="font-medium text-secondary hover:underline"
            >
              Sign Up
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
