import { useRef } from 'react';

export default function useLatest(val) {
  const ref = useRef(val);
  ref.current = val;
  return ref;
}
