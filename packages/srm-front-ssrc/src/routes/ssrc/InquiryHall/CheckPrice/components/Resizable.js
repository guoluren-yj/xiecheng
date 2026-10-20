import React, { useEffect, useRef, memo, useState } from 'react';
import { compose } from 'lodash';
import ResizeObserver from 'resize-observer-polyfill';

function Resizable({ children, calcTabWidth }) {
  const divRef = useRef(null);
  const [changeFlag, setChangeFlag] = useState(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setChangeFlag(true);
    });

    if (divRef.current) {
      resizeObserver.observe(divRef.current);
    }

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    if (changeFlag) {
      calcTabWidth();
      setChangeFlag(false);
    }
  }, [changeFlag]);

  return <div ref={divRef}>{children}</div>;
}

export default compose(memo)(Resizable);
