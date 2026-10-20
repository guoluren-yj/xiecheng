import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { Button } from 'choerodon-ui/pro';
import type { ButtonProps } from 'choerodon-ui/pro/lib/button/Button';

interface DynamicBtnProps extends ButtonProps {
  // 按钮文字
  text?: string,
  // 按钮右侧元素
  extra: ReactNode,
  // 是否收起在更多里，DynamicButtons传递过来的属性
  inMenuItem?: boolean,
  // 个性化按钮函数参数列表
  customChildArgs?: any[],
}

const DynamicBtn = memo((props: DynamicBtnProps) => {

  const {
    text: normalText,
    extra,
    inMenuItem,
    customChildArgs,
    ...c7nBtnProps
  } = props;

  const buttonText = customChildArgs?.[0] || normalText;

  if (inMenuItem) return buttonText;

  return (
    <Button {...c7nBtnProps}>
      {buttonText}
      {extra}
    </Button>
  );
});

export default DynamicBtn;