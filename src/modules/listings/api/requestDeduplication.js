// Share only concurrent identical reads. Settled results are discarded so new
// form sessions always see current catalog options and validation configuration.
export const createDeduplicatedReader = (read) => {
  const pending = new Map();
  return (path, params = {}) => {
    const key = JSON.stringify([path, Object.entries(params).sort(([a], [b]) => a.localeCompare(b))]);
    if (!pending.has(key)) {
      const request = Promise.resolve().then(() => read(path, params));
      pending.set(key, request);
      const cleanup = () => { if (pending.get(key) === request) pending.delete(key); };
      request.then(cleanup, cleanup);
    }
    return pending.get(key);
  };
};
