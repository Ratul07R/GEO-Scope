import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms of Service — GeoScope",
  description: "GeoScope Terms of Service: the rules and conditions for using our AI visibility tracking service.",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
      <h1 className="text-[40px] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        Terms of Service
      </h1>
      <p className="mb-4 mt-3 text-[14px] leading-relaxed text-[var(--color-text-tertiary)]">
        Last updated: September 22, 2026
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        1. Acceptance of Terms
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        By creating a GeoScope account or using our service, you agree to these
        Terms. If you do not agree, do not use GeoScope.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        2. Your Account
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        You are responsible for keeping your password secure and for all
        activity under your account. You must be at least 16 years old. One
        person or legal entity per account.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        3. Subscription and Payment
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        Paid plans are billed monthly or annually via Lemon Squeezy. Prices are
        listed on our pricing page and may change with notice. Subscriptions
        renew automatically until cancelled. You may cancel anytime from your
        billing settings; access continues until the end of the current billing
        period. Refunds: We offer a 7-day money-back guarantee on your first
        purchase. Contact legal@geoscope.io within 7 days of payment.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        4. Acceptable Use
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        You agree NOT to: use GeoScope to break any law or infringe
        intellectual property; attempt to reverse-engineer, scrape, or abuse
        our API; resell or redistribute access without written permission; use
        automated tools to overload our infrastructure. Violation may result in
        immediate account termination without refund.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        5. AI-Generated Content
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        GeoScope queries third-party AI models. Their responses may be
        inaccurate or incomplete. We present results &quot;as is&quot; and make
        no guarantee about their accuracy. Do not rely on GeoScope as the sole
        basis for business decisions.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        6. Intellectual Property
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        The GeoScope name, logo, and code are owned by us. You retain ownership
        of your brand data. You grant us a limited license to process your data
        to provide the service.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        7. Service Availability
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        We aim for high uptime but do not guarantee uninterrupted service.
        Maintenance, outages, or third-party failures may occur. We are not
        liable for damages caused by downtime.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        8. Limitation of Liability
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        To the maximum extent allowed by law, GeoScope is not liable for
        indirect, incidental, or consequential damages. Our total liability is
        limited to the amount you paid us in the previous 12 months.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        9. Termination
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        You may delete your account anytime. We may suspend or terminate
        accounts that violate these Terms, with or without notice.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        10. Changes to Terms
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        We may update these Terms. We will notify you of material changes.
        Continued use means acceptance.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        11. Governing Law
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        These Terms are governed by the laws of Bangladesh, without regard to
        conflict-of-law principles.
      </p>

      <h2 className="mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]">
        12. Contact
      </h2>
      <p className="mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]">
        Questions? Email legal@geoscope.io.
      </p>
    </div>
  );
}
