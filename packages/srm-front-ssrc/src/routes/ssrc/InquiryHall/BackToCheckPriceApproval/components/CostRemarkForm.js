import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { Form, Output } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';

@observer
export default class CostRemarkForm extends PureComponent {
  getFields = () => {
    const { basicInfoDS } = this.props;
    const { current } = basicInfoDS || {};
    if (!current) {
      return [];
    }

    const Fields = [
      <Output
        name="totalCost"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="totalPrice"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="overCostFlag"
        renderer={({ value }) => {
          return yesOrNoRender(value);
        }}
      />,
      <Output
        name="overCostPrice"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output name="overCostScale" />,
      <Output name="costRemark" />,
    ];

    return Fields.filter(Boolean);
  };

  render() {
    const { basicInfoDS, customizeForm = noop, getCustomizeUnitCode = noop } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: getCustomizeUnitCode('costRemark'),
            dataSet: basicInfoDS,
          },
          <Form
            useWidthPercent
            dataSet={basicInfoDS}
            columns={3}
            labelLayout="vertical"
            className="c7n-pro-vertical-form-display"
          >
            {this.getFields()}
          </Form>
        )}
      </div>
    );
  }
}
