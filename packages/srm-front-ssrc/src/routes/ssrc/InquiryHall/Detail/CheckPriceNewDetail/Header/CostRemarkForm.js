import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { Form, Output } from 'choerodon-ui/pro';

import { yesOrNoRender } from 'utils/renderer';

import { numberSeparatorRender } from '@/utils/renderer';

@observer
export default class CostRemarkForm extends PureComponent {
  getFields = () => {
    const { basicInfoDS, isSection } = this.props;
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
      isSection ? (
        <Output
          name="projectTotalPrice"
          renderer={({ value }) => {
            return numberSeparatorRender(value);
          }}
        />
      ) : null,
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
    const { basicInfoDS, customizeForm = () => {}, getCustomizeUnitCode } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: getCustomizeUnitCode('costForm'),
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
