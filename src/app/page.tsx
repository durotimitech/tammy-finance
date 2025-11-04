"use client";

import { motion } from "framer-motion";
import {
  ArrowRight,
  BarChart3,
  FileText,
  Target,
  Shield,
  Zap,
  TrendingUp,
  Check,
  Clock,
  Calculator,
  X as XIcon,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LandingFooter from "@/components/LandingFooter";
import LandingHeader from "@/components/LandingHeader";
import { Button } from "@/components/ui/Button";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

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
              <h1 className="text-3xl lg:text-5xl font-bold text-[#2D2D2D] mb-6 leading-tight">
                Take Control of Your Financial Future
              </h1>

              <p className="text-xl text-[#6B6B6B] mb-8 max-w-lg">
                Stop juggling spreadsheets and disconnected apps. See exactly{" "}
                <span className="font-semibold text-[#2D2D2D]">
                  when you can retire
                </span>{" "}
                and understand how every financial decision impacts your time to
                freedom.
              </p>

              <div className="flex flex-wrap gap-4 mb-12">
                <Link href="/auth/signup">
                  <Button size="sm" variant="secondary">
                    Get started for free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>

            {/* Phone Mockups */}
            <div className="relative flex justify-center lg:justify-start">
              <motion.div
                className="relative w-full max-w-[280px] sm:max-w-[320px] md:max-w-[380px] lg:max-w-[500px]"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Image
                  src="/hero.png"
                  alt="Dashboard"
                  width={500}
                  height={500}
                  className="w-full h-auto"
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
            {/* FIRE Calculator */}
            <motion.div
              className="bg-[#FFF] rounded-3xl p-8 pb-0 flex flex-col overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-6">
                <Target className="w-7 h-7 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                FIRE Calculator
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Calculate your path to Financial Independence, Retire Early
                (FIRE) with personalized projections and milestone tracking.
              </p>
              <div className="flex-1 -mx-8 -mb-8 overflow-hidden rounded-b-3xl relative min-h-[250px] sm:min-h-[280px] md:min-h-[300px]">
                <Image
                  src="/features/fire.png"
                  alt="FIRE Calculator"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Net Worth Tracking */}
            <motion.div
              className="bg-[#FFF] rounded-3xl p-8 pb-0 flex flex-col overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-6">
                <BarChart3 className="w-7 h-7 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                Net Worth Tracking
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Monitor your complete financial picture by tracking assets,
                liabilities, and calculating your net worth in real-time.
              </p>
              <div className="flex-1 -mx-8 -mb-8 overflow-hidden rounded-b-3xl relative min-h-[250px] sm:min-h-[280px] md:min-h-[300px]">
                <Image
                  src="/features/networth.png"
                  alt="Net Worth Tracking"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>

            {/* Expense Tracking */}
            <motion.div
              className="bg-[#FFF] rounded-3xl p-8 pb-0 flex flex-col overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="mb-6">
                <FileText className="w-7 h-7 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                Expense Tracking
              </h3>
              <p className="text-[#6B6B6B] mb-6">
                Easily track your daily, weekly, and monthly expenses to stay in
                control of where your money goes.
              </p>
              <div className="flex-1 -mx-8 -mb-8 overflow-hidden rounded-b-3xl relative min-h-[250px] sm:min-h-[280px] md:min-h-[300px]">
                <Image
                  src="/features/budget_tracker.png"
                  alt="Expense Tracking"
                  fill
                  className="object-contain"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
              Your Path to Financial Freedom
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Three simple steps that connect your daily finances to your
              ultimate goal: freedom
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <motion.div
              className="relative bg-gray-50 rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-xl font-bold">
                1
              </div>
              <div className="mb-6 mt-4">
                <Calculator className="w-10 h-10 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                Track Everything
              </h3>
              <p className="text-[#6B6B6B]">
                Add your assets, liabilities, income, and expenses. Track your
                complete financial picture in one place, no spreadsheet
                required.
              </p>
            </motion.div>

            <motion.div
              className="relative bg-gray-50 rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-xl font-bold">
                2
              </div>
              <div className="mb-6 mt-4">
                <TrendingUp className="w-10 h-10 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                See Your Progress
              </h3>
              <p className="text-[#6B6B6B]">
                Watch your net worth grow over time. Calculate your FIRE number
                and see exactly how close you are to financial independence.
              </p>
            </motion.div>

            <motion.div
              className="relative bg-gray-50 rounded-3xl p-8"
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div className="absolute -top-4 -left-4 w-12 h-12 bg-[#2D2D2D] text-white rounded-full flex items-center justify-center text-xl font-bold">
                3
              </div>
              <div className="mb-6 mt-4">
                <Clock className="w-10 h-10 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">
                Reach Freedom
              </h3>
              <p className="text-[#6B6B6B]">
                Make informed decisions knowing exactly how they impact your
                retirement date. Every saved dollar brings you closer to your
                goal.
              </p>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* Why Tammy is Different Section */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-4">
              Why Tammy is Different
            </h2>
            <p className="text-xl text-[#6B6B6B] max-w-3xl mx-auto">
              Built specifically for FIRE seekers, not general budgeters
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <div className="bg-white rounded-3xl p-8">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <XIcon className="w-8 h-8 text-[#2D2D2D]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">
                    Other Apps
                  </h3>
                  <ul className="space-y-2 text-[#6B6B6B]">
                    <li>
                      • Fragmented tools that don&apos;t talk to each other
                    </li>
                    <li>• Complex spreadsheets that break easily</li>
                    <li>• Generic budgeting with no FIRE focus</li>
                    <li>• Sell your data or push wealth management</li>
                    <li>• Can&apos;t answer: &quot;When can I retire?&quot;</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-3xl p-8 border-2 border-[#2f2f2f]">
              <div className="flex items-start gap-4 mb-6">
                <div className="flex-shrink-0">
                  <Check className="w-8 h-8 text-[#2D2D2D]" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-[#2D2D2D] mb-2">
                    Tammy Finance
                  </h3>
                  <ul className="space-y-2 text-[#6B6B6B]">
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2D2D2D] flex-shrink-0" />
                      <span>All-in-one FIRE-focused platform</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2D2D2D] flex-shrink-0" />
                      <span>
                        Every data point connected to your freedom date
                      </span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2D2D2D] flex-shrink-0" />
                      <span>Privacy-first, no ads, no data selling</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#2D2D2D] flex-shrink-0" />
                      <span>Clear answer: See exactly when you can retire</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Privacy & Security Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-[#2D2D2D] text-white rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <div className="mb-6">
                  <Shield className="w-16 h-16 text-white" />
                </div>
                <h2 className="text-4xl lg:text-5xl font-bold mb-6">
                  Your Financial Data is Sacred
                </h2>
                <p className="text-xl text-gray-300 mb-8">
                  Unlike &quot;free&quot; apps that sell your data or push
                  aggressive upsells, Tammy Finance operates on a simple
                  principle: you pay us, we serve you.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        No Ads, Ever
                      </h3>
                      <p className="text-gray-300">
                        Your attention belongs to your goals, not advertisers.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Your Data Stays Private
                      </h3>
                      <p className="text-gray-300">
                        We never sell or share your financial information with
                        third parties.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                      <Check className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">
                        Bank-Level Security
                      </h3>
                      <p className="text-gray-300">
                        Encrypted at rest and in transit with industry-leading
                        standards.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                  <Zap className="relative w-48 h-48 text-white" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Final CTA Section */}
      <section className="py-24 px-6 lg:px-12 bg-gray-50">
        <motion.div
          className="max-w-4xl mx-auto text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl lg:text-5xl font-bold text-[#2D2D2D] mb-6">
            Ready to Calculate Your Path to Freedom?
          </h2>
          <p className="text-xl text-[#6B6B6B] mb-8 max-w-2xl mx-auto">
            Join others who have ditched their messy spreadsheets and taken
            control of their FIRE journey. Start tracking for free, no credit
            card required.
          </p>
          <Link href="/auth/signup">
            <Button size="sm" variant="secondary">
              Start Your FIRE Journey
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <p className="text-sm text-[#6B6B6B] mt-4">
            Free forever. Upgrade when you&apos;re ready for automation.
          </p>
        </motion.div>
      </section>

      {/* Creator Section */}
      <section className="py-24 px-6 lg:px-12 bg-white">
        <motion.div
          className="max-w-7xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
        >
          <div className="bg-gray-50 rounded-3xl p-8 md:p-12 lg:p-16">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="relative">
                <div className="absolute -top-8 -left-8 text-6xl">👋</div>
                <Image
                  src="/creator.jpg"
                  alt="Timmy Mejabi"
                  width={400}
                  height={400}
                  className="rounded-full w-48 h-48 md:w-64 md:h-64 object-cover mx-auto lg:mx-0"
                />
                <div className="mt-8 text-center lg:text-left">
                  <p className="text-sm text-[#6B6B6B] mb-4">
                    If you want to follow along with my journey, here is my
                    TikTok.
                  </p>
                  <div className="flex gap-4 justify-center lg:justify-start">
                    {/* <a
                      href="https://youtube.com/@createdbytimmy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors text-sm"
                    >
                      YouTube
                    </a> */}
                    <a
                      href="https://tiktok.com/@createdbytimmy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-full hover:bg-gray-800 transition-colors text-sm"
                    >
                      TikTok
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <p className="text-lg text-[#6B6B6B] mb-6 leading-relaxed">
                  Hello, my name is Timmy and I built Tammy because I needed a
                  way to track my journey to Financial Independence.
                </p>
                <p className="text-lg text-[#6B6B6B] mb-6 leading-relaxed">
                  As it turns out, there are other things that need to be
                  tracked in order to have a complete view of your FIRE target.
                  Things like budgets, networth and so on.
                </p>
                <p className="text-lg text-[#6B6B6B] mb-6 leading-relaxed">
                  My goal with this app is that it assists your financial
                  journey like it has done to mine. I spend a lot of time
                  actually using the app personally because progress can be
                  addicting and I hope you enjoy using it as much as me.
                </p>
                <p className="text-lg font-semibold text-[#2D2D2D]">
                  - Timmy Mejabi
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
