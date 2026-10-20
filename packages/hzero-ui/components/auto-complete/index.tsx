import type { ForwardRefExoticComponent } from 'react';
import React, { forwardRef } from 'react';
import C7NAutoComplete from 'choerodon-ui/lib/auto-complete';
import type {
  AutoCompleteInputProps,
  AutoCompleteProps,
  DataSourceItemObject,
  DataSourceItemType,
  ValidInputElement,
} from 'choerodon-ui/lib/auto-complete';
import C7NSelectProps from '../select/overwriteProps';
import C7NInputProps from '../input/overwriteProps';

export type {
  AutoCompleteInputProps, AutoCompleteProps, DataSourceItemObject, DataSourceItemType, ValidInputElement,
};

const { OptGroup, Option } = C7NAutoComplete;

export { OptGroup, Option };

const AutoComplete: ForwardRefExoticComponent<AutoCompleteProps> = forwardRef<C7NAutoComplete, AutoCompleteProps>((props, ref) => {
  return <C7NAutoComplete {...C7NSelectProps} inputProps={C7NInputProps} {...props} ref={ref} />;
});

AutoComplete.displayName = 'AutoComplete<hzeroWithC7n>';

type AutoCompleteType = typeof AutoComplete & {
  Option: typeof Option;
  OptGroup: typeof OptGroup;
}

(AutoComplete as AutoCompleteType).Option = Option;
(AutoComplete as AutoCompleteType).OptGroup = OptGroup;

export default AutoComplete as AutoCompleteType;
