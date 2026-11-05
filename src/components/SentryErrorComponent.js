import React from "react";
import T from "i18n-react/dist/i18n-react";

// webpack (JS chunks) and mini-css-extract-plugin (CSS chunks) both tag a failed
// lazy-route load with this name, e.g. after a deploy removes the old hashed chunks
export const isChunkLoadError = (error) => error?.name === "ChunkLoadError";

function FallbackComponent({ componentName, error, onReload }) {
  // React.lazy caches the rejected import, so re-rendering can't recover: only a reload refetches the chunk
  if (isChunkLoadError(error)) {
    return (
      <div>
        {T.translate("errors.chunk_load_error")}{" "}
        <button type="button" onClick={onReload}>
          {T.translate("errors.reload_page")}
        </button>
      </div>
    );
  }
  return <div>An error has occurred on <b>{componentName}</b> Component</div>;
}

// returns a Sentry.ErrorBoundary fallback render function, which receives the caught error
export const SentryFallbackFunction = ({ componentName, onReload = () => window.location.reload() }) => ({ error }) => (
  <FallbackComponent componentName={componentName} error={error} onReload={onReload} />
);
