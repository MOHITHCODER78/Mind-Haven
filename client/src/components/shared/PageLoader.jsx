import { Suspense } from 'react';

function SpinnerFallback() {
  return (
    <div className="page-loader" role="status" aria-label="Loading page">
      <div className="page-loader-spinner" />
      <span>Loading&hellip;</span>
    </div>
  );
}

function PageLoader({ children }) {
  return <Suspense fallback={<SpinnerFallback />}>{children}</Suspense>;
}

export default PageLoader;
