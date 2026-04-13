'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import CircleLogo from '@/components/ui/CircleLogo';

export default function TermsOfServicePage() {
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

      <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">Terms of Service</h1>
      <p className="text-[13px] text-[var(--text-muted)] mb-8">Last updated: {new Date().toLocaleDateString()}</p>

      <div className="space-y-8 text-[13px] text-[var(--text-secondary)] leading-relaxed">
        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">1. Binding Agreement & Platform Access</h2>
          <p className="mb-3">
            These Terms of Service ("Terms") dictate your legal rights and obligations regarding your access to and utilization of the Circle messaging platform, its underlying software, routing infrastructure, and associated services (collectively, the "Platform"). 
          </p>
          <p>
            By registering for an account, accessing the network, or transmitting data through our architecture, you enter into a legally binding agreement with Circle. If you represent an organization, you warrant that you possess the explicit authority to bind that entity to these Terms. Failure to comply with these stipulations may result in the immediate cryptographic termination of your access.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">2. Identity Verification & Account Integrity</h2>
          <p className="mb-3">
            To integrate into the Circle network, you must establish an authenticated identity using a verified telecommunications number or recognized OAuth provider (Google). 
          </p>
          <p>
            You assume absolute liability for all activities initiated under your cryptographic identity. You are strictly prohibited from facilitating network access to unauthorized third parties, sharing authentication tokens, or creating accounts through automated, malicious, or deceptive means.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">3. Acceptable Use Policy & Network Abuse</h2>
          <p className="mb-3">
            Circle provides a neutral, encrypted transport layer for personal and professional communication. We maintain a zero-tolerance policy for network abuse. You unequivocally agree NOT to leverage the Platform to:
          </p>
          <ul className="list-disc pl-5 mt-2 space-y-2 marker:text-[var(--text-muted)]">
            <li>Transmit payloads containing explicit illegal material, terrorism coordination, or child exploitation imagery.</li>
            <li>Execute automated spam, mass unsolicited broadcasts, or deploy unauthorized bot architectures.</li>
            <li>Initiate Denial of Service (DoS) attacks, protocol exploitation, or reverse-engineer our proprietary encryption algorithms.</li>
            <li>Impersonate legal entities, governmental bodies, or execute coordinated social engineering attacks.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">4. Content Ownership & License to Host</h2>
          <p>
            Circle claims absolutely NO intellectual property rights or ownership over your transmitted messages, media, or statuses. You retain full sovereignty over your data. However, to execute the fundamental operations of the Platform, you grant Circle a localized, encrypted, limited license strictly to route, process, and synchronize your data across your authenticated digital endpoints.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">5. Service Availability & Algorithmic Modifications</h2>
          <p>
            We operate the Platform on an "AS IS" and "AS AVAILABLE" absolute basis. Circle retains the unilateral right to deploy algorithmic updates, modify routing infrastructure, or temporarily suspend nodes for maintenance without prior disclosure. We explicitly disclaim all warranties of continuous availability, and we are not liable for any telecommunication failures, data packet loss, or localized service degradation.
          </p>
        </section>

        <section>
          <h2 className="text-[15px] font-semibold text-[var(--text-primary)] mb-3">6. Limitation of Liability</h2>
          <p>
            To the maximum extent permitted by applicable jurisdiction, Circle, its directors, developers, and infrastructure partners shall NOT be held liable for any indirect, incidental, special, consequential, or punitive damages—including data loss, reputation damage, or financial deficits—resulting from your reliance on the Platform or unauthorized interception at your endpoint device.
          </p>
        </section>

        <section className="pt-4 border-t border-[var(--border-color)] flex flex-col gap-2">
          <p className="text-[12px] text-[var(--text-muted)]">
            These Terms of Service are subject to evolutionary updates. Continued utilization of the Platform constitutes your acceptance of the revised architectural policies.
          </p>
          <p className="text-[12px] text-[var(--text-muted)]">
            For legal inquiries or compliance directives, contact legal@circleapp.network.
          </p>
        </section>
      </div>

    </div>
  );
}
