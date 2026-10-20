/**
 * 控制button 是否展示Popover
 * @date: 2021-08-10
 * @description h0的Popover会导致h0的button缺少margin; c7n的Popover会导致h0的button hover移出的时候popover不隐藏
 */
import React from 'react';
import { Button as H0Button } from 'hzero-ui';
import { Button as C7NButton, Popover } from 'choerodon-ui';
import { Button as C7NProButton } from 'choerodon-ui/pro';

export default function PopoverButton(props) {
  const {
    btnType,
    showPopover = false,
    content,
    placement = 'topLeft',
    children,
    ...btnPorps
  } = props;
  let BtnComp;
  switch (btnType) {
    case 'c7n':
      BtnComp = C7NButton;
      break;
    case 'h0':
      BtnComp = H0Button;
      break;
    case 'c7n-pro':
    default:
      BtnComp = C7NProButton;
  }

  return showPopover ? (
    <Popover placement={placement} content={content}>
      <BtnComp {...btnPorps}>{children}</BtnComp>
    </Popover>
  ) : (
    <BtnComp {...btnPorps}>{children}</BtnComp>
  );
}
