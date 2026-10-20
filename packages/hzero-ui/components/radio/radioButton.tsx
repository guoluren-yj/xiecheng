import type { ForwardRefExoticComponent} from 'react';
import React, { forwardRef, memo, useContext } from 'react';
import RadioContext from 'choerodon-ui/lib/radio/RadioContext';
import Radio from 'choerodon-ui/lib/radio';
import type { RadioButtonProps } from 'choerodon-ui/lib/radio/radioButton';

export type {
  RadioButtonProps,
};

const RadioButton: ForwardRefExoticComponent<RadioButtonProps> = forwardRef<Radio, RadioButtonProps>((props, ref) => {
  const { radioGroup } = useContext(RadioContext);
  const radioProps: RadioButtonProps = { ...props };
  if (radioGroup) {
    radioProps.checked = props.value === radioGroup.value;
    radioProps.disabled = props.disabled || radioGroup.disabled;
  }

  return <Radio prefixCls="ant-radio-button" {...radioProps} ref={ref} />;
});

RadioButton.displayName = 'RadioButton<hzeroWithC7n>';

export default memo(RadioButton);
