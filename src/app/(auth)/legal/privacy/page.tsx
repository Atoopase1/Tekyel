'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CircleLogo from '@/components/ui/CircleLogo';

export default function PrivacyPolicyPage() {
  const router = useRouter();

  return (
    <div className="p-8 max-h-[80vh] overflow-y-auto scrollbar-thin">
      <div className="mb-6 flex justify-between items-start">
        <button 
          onClick={() => router.back()}
          className="p-2 bg-[var(--bg-secondary)] rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <CircleLogo size={40} />
      </div>

      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Privacy Policy</h1>
      <p className="text-[13px] text-[var(--text-muted)] mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8 text-[13px] text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">1. Introduction to Circle Privacy</h2>
          <p className="mb-3">
            At Circle ("we", "our", or "us"), your privacy is fundamentally integrated into how we design and build our services. 
            We are committed to securing your personal communications and protecting your identity. This Privacy Policy outlines our 
            practices regarding the collection, encryption, utilization, and safeguarding of your data when you access the Circle Messaging Platform.
          </p>
          <p>
            By creating an account or utilizing our services, you acknowledge and consent to the data practices described in this policy. 
            If you do not agree with these terms, we kindly ask that you refrain from using our application.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">2. Information Architecture & Collection</h2>
          <p className="mb-3">
            Circle operates on a principle of data minimization. We only collect information that is strictly necessary to provide our core messaging services.
          </p>
          <div className="space-y-4 pl-2 border-l-2 border-[var(--border-color)]">
            <div>
              <strong className="text-[var(--text-primary)] block mb-1">Account & Identity Information</strong>
              <p>During enrollment via Google OAuth or phone verification, we securely process your primary identifier (email or phone number), your chosen display name, and optional profile media. This data is strictly used for account continuity and platform identification.</p>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block mb-1">Encrypted Communication Data</strong>
              <p>While we facilitate the transmission of your texts, high-definition media, voice notes, and status updates, all primary communication payloads are subject to end-to-end encryption protocols during transit. Our servers only retain encrypted blobs necessary for cross-device synchronization and offline queuing.</p>
            </div>
            <div>
              <strong className="text-[var(--text-primary)] block mb-1">Telemetry & Diagnostic Metadata</strong>
              <p>To ensure network stability and platform security, our infrastructure automatically records non-identifiable telemetry, including hardware identifiers, connection ping rates, and generic crash reports. This data contains no message content.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">3. Utilization of Secure Data</h2>
          <p className="mb-3">
            Your data is strictly weaponized against latency and service interruption, never sold or monetized. We utilize your minimal footprint to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 marker:text-[var(--text-muted)]">
            <li>Facilitate instant, secure routing of your messages to intended recipients.</li>
            <li>Synchronize your contact graph locally to ensure seamless communication with your circle.</li>
            <li>Deploy critical security patches and algorithmic network optimizations.</li>
            <li>Verify identity to prevent unauthorized platform access and mitigate automated abuse.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">4. State-of-the-Art Security Infrastructure</h2>
          <p>
            Circle employs enterprise-grade cryptographic standards. We utilize advanced cloud infrastructure powered by Supabase, enforcing strict Row Level Security (RLS) policies. This guarantees that your chats, media, and statuses are mathematically inaccessible to unauthorized users. While we provide absolute security in transit, the localized security of your endpoint device remains your responsibility.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">5. Data Sovereignty & Third-Party Disclosure</h2>
          <p>
            Circle does not participate in the surveillance economy. We will never sell, trade, or rent your personal identification information to third parties. We strictly engage authenticated sub-processors solely for infrastructure routing, and we require them to uphold equivalent cryptographic standards. We only disclose minimal metadata to legal authorities when compelled by a verified, legally binding court order.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">6. User Rights & Data Deletion</h2>
          <p>
            You retain absolute sovereignty over your profile. Through the Circle application settings, you hold the right to instantly request a full data archive, modify your identity architecture, or permanently execute a cryptographic wipe of your account and metadata from our active servers.
          </p>
        </section>

        <section className="pt-4 border-t border-[var(--border-color)]">
          <p className="text-[12px] text-[var(--text-muted)]">
            For advanced inquiries regarding our cryptographic implementations or privacy architecture, please contact our security division at privacy@circleapp.network.
          </p>
        </section>
      </div>

    </div>
  );
}
