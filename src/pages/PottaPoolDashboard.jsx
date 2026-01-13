import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, ArrowUpRight, ArrowDownLeft, Send, TrendingUp, QrCode, Gift, DollarSign, Bell, Settings, Check, X, Clock, Trophy, Target, CreditCard, Smartphone, Building2, Activity, Award, Zap, Lock, Star, ChevronRight, Users } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import LoadingSpinner from '../components/LoadingSpinner';
import QRCode from 'react-qr-code';

export default function PottaPoolDashboard() {
  const { showToast } = useToast();
  const [darkMode, setDarkMode] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('GHS');
  const [showModal, setShowModal] = useState(null);
  const [amount, setAmount] = useState('');
  const [selectedPayment, setSelectedPayment] = useState('');
  const [recipientInfo, setRecipientInfo] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');

  // 2FA Transfer states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [transferSessionId, setTransferSessionId] = useState('');
  const [pendingTransferAmount, setPendingTransferAmount] = useState(0);

  const [wallet, setWallet] = useState({ availableBalance: 0, lockedBalance: 0 });
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({ wins: 0, losses: 0, winRate: 0, streak: 0 });
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [exchangeRates, setExchangeRates] = useState({
    USD: 1,
    NGN: 1650,
    GHS: 16.0,
    GBP: 0.79,
    EUR: 0.92
  });

  useEffect(() => {
    const fetchData = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const headers = { 'Authorization': `Bearer ${token}` };

        // Parallel Fetch
        const [balRes, profRes, txRes, statsRes, lbRes, ratesRes] = await Promise.all([
          fetch(`${apiUrl}/wallet/balance`, { headers }),
          fetch(`${apiUrl}/auth/profile`, { headers }),
          fetch(`${apiUrl}/wallet/history`, { headers }),
          fetch(`${apiUrl}/game/stats`, { headers }),
          fetch(`${apiUrl}/game/leaderboard`, { headers }),
          fetch(`${apiUrl}/wallet/rates`, { headers })
        ]);

        if (ratesRes.ok) {
          const ratesData = await ratesRes.json();
          setExchangeRates(ratesData);
        }

        if (balRes.ok) {
          const balData = await balRes.json();
          setWallet(balData);
        }

        if (profRes.ok) {
          const profData = await profRes.json();
          setUser(profData);
        }

        if (txRes.ok) {
          const txData = await txRes.json();
          const mappedTx = txData.map(tx => ({
            id: tx.id,
            type: tx.type.toLowerCase(),
            name: tx.description || tx.type,
            amount: tx.amount,
            status: 'completed',
            date: new Date(tx.createdAt).toLocaleDateString(),
            icon: getIconForType(tx.type)
          }));
          setTransactions(mappedTx);
        }

        if (statsRes.ok) {
          const statsData = await statsRes.json();
          console.log('Stats Response:', statsData); // Debug log
          setStats(statsData);
        } else {
          console.error('Stats fetch failed:', statsRes.status);
        }

        if (lbRes.ok) {
          const lbData = await lbRes.json();
          // lbData.topPlayers is array
          // We map it to our UI structure
          const mappedLb = lbData.topPlayers.map((p, index) => ({
            rank: index + 1,
            name: p.name || `Player_${p.email.substring(0, 4)}`,
            wins: p.wins,
            avatar: index === 0 ? '👑' : index === 1 ? '⚡' : index === 2 ? '🎱' : '🏆',
            isUser: p.email === user?.email // Simple check if user object available, else approximate
          }));
          setLeaderboardData(mappedLb);
        }

      } catch (err) {
        console.error('Dashboard fetch error:', err);
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [showToast]);

  // Payment Verification logic
  useEffect(() => {
    const verifyPayment = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const reference = urlParams.get('reference');

      if (reference) {
        // Clear params to prevent re-verification on reload
        window.history.replaceState({}, document.title, window.location.pathname);
        showToast('Verifying deposit...', 'info');

        try {
          const token = localStorage.getItem('token');
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

          const res = await fetch(`${apiUrl}/payments/verify/${reference}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          const data = await res.json();

          if (res.ok && (data.status === 'success' || data.status === 'already_processed')) {
            const msg = data.status === 'success' ? 'Deposit confirmed! Balance updated.' : 'Transaction confirmed. Balance updated.';
            showToast(msg, 'success');

            // Refresh wallet balance
            const balRes = await fetch(`${apiUrl}/wallet/balance`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (balRes.ok) {
              const balData = await balRes.json();
              setWallet(balData);
            }
          } else {
            showToast(data.message || 'Payment verification failed.', 'error');
          }
        } catch (error) {
          console.error(error);
          showToast('Failed to verify payment.', 'error');
        }
      }
    };

    verifyPayment();
  }, [showToast]);

  const availableBalanceGHS = wallet.available || 0;
  // Convert GHS balance to selected currency. Rates are per 1 USD.
  // 1 GHS = (1 / rates.GHS) USD.
  // Value in Selected = B_GHS * (rates[selected] / rates.GHS)
  const convertedBalance = availableBalanceGHS * (exchangeRates[selectedCurrency] / exchangeRates.GHS);

  const currencySymbols = {
    USD: '$',
    NGN: '₦',
    GHS: 'GHC ',
    GBP: '£',
    EUR: '€'
  };

  const paymentMethods = {
    deposit: [
      { id: 'paystack', name: 'Paystack (Card/MoMo)', icon: 'CreditCard', color: 'from-blue-500 to-emerald-500', fee: '1.5% + GHC 0.1' },
      { id: 'mobile', name: 'Direct Mobile Money', icon: 'Smartphone', color: 'from-green-500 to-emerald-500', fee: '1%' }
    ],
    withdraw: [
      { id: 'paystack_transfer', name: 'Bank/MoMo Transfer', icon: 'Building2', color: 'from-purple-500 to-pink-500', fee: 'GHC 1.00', time: 'Instant' },
    ],
    transfer: [
      { id: 'username', name: 'Player Username', icon: 'Users', color: 'from-orange-500 to-red-500', fee: 'Free' },
    ]
  };

  const getIconForType = (type) => {
    const icons = {
      'DEPOSIT': '💰',
      'WITHDRAWAL': '💸',
      'PAYOUT': '🎱',
      'LOCK': '🔒',
      'ROLLBACK': '↩️',
      'COMMISSION': '💼',
      'REFUND': '🔄'
    };
    return icons[type] || '📝';
  };

  const monthlyStats = stats.monthlyStats || [
    { month: 'Jan', wins: 0, losses: 0 },
    { month: 'Feb', wins: 0, losses: 0 },
    { month: 'Mar', wins: 0, losses: 0 },
    { month: 'Apr', wins: 0, losses: 0 },
    { month: 'May', wins: 0, losses: 0 },
    { month: 'Jun', wins: 0, losses: 0 }
  ];

  const achievements = stats.achievements || [
    { id: 1, name: 'First Win', icon: '🎯', unlocked: false },
    { id: 2, name: 'Win Streak', icon: '🔥', unlocked: false },
    { id: 3, name: 'Tournament King', icon: '👑', unlocked: false },
    { id: 4, name: 'Big Money', icon: '💎', unlocked: false }
  ];

  const leaderboard = leaderboardData.length > 0 ? leaderboardData : [];

  const maxGames = Math.max(...monthlyStats.map(d => d.wins + d.losses));

  const getIcon = (iconName) => {
    const icons = { CreditCard, Smartphone, Building2, Users, Target };
    const IconComponent = icons[iconName];
    return IconComponent ? <IconComponent size={20} /> : iconName;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    if (!token) {
      showToast('Please log in first', 'error');
      return;
    }

    console.log('Initiating transaction:', showModal, amount); // Debug log

    try {
      if (showModal === 'deposit') {
        const res = await fetch(`${apiUrl}/payments/deposit/initialize`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            currency: selectedCurrency,
            email: user?.email || 'test@example.com',
            callbackUrl: window.location.href
          })
        });
        const data = await res.json();
        if (res.ok && data.authorization_url) {
          window.location.href = data.authorization_url;
        } else {
          showToast(data.message || 'Deposit initiation failed', 'error');
        }
      } else if (showModal === 'withdraw') {
        const res = await fetch(`${apiUrl}/payments/withdraw`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            bankCode: bankCode,
            accountNumber: accountNumber,
            accountName: accountName
          })
        });
        const data = await res.json();
        if (res.ok) {
          showToast('Withdrawal initiated successfully!', 'success');
          setShowModal(null);
        } else {
          showToast(data.message || 'Withdrawal failed', 'error');
        }
      } else if (showModal === 'transfer') {
        if (!recipientInfo) {
          showToast('Please enter recipient username or email', 'error');
          return;
        }

        // Call new transfer/initiate endpoint
        const res = await fetch(`${apiUrl}/wallet/transfer/initiate`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            amount: parseFloat(amount),
            recipientIdentifier: recipientInfo
          })
        });
        const data = await res.json();

        if (res.ok) {
          if (data.requires2FA) {
            // Large transfer - requires 2FA
            setTransferSessionId(data.sessionId);
            setPendingTransferAmount(parseFloat(amount));
            setShowModal(null); // Close transfer modal
            setShow2FAModal(true); // Show 2FA modal
            showToast(data.message || 'Confirmation code sent to your email', 'info');
          } else {
            // Small transfer - completed immediately
            showToast(`Transfer successful! Sent ${currencySymbols[selectedCurrency]}${amount} to ${data.recipient.name}`, 'success');
            setShowModal(null);
            // Refresh wallet balance
            const balRes = await fetch(`${apiUrl}/wallet/balance`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (balRes.ok) {
              const balData = await balRes.json();
              setWallet(balData);
            }
          }
        } else {
          showToast(data.message || 'Transfer failed', 'error');
        }
      } else {
        showToast(`${showModal.charAt(0).toUpperCase() + showModal.slice(1)} successful! Amount: ${currencySymbols[selectedCurrency]}${amount}`, 'success');
        setShowModal(null);
      }
    } catch (err) {
      console.error('Transaction error:', err);
      showToast('An error occurred. Please try again.', 'error');
    } finally {
      setAmount('');
      setSelectedPayment('');
      setRecipientInfo('');
    }
  };

  const handleConfirm2FA = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';

    if (!verificationCode || verificationCode.length !== 6) {
      showToast('Please enter a valid 6-digit code', 'error');
      return;
    }

    try {
      const res = await fetch(`${apiUrl}/wallet/transfer/confirm`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          sessionId: transferSessionId,
          code: verificationCode
        })
      });

      const data = await res.json();

      if (res.ok) {
        showToast(`Transfer successful! Sent ${currencySymbols[selectedCurrency]}${pendingTransferAmount} to ${data.recipient.name}`, 'success');
        setShow2FAModal(false);
        setVerificationCode('');
        setTransferSessionId('');

        // Refresh wallet balance
        const balRes = await fetch(`${apiUrl}/wallet/balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (balRes.ok) {
          const balData = await balRes.json();
          setWallet(balData);
        }
      } else {
        showToast(data.message || 'Invalid code. Please try again.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Connection error', 'error');
    }
  };

  if (loading) return <LoadingSpinner text="Loading Wallet Dashboard..." />;

  const bgClass = darkMode ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900' : 'bg-gradient-to-br from-gray-50 via-blue-50 to-gray-50';
  const cardBg = darkMode ? 'bg-gradient-to-br from-slate-800 to-slate-900' : 'bg-white';
  const textPrimary = darkMode ? 'text-white' : 'text-gray-900';
  const textSecondary = darkMode ? 'text-gray-400' : 'text-gray-600';
  const borderColor = darkMode ? 'border-slate-700' : 'border-gray-200';

  // Modal component - defined once to prevent re-creation
  const renderModal = (type) => {
    const selectedMethod = paymentMethods[type].find(m => m.id === selectedPayment);

    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-start justify-center z-50 p-4 overflow-y-auto pt-8 pb-8">
        <div className={`${cardBg} rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border ${borderColor} my-auto`}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className={`p-3 rounded-xl bg-gradient-to-r ${type === 'deposit' ? 'from-green-500 to-emerald-600' :
                type === 'withdraw' ? 'from-blue-500 to-cyan-600' :
                  'from-purple-500 to-pink-600'
                }`}>
                {type === 'deposit' && <ArrowDownLeft size={24} className="text-white" />}
                {type === 'withdraw' && <ArrowUpRight size={24} className="text-white" />}
                {type === 'transfer' && <Send size={24} className="text-white" />}
              </div>
              <h3 className="text-2xl font-bold capitalize">{type} Funds</h3>
            </div>
            <button onClick={() => setShowModal(null)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className={`text-sm font-medium ${textSecondary} block mb-2`}>Amount</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-bold">
                  {currencySymbols[selectedCurrency]}
                </span>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  min="10"
                  required
                  className={`w-full pl-24 pr-4 py-4 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700' : 'bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-500 text-lg font-medium`}
                />
              </div>
              {type === 'withdraw' && (
                <p className={`text-xs ${textSecondary} mt-1`}>
                  Available: {currencySymbols[selectedCurrency]}{convertedBalance.toLocaleString()}
                </p>
              )}
            </div>

            <div>
              <label className={`text-sm font-medium ${textSecondary} block mb-3`}>
                {type === 'transfer' ? 'Transfer Method' : 'Payment Method'}
              </label>
              <div className="space-y-2">
                {paymentMethods[type].map((method) => (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setSelectedPayment(method.id)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedPayment === method.id
                      ? `border-green-500 bg-gradient-to-r ${method.color} bg-opacity-10`
                      : `${borderColor} hover:border-green-500/50`
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg bg-gradient-to-r ${method.color}`}>
                        <span className="text-white">{getIcon(method.icon)}</span>
                      </div>
                      <div className="text-left">
                        <span className="font-medium block">{method.name}</span>
                        <span className={`text-xs ${textSecondary}`}>
                          Fee: {method.fee} {method.time ? `• ${method.time}` : ''}
                        </span>
                      </div>
                    </div>
                    {selectedPayment === method.id && (
                      <Check size={20} className="text-green-500" />
                    )}
                  </button>
                ))}
              </div>
            </div>

            {type === 'withdraw' && (
              <div className="space-y-4">
                <div>
                  <label className={`text-sm font-medium ${textSecondary} block mb-2`}>Bank / Network</label>
                  <select
                    value={bankCode}
                    onChange={(e) => setBankCode(e.target.value)}
                    required
                    className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700' : 'bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-500`}
                  >
                    <option value="">Select Option</option>
                    <option value="MTN">MTN Mobile Money</option>
                    <option value="VOD">Vodafone Cash</option>
                    <option value="AIR">AirtelTigo Money</option>
                    <option value="GCB">GCB Bank</option>
                    <option value="CBG">CBG Bank</option>
                  </select>
                </div>
                <div>
                  <label className={`text-sm font-medium ${textSecondary} block mb-2`}>Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="0540000000"
                    required
                    className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700' : 'bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-500`}
                  />
                </div>
              </div>
            )}

            {type === 'transfer' && selectedPayment && (
              <div>
                <label className={`text-sm font-medium ${textSecondary} block mb-2`}>
                  {selectedPayment === 'username' ? 'Recipient Username' : 'Recipient Player ID'}
                </label>
                <input
                  type="text"
                  value={recipientInfo}
                  onChange={(e) => setRecipientInfo(e.target.value)}
                  placeholder={selectedPayment === 'username' ? '@username' : 'PTG-XXX-XXX'}
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${borderColor} ${darkMode ? 'bg-slate-700' : 'bg-gray-50'} focus:outline-none focus:ring-2 focus:ring-green-500`}
                />
              </div>
            )}

            {selectedPayment && amount && selectedMethod && (
              <div className={`p-4 rounded-xl border ${borderColor} space-y-2`}>
                <div className="flex justify-between text-sm">
                  <span className={textSecondary}>Amount</span>
                  <span className="font-medium">{currencySymbols[selectedCurrency]}{parseFloat(amount).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className={textSecondary}>Fee</span>
                  <span className="font-medium">{selectedMethod.fee}</span>
                </div>
                <div className={`flex justify-between pt-2 border-t ${borderColor}`}>
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-green-400">
                    {currencySymbols[selectedCurrency]}{parseFloat(amount).toLocaleString()}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedPayment || !amount || (type === 'transfer' && !recipientInfo)}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${selectedPayment && amount && (type !== 'transfer' || recipientInfo)
                ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-[1.02]'
                : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
            >
              Confirm {type}
            </button>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className={`min-h-screen ${bgClass} ${textPrimary} transition-all duration-500 p-4 md:p-8`}>
      <div className="max-w-7xl mx-auto">

        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
              <span className="text-2xl">🎱</span>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">
                Potta Pool Wallet
              </h1>
              <p className={`text-sm ${textSecondary}`}>Your Gaming Balance</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="p-2 md:p-3 rounded-xl hover:bg-white/10 transition-all relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
            <button className="p-2 md:p-3 rounded-xl hover:bg-white/10 transition-all">
              <Settings size={20} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 md:px-4 py-2 rounded-xl font-medium transition-all ${darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-slate-800 text-white'}`}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} hover:scale-105 transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Activity className="text-green-400" size={20} />
              <span className={`text-xs ${textSecondary}`}>Win Rate</span>
            </div>
            <p className="text-2xl font-bold text-green-400">{(Number(stats.winRate) || 0).toFixed(0)}%</p>
          </div>
          <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} hover:scale-105 transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="text-yellow-400" size={20} />
              <span className={`text-xs ${textSecondary}`}>Rank</span>
            </div>
            <p className="text-2xl font-bold">#{stats.rank || '-'}</p>
          </div>
          <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} hover:scale-105 transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="text-orange-400" size={20} />
              <span className={`text-xs ${textSecondary}`}>Streak</span>
            </div>
            <p className="text-2xl font-bold">{stats.streak || 0}🔥</p>
          </div>
          <div className={`${cardBg} p-4 rounded-2xl border ${borderColor} hover:scale-105 transition-all`}>
            <div className="flex items-center gap-2 mb-2">
              <Star className="text-purple-400" size={20} />
              <span className={`text-xs ${textSecondary}`}>Level</span>
            </div>
            <p className="text-2xl font-bold">{stats.level || 'Loading...'}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <div className="lg:col-span-2 space-y-6">

            <div className={`${cardBg} rounded-3xl p-6 md:p-8 shadow-2xl border ${borderColor} backdrop-blur-xl transition-all duration-300`}>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl">
                    <DollarSign size={24} className="text-white" />
                  </div>
                  <div>
                    <p className={`text-sm ${textSecondary}`}>Gaming Balance</p>
                    <div className="flex items-center gap-3 mt-1">
                      <select
                        value={selectedCurrency}
                        onChange={(e) => setSelectedCurrency(e.target.value)}
                        className={`${darkMode ? 'bg-slate-700' : 'bg-gray-100'} px-3 py-1 rounded-lg text-sm font-medium border ${borderColor} focus:outline-none focus:ring-2 focus:ring-green-500`}
                      >
                        <option value="USD">USD</option>
                        <option value="NGN">NGN</option>
                        <option value="GHS">GHS</option>
                        <option value="GBP">GBP</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setBalanceVisible(!balanceVisible)}
                  className="p-3 hover:bg-white/10 rounded-xl transition-all"
                >
                  {balanceVisible ? <Eye size={20} /> : <EyeOff size={20} />}
                </button>
              </div>

              <div className="mb-8">
                <h2 className="text-4xl md:text-5xl font-bold mb-2">
                  {balanceVisible ? (
                    `${currencySymbols[selectedCurrency]}${convertedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  ) : (
                    '••••••••'
                  )}
                </h2>
                {selectedCurrency !== 'USD' && balanceVisible && (
                  <p className={`text-sm ${textSecondary}`}>
                    ≈ ${(availableBalanceGHS / exchangeRates.GHS).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD
                  </p>
                )}
              </div>

              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => setShowModal('deposit')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 transition-all transform hover:scale-105"
                >
                  <ArrowDownLeft size={24} className="text-white" />
                  <span className="text-sm font-medium text-white">Deposit</span>
                </button>
                <button
                  onClick={() => setShowModal('withdraw')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 transition-all transform hover:scale-105"
                >
                  <ArrowUpRight size={24} className="text-white" />
                  <span className="text-sm font-medium text-white">Withdraw</span>
                </button>
                <button
                  onClick={() => setShowModal('transfer')}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 transition-all transform hover:scale-105"
                >
                  <Send size={24} className="text-white" />
                  <span className="text-sm font-medium text-white">Transfer</span>
                </button>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Achievements</h3>
                <Award className="text-yellow-400" size={24} />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`p-4 rounded-2xl border ${borderColor} text-center transition-all ${achievement.unlocked ? 'hover:scale-110' : 'opacity-40'
                      }`}
                  >
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className="text-xs font-medium">{achievement.name}</p>
                    {achievement.unlocked && <Check size={12} className="mx-auto mt-1 text-green-400" />}
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Performance Stats</h3>
                <TrendingUp className="text-green-500" size={24} />
              </div>

              <div className="space-y-4">
                {monthlyStats.map((stat, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className={textSecondary}>{stat.month}</span>
                      <span className="font-medium">W: {stat.wins} | L: {stat.losses}</span>
                    </div>
                    <div className="flex gap-1 h-8">
                      <div
                        className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg transition-all duration-500"
                        style={{ width: `${(stat.wins / maxGames) * 100}%` }}
                      ></div>
                      <div
                        className="bg-gradient-to-r from-red-500 to-orange-500 rounded-lg transition-all duration-500"
                        style={{ width: `${(stat.losses / maxGames) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor}`}>
              <h3 className="text-xl font-bold mb-6">Recent Games</h3>

              <div className="space-y-3">
                {transactions.map((tx) => (
                  <div
                    key={tx.id}
                    className={`flex items-center justify-between p-4 rounded-2xl border ${borderColor} hover:bg-white/5 transition-all cursor-pointer`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-xl text-2xl ${tx.type === 'won' || tx.type === 'deposit' ? 'bg-green-500/20' : 'bg-red-500/20'
                        }`}>
                        {tx.icon}
                      </div>
                      <div>
                        <p className="font-medium">{tx.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <p className={`text-xs ${textSecondary}`}>{tx.date}</p>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${tx.status === 'completed'
                            ? darkMode ? 'bg-green-500/20 text-green-400' : 'bg-green-100 text-green-700'
                            : darkMode ? 'bg-yellow-500/20 text-yellow-400' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                            {tx.status === 'completed' ? <Check size={12} className="inline" /> : <Clock size={12} className="inline" />}
                            {' '}{tx.status}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {tx.amount > 0 ? '+' : ''}{currencySymbols[selectedCurrency]}{(Math.abs(tx.amount) * exchangeRates[selectedCurrency]).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor}`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Leaderboard</h3>
                <Trophy className="text-yellow-500" size={24} />
              </div>

              <div className="space-y-3">
                {leaderboard.map((player) => (
                  <div
                    key={player.rank}
                    className={`flex items-center justify-between p-3 rounded-xl border ${borderColor} ${player.isUser || player.name === 'You' ? 'bg-green-500/10 border-green-500' : 'hover:bg-white/5'
                      } transition-all`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${player.rank === 1 ? 'bg-yellow-400 text-gray-900' :
                        player.rank === 2 ? 'bg-gray-400 text-gray-900' :
                          player.rank === 3 ? 'bg-orange-400 text-gray-900' :
                            'bg-slate-700'
                        }`}>
                        {player.rank}
                      </div>
                      <span className="text-2xl">{player.avatar}</span>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className={`text-xs ${textSecondary}`}>{player.wins} wins</p>
                      </div>
                    </div>
                    {(player.isUser || player.name === 'You') && <ChevronRight className="text-green-400" size={20} />}
                  </div>
                ))}
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <Target className="text-blue-500" size={24} />
                <h3 className="text-lg font-bold">Lifetime Stats</h3>
              </div>

              <div className="space-y-3">
                <div>
                  <p className={`text-sm ${textSecondary}`}>Total Winnings</p>
                  <p className="text-2xl font-bold text-green-400">+{currencySymbols[selectedCurrency]}{(stats.totalEarnings * (exchangeRates[selectedCurrency] / exchangeRates.GHS)).toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
                </div>
                <div>
                  <p className={`text-sm ${textSecondary}`}>Total Games</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.totalGames || 0}</p>
                </div>
                <div className={`pt-3 border-t ${borderColor}`}>
                  <p className={`text-sm ${textSecondary}`}>Win Rate</p>
                  <p className="text-3xl font-bold text-green-400">{(Number(stats.winRate) || 0).toFixed(1)}%</p>
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor} bg-gradient-to-br from-purple-500/10 to-pink-500/10`}>
              <div className="flex items-center gap-3 mb-4">
                <Gift className="text-purple-400" size={24} />
                <h3 className="text-lg font-bold">Reward Points</h3>
              </div>

              <div className="text-center py-4">
                <p className="text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  {(stats.rewardPoints || 0).toLocaleString()}
                </p>
                <p className={`text-sm ${textSecondary} mt-2`}>Points Available</p>

                <button className="w-full mt-4 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl font-medium hover:from-purple-600 hover:to-pink-600 transition-all transform hover:scale-105">
                  Redeem Rewards
                </button>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor}`}>
              <div className="flex items-center gap-3 mb-4">
                <Lock className="text-green-400" size={24} />
                <h3 className="text-lg font-bold">Security</h3>
              </div>

              <div className="space-y-3">
                <div className={`flex items-center justify-between p-3 rounded-xl border ${stats.security?.twoFactorEnabled ? 'border-green-500/50 bg-green-500/10' : 'border-gray-500/30'}`}>
                  <span className="text-sm">2FA Enabled</span>
                  {stats.security?.twoFactorEnabled ? <Check className="text-green-400" size={18} /> : <X className="text-gray-400" size={18} />}
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl border ${stats.security?.emailVerified ? 'border-green-500/50 bg-green-500/10' : 'border-yellow-500/50 bg-yellow-500/10'}`}>
                  <span className="text-sm">Email Verified</span>
                  {stats.security?.emailVerified ? <Check className="text-green-400" size={18} /> : <Clock className="text-yellow-400" size={18} />}
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl border ${stats.security?.phoneVerified ? 'border-green-500/50 bg-green-500/10' : 'border-red-500/30'}`}>
                  <span className="text-sm">Phone Verified</span>
                  {stats.security?.phoneVerified ? <Check className="text-green-400" size={18} /> : <X className="text-red-400" size={18} />}
                </div>
              </div>
            </div>

            <div className={`${cardBg} rounded-3xl p-6 shadow-2xl border ${borderColor} text-center`}>
              <QrCode className="mx-auto mb-3 text-blue-400" size={28} />
              <h3 className="text-lg font-bold mb-3">Player ID</h3>

              <div className={`${darkMode ? 'bg-white' : 'bg-gray-900'} p-4 rounded-2xl mb-3`}>
                <div className="flex justify-center p-2">
                  <QRCode
                    size={256}
                    style={{ height: "auto", maxWidth: "100%", width: "100%" }}
                    value={user?.id || 'PottaPool'}
                    viewBox={`0 0 256 256`}
                    bgColor={darkMode ? '#ffffff' : '#111827'}
                    fgColor={darkMode ? '#000000' : '#ffffff'}
                  />
                </div>
              </div>

              <p className={`text-sm font-mono ${textSecondary}`}>ID: {user?.id ? `PTG-${user.id.substring(0, 8).toUpperCase()}` : 'Loading...'}</p>
              <button
                onClick={async () => {
                  const idText = user?.id ? `PTG-${user.id.substring(0, 8).toUpperCase()}` : '';
                  try {
                    if (navigator.share) {
                      await navigator.share({
                        title: 'My Potta Pool ID',
                        text: `Add me on Potta Pool! My ID is: ${idText}`
                      });
                    } else if (navigator.clipboard && navigator.clipboard.writeText) {
                      await navigator.clipboard.writeText(idText);
                      showToast('ID copied to clipboard!', 'success');
                    } else {
                      // Fallback for older browsers
                      const textArea = document.createElement('textarea');
                      textArea.value = idText;
                      textArea.style.position = 'fixed';
                      textArea.style.left = '-999999px';
                      document.body.appendChild(textArea);
                      textArea.select();
                      try {
                        document.execCommand('copy');
                        showToast('ID copied to clipboard!', 'success');
                      } catch (err) {
                        showToast('Failed to copy ID', 'error');
                      }
                      document.body.removeChild(textArea);
                    }
                  } catch (err) {
                    console.error('Share error:', err);
                    showToast('Share failed', 'error');
                  }
                }}
                className="mt-3 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all"
              >
                Share ID
              </button>
            </div>

          </div>
        </div>
      </div>

      {showModal && renderModal(showModal)}

      {/* 2FA Confirmation Modal */}
      {show2FAModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className={"bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl relative border border-slate-700 text-white"}>
            <button
              onClick={() => {
                setShow2FAModal(false);
                setVerificationCode('');
              }}
              className="absolute top-4 right-4 p-2 hover:bg-slate-700 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-green-400" />
              </div>
              <h3 className="text-2xl font-bold mb-2 text-white">Confirm Transfer</h3>
              <p className="text-gray-400 text-sm">
                We've sent a 6-digit confirmation code to your email.
              </p>
              <p className="text-green-400 font-bold text-lg mt-2">
                Transfer Amount: {currencySymbols[selectedCurrency]}{pendingTransferAmount.toFixed(2)}
              </p>
            </div>

            <form onSubmit={handleConfirm2FA} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-300">Verification Code</label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                    setVerificationCode(value);
                  }}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-xl bg-slate-950 border border-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 text-center text-2xl font-bold tracking-widest text-white placeholder-gray-600"
                  autoFocus
                />
                <p className="text-xs text-gray-500 mt-2 text-center">Code expires in 10 minutes</p>
              </div>

              <button
                type="submit"
                disabled={verificationCode.length !== 6}
                className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${verificationCode.length === 6
                  ? 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white transform hover:scale-[1.02]'
                  : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                  }`}
              >
                Confirm Transfer
              </button>

              <button
                type="button"
                onClick={() => {
                  setShow2FAModal(false);
                  setVerificationCode('');
                  showToast('Transfer cancelled', 'info');
                }}
                className="w-full py-3 rounded-xl font-medium text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}