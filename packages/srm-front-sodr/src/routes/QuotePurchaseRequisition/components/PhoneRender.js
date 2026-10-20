import React, { PureComponent } from 'react';
import { Select } from 'hzero-ui';

import { TooltipInput } from '@/routes/components/TooltipFormItem';

export default class PhoneRender extends PureComponent {
  render() {
    const { internationalTelCode, disabled, record, ...otherProps } = this.props;
    // const initValue = record.internationalTelCode || internationalTelCode[0].value;
    const initValue = record.internationalTelCode;
    return (
      <div style={{ display: 'flex' }}>
        <Select
          style={{ width: 120 }}
          disabled={disabled || otherProps.disabled}
          onChange={(value) => {
            record.$form.setFieldsValue({ internationalTelCode: value });
          }}
          defaultValue={initValue}
        >
          {internationalTelCode.map((n) => (
            <Select.Option key={n.value} value={n.value}>
              {n.meaning}
            </Select.Option>
          ))}
        </Select>
        <TooltipInput style={{ width: 150 }} disabled={disabled} {...otherProps} />
      </div>
    );
  }
}
