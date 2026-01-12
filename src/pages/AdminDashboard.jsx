import React, { useState, useEffect } from 'react';
import { BarChart3, Users, Wallet, TrendingUp, Settings, Bell, Search, Menu, X, DollarSign, ArrowUpRight, ArrowDownRight, CreditCard, Eye, EyeOff, Download, Filter, MoreVertical, Shield, Activity, PieChart, LogOut, RefreshCw } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { useToast } from '../context/ToastContext';

export default function AdminDashboard() {
  const { showToast } = useToast();
  const [activeSection, setActiveSection] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState('GHS');
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    stats: { totalUsers: 0, totalWallets: 0, transactionVolume: 0, activeSessions: 0 },
    recentTransactions: [],
    topUsers: [],
    platformBalance: 0,
    monthlySummary: { totalDeposits: 0, totalWithdrawals: 0, netGrowth: 0 }
  });
  const [currencies, setCurrencies] = useState([
    { code: 'GHS', symbol: '₵', rate: 1, name: 'Ghanaian Cedi' },
    { code: 'USD', symbol: '$', rate: 0.062, name: 'US Dollar' },
  ]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
        const token = localStorage.getItem('token');

        // Fetch dashboard data
        const dashResponse = await fetch(`${apiUrl}/admin/dashboard`);
        const dashData = await dashResponse.json();
        if (dashResponse.ok) {
          setDashboardData(dashData);
        }

        // Fetch live currency rates
        if (token) {
          const ratesResponse = await fetch(`${apiUrl}/wallet/rates`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const ratesData = await ratesResponse.json();
          if (ratesResponse.ok) {
            // Convert to currency format, only keep GHS and USD
            const liveCurrencies = [
              { code: 'GHS', symbol: '₵', rate: ratesData.GHS || 1, name: 'Ghanaian Cedi' },
              { code: 'USD', symbol: '$', rate: ratesData.USD || 0.062, name: 'US Dollar' },
            ];
            setCurrencies(liveCurrencies);
          }
        }
      } catch (err) {
        console.error('Failed to fetch dashboard:', err);
        showToast('Failed to load dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, [showToast]);

  if (loading) return <LoadingSpinner text="Loading Admin Dashboard..." />;

  const sections = [
    { id: 'overview', name: 'Overview', icon: BarChart3 },
    { id: 'users', name: 'User Management', icon: Users },
    { id: 'wallets', name: 'Wallet Operations', icon: Wallet },
    { id: 'transactions', name: 'Transactions', icon: Activity },
    { id: 'analytics', name: 'Analytics', icon: PieChart },
    { id: 'settings', name: 'Settings', icon: Settings },
  ];

  const stats = [
    { label: 'Total Users', value: dashboardData.stats.totalUsers.toLocaleString(), change: '+12.5%', trend: 'up', icon: Users },
    { label: 'Total Wallets', value: dashboardData.stats.totalWallets.toLocaleString(), change: '+8.2%', trend: 'up', icon: Wallet },
    { label: 'Transaction Volume', value: convertAmount(dashboardData.stats.transactionVolume), change: '+23.1%', trend: 'up', icon: TrendingUp },
    { label: 'Active Sessions', value: dashboardData.stats.activeSessions.toLocaleString(), change: '-3.2%', trend: 'down', icon: Activity },
  ];

  const theme = darkMode ? {
    bg: 'bg-slate-950',
    card: 'bg-slate-900',
    border: 'border-slate-800',
    text: 'text-slate-100',
    textMuted: 'text-slate-400',
    accent: 'bg-gradient-to-r from-violet-600 to-indigo-600',
  } : {
    bg: 'bg-slate-50',
    card: 'bg-white',
    border: 'border-slate-200',
    text: 'text-slate-900',
    textMuted: 'text-slate-600',
    accent: 'bg-gradient-to-r from-violet-600 to-indigo-600',
  };

  const convertAmount = (amount) => {
    const currency = currencies.find(c => c.code === selectedCurrency);
    const converted = amount * currency.rate;
    return `${currency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const renderOverview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className={`${theme.card} ${theme.border} border rounded-xl p-6 transition-all hover:scale-105 hover:shadow-lg`}>
            <div className="flex items-center justify-between mb-4">
              <stat.icon className={`${theme.textMuted} w-8 h-8`} />
              <span className={`flex items-center text-sm ${stat.trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                {stat.trend === 'up' ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                {stat.change}
              </span>
            </div>
            <p className={`${theme.textMuted} text-sm mb-1`}>{stat.label}</p>
            <p className={`${theme.text} text-3xl font-bold`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`${theme.card} ${theme.border} border rounded-xl p-6`}>
          <h3 className={`${theme.text} text-xl font-semibold mb-6`}>Recent Transactions</h3>
          <div className="space-y-4">
            {dashboardData.recentTransactions.map((tx) => (
              <div key={tx.id} className={`flex items-center justify-between p-4 ${theme.bg} rounded-lg`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${theme.accent} flex items-center justify-center`}>
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className={`${theme.text} font-medium`}>{tx.user}</p>
                    <p className={`${theme.textMuted} text-sm`}>{tx.type} • {new Date(tx.time).toLocaleString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`${theme.text} font-semibold`}>{convertAmount(tx.amount)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${tx.status === 'completed' ? 'bg-green-500/20 text-green-500' :
                    tx.status === 'pending' ? 'bg-yellow-500/20 text-yellow-500' :
                      'bg-red-500/20 text-red-500'
                    }`}>
                    {tx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className={`${theme.card} ${theme.border} border rounded-xl p-6`}>
          <h3 className={`${theme.text} text-xl font-semibold mb-6`}>Top Users by Balance</h3>
          <div className="space-y-4">
            {dashboardData.topUsers.map((user, idx) => (
              <div key={idx} className={`flex items-center justify-between p-4 ${theme.bg} rounded-lg`}>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${theme.accent} flex items-center justify-center text-white font-bold`}>
                    {idx + 1}
                  </div>
                  <div>
                    <p className={`${theme.text} font-medium`}>{user.name}</p>
                    <p className={`${theme.textMuted} text-sm`}>{user.transactions} transactions</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`${theme.text} font-semibold`}>{convertAmount(user.balance)}</p>
                  <p className="text-green-500 text-sm">{user.growth}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderWallets = () => (
    <div className="space-y-6">
      {/* Currency Converter Card */}
      <div className={`${theme.card} ${theme.border} border rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className={`${theme.text} text-xl font-semibold`}>Currency Converter</h3>
          <RefreshCw className={`${theme.textMuted} w-5 h-5`} />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {currencies.map((currency) => (
            <button
              key={currency.code}
              onClick={() => setSelectedCurrency(currency.code)}
              className={`p-4 rounded-lg border transition-all ${selectedCurrency === currency.code
                ? `${theme.accent} text-white border-transparent shadow-lg`
                : `${theme.bg} ${theme.border} ${theme.text} hover:scale-105`
                }`}
            >
              <div className="text-2xl font-bold mb-1">{currency.symbol}</div>
              <div className="text-xs opacity-80">{currency.code}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Platform Balance */}
      <div className={`${theme.card} ${theme.border} border rounded-xl p-6`}>
        <div className="flex items-center justify-between mb-6">
          <h3 className={`${theme.text} text-xl font-semibold`}>Platform Balance</h3>
          <button onClick={() => setBalanceVisible(!balanceVisible)} className={`${theme.textMuted} hover:${theme.text}`}>
            {balanceVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
          </button>
        </div>
        <div className={`${theme.accent} rounded-xl p-8 text-white`}>
          <p className="text-sm opacity-80 mb-2">Total Platform Balance</p>
          <p className="text-4xl font-bold mb-4">{balanceVisible ? convertAmount(dashboardData.platformBalance) : '••••••••'}</p>

          {/* Multi-currency display */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/20">
            {currencies.filter(c => c.code !== selectedCurrency).map((currency) => (
              <div key={currency.code} className="text-center">
                <p className="text-xs opacity-70 mb-1">{currency.code}</p>
                <p className="text-sm font-semibold">{balanceVisible ? `${currency.symbol}${(dashboardData.platformBalance * currency.rate).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '••••••'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['Top Up Reserve', 'Withdraw Funds', 'Internal Transfer'].map((action, idx) => (
          <button key={idx} className={`${theme.card} ${theme.border} border rounded-xl p-6 hover:scale-105 transition-all hover:shadow-lg`}>
            <div className={`w-12 h-12 rounded-full ${theme.accent} flex items-center justify-center text-white mb-4`}>
              {idx === 0 ? <ArrowDownRight /> : idx === 1 ? <ArrowUpRight /> : <Activity />}
            </div>
            <p className={`${theme.text} font-semibold`}>{action}</p>
          </button>
        ))}
      </div>

      {/* Monthly Summary */}
      <div className={`${theme.card} ${theme.border} border rounded-xl p-6`}>
        <h3 className={`${theme.text} text-xl font-semibold mb-6`}>Monthly Summary ({selectedCurrency})</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className={`${theme.textMuted} text-sm mb-2`}>Total Deposits</p>
            <p className={`${theme.text} text-2xl font-bold`}>{convertAmount(dashboardData.monthlySummary.totalDeposits)}</p>
            <p className="text-green-500 text-sm mt-1">This Month</p>
          </div>
          <div>
            <p className={`${theme.textMuted} text-sm mb-2`}>Total Withdrawals</p>
            <p className={`${theme.text} text-2xl font-bold`}>{convertAmount(dashboardData.monthlySummary.totalWithdrawals)}</p>
            <p className="text-green-500 text-sm mt-1">This Month</p>
          </div>
          <div>
            <p className={`${theme.textMuted} text-sm mb-2`}>Net Growth</p>
            <p className={`${theme.text} text-2xl font-bold`}>{convertAmount(dashboardData.monthlySummary.netGrowth)}</p>
            <p className="text-green-500 text-sm mt-1">This Month</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'overview': return renderOverview();
      case 'wallets': return renderWallets();
      default: return (
        <div className={`${theme.card} ${theme.border} border rounded-xl p-12 text-center`}>
          <p className={`${theme.text} text-xl mb-2`}>{sections.find(s => s.id === activeSection)?.name}</p>
          <p className={`${theme.textMuted}`}>Content for this section coming soon</p>
        </div>
      );
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} transition-colors duration-300`}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full ${theme.card} ${theme.border} border-r transition-all duration-300 z-50 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${sidebarOpen ? 'w-64' : 'lg:w-20 w-64'}`}>
        <div className="flex items-center justify-between p-6">
          {sidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent">Admin Panel</h1>}
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className={`${theme.textMuted} lg:block`}>
            {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        <nav className="mt-8 space-y-2 px-3">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setActiveSection(section.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${activeSection === section.id
                ? `${theme.accent} text-white shadow-lg`
                : `${theme.textMuted} hover:${theme.text} hover:bg-slate-800/50`
                }`}
            >
              <section.icon className="w-5 h-5" />
              {sidebarOpen && <span className="font-medium">{section.name}</span>}
            </button>
          ))}
        </nav>

        {/* Logout Button */}
        {sidebarOpen && (
          <div className="absolute bottom-6 left-0 right-0 px-3">
            <button className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg ${theme.textMuted} hover:text-red-500 hover:bg-red-500/10 transition-all`}>
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <div className={`${sidebarOpen ? 'lg:ml-64' : 'lg:ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className={`${theme.card} ${theme.border} border-b px-4 lg:px-8 py-4 sticky top-0 z-40 backdrop-blur-lg bg-opacity-80`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => setSidebarOpen(true)} className={`lg:hidden ${theme.textMuted}`}>
                <Menu className="w-6 h-6" />
              </button>
              <div className={`relative hidden md:block`}>
                <Search className={`absolute left-3 top-1/2 -translate-y-1/2 ${theme.textMuted} w-5 h-5`} />
                <input
                  type="text"
                  placeholder="Search..."
                  className={`${theme.bg} ${theme.border} border rounded-lg pl-10 pr-4 py-2 w-60 lg:w-80 focus:outline-none focus:ring-2 focus:ring-violet-500`}
                />
              </div>
            </div>

            <div className="flex items-center gap-2 lg:gap-4">
              <button onClick={() => setDarkMode(!darkMode)} className={`${theme.textMuted} hover:${theme.text} p-2 rounded-lg hover:bg-slate-800/50`}>
                {darkMode ? '🌙' : '☀️'}
              </button>
              <button className={`${theme.textMuted} hover:${theme.text} relative p-2 rounded-lg hover:bg-slate-800/50`}>
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              <div className="hidden lg:flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full ${theme.accent}`}></div>
                <div>
                  <p className={`${theme.text} font-medium text-sm`}>Admin User</p>
                  <p className={`${theme.textMuted} text-xs`}>Super Admin</p>
                </div>
              </div>
              <div className={`lg:hidden w-10 h-10 rounded-full ${theme.accent}`}></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <div className="mb-8">
            <h2 className={`${theme.text} text-3xl font-bold mb-2`}>
              {sections.find(s => s.id === activeSection)?.name}
            </h2>
            <p className={theme.textMuted}>Manage and monitor your platform operations</p>
          </div>

          {renderSection()}
        </main>
      </div>
    </div>
  );
}