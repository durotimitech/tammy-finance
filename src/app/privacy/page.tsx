import type { Metadata } from 'next';
import LandingFooter from '@/components/LandingFooter';
import LandingHeader from '@/components/LandingHeader';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Tammy protects your financial data. No ads, no data selling, bank-level security. Your privacy is our priority.',
  robots: {
    index: true,
    follow: true,
  },
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <LandingHeader />

      <div className="max-w-4xl mx-auto px-6 py-12 lg:px-12">
        <h1 className="text-4xl font-bold text-[#2D2D2D] mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none">
          <section className="mb-8">
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              Your privacy is important to us. It is tammy policy to respect your privacy regarding
              any information we may collect from you through our app and website.
            </p>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              We only ask for personal information when we truly need it to provide a service to
              you. We collect it by fair and lawful means, with your knowledge and consent. We also
              let you know why we&apos;re collecting it and how it will be used.
            </p>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              We only retain collected information for as long as necessary to provide you with your
              requested service. What data we store, we&apos;ll protect within commercially
              acceptable means to prevent loss and theft, as well as unauthorized access,
              disclosure, copying, use or modification.
            </p>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              We don&apos;t share any personally identifying information publicly or with
              third-parties, except when required to by law.
            </p>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              Our app may link to external sites that are not operated by us. Please be aware that
              we have no control over the content and practices of these sites, and cannot accept
              responsibility or liability for their respective privacy policies.
            </p>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              You are free to refuse our request for your personal information, with the
              understanding that we may be unable to provide you with some of your desired services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Our Commitments to You</h2>
            <ul className="space-y-3 text-[#2D2D2D]">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>No Ads:</strong> We will never run advertisements on our platform. Your
                  experience remains clean and focused on your financial goals.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>No Data Selling:</strong> We will never sell your personal data or
                  financial information to third parties. Your data is yours alone.
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong>Account Closure:</strong> You can close your account at any time by
                  contacting us at{' '}
                  <a
                    href="mailto:createdbytimmy@gmail.com"
                    className="text-[#2D2D2D] underline hover:text-[#1a1a1a]"
                  >
                    createdbytimmy@gmail.com
                  </a>
                  . We will promptly delete your data upon request.
                </span>
              </li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Data Security</h2>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              We use industry-standard encryption and security practices to protect your financial
              data. All sensitive information is encrypted both in transit and at rest. We regularly
              review and update our security measures to ensure your data remains safe.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Third-Party Integrations</h2>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              When you choose to connect third-party services (such as trading platforms), we only
              request the minimum permissions necessary to provide our service. Your credentials are
              encrypted and stored securely, and we never share this information with other parties.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Your Rights</h2>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-[#2D2D2D] mb-4">
              <li>Access your personal data</li>
              <li>Correct inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of data collection</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-[#2D2D2D] mb-4">Contact Us</h2>
            <p className="text-[#2D2D2D] leading-relaxed mb-4">
              Your continued use of our website will be regarded as acceptance of our practices
              around privacy and personal information. If you have any questions about how we handle
              user data and personal information, feel free to contact us at{' '}
              <a
                href="mailto:createdbytimmy@gmail.com"
                className="text-[#2D2D2D] underline hover:text-[#1a1a1a]"
              >
                createdbytimmy@gmail.com
              </a>
              .
            </p>
          </section>

          <section className="mb-8">
            <p className="text-sm text-[#6B6B6B]">Last updated: November 4th 2025</p>
          </section>
        </div>
      </div>

      <LandingFooter />
    </div>
  );
}
