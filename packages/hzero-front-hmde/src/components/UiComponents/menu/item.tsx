import React, { MouseEvent } from 'react';
import { MenuContext } from './context';

export class MenuItemInner extends React.PureComponent<any> {
  componentDidMount() {
    const { hotkey } = this.props;
    if (hotkey) {
      this.props.context.registerHotkey(hotkey, this.onHotkey);
    }
  }

  componentWillUnmount() {
    const { hotkey } = this.props;
    if (hotkey) {
      this.props.context.unregisterHotkey(hotkey, this.onHotkey);
    }
  }

  private onHotkey = () => {
    this.triggerHandler();
  };

  private onClick = (e: MouseEvent) => {
    this.triggerHandler(e);
  };

  private triggerHandler(e?: MouseEvent) {
    if (!this.props.disabled && !this.props.hidden) {
      if (this.props.name) {
        this.props.context.onClick(this.props.name, e);
      }

      if (this.props.onClick) {
        this.props.onClick();
      }
    }
  }

  render() {
    return (
      <div {...(MenuItemInner as any).getProps(this.props)}>
        {(MenuItemInner as any).getContent(this.props, this.onClick)}
      </div>
    );
  }
}

export const MenuItem: React.SFC<any> = (props) => (
  <MenuContext.Consumer>
    {(context) => <MenuItemInner context={context} {...props} />}
  </MenuContext.Consumer>
);
