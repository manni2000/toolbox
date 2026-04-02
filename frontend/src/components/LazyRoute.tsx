import { Suspense, lazy, ComponentType } from 'react';
import ErrorBoundary from './ErrorBoundary';
import { ToolPageSkeleton } from './LoadingSkeleton';

interface LazyRouteProps {
  component: ComponentType<any>;
  fallback?: React.ReactNode;
}

export const LazyRoute = ({ component: Component, fallback }: LazyRouteProps) => {
  return (
    <ErrorBoundary>
      <Suspense fallback={fallback || <ToolPageSkeleton />}>
        <Component />
      </Suspense>
    </ErrorBoundary>
  );
};

// Helper to create lazy-loaded routes
export const createLazyRoute = (importFn: () => Promise<{ default: ComponentType<any> }>) => {
  const LazyComponent = lazy(importFn);
  return () => <LazyRoute component={LazyComponent} />;
};
