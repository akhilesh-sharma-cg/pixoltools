
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const navigate = useNavigate();
  const { signUp } = useAuth();

  const handleSignup = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (password.length < 8) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const result = await signUp(
        name.trim(),
        email.trim(),
        password
      );

      if (result.needsEmailConfirmation) {
        setMessage(
          'Verification email sent! Please open your inbox and click the confirmation link. You will be logged in automatically after successful confirmation.'
        );
      } else {
        navigate('/', { replace: true });
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to create your account. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-auth-page">
      <div className="pt-auth-card">
        <div className="pt-auth-brand-panel">
          <div className="pt-auth-logo">PixelTools</div>

          <div className="pt-auth-brand-content">
            <h1>Create your account</h1>
            <p>Join PixelTools and make image editing easier.</p>
          </div>

          <div className="pt-auth-brand-footer">
            Your creative workspace, all in one place.
          </div>
        </div>

        <div className="pt-auth-form-panel">
          <div className="pt-auth-form-container">
            <div className="pt-auth-mobile-logo">PixelTools</div>

            <h2 className="pt-auth-heading">Create your account</h2>

            <p className="pt-auth-switch">
              Already have an account?{' '}
              <Link to="/login">Sign in</Link>
            </p>

            <form className="pt-auth-form" onSubmit={handleSignup}>
              <div className="pt-auth-field">
                <label htmlFor="signup-name">Full name</label>
                <input
                  id="signup-name"
                  type="text"
                  placeholder="Enter your name"
                  autoComplete="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="pt-auth-field">
                <label htmlFor="signup-email">Email address</label>
                <input
                  id="signup-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pt-auth-field">
                <label htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  placeholder="Create a password"
                  autoComplete="new-password"
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="pt-auth-field">
                <label htmlFor="signup-confirm-password">
                  Confirm password
                </label>
                <input
                  id="signup-confirm-password"
                  type="password"
                  placeholder="Confirm your password"
                  autoComplete="new-password"
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="pt-auth-submit"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </form>

            {error && (
              <p className="pt-auth-error" role="alert">
                {error}
              </p>
            )}

            {message && (
              <p className="pt-auth-message" role="status">
                {message}
              </p>
            )}

            <Link to="/" className="pt-auth-back">
              Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
