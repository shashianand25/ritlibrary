import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { AlertCircle, RefreshCw } from 'lucide-react';
import logger from '../utils/logger.js';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    logger.error('Unhandled React Render Error:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#0a0d14] text-white flex items-center justify-center p-6 font-sans">
          <div className="max-w-md w-full p-8 rounded-3xl bg-neutral-900 border border-white/10 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4 text-rose-400">
              <AlertCircle size={30} />
            </div>
            <h2 className="text-xl font-extrabold text-white mb-2">Something went wrong</h2>
            <p className="text-sm text-neutral-400 mb-6">
              An unexpected error occurred while rendering this page.
            </p>
            <button
              type="button"
              onClick={this.handleReset}
              className="px-6 py-2.5 rounded-xl bg-lime-400 text-neutral-950 font-bold text-sm hover:bg-lime-300 transition-all flex items-center justify-center gap-2 mx-auto cursor-pointer"
            >
              <RefreshCw size={15} /> Reload Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.node,
};

export default ErrorBoundary;
