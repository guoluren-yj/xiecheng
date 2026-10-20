import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
import classNames from 'classnames';
import styles from './index.less';

// 详情表单常见的区域容器
export function SubContent(props) {
  const { id, title, children, style, bodyStyle, className } = props;
  return (
    <div
      id={id}
      style={style}
      className={classNames({
        [className]: !!className,
        [styles['sub-content-container']]: true,
      })}
    >
      <div
        className={classNames({
          [styles['sub-content-header']]: true,
        })}
      >
        <span
          className={classNames({
            [styles['sub-content-title']]: true,
          })}
        >
          {title}
        </span>
      </div>
      <div
        className={classNames({
          [styles['sub-content-body']]: true,
        })}
        style={bodyStyle}
      >
        {children}
      </div>
    </div>
  );
}

// 带左边线的卡片容器
export function Card(props) {
  const { id, dot, title, children, style, bodyStyle, className } = props;
  return (
    <div
      id={id}
      style={style}
      className={classNames({
        [className]: !!className,
        [styles['card-container']]: true,
      })}
    >
      <div
        className={classNames({
          [styles['card-header']]: true,
        })}
      >
        <span
          className={classNames({
            [styles['card-title']]: true,
          })}
        >
          {title}
        </span>
        {dot && (
          <Tooltip placement="bottom" title={dot}>
            <span
              className={classNames({
                [styles['card-dot']]: true,
              })}
            />
          </Tooltip>
        )}
      </div>
      <div
        style={bodyStyle}
        className={classNames({
          [styles['card-body']]: true,
        })}
      >
        {children}
      </div>
    </div>
  );
}
