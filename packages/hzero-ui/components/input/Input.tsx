import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import type { AbstractInputProps, InputProps, InputSelection, InputState } from 'choerodon-ui/lib/input/Input';
import C7NInput from 'choerodon-ui/lib/input';
import C7NInputProps from './overwriteProps';

export type {
  InputSelection, AbstractInputProps, InputProps, InputState,
};

const Input: ForwardRefExoticComponent<InputProps> = forwardRef<C7NInput, InputProps>((props, ref) => {
  return <C7NInput {...C7NInputProps} {...props} ref={ref} />;
});

Input.displayName = 'Input<hzeroWithC7n>';

export default Input;
