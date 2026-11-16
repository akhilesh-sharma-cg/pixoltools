
import { useState } from 'react';
import type { FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const navigate = useNavigate();
  const location = useLocation();

  const { signIn } = useAuth();

  // Preserve the image selected before login.
  const pendingFile = location.state?.pendingFile ?? null;

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);
    setError('');

    try {
      await signIn(email.trim(), password);

      navigate('/', {
        replace: true,
        state: {
          pendingFile,
          resumeProcessing: Boolean(pendingFile)
        }
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to sign in. Please check your details.'
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
            <h1>Welcome back!</h1>
            <p>Sign in to continue using your image tools.</p>
          </div>

          <div className="pt-auth-brand-footer">
            Your creative workspace, all in one place.
          </div>
        </div>

        <div className="pt-auth-form-panel">
          <div className="pt-auth-form-container">
            <div className="pt-auth-mobile-logo">PixelTools</div>

            <h2 className="pt-auth-heading">Sign in to your account</h2>

            <p className="pt-auth-switch">
              Don't have an account?{' '}
              <Link to="/signup">Create an account</Link>
            </p>

            <form className="pt-auth-form" onSubmit={handleLogin}>
              <div className="pt-auth-field">
                <label htmlFor="login-email">Email address</label>

                <input
                  id="login-email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="pt-auth-field">
                <label htmlFor="login-password">Password</label>

                <input
                  id="login-password"
                  type="password"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="pt-auth-submit"
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>

            {error && (
              <p className="pt-auth-error" role="alert">
                {error}
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
