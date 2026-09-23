import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy — GeoScope",
  description:
    "GeoScope Privacy Policy: what information we collect, how we use it, and your rights.",
};

const h2 =
  "mb-3 mt-10 text-[18px] font-medium text-[var(--color-text-primary)]";
const p = "mb-4 text-[14px] leading-relaxed text-[var(--color-text-secondary)]";

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 lg:py-24">
      <h1 className="text-[40px] font-semibold tracking-[-0.03em] text-[var(--color-text-primary)]">
        Privacy Policy
      </h1>
      <p className="mb-4 mt-3 text-[14px] leading-relaxed text-[var(--color-text-tertiary)]">
        Last updated: September 22, 2026
      </p>

      <h2 className={h2}>1. Introduction</h2>
      <p className={p}>
        GeoScope (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) provides an
        AI visibility tracking service. This Privacy Policy explains what
        information we collect, how we use it, and your rights. By using
        GeoScope, you agree to this policy.
      </p>

      <h2 className={h2}>2. Information We Collect</h2>
      <p className={p}>
        Account information: your email address and (optionally) your name.
      </p>
      <p className={p}>
        Brand data: brand names, domains, and competitor names you add.
      </p>
      <p className={p}>
        Scan data: queries sent to AI engines, AI responses, and analysis
        results.
      </p>
      <p className={p}>
        Usage data: pages visited, features used, and approximate timestamps.
      </p>
      <p className={p}>
        Payment data: handled entirely by our payment processor (Lemon Squeezy).
        We never see or store your full card details.
      </p>

      <h2 className={h2}>3. How We Use Your Information</h2>
      <p className={p}>To provide and operate the GeoScope service.</p>
      <p className={p}>To run AI visibility scans you request.</p>
      <p className={p}>
        To send transactional emails (e.g., password resets, payment
        confirmations).
      </p>
      <p className={p}>To improve our product and understand usage patterns.</p>
      <p className={p}>To comply with legal obligations.</p>

      <h2 className={h2}>4. Third-Party Services</h2>
      <p className={p}>
        We share limited data with these processors: PocketBase — our database
        and authentication provider. OpenRouter — routes your scan queries to
        AI models (ChatGPT, Gemini, etc.). Lemon Squeezy — our merchant of
        record for subscription billing and tax. These providers have their own
        privacy policies and only receive data necessary to perform their
        function.
      </p>

      <h2 className={h2}>5. Data Retention</h2>
      <p className={p}>
        We retain your data while your account is active. When you delete your
        account, we permanently delete your brands, scans, mentions, and
        personal information within 30 days, except where required by law
        (e.g., tax records).
      </p>

      <h2 className={h2}>6. Your Rights</h2>
      <p className={p}>
        Depending on your jurisdiction (including EU/UK under GDPR), you have
        the right to: access, correct, delete, export, or restrict processing
        of your data. Contact legal@geoscope.io to exercise these rights.
      </p>

      <h2 className={h2}>7. Cookies</h2>
      <p className={p}>
        We use essential cookies to keep you logged in. We do not use
        advertising or third-party tracking cookies.
      </p>

      <h2 className={h2}>8. Security</h2>
      <p className={p}>
        We use industry-standard measures including encrypted connections
        (HTTPS), hashed passwords, and access controls. No system is 100%
        secure — we cannot guarantee absolute protection.
      </p>

      <h2 className={h2}>9. Children&apos;s Privacy</h2>
      <p className={p}>
        GeoScope is not intended for users under 16. We do not knowingly
        collect data from children.
      </p>

      <h2 className={h2}>10. Changes to This Policy</h2>
      <p className={p}>
        We may update this policy. Material changes will be announced via email
        or in-app notice. Continued use after changes means acceptance.
      </p>

      <h2 className={h2}>11. Contact</h2>
      <p className={p}>Questions? Email legal@geoscope.io.</p>
    </div>
  );
}
