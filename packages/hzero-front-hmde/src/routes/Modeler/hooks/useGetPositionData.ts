// eslint-disable-next-line no-unused-vars
import { useState, useEffect, useRef } from 'react';

export default (initData = {}) => {
  const ref = useRef();
  const [positionData, setPositionData] = useState(initData);
  useEffect(() => {
    if (ref.current) {
      setPositionData(ref.current as any);
    }
  }, [ref.current]);
  return [ref, positionData];
};
