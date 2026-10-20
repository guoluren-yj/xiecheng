/**
 * Input Box is in different position for different mode.
 * This not the same design as `Select` cause it's followed by antd 0.x `Select`.
 * We will not follow the new design immediately since antd 3.x is already released.
 *
 * So this file named as Selector to avoid confuse.
 */

import React from 'react';
import classNames from 'classnames';
import { createRef } from '../util';
import TreeSelectContext from '../TreeSelectContext';

export default function (modeName) {
  class BaseSelector extends React.Component {
    static get contextType() {
      return TreeSelectContext;
    }

    static defaultProps = {
      tabIndex: 0,
    };

    constructor(props, context) {
      super(props, context);

      this.domRef = createRef();
    }

    onFocus = (...args) => {
      const { onFocus, focused } = this.props;
      const { rcTreeSelect: { onSelectorFocus } } = this.context;

      if (!focused) {
        onSelectorFocus();
      }

      if (onFocus) {
        onFocus(...args);
      }
    };

    onBlur = (...args) => {
      const { onBlur } = this.props;
      const { rcTreeSelect: { onSelectorBlur } } = this.context;

      // TODO: Not trigger when is inner component get focused
      onSelectorBlur();

      if (onBlur) {
        onBlur(...args);
      }
    };

    focus = () => {
      this.domRef.current.focus();
    };

    blur = () => {
      this.domRef.current.focus();
    };

    renderClear() {
      const { prefixCls, allowClear, valueList } = this.props;
      const { rcTreeSelect: { onSelectorClear } } = this.context;

      if (!allowClear || !valueList.length || !valueList[0].value) {
        return null;
      }

      return (
        <span
          key="clear"
          className={`${prefixCls}-selection__clear`}
          onClick={onSelectorClear}
        />
      );
    }

    renderArrow() {
      const { prefixCls, showArrow } = this.props;
      if (!showArrow) {
        return null;
      }

      return (
        <span
          key="arrow"
          className={`${prefixCls}-arrow`}
          style={{ outline: 'none' }}
        >
          <b />
        </span>
      );
    }

    render() {
      const {
        prefixCls, className, style,
        open, focused, disabled, allowClear,
        onClick,
        ariaId,
        renderSelection, renderPlaceholder,
        tabIndex,
      } = this.props;
      const { rcTreeSelect: { onSelectorKeyDown } } = this.context;

      let myTabIndex = tabIndex;
      if (disabled) {
        myTabIndex = null;
      }

      return (
        <span
          style={style}
          onClick={onClick}
          className={classNames(
            className,
            prefixCls,
            {
              [`${prefixCls}-open`]: open,
              [`${prefixCls}-focused`]: open || focused,
              [`${prefixCls}-disabled`]: disabled,
              [`${prefixCls}-enabled`]: !disabled,
              [`${prefixCls}-allow-clear`]: allowClear,
            },
          )}
          ref={this.domRef}
          role="combobox"
          aria-expanded={open}
          aria-owns={open ? ariaId : undefined}
          aria-controls={open ? ariaId : undefined}
          aria-haspopup="listbox"
          aria-disabled={disabled}
          tabIndex={myTabIndex}
          onFocus={this.onFocus}
          onBlur={this.onBlur}
          onKeyDown={onSelectorKeyDown}
        >
          <span
            key="selection"
            className={classNames(
              `${prefixCls}-selection`,
              `${prefixCls}-selection--${modeName}`,
            )}
          >
            {renderSelection()}
            {this.renderClear()}
            {this.renderArrow()}

            {renderPlaceholder && renderPlaceholder()}
          </span>
        </span>
      );
    }
  }

  return BaseSelector;
}
