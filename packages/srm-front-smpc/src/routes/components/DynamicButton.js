// 动态可变的按钮根据mobx控制
import React from 'react';
import { observer } from 'mobx-react-lite';
import { Button } from 'choerodon-ui/pro';

const DynamicButton = observer(({ dynamicProps, record, dataSet, ...props }) => {
  const mergeProps = { ...props };
  Object.keys(dynamicProps).forEach((propKey) => {
    const dynamicProp = dynamicProps[propKey];
    if (typeof dynamicProp === 'function') {
      mergeProps[propKey] =
        dynamicProp({ dataSet, record: record || dataSet || dataSet.create({}) }) ||
        mergeProps[propKey];
    } else {
      mergeProps[propKey] = dynamicProp || mergeProps[propKey];
    }
  });
  const { children, ...buttonProps } = mergeProps;
  return <Button {...buttonProps}>{children}</Button>;
});

export default DynamicButton;
