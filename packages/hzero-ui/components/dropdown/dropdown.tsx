import type { FunctionComponent } from 'react';
import React from 'react';
import type { DropDownProps } from 'choerodon-ui/lib/dropdown/dropdown';
import C7NDropDown from 'choerodon-ui/lib/dropdown';
import C7NDropdownProps from './overwriteProps';
import DropdownButton from './dropdown-button';

export type {
  DropDownProps,
};

const Dropdown: FunctionComponent<DropDownProps> = function Dropdown(props) {
  return <C7NDropDown {...C7NDropdownProps} {...props} />;
};
Dropdown.displayName = 'Dropdown<hzeroWithC7n>';

type DropdownType = typeof Dropdown & { Button: typeof DropdownButton };

(Dropdown as DropdownType).Button = DropdownButton;

export default Dropdown as DropdownType;
