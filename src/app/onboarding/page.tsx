"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Calendar,
  Wallet,
  TrendingUp,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { calculateAge } from "@/lib/fire-calculations";
import { createClient } from "@/lib/supabase/client";

interface OnboardingData {
  // Step 1: Date of Birth & Retirement
  date_of_birth: string; // ISO date string (YYYY-MM-DD)
  target_retirement_age: number;

  // Step 2: Current Assets
  current_invested_assets: number;

  // Step 3: Monthly Expenses
  monthly_expenses: number;

  // Assumptions (with defaults)
  investment_return: number;
  inflation: number;
  safe_withdrawal_rate: number;
}

export default function OnboardingPage() {
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState<OnboardingData>({
    date_of_birth: "",
    target_retirement_age: 0,
    current_invested_assets: 0,
    monthly_expenses: 0,
    investment_return: 7.0,
    inflation: 3.0,
    safe_withdrawal_rate: 4.0,
  });

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 1) {
      if (!formData.date_of_birth) {
        newErrors.date_of_birth = "Please enter your date of birth";
      } else {
        const age = calculateAge(formData.date_of_birth);
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();

        if (birthDate > today) {
          newErrors.date_of_birth = "Date of birth cannot be in the future";
        } else if (age < 18) {
          newErrors.date_of_birth = "You must be at least 18 years old";
        } else if (age > 120) {
          newErrors.date_of_birth = "Please enter a valid date of birth";
        }

        if (!newErrors.date_of_birth && formData.target_retirement_age > 0) {
          if (
            formData.target_retirement_age < age ||
            formData.target_retirement_age > 120
          ) {
            newErrors.target_retirement_age = `Retirement age must be between ${age} and 120`;
          }
        }
      }
      if (
        !formData.target_retirement_age ||
        formData.target_retirement_age < 18 ||
        formData.target_retirement_age > 120
      ) {
        if (!newErrors.target_retirement_age) {
          const age = formData.date_of_birth
            ? calculateAge(formData.date_of_birth)
            : 18;
          if (formData.target_retirement_age < age) {
            newErrors.target_retirement_age = `Retirement age must be at least ${age}`;
          } else if (!formData.target_retirement_age) {
            newErrors.target_retirement_age =
              "Please enter your target retirement age";
          }
        }
      }
    } else if (step === 2) {
      if (formData.current_invested_assets < 0) {
        newErrors.current_invested_assets =
          "Please enter a valid amount (0 or more)";
      }
    } else if (step === 3) {
      if (formData.monthly_expenses <= 0) {
        newErrors.monthly_expenses = "Please enter your monthly expenses";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < 3) {
        setCurrentStep(currentStep + 1);
      } else {
        handleSubmit();
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      // Get current user
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user) {
        throw new Error("Not authenticated");
      }

      // Create or update profile
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: user.id,
        date_of_birth: formData.date_of_birth,
        target_retirement_age: formData.target_retirement_age,
        monthly_expenses: formData.monthly_expenses,
        monthly_savings: 0, // User will set this later
        currency: "EUR", // Default currency
        investment_return: formData.investment_return,
        inflation: formData.inflation,
        safe_withdrawal_rate: formData.safe_withdrawal_rate,
        onboarding_completed: true,
      });

      if (profileError) throw profileError;

      // If user has invested assets, create an asset entry
      if (formData.current_invested_assets > 0) {
        const { error: assetError } = await supabase.from("assets").insert({
          user_id: user.id,
          name: "Investment Portfolio",
          category: "Investments",
          value: formData.current_invested_assets,
        });

        if (assetError) {
          console.error("Error creating asset:", assetError);
          // Don't throw, just log - onboarding can still complete
        }
      }

      // Redirect to dashboard
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      setErrors({
        submit: "Failed to save your information. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const stepContent = [
    // Step 1: Date of Birth & Target Retirement Age
    <div key="step1" className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          When do you want to retire?
        </h2>
        <p className="text-gray-600">
          Let&apos;s start with your date of birth and retirement goals
        </p>
      </div>

      <div className="space-y-4">
        <div>
          <label
            htmlFor="date_of_birth"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Date of Birth
          </label>
          <Input
            id="date_of_birth"
            type="date"
            max={
              new Date(new Date().setFullYear(new Date().getFullYear() - 18))
                .toISOString()
                .split("T")[0]
            }
            value={formData.date_of_birth}
            onChange={(e) => {
              setFormData({ ...formData, date_of_birth: e.target.value });
              if (errors.date_of_birth) {
                const newErrors = { ...errors };
                delete newErrors.date_of_birth;
                setErrors(newErrors);
              }
              // Auto-update retirement age min if age changes
              if (formData.target_retirement_age > 0 && e.target.value) {
                const age = calculateAge(e.target.value);
                if (formData.target_retirement_age < age) {
                  setFormData({
                    ...formData,
                    date_of_birth: e.target.value,
                    target_retirement_age: age,
                  });
                }
              }
            }}
            className={errors.date_of_birth ? "border-red-500" : ""}
          />
          {errors.date_of_birth && (
            <p className="mt-1 text-sm text-red-600">{errors.date_of_birth}</p>
          )}
          {formData.date_of_birth && (
            <p className="mt-2 text-sm text-gray-500">
              You are {calculateAge(formData.date_of_birth)} years old
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="target_retirement_age"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Target Retirement Age
          </label>
          <Input
            id="target_retirement_age"
            type="number"
            min={
              formData.date_of_birth ? calculateAge(formData.date_of_birth) : 18
            }
            max="120"
            value={formData.target_retirement_age || ""}
            onChange={(e) => {
              const age = parseInt(e.target.value) || 0;
              setFormData({ ...formData, target_retirement_age: age });
              if (errors.target_retirement_age) {
                const newErrors = { ...errors };
                delete newErrors.target_retirement_age;
                setErrors(newErrors);
              }
            }}
            placeholder="When do you want to retire?"
            className={errors.target_retirement_age ? "border-red-500" : ""}
          />
          {errors.target_retirement_age && (
            <p className="mt-1 text-sm text-red-600">
              {errors.target_retirement_age}
            </p>
          )}
          {formData.date_of_birth && formData.target_retirement_age > 0 && (
            <p className="mt-2 text-sm text-gray-500">
              You have{" "}
              {formData.target_retirement_age -
                calculateAge(formData.date_of_birth)}{" "}
              years to reach FIRE
            </p>
          )}
        </div>
      </div>
    </div>,

    // Step 2: Current Invested Assets
    <div key="step2" className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Wallet className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          What have you saved so far?
        </h2>
        <p className="text-gray-600">
          Enter your total invested assets (retirement accounts, investments,
          etc.)
        </p>
      </div>

      <div>
        <label
          htmlFor="current_invested_assets"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Current Invested Assets
        </label>
        <Input
          id="current_invested_assets"
          type="number"
          min="0"
          step="0.01"
          value={formData.current_invested_assets || ""}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            setFormData({ ...formData, current_invested_assets: value });
            if (errors.current_invested_assets) {
              const newErrors = { ...errors };
              delete newErrors.current_invested_assets;
              setErrors(newErrors);
            }
          }}
          placeholder="0.00"
          className={errors.current_invested_assets ? "border-red-500" : ""}
        />
        {errors.current_invested_assets && (
          <p className="mt-1 text-sm text-red-600">
            {errors.current_invested_assets}
          </p>
        )}
        <p className="mt-2 text-sm text-gray-500">
          Don&apos;t worry if it&apos;s 0—you can always add more assets later!
        </p>
      </div>
    </div>,

    // Step 3: Monthly Expenses
    <div key="step3" className="space-y-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <TrendingUp className="w-8 h-8 text-secondary" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          How much do you spend monthly?
        </h2>
        <p className="text-gray-600">
          This helps us calculate your FIRE number
        </p>
      </div>

      <div>
        <label
          htmlFor="monthly_expenses"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Monthly Expenses
        </label>
        <Input
          id="monthly_expenses"
          type="number"
          min="0"
          step="0.01"
          value={formData.monthly_expenses || ""}
          onChange={(e) => {
            const value = parseFloat(e.target.value) || 0;
            setFormData({ ...formData, monthly_expenses: value });
            if (errors.monthly_expenses) {
              const newErrors = { ...errors };
              delete newErrors.monthly_expenses;
              setErrors(newErrors);
            }
          }}
          placeholder="0.00"
          className={errors.monthly_expenses ? "border-red-500" : ""}
        />
        {errors.monthly_expenses && (
          <p className="mt-1 text-sm text-red-600">{errors.monthly_expenses}</p>
        )}
        {formData.monthly_expenses > 0 && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <p className="text-sm font-medium text-blue-900 mb-1">
              Your FIRE Number (Preview)
            </p>
            <p className="text-2xl font-bold text-blue-600">
              $
              {(
                (formData.monthly_expenses * 12) /
                (formData.safe_withdrawal_rate / 100)
              ).toLocaleString("en-US", {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              })}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Based on {formData.safe_withdrawal_rate}% withdrawal rate
            </p>
          </div>
        )}
      </div>

      {errors.submit && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{errors.submit}</p>
        </div>
      )}
    </div>,
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8 sm:p-12"
      >
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">
              Step {currentStep} of 3
            </span>
            <span className="text-sm font-medium text-gray-600">
              {Math.round((currentStep / 3) * 100)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / 3) * 100}%` }}
              transition={{ duration: 0.3 }}
              className="bg-secondary h-2 rounded-full"
            />
          </div>
        </div>

        {/* Step Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {stepContent[currentStep - 1]}
          </motion.div>
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex items-center justify-between">
          <Button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1}
            className="flex items-center gap-2 border-2 !border-secondary hover:!border-secondary focus:!border-secondary"
            variant="secondary"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>

          <Button
            type="button"
            onClick={handleNext}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-secondary text-white hover:bg-[#8B5CF6] border-2 !border-secondary hover:!border-secondary focus:!border-secondary"
          >
            {currentStep === 3 ? (
              <>{isSubmitting ? "Saving..." : "Complete Setup"}</>
            ) : (
              <>
                Next
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
