import { Link } from 'react-router-dom';
import SectionHeading from '../components/shared/SectionHeading';

function PrivacyPolicyPage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <SectionHeading
          eyebrow="Legal"
          title="Privacy Policy"
          description="How Mind Haven collects, uses, and protects your information."
        />
        <div style={{ display: 'grid', gap: '1.25rem', lineHeight: 1.7 }}>
          <div>
            <h3>1. Overview</h3>
            <p>Mind Haven is designed to be a private, supportive space for students. This policy explains what data we collect, why we collect it, and how we keep it safe.</p>
          </div>
          <div>
            <h3>2. Data We Collect</h3>
            <p>We collect account information such as name and email, mood check-ins, support chat messages, anonymous wall posts, and basic usage metadata. We do not sell personal data to third parties.</p>
          </div>
          <div>
            <h3>3. How We Use Data</h3>
            <p>Your data is used to provide core features: mood tracking, resource recommendations, support conversations, and moderation safety. Aggregated insights may be used to improve platform safety and content relevance.</p>
          </div>
          <div>
            <h3>4. Data Sharing</h3>
            <p>We only share data when required by law, to protect safety, or with trusted infrastructure providers under strict confidentiality obligations.</p>
          </div>
          <div>
            <h3>5. Security</h3>
            <p>We use password hashing, token-based authentication, HTTPS, rate limiting, and moderation tooling to protect your account and content.</p>
          </div>
          <div>
            <h3>6. Your Choices</h3>
            <p>You can update profile details, request account deletion, or contact support for privacy concerns. Mood logs and wall posts can be removed through support channels.</p>
          </div>
          <div>
            <h3>7. Contact</h3>
            <p>For privacy questions, contact <Link to="mailto:support@mindhaven.app">support@mindhaven.app</Link>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default PrivacyPolicyPage;