import React from 'react';
import styles from './index.less';

function HeadLine(props) {
  const { title, style, children } = props;
  return (
    <div
      className={styles['header-line-global']}
      style={{ marginLeft: 11, fontWeight: 600, fontSize: '14px', ...style }}
    >
      {title}
      {children}
    </div>
  );
}

export default HeadLine;
