"use client";

import type { Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { ChevronDown, TrendingUp, PieChart, Target, Sparkles, BarChart, Shield } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
  const [session, setSession] = useState<Session | null>(null);
  const [openFaq, setOpenFaq] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  const toggleFaq = (id: string) => {
    setOpenFaq(openFaq === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-emerald-50">
      {/* Navbar */}
      <nav className="w-full flex items-center justify-between px-6 py-4 bg-white/80 backdrop-blur border-b border-emerald-100 shadow-sm fixed top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="inline-block rounded-full bg-emerald-100 p-2">
            <TrendingUp className="w-6 h-6 text-emerald-600" />
          </span>
          <span className="font-bold text-lg text-gray-900">NetWorth</span>
        </div>
        <div className="hidden md:flex items-center gap-8">
          <Link href="#features" className="text-gray-700 hover:text-emerald-600 transition-colors">Features</Link>
          <Link href="#how-it-works" className="text-gray-700 hover:text-emerald-600 transition-colors">Product</Link>
          <Link href="#pricing" className="text-gray-700 hover:text-emerald-600 transition-colors">Pricing</Link>
        </div>
        <div>
          {session ? (
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost">Dashboard</Button>
              </Link>
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          ) : (
            <Link href="/signin">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-100/20 to-teal-100/20 rounded-full blur-3xl" />
        
        <motion.div
          className="max-w-6xl mx-auto relative"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                <span>NEW</span>
                <span>AI-Powered Insights</span>
              </div>
              
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Transforming Wealth -
                <span className="text-emerald-600"> One Asset</span>
                <br />
                at a Time
              </h1>
              
              <p className="text-lg text-gray-600 mb-8">
                Track net worth, monitor investments, and celebrate every milestone on your journey to financial freedom.
              </p>
              
              <div className="flex gap-4 mb-12">
                <Button size="lg" className="bg-black text-white hover:bg-gray-800">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  Download on App Store
                </Button>
                <Button size="lg" variant="outline">
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h14c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-14c-.83 0-1.5-.67-1.5-1.5zM18.5 3.5h-13c-.28 0-.5.22-.5.5v16c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-16c0-.28-.22-.5-.5-.5zM12 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                  Get it on Google Play
                </Button>
              </div>

              <div className="flex items-center gap-8">
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">Best Of 2024</span>
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-sm text-gray-500">Google Play&apos;s</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-gray-900">Editor&apos;s Choice</span>
                  <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                  <span className="text-sm text-gray-500">App Store</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-3xl blur-2xl opacity-30" />
              <div className="relative bg-gradient-to-br from-emerald-400 to-teal-400 rounded-3xl p-8 shadow-2xl">
                <div className="bg-black rounded-2xl overflow-hidden shadow-xl">
                  <div className="bg-gray-900 px-4 py-2 flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 bg-red-500 rounded-full" />
                      <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                      <div className="w-3 h-3 bg-green-500 rounded-full" />
                    </div>
                    <div className="flex-1 text-center">
                      <span className="text-xs text-gray-400">NetWorth Tracker</span>
                    </div>
                  </div>
                  <div className="p-6 bg-white">
                    <div className="mb-6">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Your Potential</h3>
                      <p className="text-sm text-gray-600">Start using time to reflect, set new goals, and push your boundaries.</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Net Worth</span>
                        <span className="text-sm font-semibold text-emerald-600">+12.5%</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 mb-2">$125,430</div>
                      <svg className="w-full h-16" viewBox="0 0 200 60">
                        <path d="M0,40 Q50,20 100,30 T200,15" stroke="#10b981" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="bg-orange-100 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Assets</div>
                        <div className="text-sm font-semibold">$180k</div>
                      </div>
                      <div className="bg-green-100 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Growth</div>
                        <div className="text-sm font-semibold">+24%</div>
                      </div>
                      <div className="bg-blue-100 rounded-lg p-3">
                        <div className="text-xs text-gray-600 mb-1">Goals</div>
                        <div className="text-sm font-semibold">3 of 5</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6 bg-white">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium">Your Wealth Advantage</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              A Smarter Approach<br />to Wealth Building
            </h2>
            <Link href="/learn-more" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Learn more →
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-gradient-to-br from-orange-100 to-yellow-100 rounded-3xl p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6">
                <PieChart className="w-8 h-8 text-orange-600 mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Unlock Your Potential</h3>
                <p className="text-sm text-gray-600">Take some time to reflect, set new goals, and push your boundaries.</p>
              </div>
              <div className="flex items-center gap-4">
                <BarChart className="w-6 h-6 text-orange-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">AI-Powered Insights</h4>
                  <p className="text-sm text-gray-600">Receive personalized, data-driven insights that help you understand your progress and guide your wealth journey.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-pink-100 to-rose-100 rounded-3xl p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6 flex items-center justify-center h-32">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900 mb-1">$156,234</div>
                  <div className="text-sm text-emerald-600">Net Worth</div>
                  <svg className="w-32 h-16 mt-2" viewBox="0 0 128 64">
                    <path d="M0,50 Q32,30 64,35 T128,20" stroke="#10b981" strokeWidth="2" fill="none" />
                  </svg>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Target className="w-6 h-6 text-rose-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">All-in-One Tracking</h4>
                  <p className="text-sm text-gray-600">From real estate to crypto, track every aspect of your wealth in one place.</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              className="bg-gradient-to-br from-blue-100 to-cyan-100 rounded-3xl p-8"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="bg-white/80 backdrop-blur rounded-2xl p-6 mb-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <span className="text-sm font-medium">Time for Investment Review</span>
                    <span className="text-xs text-gray-500">Today at 10:00 AM</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span className="text-sm font-medium">Monthly Goal Achieved!</span>
                    <span className="text-xs text-gray-500">Saved $2,000</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium">Portfolio Rebalancing</span>
                    <span className="text-xs text-gray-500">Recommended action</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Shield className="w-6 h-6 text-blue-600" />
                <div>
                  <h4 className="font-semibold text-gray-900">Motivation that Lasts</h4>
                  <p className="text-sm text-gray-600">Stay on track with goal reminders, progress updates, and insights designed to keep you engaged and inspired.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Detailed Feature Section */}
      <section id="how-it-works" className="py-16 px-6 bg-gradient-to-b from-gray-50 to-white">
        <motion.div
          className="max-w-6xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="bg-gradient-to-br from-cyan-100 to-blue-100 rounded-3xl p-8">
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-green-100 rounded-lg p-2">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Real-Time Tracking</h4>
                    <p className="text-sm text-gray-600">Monitor your wealth 24/7</p>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Track vital wealth metrics such as portfolio value, asset allocation, and investment returns
                </h3>
                
                <p className="text-gray-600 mb-6">
                  You can adjust your strategy to stay within safe limits, prevent overexposure, and maximize the effectiveness of each investment decision.
                </p>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full" />
                    <div>
                      <div className="text-xs text-gray-600">Stock Portfolio</div>
                      <div className="text-sm font-semibold">$45,230</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-orange-500 rounded-full" />
                    <div>
                      <div className="text-xs text-gray-600">Real Estate</div>
                      <div className="text-sm font-semibold">$280,000</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <div className="text-xs text-gray-600">Crypto Assets</div>
                      <div className="text-sm font-semibold">$12,450</div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <div>
                      <div className="text-xs text-gray-600">Savings</div>
                      <div className="text-sm font-semibold">$35,000</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-green-200 to-emerald-200 rounded-3xl blur-2xl opacity-30" />
              <div className="relative bg-gradient-to-br from-green-400 to-emerald-400 rounded-3xl p-1 shadow-2xl">
                <div className="bg-black rounded-3xl overflow-hidden">
                  <div className="bg-gray-900 px-4 py-2 flex items-center justify-center">
                    <span className="text-xs text-gray-400">NetWorth Stats</span>
                  </div>
                  <div className="p-6 bg-white">
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">Wealth Stats</h3>
                    <p className="text-sm text-gray-600 mb-4">Track key indicators of your wealth and financial progress.</p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-sm">Portfolio Balance</span>
                        </div>
                        <span className="text-sm font-semibold">98.0°F</span>
                      </div>
                      
                      <div className="bg-emerald-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-700">Net Worth Growth</span>
                          <span className="text-xs text-emerald-600">+18% YoY</span>
                        </div>
                        <svg className="w-full h-20" viewBox="0 0 200 80">
                          <path d="M0,60 Q25,40 50,45 T100,35 T150,25 T200,15" stroke="#10b981" strokeWidth="2" fill="none" />
                          <circle cx="200" cy="15" r="3" fill="#10b981" />
                        </svg>
                      </div>
                      
                      <div className="text-center text-sm text-gray-600">
                        Looks like your portfolio is performing well! 📈
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-6 bg-white">
        <motion.div
          className="max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-12">
            <span className="text-emerald-600 font-medium">Frequently ask questions</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mt-2 mb-4">
              Here are answers to some questions<br />our community often asks
            </h2>
            <Link href="/community" className="text-gray-600 hover:text-emerald-600 transition-colors">
              Open community →
            </Link>
          </div>

          <div className="space-y-4">
            <motion.div
              className="border border-gray-200 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq('1')}
              >
                <span className="font-medium text-gray-900">How will the app know what investments are right for me?</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === '1' ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === '1' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">Our AI analyzes your financial goals, risk tolerance, and current portfolio to provide personalized recommendations. You&apos;ll complete a brief questionnaire when you start, and the app continuously learns from your financial behavior to refine its suggestions.</p>
                </div>
              )}
            </motion.div>

            <motion.div
              className="border border-gray-200 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq('2')}
              >
                <span className="font-medium text-gray-900">Can I really track my wealth in real time?</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === '2' ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === '2' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">Yes! You&apos;ll see live updates on things like stock prices, crypto values, and even estimated real estate values. It&apos;s like having instant insight into how your wealth is responding, helping you decide if it&apos;s time to rebalance or take action.</p>
                </div>
              )}
            </motion.div>

            <motion.div
              className="border border-gray-200 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq('3')}
              >
                <span className="font-medium text-gray-900">Does this work with other apps like Mint or Personal Capital?</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === '3' ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === '3' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">Yes! NetWorth Tracker integrates seamlessly with popular financial apps and institutions. You can sync your accounts from banks, brokerages, and other financial platforms to get a complete picture of your wealth in one place.</p>
                </div>
              )}
            </motion.div>

            <motion.div
              className="border border-gray-200 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq('4')}
              >
                <span className="font-medium text-gray-900">How do I set my financial goals in the app?</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === '4' ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === '4' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">Setting goals is simple! Navigate to the Goals section, where you can create custom targets like &quot;Save $50,000 for a house&quot; or &quot;Reach $1M net worth by 40.&quot; The app tracks your progress and sends motivating updates to keep you on track.</p>
                </div>
              )}
            </motion.div>

            <motion.div
              className="border border-gray-200 rounded-lg overflow-hidden"
              whileHover={{ scale: 1.01 }}
            >
              <button
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                onClick={() => toggleFaq('5')}
              >
                <span className="font-medium text-gray-900">Will the app remind me to review my portfolio or rebalance?</span>
                <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${openFaq === '5' ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === '5' && (
                <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
                  <p className="text-gray-600">Absolutely! You&apos;ll receive smart notifications when it&apos;s time to review your portfolio, when market conditions suggest rebalancing, or when you&apos;re approaching your goals. You can customize the frequency and types of reminders you receive.</p>
                </div>
              )}
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Footer CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-br from-orange-100 via-pink-100 to-purple-100">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Your Wealth. Your Journey.
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Track net worth, monitor investments, and celebrate every milestone
          </p>
          
          <div className="flex justify-center gap-4 mb-12">
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
              </svg>
              Download on App Store
            </Button>
            <Button size="lg" className="bg-black text-white hover:bg-gray-800">
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h14c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-14c-.83 0-1.5-.67-1.5-1.5zM18.5 3.5h-13c-.28 0-.5.22-.5.5v16c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-16c0-.28-.22-.5-.5-.5zM12 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
              </svg>
              Get it on Google Play
            </Button>
          </div>

          <div className="relative max-w-2xl mx-auto">
            <div className="absolute -inset-4 bg-gradient-to-r from-orange-200 via-pink-200 to-purple-200 rounded-3xl blur-2xl opacity-50" />
            <div className="relative grid grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="bg-gray-100 rounded-lg h-32 mb-2 flex items-center justify-center">
                  <svg className="w-24 h-24" viewBox="0 0 100 60">
                    <path d="M10,40 Q30,20 50,30 T90,20" stroke="#10b981" strokeWidth="2" fill="none" />
                  </svg>
                </div>
                <p className="text-xs text-gray-600 text-center">Track daily progress</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg -mt-4">
                <div className="bg-gray-100 rounded-lg h-32 mb-2 flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-xl font-bold text-gray-900">$125k</div>
                    <div className="text-xs text-emerald-600">Net Worth</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center">Real-time updates</p>
              </div>
              <div className="bg-white rounded-2xl p-4 shadow-lg">
                <div className="bg-gray-100 rounded-lg h-32 mb-2 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                </div>
                <p className="text-xs text-gray-600 text-center">Achieve your goals</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <span className="inline-block rounded-full bg-emerald-100 p-2">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </span>
                <span className="font-bold text-lg text-gray-900">NetWorth</span>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-gray-600 hover:text-emerald-600">Features</Link></li>
                <li><Link href="/pricing" className="text-gray-600 hover:text-emerald-600">Pricing</Link></li>
                <li><Link href="/about" className="text-gray-600 hover:text-emerald-600">About</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Support</h4>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-600 hover:text-emerald-600">Help Center</Link></li>
                <li><Link href="/contact" className="text-gray-600 hover:text-emerald-600">Contact Us</Link></li>
                <li><Link href="/faq" className="text-gray-600 hover:text-emerald-600">FAQ</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-gray-600 hover:text-emerald-600">Blog</Link></li>
                <li><Link href="/guides" className="text-gray-600 hover:text-emerald-600">Guides</Link></li>
                <li><Link href="/calculator" className="text-gray-600 hover:text-emerald-600">Calculator</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-gray-900 mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-600 hover:text-emerald-600">Privacy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-emerald-600">Terms</Link></li>
                <li><Link href="/security" className="text-gray-600 hover:text-emerald-600">Security</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-8 text-center text-sm text-gray-600">
            <p>&copy; 2024 NetWorth Tracker. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}