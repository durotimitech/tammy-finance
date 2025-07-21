"use client";

import type { Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { Calendar, Clock, Target, Sparkles, ChevronRight, Star, Check, ArrowRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { supabase } from "@/lib/supabaseClient";

export default function Home() {
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
  }, []);

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
            <span className="text-2xl font-bold text-[#2D2D2D]">Ellie</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            <Link href="#features" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">Features</Link>
            <Link href="#how-it-works" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">How it works</Link>
            <Link href="#pricing" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">Pricing</Link>
            <Link href="#reviews" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">Reviews</Link>
          </div>

          {/* Desktop Auth Buttons */}
          <div className="hidden md:block">
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button variant="ghost" className="text-[#6B6B6B]">Dashboard</Button>
                </Link>
                <Button onClick={handleLogout} className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-6">Logout</Button>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <Link href="/signin">
                  <Button variant="ghost" className="text-[#6B6B6B]">Login</Button>
                </Link>
                <Link href="/signup">
                  <Button className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-6">Get started</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-b">
            <div className="flex flex-col gap-4 pt-4">
              <Link href="#features" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">Features</Link>
              <Link href="#how-it-works" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">How it works</Link>
              <Link href="#pricing" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">Pricing</Link>
              <Link href="#reviews" className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors text-sm font-medium">Reviews</Link>
              <div className="pt-4 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button variant="ghost" className="w-full text-[#6B6B6B]">Dashboard</Button>
                    </Link>
                    <Button onClick={handleLogout} className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full">Logout</Button>
                  </>
                ) : (
                  <>
                    <Link href="/signin">
                      <Button variant="ghost" className="w-full text-[#6B6B6B]">Login</Button>
                    </Link>
                    <Link href="/signup">
                      <Button className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full">Get started</Button>
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
                A better day
                <br />
                planner
              </h1>
              
              <p className="text-xl text-[#6B6B6B] mb-8 max-w-lg">
                Ellie is your AI-powered daily planner that helps you get organized and stay productive.
              </p>
              
              <div className="flex flex-wrap gap-4 mb-12">
                <Button 
                  size="lg" 
                  className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-8 py-6 text-base font-medium"
                >
                  Get started for free
                </Button>
                <Button 
                  size="lg" 
                  variant="outline"
                  className="border-[#E5E5E3] text-[#2D2D2D] hover:bg-[#F5F5F3] rounded-full px-8 py-6 text-base font-medium"
                >
                  Watch demo
                </Button>
              </div>

              <div className="flex items-center gap-6">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 border-2 border-white" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-sm text-[#6B6B6B]">Loved by 50,000+ users</p>
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
                  <h3 className="text-2xl font-bold text-[#2D2D2D] mb-2">Today&apos;s Plan</h3>
                  <p className="text-[#6B6B6B]">Tuesday, January 21</p>
                </div>

                <div className="space-y-4">
                  <motion.div 
                    className="bg-[#F5F5F3] rounded-2xl p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-purple-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D2D2D]">Morning routine</h4>
                        <p className="text-sm text-[#6B6B6B]">8:00 - 9:00 AM</p>
                      </div>
                      <Check className="w-5 h-5 text-green-500" />
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-[#F5F5F3] rounded-2xl p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-blue-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D2D2D]">Team standup</h4>
                        <p className="text-sm text-[#6B6B6B]">9:30 - 10:00 AM</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-[#F5F5F3] rounded-2xl p-4"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-green-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D2D2D]">Deep work session</h4>
                        <p className="text-sm text-[#6B6B6B]">10:00 AM - 12:00 PM</p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div 
                    className="bg-[#F5F5F3] rounded-2xl p-4 opacity-60"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-orange-400 mt-0.5" />
                      <div className="flex-1">
                        <h4 className="font-semibold text-[#2D2D2D]">Lunch break</h4>
                        <p className="text-sm text-[#6B6B6B]">12:00 - 1:00 PM</p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                <div className="mt-6 flex items-center justify-between p-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-2xl">
                  <div>
                    <p className="text-sm font-medium text-[#2D2D2D]">You&apos;re on track!</p>
                    <p className="text-xs text-[#6B6B6B]">3 of 7 tasks completed</p>
                  </div>
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-500" />
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
              Everything you need to plan your day
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Powerful features to help you organize, prioritize, and achieve your daily goals
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="bg-[#F5F5F3] rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                <Calendar className="w-7 h-7 text-purple-600" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Smart scheduling</h3>
              <p className="text-[#6B6B6B]">
                AI-powered scheduling that learns your habits and optimizes your daily routine for maximum productivity.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#F5F5F3] rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-blue-600" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Goal tracking</h3>
              <p className="text-[#6B6B6B]">
                Set daily, weekly, and monthly goals. Track your progress and celebrate your achievements.
              </p>
            </motion.div>

            <motion.div
              className="bg-[#F5F5F3] rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mb-6">
                <Clock className="w-7 h-7 text-green-600" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Time blocking</h3>
              <p className="text-[#6B6B6B]">
                Visualize your day with time blocks. Focus on what matters most without distractions.
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
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
              How Ellie works
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Get started in minutes and transform the way you plan your days
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
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-purple-600">
                1
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Sign up for free</h3>
              <p className="text-[#6B6B6B]">
                Create your account in seconds. No credit card required.
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
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Add your tasks</h3>
              <p className="text-[#6B6B6B]">
                Brain dump everything you need to do. Ellie will help you organize and prioritize.
              </p>
            </motion.div>

            <motion.div
              className="text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-3xl font-bold text-green-600">
                3
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Plan your perfect day</h3>
              <p className="text-[#6B6B6B]">
                Let AI optimize your schedule and start achieving more every day.
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
              Loved by productive people
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Join thousands who have transformed their daily productivity with Ellie
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Chen",
                role: "Product Manager",
                content: "Ellie has completely transformed how I plan my days. The AI suggestions are spot-on and help me stay focused on what matters most.",
                rating: 5
              },
              {
                name: "Michael Rodriguez",
                role: "Entrepreneur",
                content: "As someone juggling multiple projects, Ellie keeps me organized and on track. The time blocking feature is a game-changer.",
                rating: 5
              },
              {
                name: "Emma Thompson",
                role: "Software Engineer",
                content: "I love how intuitive Ellie is. It learns my patterns and helps me maintain a healthy work-life balance. Highly recommend!",
                rating: 5
              }
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
              Start free and upgrade when you need more features
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <motion.div
              className="bg-white rounded-3xl p-8 border border-[#E5E5E3]"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-2">Free</h3>
              <p className="text-[#6B6B6B] mb-6">Perfect for getting started</p>
              <div className="text-4xl font-bold text-[#2D2D2D] mb-6">$0<span className="text-lg font-normal text-[#6B6B6B]">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-[#6B6B6B]">Up to 10 tasks per day</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-[#6B6B6B]">Basic scheduling</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 mt-0.5" />
                  <span className="text-[#6B6B6B]">Mobile app access</span>
                </li>
              </ul>

              <Button className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full">
                Get started
              </Button>
            </motion.div>

            <motion.div
              className="bg-[#2D2D2D] text-white rounded-3xl p-8 relative"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-400 to-pink-400 text-white text-sm font-medium px-4 py-1 rounded-full">
                Most popular
              </div>
              <h3 className="text-2xl font-semibold mb-2">Pro</h3>
              <p className="text-gray-300 mb-6">For power users</p>
              <div className="text-4xl font-bold mb-6">$9<span className="text-lg font-normal text-gray-300">/month</span></div>
              
              <ul className="space-y-3 mb-8">
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Unlimited tasks</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">AI-powered scheduling</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Advanced analytics</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Calendar integrations</span>
                </li>
                <li className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-400 mt-0.5" />
                  <span className="text-gray-300">Priority support</span>
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
      <section className="py-24 px-6 lg:px-12 bg-gradient-to-br from-purple-100 to-pink-100">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-6">
            Ready to plan your best day?
          </h2>
          <p className="text-xl text-[#6B6B6B] mb-8">
            Join thousands of productive people using Ellie to achieve more every day.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] rounded-full px-8 py-6 text-base font-medium"
            >
              Get started for free
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          <p className="text-sm text-[#6B6B6B] mt-6">
            No credit card required • Free forever for basic use
          </p>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E5E3] py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-[#2D2D2D]">Ellie</span>
              </div>
              <p className="text-[#6B6B6B] mb-6">
                Your AI-powered daily planner for a more productive life.
              </p>
              <div className="flex gap-4">
                <Link href="/download" className="text-[#6B6B6B] hover:text-[#2D2D2D]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                  </svg>
                </Link>
                <Link href="/download" className="text-[#6B6B6B] hover:text-[#2D2D2D]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 20.5v-17c0-.83.67-1.5 1.5-1.5h14c.83 0 1.5.67 1.5 1.5v17c0 .83-.67 1.5-1.5 1.5h-14c-.83 0-1.5-.67-1.5-1.5zM18.5 3.5h-13c-.28 0-.5.22-.5.5v16c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5v-16c0-.28-.22-.5-.5-.5zM12 17.5c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/>
                  </svg>
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Product</h4>
              <ul className="space-y-2">
                <li><Link href="/features" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Features</Link></li>
                <li><Link href="/pricing" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Pricing</Link></li>
                <li><Link href="/updates" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Updates</Link></li>
                <li><Link href="/roadmap" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Roadmap</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Resources</h4>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Blog</Link></li>
                <li><Link href="/help" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Help Center</Link></li>
                <li><Link href="/api" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">API</Link></li>
                <li><Link href="/community" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Community</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Company</h4>
              <ul className="space-y-2">
                <li><Link href="/about" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">About</Link></li>
                <li><Link href="/careers" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Careers</Link></li>
                <li><Link href="/privacy" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Privacy</Link></li>
                <li><Link href="/terms" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">Terms</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#E5E5E3] pt-8 text-center">
            <p className="text-sm text-[#6B6B6B]">
              © 2024 Ellie. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}