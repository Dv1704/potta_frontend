import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

import { logoBase64 as logo } from '../utils/logoBase64';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [verificationSessionId, setVerificationSessionId] = useState(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [requiresVerification, setRequiresVerification] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      if (requiresVerification && verificationSessionId) {
        // Verify the code after the backend requested 2FA.
        console.log('🔐 Verifying login code with session:', verificationSessionId);
        const verifyRes = await fetch(`${apiUrl}/auth/verify-login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ sessionId: verificationSessionId, code: verificationCode })
        });

        const verifyData = await verifyRes.json();
        if (!verifyRes.ok) {
          throw new Error(verifyData.message || verifyData.error || 'Verification failed');
        }

        if (!verifyData.access_token) {
          throw new Error('No token received after verification');
        }

        const profileRes = await fetch(`${apiUrl}/auth/profile`, {
          headers: {
            'Authorization': `Bearer ${verifyData.access_token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!profileRes.ok) {
          const errorText = await profileRes.text();
          throw new Error(`Failed to fetch profile after verification: ${profileRes.status} ${errorText}`);
        }

        const userData = await profileRes.json();
        login(verifyData.access_token, userData);
        showToast(`Verified! Welcome back, ${userData.name || 'Hustler'}!`, 'success');
        const from = location.state?.from ?? { pathname: '/success' };
        navigate(from, { replace: true });
        return;
      }

      // Initial login attempt
      console.log('🔐 Attempting login to:', `${apiUrl}/auth/login`);
      const loginRes = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const loginData = await loginRes.json();
      console.log('📥 Login response:', { status: loginRes.status, loginData });

      if (!loginRes.ok) {
        throw new Error(loginData.message || loginData.error || 'Login failed');
      }

      if (loginData.requiresVerification) {
        setRequiresVerification(true);
        setVerificationSessionId(loginData.sessionId);
        setStatusMessage(loginData.message || 'A verification code was sent to your email. Enter it below to complete login.');
        showToast('Verification code sent to email.', 'info');
        setIsLoading(false);
        return;
      }

      if (!loginData.access_token) {
        console.error('❌ No access_token in response:', loginData);
        throw new Error('No token received from server');
      }

      const profileRes = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        throw new Error(`Failed to fetch profile: ${profileRes.status} ${errorText}`);
      }

      const userData = await profileRes.json();
      login(loginData.access_token, userData);
      showToast(`Welcome back, ${userData.name || 'Hustler'}!`, 'success');
      const from = location.state?.from ?? { pathname: '/success' };
      navigate(from, { replace: true });
    } catch (err) {
      console.error('🚨 Login error:', err);
      showToast(err.message || 'Login error', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4">
        <div className="flex justify-center mb-6">
          <Link to="/">
            <img src={logo} alt="POTTA Logo" className="h-16 w-auto object-contain" style={{ filter: 'drop-shadow(0 0 8px rgba(168,85,247,0.6))' }} fetchPriority="high" />
          </Link>
        </div>
        <h2 className="text-3xl font-bold mb-4 text-center text-blue-400">Login</h2>

        <input
          type="email"
          placeholder="Email Address"
          className="w-full p-3 rounded bg-slate-700 text-white"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full p-3 rounded bg-slate-700 text-white"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          required={!requiresVerification}
          disabled={requiresVerification}
        />

        {requiresVerification && (
          <div className="space-y-3">
            <p className="text-sm text-yellow-300 bg-slate-800 p-3 rounded border border-yellow-700">
              {statusMessage || 'A verification code was sent to your email. Enter it below to complete login.'}
            </p>
            <input
              type="text"
              inputMode="numeric"
              placeholder="Verification code"
              className="w-full p-3 rounded bg-slate-700 text-white"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
              maxLength={6}
            />
          </div>
        )}

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-blue-400 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
        >
          {isLoading ? <LoadingSpinner fullScreen={false} text="" /> : requiresVerification ? 'Verify Code' : 'Login'}
        </button>

        <p className="text-sm text-center">
          Don't have an account?{' '}
          <Link to="/signup" state={location.state} className="text-blue-400 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
