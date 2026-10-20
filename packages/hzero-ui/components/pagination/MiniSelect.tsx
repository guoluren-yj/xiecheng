import * as React from 'react';
import { Size } from 'choerodon-ui/lib/_util/enum';
import type { OptionProps } from '../select';
import Select, { Option } from '../select';

export default class MiniSelect extends React.Component<any, any> {
  static Option = Option as React.ClassicComponentClass<OptionProps>;

  render() {
    return <Select size={Size.small} {...this.props} />;
  }
}
