'use client';

import type { Session } from '@supabase/supabase-js';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  PiggyBank,
  Target,
  Star,
  Check,
  ArrowRight,
  Menu,
  X,
  Shield,
  Wallet,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function Home() {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      {/* Navbar */}
      <nav className="w-full px-6 lg:px-12 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#2D2D2D] font-pirata">tammy</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link
              href="#features"
              className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
            >
              How it works
            </Link>
            <Link
              href="#pricing"
              className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
            >
              Pricing
            </Link>
            <Link
              href="#reviews"
              className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
            >
              Reviews
            </Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button className="text-[#6B6B6B] bg-transparent hover:bg-gray-100">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  onClick={handleLogout}
                  className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-6"
                >
                  Logout
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/auth/login">
                  <Button className="bg-transparent hover:bg-gray-100 text-[#6B6B6B]">Login</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-6">
                    Get started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-b">
            <div className="flex flex-col gap-4 pt-4">
              <Link
                href="#features"
                className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
              >
                Features
              </Link>
              <Link
                href="#how-it-works"
                className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
              >
                How it works
              </Link>
              <Link
                href="#pricing"
                className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
              >
                Pricing
              </Link>
              <Link
                href="#reviews"
                className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium"
              >
                Reviews
              </Link>
              <div className="pt-4 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button className="w-full bg-transparent hover:bg-gray-100 text-[#6B6B6B]">
                        Dashboard
                      </Button>
                    </Link>
                    <Button
                      onClick={handleLogout}
                      className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full"
                    >
                      Logout
                    </Button>
                  </>
                ) : (
                  <>
                    <Link href="/auth/login">
                      <Button className="w-full bg-transparent hover:bg-gray-100 text-[#6B6B6B]">
                        Login
                      </Button>
                    </Link>
                    <Link href="/auth/signup">
                      <Button className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full">
                        Get started
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 overflow-hidden">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-5xl lg:text-7xl font-bold text-[#2D2D2D] mb-6 leading-tight">
                Track your
                <br />
                net worth
              </h1>

              <p className="text-xl text-[#6B6B6B] mb-8 max-w-lg">
                A modern financial tracking app that helps you manage assets, liabilities, and reach
                your financial independence goals.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-8 py-6 text-base font-medium"
                  >
                    Get started for free
                  </Button>
                </Link>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="bg-transparent border border-[#E5E5E3] text-[#2D2D2D] hover:bg-[#F5F5F3] rounded-full px-8 py-6 text-base font-medium"
                  >
                    View demo dashboard
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-blue-400 border-2 border-white"
                    />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#6B6B6B]">Trusted by investors worldwide</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <motion.div
                className="relative bg-white rounded-3xl shadow-2xl p-8"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-[#2D2D2D] mb-2">Net Worth Summary</h3>
                  <p className="text-[#6B6B6B]">As of January 2025</p>
                </div>

                <div className="space-y-4">
                  <motion.div
                    className="bg-[#F5F5F3] rounded-2xl p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D2D2D]">Total Assets</h4>
                        <p className="text-lg font-bold text-green-600">$125,430</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-[#F5F5F3] rounded-2xl p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3">
                      <TrendingUp className="w-5 h-5 text-red-500 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D2D2D]">Total Liabilities</h4>
                        <p className="text-lg font-bold text-red-600">$42,100</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    className="bg-gradient-to-r from-green-100 to-blue-100 rounded-2xl p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3">
                      <Wallet className="w-5 h-5 text-blue-600 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D2D2D]">Net Worth</h4>
                        <p className="text-xl font-bold text-blue-600">$83,330</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-[#2D2D2D]">FIRE Progress</p>
                    <p className="text-xs text-[#6B6B6B]">33% to your goal</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Target className="w-6 h-6 text-purple-500" />
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-white">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
              Everything you need to track your wealth
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Comprehensive tools to manage your finances and achieve financial independence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-[#F5F5F3] rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Wallet className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Asset Management</h3>
              <p className="text-[#6B6B6B]">
                Track all your assets in one place. Connect to Trading 212 for automatic portfolio
                updates.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#F5F5F3] rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">FIRE Calculator</h3>
              <p className="text-[#6B6B6B]">
                Plan your path to financial independence with our comprehensive FIRE tracking tools.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#F5F5F3] rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <PiggyBank className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Budget Tracking</h3>
              <p className="text-[#6B6B6B]">
                Set and monitor budgets across categories. Visualize spending patterns and save
                more.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="py-24 px-6 lg:px-12 bg-[#FAFAF8]">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">How tammy works</h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Get started in minutes and take control of your financial future
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-12">
            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-green-600">
                1
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Create your account</h3>
              <p className="text-[#6B6B6B]">
                Sign up for free and secure your data with end-to-end encryption.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-blue-600">
                2
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Add your finances</h3>
              <p className="text-[#6B6B6B]">
                Input your assets and liabilities. Connect Trading 212 for automatic updates.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-purple-600">
                3
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Track your progress</h3>
              <p className="text-[#6B6B6B]">
                Monitor net worth growth, set budgets, and reach financial independence faster.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Testimonials Section */}
      <section id="reviews" className="py-24 px-6 lg:px-12 bg-white">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
              Loved by smart investors
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Join thousands tracking their journey to financial independence
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Chen',
                role: 'Real Estate Investor',
                content:
                  'tammy helped me visualize my entire portfolio. The Trading 212 integration saves hours of manual updates every month.',
                rating: 5,
              },
              {
                name: 'Michael Rodriguez',
                role: 'FIRE Enthusiast',
                content:
                  'The FIRE calculator is incredible. I can see exactly when I&apos;ll reach financial independence based on my current trajectory.',
                rating: 5,
              },
              {
                name: 'Emma Thompson',
                role: 'Software Engineer',
                content:
                  'Finally, a net worth tracker that respects privacy. The encrypted API storage gives me peace of mind with my financial data.',
                rating: 5,
              },
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                className="bg-[#F5F5F3] rounded-3xl p-8"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-[#6B6B6B] mb-6">&ldquo;{testimonial.content}&rdquo;</p>
                <div>
                  <p className="font-semibold text-[#2D2D2D]">{testimonial.name}</p>
                  <p className="text-sm text-[#6B6B6B]">{testimonial.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6 lg:px-12 bg-[#FAFAF8]">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
              Simple, transparent pricing
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Start free and upgrade for advanced features
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-3xl p-8 border border-[#E5E5E3]"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-2">Free</h3>
              <p className="text-[#6B6B6B] mb-6">Perfect for getting started</p>
              <div className="text-4xl font-bold text-[#2D2D2D] mb-6">
                $0<span className="text-lg font-normal text-[#6B6B6B]">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-[#6B6B6B]">Track unlimited assets</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-[#6B6B6B]">Net worth calculation</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-[#6B6B6B]">Basic charts & analytics</span>
                </li>
              </ul>

              <Button className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full">
                Get started
              </Button>
            </motion.div>

            <motion.div
              className="bg-[#2D2D2D] text-white rounded-3xl p-8 relative"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-green-400 to-blue-400 text-white text-sm font-medium px-4 py-1 rounded-full">
                Most popular
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-300 mb-6">For serious investors</p>
              <div className="text-4xl font-bold mb-6">
                $12<span className="text-lg font-normal text-gray-300">/month</span>
              </div>

              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Everything in Free</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Trading 212 integration</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Advanced FIRE calculator</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Budget tracking & alerts</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Export reports</span>
                </li>
              </ul>

              <Button className="w-full bg-white text-[#2D2D2D] hover:bg-gray-100 rounded-full">
                Start free trial
              </Button>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-green-100 to-blue-100">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-6">
            Ready to take control of your finances?
          </h2>
          <p className="text-xl text-[#6B6B6B] mb-8">
            Join thousands tracking their journey to financial independence with tammy.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup">
              <Button
                size="lg"
                className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-8 py-6 text-base font-medium"
              >
                Get started for free
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>

          <p className="text-sm text-[#6B6B6B] mt-6">No credit card required • Free forever</p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E5E3] py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-[#2D2D2D] font-pirata">tammy</span>
              </div>
              <p className="text-[#6B6B6B] mb-6">
                Your modern net worth tracker for achieving financial independence.
              </p>
              <div className="flex gap-4">
                <Shield className="w-6 h-6 text-[#6B6B6B]" />
                <span className="text-sm text-[#6B6B6B]">Bank-level security</span>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Product</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Dashboard
                  </Link>
                </li>
                <li>
                  <Link
                    href="/dashboard/fire"
                    className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm"
                  >
                    FIRE Calculator
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Documentation
                  </Link>
                </li>
                <li>
                  <Link href="/support" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Support
                  </Link>
                </li>
                <li>
                  <Link href="/security" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Security
                  </Link>
                </li>
                <li>
                  <Link
                    href="/integrations"
                    className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm"
                  >
                    Integrations
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Privacy
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Terms
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#E5E5E3] pt-8 text-center">
            <p className="text-sm text-[#6B6B6B]">© 2025 tammy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
