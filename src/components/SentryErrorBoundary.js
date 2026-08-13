import React, { Component } from "react";
import { SentryFallbackFunction } from "./SentryErrorComponent";

class SentryErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { Sentry: null, hasError: false };
  }

  // Makes this component itself a real error boundary, active from the very
  // first render - the Sentry-backed ErrorBoundary below only becomes
  // available after its chunk loads, so without this there is a window
  // (every initial mount) with no boundary at all.
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, info) {
    // Best-effort report: only reachable if this boundary caught the error
    // itself rather than the nested Sentry.ErrorBoundary (e.g. during the
    // bootstrap window before the chunk loads, or if Sentry is disabled).
    const { Sentry } = this.state;
    if (Sentry) {
      Sentry.captureException(error, { extra: info });
    }
  }

  componentDidMount() {
    if (window.SENTRY_DSN && window.SENTRY_DSN !== "") {
      import("../sentry-init").then(({ initSentry }) => {
        const Sentry = initSentry();
        this.setState({ Sentry });
      });
    }
  }

  render() {
    const { Sentry, hasError } = this.state;
    const { children, componentName } = this.props;

    if (hasError) {
      return SentryFallbackFunction({ componentName });
    }

    if (Sentry) {
      const { ErrorBoundary } = Sentry;
      return (
        <ErrorBoundary
          fallback={SentryFallbackFunction({ componentName })}
        >
          {children}
        </ErrorBoundary>
      );
    }

    return children;
  }
}

export default SentryErrorBoundary;