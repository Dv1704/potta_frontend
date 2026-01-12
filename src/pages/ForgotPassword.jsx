import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';

const ForgotPassword = () => {
    const { showToast } = useToast();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [emailSent, setEmailSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

            const response = await fetch(`${apiUrl}/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Failed to send reset email');
            }

            setEmailSent(true);
            showToast('Reset instructions sent! Check your email.', 'success');
        } catch (err) {
            showToast(err.message, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    if (emailSent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
                <div className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md text-center space-y-4">
                    <div className="text-6xl mb-4">📧</div>
                    <h2 className="text-3xl font-bold text-blue-400">Check Your Email</h2>
                    <p className="text-slate-300">
                        We've sent password reset instructions to <strong>{email}</strong>
                    </p>
                    <p className="text-sm text-slate-400">
                        The email contains a reset token that's valid for 1 hour.
                    </p>
                    <div className="pt-4">
                        <Link
                            to="/reset-password"
                            className="text-blue-400 hover:underline font-medium"
                        >
                            I have my reset token →
                        </Link>
                    </div>
                    <div className="pt-2">
                        <Link
                            to="/login"
                            className="text-sm text-slate-400 hover:text-white"
                        >
                            Back to Login
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6">
            <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-lg shadow-lg w-full max-w-md space-y-4">
                <h2 className="text-3xl font-bold mb-4 text-center text-blue-400">Forgot Password</h2>

                <p className="text-sm text-slate-300 mb-6">
                    Enter your email address and we'll send you instructions to reset your password.
                </p>

                <input
                    type="email"
                    placeholder="Email Address"
                    className="w-full p-3 rounded bg-slate-700 text-white"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isLoading ? <LoadingSpinner fullScreen={false} text="" /> : 'Send Reset Instructions'}
                </button>

                <p className="text-sm text-center">
                    Remember your password?{' '}
                    <Link to="/login" className="text-blue-400 hover:underline">Login</Link>
                </p>
            </form>
        </div>
    );
};

export default ForgotPassword;
