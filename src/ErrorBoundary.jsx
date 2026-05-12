import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Errore catturato dalla Scatola Nera:", error, errorInfo);
    this.setState({ errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', backgroundColor: '#03091B', color: 'white', minHeight: '100vh', fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#F87171', fontSize: '32px', marginBottom: '20px' }}>⚠️ Errore di Sistema (Scatola Nera)</h1>
          <p style={{ fontSize: '18px', marginBottom: '20px' }}>Qualcosa si è rotto. Fotografa questo errore o copialo per il team tecnico:</p>
          
          <div style={{ backgroundColor: '#131A33', padding: '20px', borderRadius: '12px', overflowX: 'auto', marginBottom: '20px' }}>
            <h2 style={{ color: '#FF8731', marginBottom: '10px' }}>Errore Esatto:</h2>
            <code style={{ color: '#FFF5EE', fontSize: '16px' }}>{this.state.error && this.state.error.toString()}</code>
          </div>

          <div style={{ backgroundColor: '#131A33', padding: '20px', borderRadius: '12px', overflowX: 'auto' }}>
            <h2 style={{ color: '#FF8731', marginBottom: '10px' }}>Stack Trace (Dove si trova):</h2>
            <pre style={{ color: '#94a3b8', fontSize: '12px' }}>{this.state.errorInfo && this.state.errorInfo.componentStack}</pre>
          </div>

          <button 
            onClick={() => { localStorage.clear(); window.location.href = '/'; }} 
            style={{ marginTop: '30px', padding: '15px 30px', backgroundColor: '#FF8731', color: '#03091B', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            Reset Totale (Cancella dati corrotti)
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;