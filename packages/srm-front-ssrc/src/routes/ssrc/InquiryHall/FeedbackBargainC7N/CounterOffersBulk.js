import React from 'react';
import { Form, Select, TextField, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

const CommonNumberField = ({ bargainType = '', current = {}, name, ...otherProps }) => {
  return bargainType === 'DISCOUNT_RATE' ? (
    <NumberField name={name} {...otherProps} />
  ) : (
    <C7nPrecisionInputNumber
      name={name}
      record={current}
      currency="quotationCurrencyCode"
      {...otherProps}
    />
  );
};

class CounterOffersBulk extends React.Component {
  render() {
    const { dataSet } = this.props;

    const { current } = dataSet || {};

    return (
      <Form dataSet={dataSet} columns={1} labelLayout="float">
        <Select name="bargainType" />
        <CommonNumberField
          name="bargainPrice"
          current={current}
          bargainType={current?.get('bargainType')}
          style={{ width: '100%' }}
        />
        <TextField name="bargainRemark" />
      </Form>
    );
  }
}

export default observer(CounterOffersBulk);
