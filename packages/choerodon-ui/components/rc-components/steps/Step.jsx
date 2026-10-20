import React, { useCallback } from 'react';
import classNames from 'classnames';
import noop from 'lodash/noop';
import Text from '../../text';
import RenderIcon from './RenderIcon';
import Icon from '../../icon';

const Step = function Step(props) {
  const {
    className,
    prefixCls,
    style,
    itemWidth,
    status = 'wait',
    iconPrefix,
    icon,
    wrapperStyle,
    adjustMarginRight,
    stepNumber,
    description,
    title,
    progressDot,
    tailContent,
    onChange,
    onClick = noop,
    navigation,
    direction,
    extra,
    activeIndex,
    ...restProps
  } = props;

  const onClickItem = useCallback((e) => {
    onClick(e);
    if (onChange) {
      onChange(Number(stepNumber) - 1);
    }
  }, [stepNumber, onChange, onClick]);

  const classString = classNames(`${prefixCls}-item`, `${prefixCls}-item-${status}`, className, {
    [`${prefixCls}-item-custom`]: icon,
    [`${prefixCls}-item-active`]: activeIndex === Number(stepNumber) - 1,
  });
  const stepItemStyle = { ...style };
  if (itemWidth) {
    stepItemStyle.width = itemWidth;
  }
  if (adjustMarginRight) {
    stepItemStyle.marginRight = adjustMarginRight;
  }
  if (onChange) {
    stepItemStyle.cursor = 'pointer';
  }
  return (
    <div {...restProps} className={classString} style={stepItemStyle} onClick={onClickItem}>
      <div className={`${prefixCls}-item-tail`}>{tailContent}</div>
      <div className={`${prefixCls}-item-icon`}><RenderIcon {...props} /></div>
      <div className={`${prefixCls}-item-content`}>
        <div className={`${prefixCls}-item-title`}>
          <Text>{title}</Text>
          {extra && <span className={`${prefixCls}-item-title-extra`}>{extra}</span>}
          {navigation && <Icon type="navigate_next" className={`${prefixCls}-item-title-icon`} />}
        </div>
        {description ? <div className={`${prefixCls}-item-description`}>{direction === 'vertical' ? description : <Text>{description}</Text>}</div> : null}
      </div>
    </div>
  );
};

Step.displayName = 'RcStep';

export default Step;
