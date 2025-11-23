import React, { Suspense } from 'react';

interface ChartWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

// Error Boundary pour les graphiques
class ChartErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback?: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Erreur dans le graphique:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="chart-error">
          <p>Erreur lors du chargement du graphique</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Wrapper pour les composants Chart.js
const ChartWrapper: React.FC<ChartWrapperProps> = ({
  children,
  fallback = <div className="chart-loading">Chargement du graphique...</div>
}) => {
  return (
    <ChartErrorBoundary fallback={fallback}>
      <Suspense fallback={fallback}>
        {children}
      </Suspense>
    </ChartErrorBoundary>
  );
};

export default ChartWrapper;
