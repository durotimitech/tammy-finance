import Link from "next/link";

export default function LandingFooter() {
  return (
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
              Your personal net worth and budget tracker for achieving financial
              independence.
            </p>
            <div className="flex flex-wrap gap-3 mb-6">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-sm font-medium text-[#2D2D2D] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium text-white bg-[#2D2D2D] rounded-lg hover:bg-[#1a1a1a] transition-colors"
              >
                Register
              </Link>
              <a
                href="mailto:createdbytimmy@gmail.com"
                className="px-4 py-2 text-sm font-medium text-[#2D2D2D] border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Contact
              </a>
            </div>
            <div>
              <h4 className="font-semibold text-[#2D2D2D] mb-3 text-sm">
                Follow Us
              </h4>
              <div className="flex gap-4">
                <a
                  href="https://tiktok.com/@createdbytimmy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#6B6B6B] hover:text-[#2D2D2D] transition-colors"
                  aria-label="TikTok"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-[#6B6B6B] flex flex-wrap gap-2 justify-center md:justify-start">
            <Link
              href="/privacy"
              className="hover:text-[#2D2D2D] transition-colors"
            >
              Privacy Policy
            </Link>
          </div>
          <div className="text-sm text-[#6B6B6B]">
            © 2025 tammy - All Rights Reserved
          </div>
        </div>
      </div>
    </footer>
  );
}
