'use client'

import { motion } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { login } from '../../../lib/auth/login'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { NotificationBanner } from '@/components/ui/NotificationBanner'

function SubmitButton() {
  const { pending } = useFormStatus()
  
  return (
    <Button
      type="submit"
      disabled={pending}
      className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-full font-medium transition-colors"
    >
      {pending ? 'Signing in...' : 'Login'}
    </Button>
  )
}

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useFormState(login, null)

  return (
    <div className="flex min-h-screen">
      {/* Left side - Form */}
      <motion.div 
        className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12"
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 mb-8">
            Simplify your workflow and boost your productivity<br />
            with <span className="font-semibold">Tuga&apos;s App</span>. Get started for free.
          </p>

          <form action={formAction} className="space-y-6">
            <div>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Username"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <Input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                required
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none transition-colors"
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

            <div className="text-right">
              <Link 
                href="/forgot-password" 
                className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
              >
                Forgot Password?
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

          <div className="mt-8">
            <p className="text-center text-gray-600 text-sm mb-4">
              or continue with
            </p>
          </div>

          <p className="text-center text-gray-600 text-sm mt-8">
            Not a member? <Link href="/signup" className="text-gray-900 font-medium hover:underline">Register now</Link>
          </p>
        </div>
      </motion.div>

      {/* Right side - Illustration */}
      <motion.div 
        className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 to-green-100 items-center justify-center p-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="relative max-w-lg w-full">
          {/* Illustration placeholder */}
          <div className="relative">
            {/* Central figure */}
            <motion.div 
              className="flex justify-center mb-8"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="relative">
                <div className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-24 h-24 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                {/* Floating avatars */}
                <motion.div 
                  className="absolute -top-4 -left-12 w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center"
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </motion.div>
                <motion.div 
                  className="absolute -bottom-4 -right-12 w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 1.5 }}
                >
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </motion.div>
              </div>
            </motion.div>

            {/* Canva Design card */}
            <motion.div 
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 w-48"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <h3 className="font-semibold text-gray-900 mb-2">Canva Design</h3>
              <p className="text-xs text-gray-600 mb-3">10 Task</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Design</span>
                <span className="text-xs text-gray-500">84%</span>
              </div>
            </motion.div>
          </div>

          {/* Bottom text */}
          <div className="text-center mt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Make your work easier and organized
            </h2>
            <p className="text-lg text-gray-700">
              with <span className="font-semibold">Tuga&apos;s App</span>
            </p>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center mt-8 gap-2">
            <div className="w-2 h-2 bg-gray-900 rounded-full"></div>
            <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}