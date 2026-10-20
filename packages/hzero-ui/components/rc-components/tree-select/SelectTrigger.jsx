import React from 'react';
import Trigger from '../trigger';
import classNames from 'classnames';

import { createRef } from './util';

const BUILT_IN_PLACEMENTS = {
  bottomLeft: {
    points: ['tl', 'bl'],
    offset: [0, 4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
    ignoreShake: true,
  },
  topLeft: {
    points: ['bl', 'tl'],
    offset: [0, -4],
    overflow: {
      adjustX: 0,
      adjustY: 1,
    },
    ignoreShake: true,
  },
};

class SelectTrigger extends React.Component {
  constructor() {
    super();

    this.triggerRef = createRef();
  }

  getDropdownTransitionName = () => {
    const { transitionName, animation, dropdownPrefixCls } = this.props;
    if (!transitionName && animation) {
      return `${dropdownPrefixCls}-${animation}`;
    }
    return transitionName;
  };

  forcePopupAlign = () => {
    const $trigger = this.triggerRef.current;

    if ($trigger) {
      $trigger.forcePopupAlign();
    }
  };

  render() {
    const {
      disabled, isMultiple,
      dropdownPopupAlign, dropdownMatchSelectWidth, dropdownClassName,
      dropdownStyle, onDropdownVisibleChange, getPopupContainer,
      dropdownPrefixCls, popupElement, open,
      children,
    } = this.props;

    // TODO: [Legacy] Use new action when trigger fixed: https://github.com/react-component/trigger/pull/86

    // When false do nothing with the width
    // ref: https://github.com/ant-design/ant-design/issues/10927
    let stretch;
    if (dropdownMatchSelectWidth !== false) {
      stretch = dropdownMatchSelectWidth ? 'width' : 'minWidth';
    }

    return (
      <Trigger
        ref={this.triggerRef}
        action={disabled ? [] : ['click']}
        popupPlacement="bottomLeft"
        builtinPlacements={BUILT_IN_PLACEMENTS}
        popupAlign={dropdownPopupAlign}
        prefixCls={dropdownPrefixCls}
        popupTransitionName={this.getDropdownTransitionName()}
        onPopupVisibleChange={onDropdownVisibleChange}
        popup={popupElement}
        popupVisible={open}
        getPopupContainer={getPopupContainer}
        stretch={stretch}
        popupClassName={classNames(
          dropdownClassName,
          {
            [`${dropdownPrefixCls}--multiple`]: isMultiple,
            [`${dropdownPrefixCls}--single`]: !isMultiple,
          },
        )}
        popupStyle={dropdownStyle}
      >
        {children}
      </Trigger>
    );
  }
}

export default SelectTrigger;
