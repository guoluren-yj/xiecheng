import React, { useEffect, useState } from 'react';
import classNames from 'classnames';

import style from './index.less';

let timer;
export default function Loading(props) {
  const { size = 'normal', color } = props;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    timer = setTimeout(() => {
      setVisible(true);
    }, 500);
    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <>
      {visible && (
        <div
          className={classNames({
            [style['gb-loading']]: true,
            [style[`loading-${size}`]]: !!size,
            [style[`loading-color`]]: !!color,
          })}
        >
          <i />
          <i />
          <i />
          <i />
        </div>
      )}
    </>
  );
}
