import Link from "next/link";

export const metadata = {
  title: "Terms of Service — Task Tracker",
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 sm:px-6 sm:py-8 dark:bg-gray-900">
      <div className="mx-auto max-w-2xl space-y-6">
        <header>
          <h1 className="text-lg font-semibold text-gray-900 sm:text-2xl dark:text-gray-50">
            Terms of Service
          </h1>
          <p className="mt-0.5 text-xs text-gray-500 sm:text-sm dark:text-gray-400">Last updated: August 19, 2026</p>
        </header>

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 sm:p-6 space-y-6 dark:bg-gray-800 dark:border-gray-700">
          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">1. Acceptance of terms</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              By creating an account or using Task Tracker, you agree to these Terms of Service. If
              you don&rsquo;t agree, don&rsquo;t use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">2. The service</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Task Tracker is a task management application offered as a subscription service
              (&ldquo;SaaS&rdquo;). We may change, add to, or remove features at any time.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">3. Accounts</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You need an account to use Task Tracker. You&rsquo;re responsible for keeping your
              password secure and for all activity under your account. Tell us if you suspect
              unauthorized access.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              4. Subscriptions and billing
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Task Tracker offers a Free plan (limited to 10 tasks) and a Pro plan billed at $5 per
              month. Paid subscriptions renew automatically each month until canceled and are
              processed by Stripe, our payment provider. You can cancel anytime from your account
              settings; cancellation takes effect at the end of your current billing period, and we
              don&rsquo;t provide refunds for partial periods. We may change our pricing with notice
              posted on this site or sent to your account email.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">5. Acceptable use</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Don&rsquo;t use Task Tracker for anything illegal, don&rsquo;t try to disrupt or gain
              unauthorized access to the service or other users&rsquo; accounts, and don&rsquo;t use
              it to store or share content you don&rsquo;t have the right to.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">6. Your data</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You own the task content you create. We store it to provide the service to you and
              handle it as described in our{" "}
              <Link href="/privacy" className="text-blue-600 font-medium hover:underline dark:text-blue-400">
                Privacy Policy
              </Link>
              . You can export or delete your data at any time by deleting your account.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">7. Termination</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              You can delete your account at any time from your Account page — this immediately and
              permanently deletes your account and every task you&rsquo;ve created. We may suspend or
              terminate your account if you violate these terms, and we&rsquo;ll try to give you
              notice by email where reasonably possible. Sections of these terms that by their nature
              should survive termination (including limitation of liability) will continue to apply.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">8. Intellectual property</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Task Tracker and its software, design, and branding belong to us. These terms don&rsquo;t
              grant you any rights to them beyond what&rsquo;s needed to use the service.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              9. Disclaimer of warranties
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Task Tracker is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo; without
              warranties of any kind, express or implied, including merchantability, fitness for a
              particular purpose, and non-infringement. We don&rsquo;t guarantee the service will be
              uninterrupted, error-free, or secure.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">
              10. Limitation of liability
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              To the fullest extent permitted by law, Task Tracker won&rsquo;t be liable for any
              indirect, incidental, special, consequential, or punitive damages, or for any loss of
              data, profits, or revenue, arising from your use of the service. Our total liability for
              any claim relating to the service is limited to the amount you paid us in the 12 months
              before the claim arose.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">11. Changes to these terms</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              We may update these terms from time to time. If we make material changes, we&rsquo;ll
              update the date at the top of this page. Continuing to use Task Tracker after a change
              means you accept the updated terms.
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-50">12. Contact</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Questions about these terms? Contact the person who administers this app.
            </p>
          </section>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-1 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
          Back to homepage
        </Link>
      </div>
    </div>
  );
}
