"use client";

import type { Session } from "@supabase/supabase-js";
import { motion } from "framer-motion";
import { ArrowRight, BarChart3, FileText, Menu, Target, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { createClient } from "@/lib/supabase/client";

export default function Home() {
  const supabase = createClient();
  const [session, setSession] = useState<Session | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      },
    );
    return () => {
      listener.subscription.unsubscribe();
    };
  }, [supabase.auth]);

  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="w-full px-6 lg:px-12 py-5 bg-white border-b border-gray-100">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#2D2D2D] font-pirata">
              tammy
            </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {session ? (
              <div className="flex items-center gap-4">
                <Link href="/dashboard">
                  <Button className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full px-6">
                    Dashboard
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/auth/login">
                <Button className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full px-6">
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-4 pb-4 border-b">
            <div className="flex flex-col gap-4 pt-4">
              <div className="pt-4 flex flex-col gap-2">
                {session ? (
                  <>
                    <Link href="/dashboard">
                      <Button className="bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full px-6">
                        Dashboard
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/auth/login">
                    <Button className="w-full bg-[#2D2D2D] text-white hover:bg-[#1D1D1D] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full">
                      Login
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 overflow-hidden bg-white">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-[#2D2D2D] mb-6 leading-tight">
                Take Control of Your Financial Future
              </h1>

              <p className="text-xl text-[#6B6B6B] mb-8 max-w-lg">
                Track your net worth, manage assets and liabilities, track your
                budgets and reach your financial independence goals. All in one
                easy-to-use app.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/auth/signup">
                  <Button
                    size="sm"
                    className="bg-secondary text-white hover:bg-[#8B5CF6] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full px-6 py-4 text-base font-medium"
                  >
                    Get started for free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Phone Mockups */}
            <div className="relative">
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Image
                  src="/hero.png"
                  alt="Dashboard"
                  width={500}
                  height={500}
                  className="w-full h-auto rounded-lg shadow-2xl"
                  priority
                />
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 lg:px-12 bg-gray-50">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
              Powerful Features to Take Control
              <br /> of Your Finances
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Manage your finances with Tammy Finance. Monitor expenses, track
              net worth, and reach financial independence. All within a
              user-friendly app.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Expense Tracking */}
            <motion.div
              className="bg-[#FFF] rounded-3xl p-8 pb-0 flex flex-col overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <FileText className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                Expense Tracking
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Easily track your daily, weekly, and monthly expenses to stay in
                control of where your money goes.
              </p>
              <div className="flex-1 -mx-8 -mb-8 overflow-hidden rounded-b-3xl relative min-h-[300px]">
                <Image
                  src="/features/budget_tracker.png"
                  alt="Expense Tracking"
                  fill
                  className="object-cover object-top scale-110"
                />
              </div>
            </motion.div>

            {/* Net Worth Tracking */}
            <motion.div
              className="bg-[#FFF] rounded-3xl p-8 pb-0 flex flex-col overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                Net Worth Tracking
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Monitor your complete financial picture by tracking assets,
                liabilities, and calculating your net worth in real-time.
              </p>
              <div className="flex-1 -mx-8 -mb-8 absolute inset-0 rounded-b-3xl relative min-h-[200px]">
                <Image
                  src="/features/networth.png"
                  alt="Net Worth Tracking"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* FIRE Calculator */}
            <motion.div
              className="bg-[#FFF] rounded-3xl p-8 pb-0 flex flex-col overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center mb-6">
                <Target className="w-7 h-7 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                FIRE Calculator
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Calculate your path to Financial Independence, Retire Early
                (FIRE) with personalized projections and milestone tracking.
              </p>
              <div className="flex-1 -mx-8 -mb-8 overflow-hidden rounded-b-3xl relative min-h-[300px]">
                <Image
                  src="/features/fire.png"
                  alt="FIRE Calculator"
                  fill
                  className="object-cover object-top scale-110"
                />
              </div>
            </motion.div>
          </div>

          <div className="text-center">
            <Link href="#features">
              <Button className="bg-secondary text-white hover:bg-[#8B5CF6] border-2 !border-secondary hover:!border-secondary focus:!border-secondary rounded-full px-6 py-4">
                Explore All Features
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-2xl font-bold text-[#2D2D2D] font-pirata">
                  tammy
                </span>
              </div>
              <p className="text-[#6B6B6B] mb-6">
                Your personal net worth and budget tracker for achieving
                financial independence.
              </p>
            </div>

            {/* <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Features</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="#features" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link href="/dashboard" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Financial Reports
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Pricing
                  </Link>
                </li>
              </ul>
            </div> */}

            {/* <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Resources</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/docs" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href="/blog" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href="/guides" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Guides & Tutorials
                  </Link>
                </li>
                <li>
                  <Link href="/updates" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Product Updates
                  </Link>
                </li>
              </ul>
            </div> */}

            {/* <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-4">Company</h4>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/careers" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Careers
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/team" className="text-[#6B6B6B] hover:text-[#2D2D2D] text-sm">
                    Our Team
                  </Link>
                </li>
              </ul>
            </div> */}
          </div>

          <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-[#6B6B6B]">
              Terms of Service | Cookies Settings | Privacy Policy
            </div>
            <div className="text-sm text-[#6B6B6B]">
              © 2025 tammy - All Rights Reserved
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
