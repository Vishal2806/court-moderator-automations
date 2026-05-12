import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '3rem',
          maxWidth: '640px',
          margin: '4rem auto',
          borderLeft: '4px solid #b91c1c',
          background: '#fef2f2',
          fontFamily: "'Georgia', serif"
        }}>
          <h2 style={{ color: '#7f1d1d', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
            Application Error
          </h2>
          <p style={{ color: '#374151', marginBottom: '1rem' }}>
            {this.state.error?.message || 'An unexpected error occurred. Please refresh the page.'}
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              padding: '0.5rem 1.25rem',
              background: '#7f1d1d',
              color: '#fff',
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'inherit',
              fontSize: '0.875rem'
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;