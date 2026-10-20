import type { FunctionComponent } from 'react';
import React from 'react';
import C7NSlider from 'choerodon-ui/lib/slider';
import type { HandleGeneratorFn, SliderMarks, SliderProps, SliderState, SliderValue } from 'choerodon-ui/lib/slider';

export type {
  HandleGeneratorFn, SliderMarks, SliderProps, SliderState, SliderValue,
};

const Slider: FunctionComponent<SliderProps> = function Slider(props) {
  return <C7NSlider prefixCls="ant-slider" tooltipPrefixCls="ant-tooltip" {...props} />;
};

Slider.displayName = 'Slider<hzeroWithC7n>';

export default Slider;
