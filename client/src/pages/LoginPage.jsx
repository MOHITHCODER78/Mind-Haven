import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import { getPageImage } from '../data/visualAssets';

function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { pendingAuth, requestOtp, verifyOtp, clearPendingAuth } = useAuth();
  const [requestForm, setRequestForm] = useState({
    name: '',
    email: '',
  });
  const [otpCode, setOtpCode] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const authDetails = useMemo(() => pendingAuth || { ...requestForm, role: 'student' }, [pendingAuth, requestForm]);
  const showDevOtp = Boolean(pendingAuth?.devOtp);

  const handleRequestChange = (event) => {
    const { name, value } = event.target;
    setRequestForm((current) => ({ ...current, [name]: value }));
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    setError('');
    setSuccessMessage('');
    setSending(true);

    try {
      const response = await requestOtp(requestForm);
      setSuccessMessage(response.message);
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to send OTP right now.');
    } finally {
      setSending(false);
    }
  };

  const handleVerifyOtp = async (event) => {
    event.preventDefault();
    setError('');
    setVerifying(true);

    try {
      await verifyOtp({ ...authDetails, code: otpCode, role: 'student' });
      const destination = location.state?.from?.pathname || '/dashboard';
      navigate(destination, { replace: true });
    } catch (requestError) {
      setError(requestError.response?.data?.message || 'Unable to verify OTP right now.');
    } finally {
      setVerifying(false);
    }
  };

  const handleUseDifferentEmail = () => {
    clearPendingAuth();
    setOtpCode('');
    setError('');
    setSuccessMessage('');
  };

  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-wide auth-card-compact">
        <div className="auth-copy">
          <div className="auth-copy-body">
            <p className="eyebrow">Student sign in</p>
            <h2>Open your private workspace.</h2>
            <p>Enter your email and we will send a short verification code to get you in.</p>
          </div>
          <div className="auth-image-shell">
            <img className="auth-image" src={getPageImage('studentLogin')} alt="Student workspace with a laptop and notebook" />
          </div>
          {showDevOtp ? (
            <div className="dev-otp-box">
              <span className="tag">Development preview</span>
              <strong className="dev-otp-code">{pendingAuth.devOtp}</strong>
            </div>
          ) : null}
        </div>

        {!pendingAuth || pendingAuth.mode !== 'student' ? (
          <form className="auth-form" onSubmit={handleSendOtp}>
            <label>
              <span>Full name</span>
              <input type="text" name="name" value={requestForm.name} onChange={handleRequestChange} placeholder="Your name" required />
            </label>
            <label>
              <span>Student email</span>
              <input type="email" name="email" value={requestForm.email} onChange={handleRequestChange} placeholder="you@institution.edu" required />
            </label>
            <p className="auth-helper-text">We will send a 6-digit code to your inbox.</p>
            {error ? <p className="form-error">{error}</p> : null}
            {successMessage ? <p className="form-success">{successMessage}</p> : null}
            <button className="button primary auth-submit" type="submit" disabled={sending}>
              {sending ? 'Sending code...' : 'Send code'}
            </button>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleVerifyOtp}>
            <label>
              <span>Email</span>
              <input type="email" value={authDetails.email} disabled />
            </label>
            <label>
              <span>OTP</span>
              <input type="text" inputMode="numeric" maxLength="6" value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter verification code" required />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            {successMessage ? <p className="form-success">{successMessage}</p> : null}
            <button className="button primary auth-submit" type="submit" disabled={verifying}>
              {verifying ? 'Checking code...' : 'Verify'}
            </button>
            <button type="button" className="text-button" onClick={handleUseDifferentEmail}>
              Use a different email
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default LoginPage;
