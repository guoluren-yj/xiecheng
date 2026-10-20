import React from 'react';
import { ToolbarContext } from './context';
import styles from './style/index.less';

export const ToolbarGroup: React.SFC<any> = ({ children, className }) => (
  <ToolbarContext.Consumer>
    {() => <div className={`${styles[`x6-toolbar-group`]} ${className}`}>{children}</div>}
  </ToolbarContext.Consumer>
);
