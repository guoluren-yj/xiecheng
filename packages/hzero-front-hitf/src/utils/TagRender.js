import React from 'react';
import { Tag } from 'hzero-ui';

import styles from './index.less';

export default function TagRender(value, meaning = '', type = '') {
  if (typeof value === 'number') {
    if (type === 'encrypt' && value === 2) {
      // 接口加密已发布的状态
      return (
        <Tag
          className={styles['tag-content']}
          style={{ color: '#47b881', backgroundColor: 'rgba(71,184,129,0.10)' }}
        >
          {meaning || ''}
        </Tag>
      );
    }
    switch (value) {
      case 0:
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#F56349', backgroundColor: 'rgba(245,99,73,0.10)' }}
          >
            {meaning || ''}
          </Tag>
        );
      case 1:
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#47b881', backgroundColor: 'rgba(71,184,129,0.10)' }}
          >
            {meaning || ''}
          </Tag>
        );
      case 2:
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#F56349', backgroundColor: 'rgba(245,99,73,0.10)' }}
          >
            {meaning || ''}
          </Tag>
        );
      default:
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#fca400', backgroundColor: '#fef4e2' }}
          >
            {meaning || ''}
          </Tag>
        );
    }
  } else {
    switch (value && value.toUpperCase()) {
      case 'NEW':
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#F88D10', backgroundColor: 'rgba(252,160,0,0.10)' }}
          >
            {meaning || ''}
          </Tag>
        );
      case 'APPROVED':
      case '1':
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#47b881', backgroundColor: 'rgba(71,184,129,0.10)' }}
          >
            {meaning || ''}
          </Tag>
        );
      case 'REJECTED':
      case '0':
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#F56349', backgroundColor: 'rgba(245,99,73,0.10)' }}
          >
            {meaning || ''}
          </Tag>
        );
      case 'APPROVING':
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#F88D10', backgroundColor: 'rgba(252,160,0,0.10)' }}
          >
            {meaning || ''}
          </Tag>
        );
      default:
        return (
          <Tag
            className={styles['tag-content']}
            style={{ color: '#fca400', backgroundColor: '#fef4e2' }}
          >
            {meaning || ''}
          </Tag>
        );
    }
  }
}
