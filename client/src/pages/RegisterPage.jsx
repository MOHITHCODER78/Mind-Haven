import { Link } from 'react-router-dom';
import registerSide from '../assets/images/register-side.png.png';

function RegisterPage() {
  return (
    <div className="auth-shell">
      <section className="auth-card auth-card-wide">
        <div className="auth-copy">
          <div className="auth-copy-body">
            <p className="eyebrow">Student onboarding</p>
          <h2>Create your student account through the OTP sign-in flow.</h2>
          <p>
            Mind Haven uses passwordless email OTP for students so onboarding stays simple, secure, and easy to complete during stressful periods.
          </p>
          </div>
          <img className="auth-illustration" src={registerSide} alt="Student onboarding illustration" />
        </div>
        <div className="auth-form auth-static">
          <p>
            Start from the student sign-in page, enter your name and email, and your account will be created or verified after you confirm the OTP.
          </p>
          <Link className="button primary auth-submit" to="/login">
            Continue to Student Sign In
          </Link>
        </div>
      </section>
    </div>
  );
}

export default RegisterPage;
