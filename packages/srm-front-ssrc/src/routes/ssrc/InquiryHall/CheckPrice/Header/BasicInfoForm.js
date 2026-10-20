import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { Form, TextField, Attachment, TextArea, Output } from 'choerodon-ui/pro';
import { isNil, noop } from 'lodash';

import intl from 'utils/intl';

import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

@observer
export default class BasicInfoForm extends PureComponent {
  /**
   * [网是科技] 二开, 谨慎修改!!!
   * @protected
   */
  getFields() {
    const {
      basicInfoDs,
      remote,
      handleBeSave,
      bidFlag = false,
      checkState = {},
      sourceKey = '',
      quoteLineDs,
      viewApplicationOrgModal = noop,
    } = this.props;
    const { current } = basicInfoDs;
    const { priceTypeCode, sourceFrom, secondarySourceCategoryMeaning = '' } =
      current?.get(['priceTypeCode', 'sourceFrom', 'secondarySourceCategoryMeaning']) || {};
    const sourceFromFlag = sourceFrom === 'PROJECT';
    const Fields = [
      <TextField
        name="sourceCategoryMeaning"
        renderer={({ value }) => secondarySourceCategoryMeaning || value || '-'}
      />,
      <TextField name="purOrganizationName" />,
      <TextField name="companyName" />,
      <TextField name="unitName" />,
      <C7nPrecisionInputNumber name="budgetAmount" record={current} financial="currencyCode" />,
      priceTypeCode === 'TAX_INCLUDED_PRICE' && (
        <C7nPrecisionInputNumber
          name="totalEstimatedAmount"
          record={current}
          financial="currencyCode"
        />
      ),
      <C7nPrecisionInputNumber name="savingAmount" record={current} financial="currencyCode" />,
      <TextField name="savingRatio" renderer={({ value }) => (!isNil(value) ? `${value}%` : '')} />,
      <C7nPrecisionInputNumber
        name="maxSuggestedAmount"
        record={current}
        financial="currencyCode"
      />,
      <C7nPrecisionInputNumber
        name="minSuggestedAmount"
        record={current}
        financial="currencyCode"
      />,
      <C7nPrecisionInputNumber
        name="totalPrice2"
        disabled
        financial="currencyCode"
        record={current}
      />,
      priceTypeCode !== 'TAX_INCLUDED_PRICE' && (
        <C7nPrecisionInputNumber
          name="totalNetEstimatedAmount"
          record={current}
          financial="currencyCode"
        />
      ),
      <TextField name="currencyCodeMeaning" />,
      <C7nPrecisionInputNumber
        name="projectBudgetAmount"
        record={current}
        financial="currencyCode"
      />,
      priceTypeCode === 'TAX_INCLUDED_PRICE' && (
        <C7nPrecisionInputNumber
          name="projectEstimatedAmount"
          record={current}
          financial="currencyCode"
        />
      ),
      priceTypeCode !== 'TAX_INCLUDED_PRICE' && (
        <C7nPrecisionInputNumber
          name="projectNetEstimatedAmount"
          record={current}
          financial="currencyCode"
        />
      ),
      sourceFromFlag ? <TextField name="sourceProjectNum" /> : null,
      sourceFromFlag ? <TextField name="sourceProjectName" /> : null,
      <TextField name="internalRemark" />,
      <TextField name="pretrailRemark" />,
      <Attachment name="pretrialUuid" />,
      // <Attachment name="checkAttachmentUuid" />,
      <Output
        name="applicationScopeFlag"
        renderer={({ record }) => {
          const { applicationScopeFlag } = record ? record?.get(['applicationScopeFlag']) : {};

          return (
            <a disabled={!applicationScopeFlag} onClick={() => viewApplicationOrgModal()}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        }}
      />,
      <TextArea name="rfxRemark" newLine colSpan={2} autoSize={{ minRows: 1 }} />,
      <TextArea name="checkRemark" newLine colSpan={2} resize="both" />,
    ].filter(Boolean);
    return remote
      ? remote.process('SSRC_CHECK_PRICE_PROCESS_BASICINFO_FIELDS', Fields, {
          basicInfoDs,
          handleBeSave,
          that: this,
          bidFlag,
          checkState,
          sourceKey,
          quoteLineDs,
        })
      : Fields;
  }

  render() {
    const { sourceKey, basicInfoDs, customizeForm = noop } = this.props;
    return customizeForm(
      {
        code: `SSRC.${sourceKey}_HALL_CHECK_PRICE.HEADER_INFO`,
      },
      <Form dataSet={basicInfoDs} columns={3} labelLayout="float">
        {this.getFields()}
      </Form>
    );
  }
}
