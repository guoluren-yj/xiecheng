import React, { Component } from 'react';
import { Form, Select, TextArea, NumberField } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

const CommonNumberFields = ({ current, bargainType, name }) => {
  const style = { width: '100%' };
  return bargainType === 'DISCOUNT_RATE' ? (
    <NumberField name={name} style={style} />
  ) : (
    <C7nPrecisionInputNumber
      name={name}
      record={current}
      style={style}
      currency="quotationCurrencyCode"
    />
  );
};

@observer
class BatchInputPrice extends Component {
  render() {
    const { hiddenRemark = false, dataSet } = this.props;
    const { current } = dataSet || {};

    let bargainType = null;

    if (current) {
      bargainType = current.get('bargainType');
    }

    return (
      <div>
        <Form dataSet={dataSet} columns={1} labelLayout="float">
          <Select name="bargainType" />
          <CommonNumberFields name="bargainPrice" current={current} bargainType={bargainType} />
          {!hiddenRemark ? <TextArea name="bargainRemark" resize="vertical" clearButton /> : ''}
        </Form>
      </div>
    );
  }
}

export default BatchInputPrice;
