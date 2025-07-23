'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { Eye, EyeOff } from 'lucide-react'
import { login } from '../../../lib/auth/login'
import { NotificationBanner } from '@/components/ui/NotificationBanner'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full bg-black hover:bg-gray-800 text-white py-4 rounded-lg font-medium transition-colors disabled:opacity-50"
    >
      {pending ? 'Signing in...' : 'Sign In'}
    </button>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [state, formAction] = useFormState(login, null)

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
          <div className="absolute inset-0" style={{
            backgroundImage: `
              radial-gradient(ellipse at top left, rgba(120, 119, 198, 0.3) 0%, transparent 50%),
              radial-gradient(ellipse at bottom right, rgba(255, 119, 198, 0.3) 0%, transparent 50%)
            `
          }} />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div>
            <p className="text-sm uppercase tracking-wider mb-8 opacity-80">A Wise Quote</p>
          </div>
          
          <div>
            <h1 className="text-6xl font-light leading-tight mb-8">
              Get<br />
              Everything<br />
              You Want
            </h1>
            <p className="text-lg opacity-90 max-w-md">
              You can get everything you want if you work hard,<br />
              trust the process, and stick to the plan.
            </p>
          </div>
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
              <span className="text-xl font-semibold text-black font-pirata">tammy</span>
            </div>
          </div>

          <h2 className="text-3xl font-bold text-center mb-2 text-black">
            Welcome Back
          </h2>
          <p className="text-gray-600 text-center mb-8">
            Enter your email and password to access your account
          </p>

          <form action={formAction} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-gray-300 text-black focus:ring-black"
                />
                <span className="ml-2 text-sm text-gray-600">Remember me</span>
              </label>
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-600 hover:text-black transition-colors"
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

          <div className="mt-6">
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-gray-700">Sign In with Google</span>
            </button>
          </div>

          <p className="text-center text-sm text-gray-600 mt-8">
            Don&apos;t have an account? <Link href="/signup" className="text-black font-medium hover:underline">Sign Up</Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}