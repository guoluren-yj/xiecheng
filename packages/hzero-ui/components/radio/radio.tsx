import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NRadio from 'choerodon-ui/lib/radio';
import RadioGroup from './group';
import RadioButton from './radioButton';
import type { RadioProps } from './interface';

const Radio: ForwardRefExoticComponent<RadioProps> = forwardRef<C7NRadio, RadioProps>((props, ref) => {
  return <C7NRadio prefixCls="ant-radio" {...props} ref={ref} />;
});

Radio.displayName = 'Radio<hzeroWithC7n>';

type RadioType = typeof Radio & { Group: typeof RadioGroup; Button: typeof RadioButton };

(Radio as RadioType).Group = RadioGroup;
(Radio as RadioType).Button = RadioButton;

export default Radio as RadioType;
