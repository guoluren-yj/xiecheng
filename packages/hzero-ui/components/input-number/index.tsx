import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NInputNumber, { formatNumber, parseNumber } from 'choerodon-ui/lib/input-number';
import type { InputNumberProps, OmitAttrs } from 'choerodon-ui/lib/input-number';
import C7NInputNumberProps from './overwriteProps';

export type {
  InputNumberProps, OmitAttrs,
};

export {
  formatNumber, parseNumber,
}

const InputNumber: ForwardRefExoticComponent<InputNumberProps> = forwardRef<C7NInputNumber, InputNumberProps>((props, ref) => {
  return <C7NInputNumber {...C7NInputNumberProps} {...props} ref={ref} />;
});

InputNumber.displayName = 'InputNumber<hzeroWithC7n>';

export default InputNumber;
