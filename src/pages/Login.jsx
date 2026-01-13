import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

      // 1. Login
      console.log('🔐 Attempting login to:', `${apiUrl}/auth/login`);
      const loginRes = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const loginData = await loginRes.json();
      console.log('📥 Login response:', { status: loginRes.status, hasToken: !!loginData.access_token });

      if (!loginRes.ok) {
        throw new Error(loginData.message || loginData.error || 'Login failed');
      }

      if (!loginData.access_token) {
        console.error('❌ No access_token in response:', loginData);
        throw new Error('No token received from server');
      }

      // 2. Fetch user profile
      console.log('👤 Fetching profile with token:', loginData.access_token.substring(0, 20) + '...');
      const profileRes = await fetch(`${apiUrl}/auth/profile`, {
        headers: {
          'Authorization': `Bearer ${loginData.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📥 Profile response status:', profileRes.status);

      if (!profileRes.ok) {
        const errorText = await profileRes.text();
        console.error('❌ Profile fetch failed:', errorText);
        throw new Error(`Failed to fetch profile: ${profileRes.status} ${errorText}`);
      }

      const userData = await profileRes.json();
      console.log('✅ User data received:', { id: userData.id, email: userData.email });

      // 3. Store in context
      login(loginData.access_token, userData);

      showToast(`Welcome back, ${userData.name || 'Hustler'}!`, 'success');

      // 4. Navigate back to intended page or success
      const from = location.state?.from?.pathname || '/success';
      navigate(from, { replace: true });
    } catch (err) {
      console.error('🚨 Login error:', err);
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
      <form onSubmit={handleLogin} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4">
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
          required
        />

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
          {isLoading ? <LoadingSpinner fullScreen={false} text="" /> : 'Login'}
        </button>

        <p className="text-sm text-center">
          Don't have an account?{' '}
          <Link to="/signup" className="text-blue-400 hover:underline">Sign Up</Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
