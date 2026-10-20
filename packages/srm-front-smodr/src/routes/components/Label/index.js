import React from 'react';

import styles from './index.less';
import style from './value.less';

const Title = (props) => (
  <div
    className={styles.labelTitle}
    style={{
      marginBottom: '4px',
      width: '280px',
      marginRight: '16px',
      ...props.style,
    }}
  >
    {props.children}
  </div>
);
const Value = (props) => (
  <div
    className={style.labeltValue}
    style={{
      fontWeight: 600,
      width: '280px',
      marginRight: '16px',
      marginBottom: '16px',
      ...props.style,
    }}
  >
    {props.children || '-'}
  </div>
);

export { Title, Value };
