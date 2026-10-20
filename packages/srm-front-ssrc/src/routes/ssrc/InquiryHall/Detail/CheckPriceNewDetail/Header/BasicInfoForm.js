import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { Form, Attachment, Output } from 'choerodon-ui/pro';
import { isNil, noop } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';

@observer
export default class BasicInfoForm extends PureComponent {
  getFields = () => {
    const { basicInfoDS, viewApplicationOrgModal = noop, remote, bidFlag } = this.props;
    const { current } = basicInfoDS || {};
    if (!current) {
      return [];
    }

    const Fields = [
      <Output name="companyName" />,
      <Output
        name="sourceCategory"
        renderer={({ record }) => {
          const { secondarySourceCategoryMeaning, sourceCategoryMeaning } = record?.get([
            'secondarySourceCategoryMeaning',
            'sourceCategoryMeaning',
          ]);

          return secondarySourceCategoryMeaning || sourceCategoryMeaning || '-';
        }}
      />,
      <Output
        name="sourceMethod"
        renderer={({ record }) => {
          const { sourceMethodMeaning } = record?.get(['sourceMethodMeaning']);

          return sourceMethodMeaning || '';
        }}
      />,
      <Output
        name="savingAmount"
        renderer={({ record }) => {
          const { savingAmount } = record?.get(['savingAmount']);

          return numberSeparatorRender(savingAmount);
        }}
      />,
      <Output
        name="savingRatio"
        renderer={({ record }) => {
          const { savingRatio } = record?.get(['savingRatio']);

          return !isNil(savingRatio) ? `${savingRatio}` : '';
        }}
      />,
      <Output
        name="maxSuggestedAmount"
        renderer={({ record }) => {
          const { maxSuggestedAmount } = record?.get(['maxSuggestedAmount']);

          return numberSeparatorRender(maxSuggestedAmount);
        }}
      />,
      <Output
        name="minSuggestedAmount"
        renderer={({ record }) => {
          const { minSuggestedAmount } = record?.get(['minSuggestedAmount']);

          return numberSeparatorRender(minSuggestedAmount);
        }}
      />,
      <Attachment name="pretrialUuid" viewMode="popup" funcType="link" />,
      <Attachment name="checkAttachmentUuid" viewMode="popup" funcType="link" />,
      <Output
        name="applicationScopeFlag"
        renderer={({ record }) => {
          const { applicationScopeFlag } = record?.get(['applicationScopeFlag']);

          return (
            <a disabled={!applicationScopeFlag} onClick={() => viewApplicationOrgModal()}>
              {intl.get(`ssrc.inquiryHall.model.inquiryHall.view`).d('查看')}
            </a>
          );
        }}
      />,
      <Output name="rfxRemark" />,
      <Output name="internalRemark" />,
      <Output name="pretrailRemark" />,
      <Output name="checkRemark" />,
      <Output name="templateNum" />,
    ];

    const basicInfoFields = remote
      ? remote.process(
          'SSRC_DETAIL_CHECK_PRICE_NEW_PROCESS_HEADER_FIELDS',
          Fields,
          {
            bidFlag,
            that: this,
          }
        )
      : Fields;

    return basicInfoFields.filter(Boolean);
  };

  render() {
    const { basicInfoDS, customizeForm = () => {}, unitCode = '' } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: unitCode,
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
