import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);

        // Handle chunk load errors (failed to fetch dynamically imported module)
        if (error.name === 'TypeError' &&
            (error.message.includes('Failed to fetch dynamically imported module') ||
                error.message.includes('importing module'))) {
            console.log('Detected chunk load error, reloading page...');
            window.location.reload();
            return;
        }

        this.setState({ error, errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-8">
                    <h1 className="text-3xl font-bold text-red-500 mb-4">Something went wrong.</h1>
                    <div className="bg-slate-800 p-6 rounded-xl border border-red-500/30 max-w-2xl w-full overflow-auto">
                        <p className="font-mono text-red-300 mb-2">{this.state.error && this.state.error.toString()}</p>
                        <pre className="font-mono text-xs text-slate-400 whitespace-pre-wrap">
                            {this.state.errorInfo && this.state.errorInfo.componentStack}
                        </pre>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-8 px-6 py-3 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all"
                    >
                        Reload Application
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
