import React from 'react';
import { Tooltip } from 'choerodon-ui/pro';
// import 'antd/es/tooltip/style';
import { Menu } from '../menu';
import { Dropdown } from '../dropdown';
import { ToolbarContext } from './context';
import styles from './style/index.less';

class ToolbarItemInner extends React.PureComponent<any> {
  handleClick = () => {
    this.processClick();
  };

  handleDropdownItemClick = (name?: string) => {
    this.processClick(name, false);
  };

  processClick(name = this.props.name, dropdown = this.props.dropdown) {
    if (!this.props.disabled && !dropdown) {
      if (name) {
        this.props.context.onClick(name);
      }

      if (this.props.onClick) {
        this.props.onClick(name);
      }
    }
  }

  renderButton() {
    const {
      className,
      hidden,
      disabled,
      active,
      icon,
      text,
      dropdown,
      dropdownArrow,
      tooltip,
      tooltipAsTitle,
      children,
    } = this.props;
    const { prefixCls } = this.props.context;

    const baseCls = `${prefixCls}-item`;
    const props: any = {
      onClick: this.handleClick,
      className: `${styles[baseCls]} ${className} ${hidden ? styles[`${baseCls}-hidden`] : ''} ${
        active ? styles[`${baseCls}-active`] : ''
      } ${disabled ? styles[`${baseCls}-disabled`] : ''} ${
        dropdown ? styles[`${baseCls}-dropdown`] : ''
      }`,
    };

    if (tooltip && tooltipAsTitle) {
      props.title = tooltip;
    }

    const button = (
      <button type="button" {...props}>
        {icon && React.isValidElement(icon) && (
          <span className={`${styles[`${baseCls}-icon`]}`}>{icon}</span>
        )}
        {(text || children) && (
          <span className={`${styles[`${baseCls}-text`]}`}>{text || children}</span>
        )}
        {dropdown && dropdownArrow && <span className={`${styles[`${baseCls}-dropdown-arrow`]}`} />}
      </button>
    );

    if (tooltip && !tooltipAsTitle && !disabled) {
      return (
        <Tooltip title={tooltip} placement="bottom" mouseEnterDelay={0} mouseLeaveDelay={0}>
          {button}
        </Tooltip>
      );
    }

    return button;
  }

  render() {
    const { dropdown, dropdownProps, disabled } = this.props;
    const content = this.renderButton();

    if (dropdown != null && !disabled) {
      const overlay = (
        <div>
          {dropdown.type === Menu
            ? React.cloneElement(dropdown, {
                onClick: this.handleDropdownItemClick,
              })
            : dropdown}
        </div>
      );

      const props = {
        trigger: ['click'],
        ...dropdownProps,
        disabled,
        overlay,
      };

      return <Dropdown {...props}>{content}</Dropdown>;
    }

    return content;
  }
}

export const ToolbarItem: any = (props) => (
  <ToolbarContext.Consumer>
    {(context) => <ToolbarItemInner context={context} {...props} />}
  </ToolbarContext.Consumer>
);

ToolbarItem.defaultProps = {
  dropdownArrow: true,
};
