import React, { HTMLAttributes, CSSProperties, Key, useContext, useEffect, useRef } from 'react';
import classNames from 'classnames';
import isOverflow from 'choerodon-ui/pro/lib/overflow-tip/util';
import { hide, show } from 'choerodon-ui/pro/lib/tooltip/singleton';
import ConfigContext from '../config-provider/ConfigContext';

export interface BaseProps {
  id?: string | undefined;
  key?: Key | null | undefined;
  prefixCls?: string | undefined;
  className?: string | undefined;
  style?: CSSProperties | undefined;
  size?: 'medium' | 'small' | 'large' | 'extra-small' | 'extra-large' | undefined;
  lang?: string | undefined;
  hidden?: boolean | undefined;
  tabIndex?: number | undefined;
  direction?: 'ltr' | 'rtl' | undefined;
  autoFocus?: boolean;
}


export interface TextProps extends BaseProps, HTMLAttributes<HTMLSpanElement> {
  tooltip?: boolean;
}

const Text = function Text(props: TextProps) {
  const {
    prefixCls: customizePrefixCls,
    className,
    children,
    onMouseEnter,
    onMouseLeave,
    tooltip = true,
    ...rest
  } = props;
  const { getPrefixCls } = useContext(ConfigContext);
  const prefixCls = getPrefixCls('text', customizePrefixCls);
  const classString = classNames(`${prefixCls}-wrapper`, className);
  const tooltipRef = useRef<boolean | undefined>();
  const handleMouseEnter = (e) => {
    if (onMouseEnter) {
      onMouseEnter(e);
    }
    if (tooltip && !e.isDefaultPrevented()) {
      const { currentTarget } = e;
      const { textContent } = currentTarget;
      if (textContent && isOverflow(currentTarget)) {
        show(currentTarget, {
          title: textContent,
          placement: 'right',
        });
        tooltipRef.current = true;
      }
    }
  };

  const hideTooltip = () => {
    if (tooltip && tooltipRef.current) {
      hide();
      tooltipRef.current = false;
    }
  };

  const handleMouseLeave = (e) => {
    if (onMouseLeave) {
      onMouseLeave(e);
    }
    hideTooltip();
  };

  useEffect(() => {
    if (tooltip) {
      return hideTooltip;
    }
  }, [tooltip]);

  return (
    <span className={classString} {...rest}>
      <span
        className={prefixCls}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {children}
      </span>
    </span>
  );
};

Text.displayName = 'Text';
export default Text;
