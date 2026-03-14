import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import dashboardBanner from '../assets/images/dashboard-banner.png.png';

function SupportLoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loginSupportWithPassword } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);

    try {
      await loginSupportWithPassword(formData);
      const destination = location.state?.from?.pathname || '/chat';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to sign in right now.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-wide auth-card-compact">
        <div className="auth-copy admin-auth-copy">
          <div className="auth-copy-body">
            <p className="eyebrow">Support access</p>
            <h2>Open the counsellor and peer mentor workspace.</h2>
            <p>Use your assigned Mind Haven work email and password to support students, manage follow-up, and review conversations.</p>
          </div>
          <img className="auth-illustration auth-illustration-support" src={dashboardBanner} alt="Support workspace illustration" />
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            <span>Work email</span>
            <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="care@mindhaven.app" required />
          </label>
          <label>
            <span>Password</span>
            <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder="Enter your password" required />
          </label>
          <p className="auth-helper-text">Support accounts are approved internally and use password login instead of student OTP.</p>
          {message ? <p className="form-success">{message}</p> : null}
          {error ? <p className="form-error">{error}</p> : null}
          <button className="button primary auth-submit" type="submit" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Open support inbox'}
          </button>
        </form>
      </section>
    </div>
  );
}

export default SupportLoginPage;
