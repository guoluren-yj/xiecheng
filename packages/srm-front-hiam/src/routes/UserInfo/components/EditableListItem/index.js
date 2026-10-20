import React, { Component } from 'react';
import styles from './index.less';

export default class EditableListItem extends Component {
  render() {
    const { key, title, content, description } = this.props;
    return (
      <div key={key} className={styles['edit-list-item']}>
        <div className={styles['list-item-left']}>
          <div className={styles['list-item-title']}>{title}</div>
          <div className={styles['list-item-description']}>{description}</div>
        </div>
        <div className={styles['list-item-right']}>{content}</div>
      </div>
    );
  }
}
