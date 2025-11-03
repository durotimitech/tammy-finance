"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Button } from "@/components/ui/Button";

function ErrorContent() {
  const searchParams = useSearchParams();
  const message =
    searchParams.get("message") ||
    "An error occurred during email confirmation";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Oops! Something went wrong
          </h1>
          <p className="text-gray-600">{message}</p>
        </div>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            If you&apos;re having trouble confirming your email, please try:
          </p>
          <ul className="text-sm text-gray-500 text-left list-disc list-inside space-y-2">
            <li>Checking your spam folder for the confirmation email</li>
            <li>Requesting a new confirmation email from the login page</li>
            <li>Contacting support if the issue persists</li>
          </ul>
        </div>

        <div className="mt-8 space-y-4">
          <Link href="/auth/login" className="block">
            <Button variant="default" size="lg" className="w-full">
              Go to Login
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button
              variant="default"
              size="lg"
              className="w-full bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ErrorPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <ErrorContent />
    </Suspense>
  );
}
