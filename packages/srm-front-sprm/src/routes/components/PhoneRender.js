import React, { PureComponent } from 'react';

import { Select, Input } from 'hzero-ui';

export default class PhoneRender extends PureComponent {
  render() {
    const { internationalTelCode = [], disabled, record, ...otherProps } = this.props;
    const initValue = record.internationalTelCode || internationalTelCode[0]?.value;
    return (
      <div>
        <Select
          style={{ width: 100 }}
          disabled={disabled || otherProps.disabled}
          onChange={value => {
            record.$form.setFieldsValue({ internationalTelCode: value });
          }}
          defaultValue={initValue}
        >
          {internationalTelCode?.map(n => (
            <Select.Option key={n.value} value={n.value}>
              {n.meaning}
            </Select.Option>
          ))}
        </Select>
        <Input style={{ width: 150 }} disabled={disabled} {...otherProps} />
      </div>
    );
  }
}
