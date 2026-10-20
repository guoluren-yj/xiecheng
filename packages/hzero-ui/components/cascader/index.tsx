import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NCascader from 'choerodon-ui/lib/cascader';
import type {
  CascaderExpandTrigger,
  CascaderLocale,
  CascaderOptionType,
  CascaderProps,
  CascaderState,
  FieldNamesType,
  FilledFieldNamesType,
  MenuMode,
  ShowSearchType,
} from 'choerodon-ui/lib/cascader';
import C7NInputProps from '../input/overwriteProps';

export type {
  CascaderState,
  CascaderProps,
  CascaderOptionType,
  FieldNamesType,
  FilledFieldNamesType,
  CascaderExpandTrigger,
  ShowSearchType,
  MenuMode,
  CascaderLocale,
};

const Cascader: ForwardRefExoticComponent<CascaderProps> = forwardRef<C7NCascader, CascaderProps>((props, ref) => {
  return <C7NCascader {...C7NInputProps} prefixCls="ant-cascader" inputPrefixCls={C7NInputProps.prefixCls} {...props} ref={ref} />;
});

Cascader.displayName = 'Cascader<hzeroWithC7n>';

export default Cascader;
