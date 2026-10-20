import React from 'react';
import { DatePicker } from 'hzero-ui';
import moment from 'moment';

export default class PriceInput extends React.Component {
  triggerChange = (changedValue) => {
    const { onChange } = this.props;
    if (onChange) {
      onChange(changedValue);
    }
  };

  render() {
    const { value, format, ...restPops } = this.props;
    return (
      <DatePicker
        {...restPops}
        format={format}
        value={value ? moment(value, format) : null}
        onChange={(date) => {
          const newValue = date ? moment(date).format(format) : null;
          this.triggerChange(newValue);
        }}
      />
    );
  }
}
