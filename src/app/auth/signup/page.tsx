'use client';

import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import { signup } from '../../../lib/auth/signup';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { NotificationBanner } from '@/components/ui/NotificationBanner';

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" loading={pending} variant="default" size="lg" className="w-full">
      Sign Up
    </Button>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [state, formAction] = useFormState(signup, null);

  useEffect(() => {
    if (state?.accountExists) {
      // Redirect to login page after a short delay to show the message
      const timer = setTimeout(() => {
        router.push('/auth/login');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [state?.accountExists, router]);

  return (
    <div className="flex min-h-screen">
      {/* Left side - Gradient Background */}
      <motion.div
        className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-black"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {/* Gradient waves background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 opacity-80" />
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
              radial-gradient(ellipse at top left, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(255, 119, 198, 0.3) 0%, transparent 50%)
            `,
            }}
          />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <p className="text-sm uppercase tracking-wider mb-8 opacity-80">Join Today</p>
          </div>

          <div>
            <h1 className="text-6xl font-light leading-tight mb-8">
              Start Your
              <br />
              Financial
              <br />
              Journey
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              Take control of your finances and watch your wealth grow
              <br />
              with our intuitive tracking tools.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right side - Signup Form */}
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
              <span className="text-xl font-semibold font-pirata text-secondary">tammy</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2">Create Account</h2>
          <p className="text-gray-600 text-center mb-8">Enter your details to get started</p>

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="firstname" className="block text-sm font-medium text-gray-700 mb-2">
                First Name
              </label>
              <Input
                id="firstname"
                name="firstname"
                type="text"
                placeholder="Enter your first name"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input id="email" name="email" type="email" placeholder="Enter your email" required />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a password"
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
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </Button>
              </div>
            </div>

            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Confirm Password
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  required
                  className="pr-12"
                />
                <Button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  variant="default"
                  size="sm"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </Button>
              </div>
            </div>

            {state?.error && (
              <NotificationBanner message={state.error} type="error" onClose={() => {}} />
            )}
            {state?.success && (
              <NotificationBanner
                message="Account created! Please check your email to confirm."
                type="success"
                onClose={() => {}}
              />
            )}

            <SubmitButton />
          </form>

          <p className="text-center text-sm text-gray-600 mt-8">
            Already have an account?{' '}
            <Link href="/auth/login" className="font-medium text-secondary hover:underline">
              Sign In
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
