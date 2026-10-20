import React from 'react';

import styles from '../index.less';

export default class Title extends React.Component {
  render() {
    const { title, children, className, ...other } = this.props;
    let titleClassName = styles.contentTitle;
    if (className) {
      titleClassName += `${className}`;
    }
    return (
      <div className={titleClassName} {...other}>
        <h3 className={styles['modal-content-title-h3']}>{title}</h3>
        {children}
      </div>
    );
  }
}
