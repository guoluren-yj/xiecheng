import React, { MouseEvent } from 'react';
import classNames from 'classnames';
import { MenuContext } from './context';

export class Menu extends React.PureComponent<any> {
  private onClick = (name: string, e?: MouseEvent) => {
    if (this.props.stopPropagation && e != null) {
      e.stopPropagation();
    }

    if (this.props.onClick) {
      this.props.onClick(name);
    }
  };

  private registerHotkey = (hotkey: string, handler: () => any) => {
    if (this.props.registerHotkey) {
      this.props.registerHotkey(hotkey, handler);
    }
  };

  private unregisterHotkey = (hotkey: string, handler: () => any) => {
    if (this.props.unregisterHotkey) {
      this.props.unregisterHotkey(hotkey, handler);
    }
  };

  render() {
    const { prefixCls, className, children, hasIcon } = this.props;
    const baseCls = `${prefixCls}-menu`;
    const ContextProvider = MenuContext.Provider;
    const contextValue: any = {
      prefixCls: baseCls,
      onClick: this.onClick,
      registerHotkey: this.registerHotkey,
      unregisterHotkey: this.unregisterHotkey,
    };

    return (
      <div
        className={classNames(
          baseCls,
          {
            [`${baseCls}-has-icon`]: hasIcon,
          },
          className
        )}
      >
        <ContextProvider value={contextValue}>{children}</ContextProvider>
      </div>
    );
  }
}
