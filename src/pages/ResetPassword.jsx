import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ResetPassword = () => {
    const navigate = useNavigate();
    const { showToast } = useToast();
    const [formData, setFormData] = useState({
        email: '',
        token: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Validate passwords match
        if (formData.newPassword !== formData.confirmPassword) {
            showToast('Passwords do not match', 'error');
            setIsLoading(false);
            return;
        }

        // Validate password strength
        if (formData.newPassword.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            setIsLoading(false);
            return;
        }

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const response = await fetch(`${apiUrl}/auth/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    token: formData.token,
                    newPassword: formData.newPassword
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to reset password');
            }

            showToast('Password reset successful! Please login.', 'success');

            // Redirect to login after 2 seconds
            setTimeout(() => navigate('/login'), 2000);
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4">
                <h2 className="text-3xl font-bold mb-4 text-center text-blue-400">Reset Password</h2>

                <p className="text-sm text-slate-300 mb-6">
                    Enter the reset token from your email and choose a new password.
                </p>

                <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full p-3 rounded bg-slate-700 text-white"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                />

                <input
                    type="text"
                    placeholder="Reset Token (from email)"
                    className="w-full p-3 rounded bg-slate-700 text-white font-mono"
                    value={formData.token}
                    onChange={(e) => setFormData({ ...formData, token: e.target.value })}
                    required
                />

                <input
                    type="password"
                    placeholder="New Password (min 8 characters)"
                    className="w-full p-3 rounded bg-slate-700 text-white"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    required
                    minLength={8}
                />

                <input
                    type="password"
                    placeholder="Confirm New Password"
                    className="w-full p-3 rounded bg-slate-700 text-white"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    required
                    minLength={8}
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isLoading ? <LoadingSpinner fullScreen={false} text="" /> : 'Reset Password'}
                </button>

                <p className="text-sm text-center">
                    Don't have a token?{' '}
                    <Link to="/forgot-password" className="text-blue-400 hover:underline">Request Reset</Link>
                </p>

                <p className="text-sm text-center">
                    <Link to="/login" className="text-slate-400 hover:text-white">Back to Login</Link>
                </p>
            </form>
        </div>
    );
};

export default ResetPassword;
