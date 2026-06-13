import {
  LegalLi,
  LegalP,
  LegalStrong,
  LegalUl,
  type LegalSection,
} from "@/components/legal/LegalDocument";
import { LEGAL, LEGAL_ROUTES } from "@/content/legal/config";

export const privacySections: LegalSection[] = [
  {
    id: "introduction",
    title: "Introduction",
    content: (
      <>
        <LegalP>
          This Privacy Policy explains how {LEGAL.legalEntity} (&ldquo;
          <LegalStrong>Ghost</LegalStrong>,&rdquo; &ldquo;
          <LegalStrong>we</LegalStrong>,&rdquo; &ldquo;
          <LegalStrong>us</LegalStrong>,&rdquo; or &ldquo;
          <LegalStrong>our</LegalStrong>&rdquo;) collects, uses, discloses, and
          protects personal information when you use the {LEGAL.productName}{" "}
          website, desktop application, and related services (the &ldquo;
          <LegalStrong>Service</LegalStrong>&rdquo;).
        </LegalP>
        <LegalP>
          By using the Service, you acknowledge this Privacy Policy. If you do
          not agree, do not use the Service. This Policy should be read together
          with our{" "}
          <a href={LEGAL_ROUTES.terms} className="text-ghost-600 underline">
            Terms of Service
          </a>
          .
        </LegalP>
      </>
    ),
  },
  {
    id: "scope",
    title: "Scope and Roles",
    content: (
      <>
        <LegalP>
          This Policy applies to personal information we process as a controller
          when you use the Service directly. If you use {LEGAL.productName}{" "}
          through an employer or enterprise customer that provisions accounts,
          your organization may act as controller for certain employee data, and
          we may process data as a processor under a separate agreement.
        </LegalP>
        <LegalP>
          This Policy does not apply to third-party websites, services, or
          platforms you connect to or use during calls (e.g., video conferencing
          providers, CRMs, OAuth providers).
        </LegalP>
      </>
    ),
  },
  {
    id: "information-collected",
    title: "Information We Collect",
    content: (
      <>
        <LegalP>
          <LegalStrong>Account and identity information.</LegalStrong> Name,
          email address, password (stored hashed by our authentication provider),
          profile photo, authentication tokens, subscription status, and
          communications with support.
        </LegalP>
        <LegalP>
          <LegalStrong>Audio and conversation data.</LegalStrong> When you enable
          listening features, the Service may capture microphone audio and, if
          you grant permission, system audio from your device. Audio may be
          transcribed locally and/or sent to third-party speech and AI services
          to generate coaching outputs.
        </LegalP>
        <LegalP>
          <LegalStrong>Transcripts and session data.</LegalStrong> Conversation
          transcripts, speaker labels, timestamps, meeting summaries, deal
          scores, objections, next steps, coaching suggestions, and related
          metadata generated during your use of the Service.
        </LegalP>
        <LegalP>
          <LegalStrong>Configuration and content.</LegalStrong> Sales modes,
          custom prompts, playbook settings, knowledge base file names and
          uploaded content you choose to provide, and in-app preferences.
        </LegalP>
        <LegalP>
          <LegalStrong>Device and technical data.</LegalStrong> Device type,
          operating system, app version, IP address, crash logs, diagnostic
          events, permission states, and usage information necessary to operate
          and secure the Service.
        </LegalP>
        <LegalP>
          <LegalStrong>Payment information.</LegalStrong> Billing name, billing
          address, and transaction metadata. Payment card details are processed
          by our payment processor and are not stored by Ghost in full.
        </LegalP>
        <LegalP>
          <LegalStrong>Website data.</LegalStrong> If you visit our website, we
          may collect cookies and similar technologies as described in our{" "}
          <a href={LEGAL_ROUTES.cookies} className="text-ghost-600 underline">
            Cookie Policy
          </a>
          .
        </LegalP>
      </>
    ),
  },
  {
    id: "sources",
    title: "How We Collect Information",
    content: (
      <>
        <LegalUl>
          <LegalLi>
            <LegalStrong>Directly from you</LegalStrong> when you register,
            configure settings, upload content, contact support, or subscribe.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Automatically</LegalStrong> when you use the
            application, including through local storage, logs, and device
            permissions.
          </LegalLi>
          <LegalLi>
            <LegalStrong>From third parties</LegalStrong> such as authentication
            providers (e.g., Google OAuth via Supabase), payment processors, and
            AI/speech service providers when you connect those features.
          </LegalLi>
        </LegalUl>
      </>
    ),
  },
  {
    id: "uses",
    title: "How We Use Information",
    content: (
      <>
        <LegalP>We use personal information to:</LegalP>
        <LegalUl>
          <LegalLi>Provide, operate, maintain, and improve the Service;</LegalLi>
          <LegalLi>
            Generate real-time coaching, summaries, and related AI outputs;
          </LegalLi>
          <LegalLi>
            Authenticate users, prevent fraud, and enforce our terms;
          </LegalLi>
          <LegalLi>
            Process subscriptions, payments, and account communications;
          </LegalLi>
          <LegalLi>
            Respond to support requests and send service-related notices;
          </LegalLi>
          <LegalLi>
            Analyze usage trends and develop new features (using aggregated or
            de-identified data where feasible);
          </LegalLi>
          <LegalLi>Comply with legal obligations and protect our rights.</LegalLi>
        </LegalUl>
        <LegalP>
          We do not sell your personal information. We do not use conversation
          content to train public third-party AI models unless we clearly
          disclose that practice and obtain your consent.
        </LegalP>
      </>
    ),
  },
  {
    id: "legal-bases",
    title: "Legal Bases for Processing (EEA/UK)",
    content: (
      <>
        <LegalP>
          If you are in the European Economic Area or United Kingdom, we
          process personal data under one or more of the following legal bases:
        </LegalP>
        <LegalUl>
          <LegalLi>
            <LegalStrong>Contract:</LegalStrong> To provide the Service you
            request.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Legitimate interests:</LegalStrong> To secure, improve,
            and operate the Service, prevent abuse, and communicate with you,
            balanced against your rights.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Consent:</LegalStrong> Where required for optional
            features, marketing, or certain cookies.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Legal obligation:</LegalStrong> Where processing is
            required by law.
          </LegalLi>
        </LegalUl>
      </>
    ),
  },
  {
    id: "sharing",
    title: "How We Share Information",
    content: (
      <>
        <LegalP>We may share personal information with:</LegalP>
        <LegalUl>
          <LegalLi>
            <LegalStrong>Service providers</LegalStrong> who assist with hosting,
            authentication, AI inference, speech recognition, analytics,
            customer support, email delivery, and payment processing.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Enterprise administrators</LegalStrong> if your account
            is managed by an organization.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Professional advisers</LegalStrong> such as lawyers,
            auditors, and insurers.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Authorities</LegalStrong> when required by law,
            subpoena, or to protect rights, safety, and security.
          </LegalLi>
          <LegalLi>
            <LegalStrong>Business transferees</LegalStrong> in connection with a
            merger, acquisition, financing, or sale of assets, subject to
            appropriate safeguards.
          </LegalLi>
        </LegalUl>
        <LegalP>
          We require service providers to process data only on our instructions
          and under appropriate confidentiality and security obligations, where
          applicable.
        </LegalP>
      </>
    ),
  },
  {
    id: "subprocessors",
    title: "Subprocessors and Third-Party AI Processing",
    content: (
      <>
        <LegalP>
          The Service relies on third-party subprocessors that may process
          personal information, including:
        </LegalP>
        <LegalUl>
          <LegalLi>
            <LegalStrong>Supabase</LegalStrong> — authentication and account
            management;
          </LegalLi>
          <LegalLi>
            <LegalStrong>OpenAI</LegalStrong> — AI inference when configured;
          </LegalLi>
          <LegalLi>
            <LegalStrong>Google</LegalStrong> — OAuth sign-in and, depending on
            browser/platform, speech recognition services;
          </LegalLi>
          <LegalLi>
            <LegalStrong>Payment processors</LegalStrong> such as Stripe — billing;
          </LegalLi>
          <LegalLi>
            <LegalStrong>Cloud infrastructure providers</LegalStrong> — hosting
            and storage.
          </LegalLi>
        </LegalUl>
        <LegalP>
          When AI features are enabled, portions of transcripts and prompts may
          be transmitted to AI providers for processing. You should review
          third-party privacy policies before enabling integrations.
        </LegalP>
      </>
    ),
  },
  {
    id: "local-storage",
    title: "Local Storage and Data Location",
    content: (
      <>
        <LegalP>
          Much of your session data (transcripts, summaries, settings) may be
          stored locally on your device using application storage mechanisms. We
          may also store data in cloud systems located in the United States and
          other countries where we or our providers operate.
        </LegalP>
        <LegalP>
          You are responsible for securing devices on which the Service is
          installed and for deleting local data by uninstalling the application
          or clearing app data, as applicable.
        </LegalP>
      </>
    ),
  },
  {
    id: "retention",
    title: "Data Retention",
    content: (
      <>
        <LegalP>
          We retain personal information for as long as necessary to provide the
          Service, fulfill the purposes described in this Policy, comply with
          legal obligations, resolve disputes, and enforce agreements.
        </LegalP>
        <LegalP>
          Retention periods vary by data type. Account data is generally retained
          while your account is active and for a reasonable period thereafter.
          Local session data remains on your device until you delete it or
          uninstall the app. Backup copies may persist for a limited period.
        </LegalP>
        <LegalP>
          We may retain aggregated or de-identified information without
          limitation.
        </LegalP>
      </>
    ),
  },
  {
    id: "security",
    title: "Security",
    content: (
      <>
        <LegalP>
          We implement reasonable technical and organizational measures designed
          to protect personal information, including encryption in transit where
          supported, access controls, and secure development practices.
        </LegalP>
        <LegalP>
          No method of transmission or storage is completely secure. You use the
          Service at your own risk and should implement appropriate endpoint
          security controls.
        </LegalP>
      </>
    ),
  },
  {
    id: "your-rights",
    title: "Your Privacy Rights",
    content: (
      <>
        <LegalP>
          Depending on your location, you may have rights to access, correct,
          delete, restrict, or object to certain processing, receive a portable
          copy of your data, withdraw consent, and lodge a complaint with a
          supervisory authority.
        </LegalP>
        <LegalP>
          <LegalStrong>California residents (CCPA/CPRA):</LegalStrong> You may
          have rights to know, delete, correct, and opt out of certain sharing.
          We do not sell personal information. To exercise rights, contact{" "}
          {LEGAL.contact.privacy}.
        </LegalP>
        <LegalP>
          <LegalStrong>EEA/UK residents:</LegalStrong> You may contact our data
          protection contact at {LEGAL.contact.dpo}. You also have the right to
          complain to your local data protection authority.
        </LegalP>
        <LegalP>
          We may verify your identity before responding and may decline requests
          permitted by law. Authorized agents may submit requests where
          applicable law allows.
        </LegalP>
      </>
    ),
  },
  {
    id: "international-transfers",
    title: "International Data Transfers",
    content: (
      <>
        <LegalP>
          If you access the Service from outside the United States, your
          information may be transferred to, stored in, and processed in the
          United States and other countries that may not provide the same level
          of data protection as your jurisdiction.
        </LegalP>
        <LegalP>
          Where required, we implement appropriate safeguards such as Standard
          Contractual Clauses or equivalent mechanisms for cross-border
          transfers.
        </LegalP>
      </>
    ),
  },
  {
    id: "children",
    title: "Children's Privacy",
    content: (
      <>
        <LegalP>
          The Service is not directed to individuals under 18. We do not
          knowingly collect personal information from children. If you believe a
          child has provided us information, contact {LEGAL.contact.privacy} and
          we will take appropriate steps to delete it.
        </LegalP>
      </>
    ),
  },
  {
    id: "automated-decisions",
    title: "Automated Processing",
    content: (
      <>
        <LegalP>
          The Service uses automated processing, including AI models, to generate
          coaching suggestions and summaries. These outputs are assistive only
          and do not produce legal or similarly significant effects without your
          review. You may contact us if you have questions about automated
          processing in your jurisdiction.
        </LegalP>
      </>
    ),
  },
  {
    id: "marketing",
    title: "Marketing Communications",
    content: (
      <>
        <LegalP>
          We may send product updates, onboarding messages, and promotional
          communications where permitted. You can opt out of marketing emails
          using the unsubscribe link or by contacting {LEGAL.contact.support}.
          Service-related messages may still be sent.
        </LegalP>
      </>
    ),
  },
  {
    id: "changes",
    title: "Changes to This Policy",
    content: (
      <>
        <LegalP>
          We may update this Privacy Policy from time to time. Material changes
          will be notified via the Service, email, or website. The &ldquo;Last
          updated&rdquo; date at the top indicates when this Policy was last
          revised. Continued use after changes constitutes acceptance where
          permitted by law.
        </LegalP>
      </>
    ),
  },
  {
    id: "contact",
    title: "Contact Us",
    content: (
      <>
        <LegalP>
          For privacy questions or requests, contact:
        </LegalP>
        <LegalUl>
          <LegalLi>
            Email: {LEGAL.contact.privacy}
          </LegalLi>
          <LegalLi>
            Legal notices: {LEGAL.contact.legal}
          </LegalLi>
          <LegalLi>
            Entity: {LEGAL.legalEntity}
          </LegalLi>
          <LegalLi>
            Website: {LEGAL.website}
          </LegalLi>
        </LegalUl>
      </>
    ),
  },
];
