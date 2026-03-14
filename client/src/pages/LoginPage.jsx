import { useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useAuth from '../context/useAuth';
import loginSide from '../assets/images/login-side.png.png';

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
  const showDevOtp = import.meta.env.DEV && Boolean(pendingAuth?.devOtp);

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
            <h2>Access Mind Haven with secure email OTP.</h2>
            <p>Use your student email to enter your private wellness space and continue where you left off.</p>
          </div>
          <img className="auth-illustration" src={loginSide} alt="Student sign in illustration" />
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
              <input type="text" name="name" value={requestForm.name} onChange={handleRequestChange} placeholder="Enter your full name" required />
            </label>
            <label>
              <span>Student email</span>
              <input type="email" name="email" value={requestForm.email} onChange={handleRequestChange} placeholder="you@college.edu" required />
            </label>
            <p className="auth-helper-text">We will send a 6-digit verification code to your inbox.</p>
            {error ? <p className="form-error">{error}</p> : null}
            {successMessage ? <p className="form-success">{successMessage}</p> : null}
            <button className="button primary auth-submit" type="submit" disabled={sending}>
              {sending ? 'Sending...' : 'Send OTP'}
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
              <input type="text" inputMode="numeric" maxLength="6" value={otpCode} onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))} placeholder="Enter 6-digit OTP" required />
            </label>
            {error ? <p className="form-error">{error}</p> : null}
            {successMessage ? <p className="form-success">{successMessage}</p> : null}
            <button className="button primary auth-submit" type="submit" disabled={verifying}>
              {verifying ? 'Verifying...' : 'Verify OTP'}
            </button>
            <button type="button" className="text-button" onClick={handleUseDifferentEmail}>
              Change email
            </button>
          </form>
        )}
      </section>
    </div>
  );
}

export default LoginPage;
