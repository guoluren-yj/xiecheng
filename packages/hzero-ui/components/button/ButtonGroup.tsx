import type { FunctionComponent } from 'react';
import React from 'react';
import type { ButtonGroupProps } from 'choerodon-ui/lib/button/ButtonGroup';
import C7NButton from 'choerodon-ui/lib/button';

const C7NButtonGroup = C7NButton.Group;

export {
  ButtonGroupProps,
};

const ButtonGroup: FunctionComponent<ButtonGroupProps> = function ButtonGroup(props) {
  return <C7NButtonGroup prefixCls="ant-btn-group" {...props} />;
};

ButtonGroup.displayName = 'ButtonGroup<hzeroWithC7n>';

export default ButtonGroup;
