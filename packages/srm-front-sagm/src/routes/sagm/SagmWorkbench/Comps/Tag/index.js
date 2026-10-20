import React from 'react';
import classNames from 'classnames';
import styles from './index.less';

export default function Tag({ text, type }) {
  return (
    <span className={classNames({ [styles.tag]: true, [styles[`tag-${type}`]]: true })}>
      {text}
    </span>
  );
}
