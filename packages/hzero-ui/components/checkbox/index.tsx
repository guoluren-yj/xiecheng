import Checkbox from './Checkbox';
import Group from './Group';

import type { CheckboxProps, CheckboxChangeEvent } from './Checkbox';
import type { CheckboxGroupProps, CheckboxOptionType } from './Group';

export type {
  CheckboxProps, CheckboxChangeEvent,
  CheckboxGroupProps, CheckboxOptionType,
}

Checkbox.Group = Group;
export default Checkbox;
