export default function invokeCallbackOnce(t) {
  let called = false;
  return [
    (e) => {
      if (!called) {
        called = true;
        if (t) {
          t(e);
        }
      }
    },
  ];
}
