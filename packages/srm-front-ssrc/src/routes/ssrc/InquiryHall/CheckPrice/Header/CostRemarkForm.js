/**
 * 成本备注表单
 */
import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { Form, TextField, TextArea } from 'choerodon-ui/pro';
import { noop } from 'lodash';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';
import { renderFlagDisplay } from '../utils/renderer';

@observer
export default class BasicInfoForm extends PureComponent {
  getFields() {
    const { basicInfoDs, sectionFlag, projectTotalPrice, remote } = this.props;
    const { current } = basicInfoDs;
    // const { priceTypeCode } = current?.get(['priceTypeCode']) || {};

    const preFormFields = [
      <C7nPrecisionInputNumber name="totalCost" record={current} financial="currencyCode" />,
      sectionFlag && <TextField name="projectTotalPrice" renderer={() => projectTotalPrice} />,
      <C7nPrecisionInputNumber
        name="totalPrice"
        disabled
        financial="currencyCode"
        record={current}
      />,
      <TextField name="overCostFlag" renderer={renderFlagDisplay} />,
      <C7nPrecisionInputNumber name="overCostPrice" financial="currencyCode" record={current} />,
      <TextField name="overCostScale" />,
      <TextArea name="costRemark" newLine colSpan={2} resize="both" />,
    ];

    let formFields = remote
      ? remote.process(
          'SSRC_CHECK_PRICE_PROCESS_CHECK_PRICE_COST_REMARK_FORM_FIELDS',
          preFormFields,
          { that: this, basicInfoDs }
        )
      : preFormFields;
    formFields = formFields || [];

    return formFields.filter(Boolean);
  }

  render() {
    const { sourceKey, basicInfoDs, customizeForm = noop } = this.props;
    return customizeForm(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.COST`,
      },
      <Form dataSet={basicInfoDs} columns={3} labelLayout="float">
        {this.getFields()}
      </Form>
    );
  }
}
