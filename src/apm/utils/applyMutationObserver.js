export default function applyMutationObserver(MutationObserver, callback) {
  const mutationObserver = MutationObserver && new MutationObserver(callback);
  return [
    (e, t) => {
      mutationObserver && e && mutationObserver.observe(e, t);
    },
    () => mutationObserver && mutationObserver.disconnect(),
  ];
}
