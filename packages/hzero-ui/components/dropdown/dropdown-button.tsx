import type { FunctionComponent } from 'react';
import React from 'react';
import type { DropdownButtonProps } from 'choerodon-ui/lib/dropdown/dropdown-button';
import DropDown from 'choerodon-ui/lib/dropdown';
import C7NButtonProps from '../button/overwriteProps';
import C7NDropdownProps from './overwriteProps';

const C7NDropdownButton = DropDown.Button;

export type {
  DropdownButtonProps,
};

const DropdownButton: FunctionComponent<DropdownButtonProps> = function DropdownButton(props) {
  return (
    <C7NDropdownButton
      buttonProps={C7NButtonProps}
      buttonGroupPrefixCls="ant-btn-group"
      {...C7NDropdownProps}
      {...props}
    />
  );
};
DropdownButton.displayName = 'DropdownButton<hzeroWithC7n>';

export default DropdownButton;
