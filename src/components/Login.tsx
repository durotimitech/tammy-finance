"use client"

import { Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { NotificationBanner } from "@/components/ui/NotificationBanner"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  // Check if Supabase is properly initialized
  useEffect(() => {
    if (!supabase) {
      setError('Authentication service is not configured. Please check your environment variables.')
      console.error('Supabase client is not initialized')
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setSuccess(false)
    
    try {
      console.log('Attempting login with email:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      })
      
      if (error) {
        console.error('Login error:', error)
        setError(error.message)
      } else if (data?.user) {
        console.log('Login successful:', data.user.email)
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setError('Login failed. Please try again.')
      }
    } catch (err) {
      console.error('Unexpected error during login:', err)
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    if (error) {
      setError(error.message)
    }
  }

  return (
    <div className={cn("flex min-h-screen", className)} {...props}>
      {/* Left side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-8 py-12">
        <div className="w-full max-w-md">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600 mb-8">
            Simplify your workflow and boost your productivity<br />
            with <span className="font-semibold">Tuga&apos;s App</span>. Get started for free.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Input
                id="email"
                type="email"
                placeholder="Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-full bg-gray-50 focus:bg-white focus:border-gray-400 focus:outline-none transition-colors"
              />
            </div>

            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            {error && (
              <NotificationBanner message={error} type="error" onClose={() => setError(null)} />
            )}
            {success && (
              <NotificationBanner message="Login successful! Redirecting..." type="success" onClose={() => setSuccess(false)} />
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-black hover:bg-gray-900 text-white py-3 rounded-full font-medium transition-colors"
            >
              {loading ? "Signing in..." : "Login"}
            </Button>
          </form>

          <div className="mt-8">
            <p className="text-center text-gray-600 text-sm mb-4">
              or continue with
            </p>
            
            <div className="flex justify-center gap-4">
              <button
                onClick={handleGoogleSignIn}
                type="button"
                className="w-12 h-12 bg-black hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <span className="font-bold text-lg">G</span>
              </button>
              <button
                type="button"
                className="w-12 h-12 bg-black hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
              </button>
              <button
                type="button"
                className="w-12 h-12 bg-black hover:bg-gray-900 text-white rounded-full flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
                </svg>
              </button>
            </div>
          </div>

          <p className="text-center text-gray-600 text-sm mt-8">
            Not a member? <Link href="/signup" className="text-gray-900 font-medium hover:underline">Register now</Link>
          </p>
        </div>
      </div>

      {/* Right side - Illustration */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-50 to-green-100 items-center justify-center p-12">
        <div className="relative max-w-lg w-full">
          {/* Illustration placeholder */}
          <div className="relative">
            {/* Central figure */}
            <div className="flex justify-center mb-8">
              <div className="relative">
                <div className="w-48 h-48 bg-white rounded-full shadow-lg flex items-center justify-center">
                  <svg className="w-24 h-24 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                {/* Floating avatars */}
                <div className="absolute -top-4 -left-12 w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="absolute -bottom-4 -right-12 w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
              </div>
            </div>

            {/* Canva Design card */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg p-4 w-48">
              <h3 className="font-semibold text-gray-900 mb-2">Canva Design</h3>
              <p className="text-xs text-gray-600 mb-3">10 Task</p>
              <div className="flex items-center justify-between">
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full">Design</span>
                <span className="text-xs text-gray-500">84%</span>
              </div>
            </div>
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
      </div>
    </div>
  )
}