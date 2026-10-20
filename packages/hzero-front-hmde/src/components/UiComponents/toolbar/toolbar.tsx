/* eslint-disable */
import React from 'react';
import { ToolbarContext } from './context';
import styles from './style/index.less';

export class Toolbar extends React.PureComponent<any> {
  onClick = (key: string, value?: any) => {
    if (this.props.onClick) {
      this.props.onClick(key, value);
    }
  };

  render() {
    const { className, children, extra, size, align, hoverEffect } = this.props;

    const baseCls = `x6-toolbar`;
    return (
      <div
        className={`${styles[baseCls]} ${className ? className : ''} ${
          size && `${baseCls}-${size}`
        } ${align === 'right' ? `${baseCls}-align-right` : ''} ${
          hoverEffect ? `${baseCls}-hover-effect` : ''
        }`}
      >
        <div className={`${styles[`${baseCls}-content`]}`}>
          <div className={`${styles[`${baseCls}-content-inner`]}`}>
            <ToolbarContext.Provider
              value={{
                prefixCls: baseCls,
                onClick: this.onClick,
              }}
            >
              {children}
            </ToolbarContext.Provider>
          </div>
          {extra && <div className={`${styles[`${baseCls}-content-extras`]}`}>{extra}</div>}
        </div>
      </div>
    );
  }
}
