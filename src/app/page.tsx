'use client';

import { motion } from 'framer-motion';
import { ArrowRight, BarChart3, FileText, Target } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import LandingFooter from '@/components/LandingFooter';
import LandingHeader from '@/components/LandingHeader';
import { Button } from '@/components/ui/Button';

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
                Know and track your FIRE journey with access to your net worth, assets and
                liabilities, track your budgets and reach your financial independence goals. All in
                one easy-to-use app.
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
              Manage your finances with Tammy Finance. Monitor expenses, track net worth, and reach
              financial independence. All within a user-friendly app.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* FIRE Calculator */}
            <motion.div
              className="bg-[#FFF] rounded-3xl p-8 pb-0 flex flex-col overflow-hidden"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="mb-6">
                <Target className="w-7 h-7 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">FIRE Calculator</h3>
              <p className="text-[#6B6B6B] mb-6">
                Calculate your path to Financial Independence, Retire Early (FIRE) with personalized
                projections and milestone tracking.
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
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="mb-6">
                <BarChart3 className="w-7 h-7 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Net Worth Tracking</h3>
              <p className="text-[#6B6B6B] mb-6">
                Monitor your complete financial picture by tracking assets, liabilities, and
                calculating your net worth in real-time.
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
              transition={{ type: 'spring', stiffness: 300 }}
            >
              <div className="mb-6">
                <FileText className="w-7 h-7 text-[#2D2D2D]" />
              </div>
              <h3 className="text-2xl font-semibold text-[#2D2D2D] mb-3">Expense Tracking</h3>
              <p className="text-[#6B6B6B] mb-6">
                Easily track your daily, weekly, and monthly expenses to stay in control of where
                your money goes.
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
                    If you want to follow along with my journey, here is my TikTok.
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
                  Hello, my name is Timmy and I built Tammy because I needed a way to track my
                  journey to Financial Independence.
                </p>
                <p className="text-lg text-[#6B6B6B] mb-6 leading-relaxed">
                  As it turns out, there are other things that need to be tracked in order to have a
                  complete view of your FIRE target. Things like budgets, networth and so on.
                </p>
                <p className="text-lg text-[#6B6B6B] mb-6 leading-relaxed">
                  My goal with this app is that it assists your financial journey like it has done
                  to mine. I spend a lot of time actually using the app personally because progress
                  can be addicting and I hope you enjoy using it as much as me.
                </p>
                <p className="text-lg font-semibold text-[#2D2D2D]">- Timmy Mejabi</p>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      <LandingFooter />
    </div>
  );
}
