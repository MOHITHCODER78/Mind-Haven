import { Link } from 'react-router-dom';
import SectionHeading from '../components/shared/SectionHeading';

function TermsOfServicePage() {
  return (
    <div className="page-stack">
      <section className="panel">
        <SectionHeading
          eyebrow="Legal"
          title="Terms of Use"
          description="Rules and responsibilities for using Mind Haven."
        />
        <div style={{ display: 'grid', gap: '1.25rem', lineHeight: 1.7 }}>
          <div>
            <h3>1. Acceptance</h3>
            <p>By accessing Mind Haven, you agree to these terms. If you do not agree, please do not use the platform.</p>
          </div>
          <div>
            <h3>2. Not Emergency Care</h3>
            <p>Mind Haven provides support tools and resources, but it is not a crisis service or replacement for licensed mental health care. If you are in danger, contact local emergency services immediately.</p>
          </div>
          <div>
            <h3>3. Expected Conduct</h3>
            <p>Be respectful, honest, and safe. Do not post harmful, abusive, or unsafe content. Violations may result in limited access or account removal.</p>
          </div>
          <div>
            <h3>4. Accounts and Security</h3>
            <p>Keep login credentials secure. Students use OTP-based sign-in. Support and admin accounts use password access. You are responsible for activity under your account.</p>
          </div>
          <div>
            <h3>5. Content and Moderation</h3>
            <p>Anonymous wall posts and chat messages are reviewed for safety. We may remove content that creates risk or violates community standards.</p>
          </div>
          <div>
            <h3>6. Limitation of Liability</h3>
            <p>Mind Haven is provided as-is. We are not liable for decisions made based on platform content. Use the platform as a supplement to, not a substitute for, professional care.</p>
          </div>
          <div>
            <h3>7. Contact</h3>
            <p>For terms questions, contact <Link to="mailto:support@mindhaven.app">support@mindhaven.app</Link>.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default TermsOfServicePage;