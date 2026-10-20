import React, { PureComponent } from 'react';
import { observer } from 'mobx-react';
import { Form, Attachment, Output } from 'choerodon-ui/pro';
import { isNil, noop } from 'lodash';

import intl from 'hzero-front/lib/utils/intl';

import { numberSeparatorRender } from '@/utils/renderer';

@observer
export default class BasicInfoForm extends PureComponent {
  getFields = () => {
    const { viewApplicationOrgModal = noop, basicInfoDS } = this.props;
    const { current } = basicInfoDS || {};
    if (!current) {
      return [];
    }

    const { priceTypeCode, sourceFrom = '' } = current?.get(['priceTypeCode', 'sourceFrom']) || {};

    const sourceFromFlag = sourceFrom === 'PROJECT';

    const Fields = [
      <Output
        name="sourceCategoryMeaning"
        renderer={({ record }) => {
          const { secondarySourceCategoryMeaning, sourceCategoryMeaning } = record?.get([
            'secondarySourceCategoryMeaning',
            'sourceCategoryMeaning',
          ]);

          return secondarySourceCategoryMeaning || sourceCategoryMeaning || '-';
        }}
      />,
      <Output name="purOrganizationName" />,
      <Output name="companyName" />,
      <Output name="unitName" />,
      <Output
        name="budgetAmount"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="totalEstimatedAmount"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="savingAmount"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="savingRatio"
        renderer={({ value }) => {
          return !isNil(value) ? `${value}` : '';
        }}
      />,
      <Output
        name="maxSuggestedAmount"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="minSuggestedAmount"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      <Output
        name="totalPrice2"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      priceTypeCode !== 'TAX_INCLUDED_PRICE' ? (
        <Output
          name="totalNetEstimatedAmount"
          renderer={({ value }) => {
            return numberSeparatorRender(value);
          }}
        />
      ) : null,
      <Output name="currencyCodeMeaning" />,
      <Output
        name="projectBudgetAmount"
        renderer={({ value }) => {
          return numberSeparatorRender(value);
        }}
      />,
      priceTypeCode === 'TAX_INCLUDED_PRICE' ? (
        <Output
          name="projectEstimatedAmount"
          renderer={({ value }) => {
            return numberSeparatorRender(value);
          }}
        />
      ) : null,
      priceTypeCode === 'TAX_INCLUDED_PRICE' ? (
        <Output
          name="projectNetEstimatedAmount"
          renderer={({ value }) => {
            return numberSeparatorRender(value);
          }}
        />
      ) : null,
      sourceFromFlag ? <Output name="sourceProjectNum" /> : null,
      sourceFromFlag ? <Output name="sourceProjectName" /> : null,
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
    ];

    return Fields.filter(Boolean);
  };

  render() {
    const { basicInfoDS, customizeForm = noop, getCustomizeUnitCode = noop } = this.props;

    return (
      <div>
        {customizeForm(
          {
            code: getCustomizeUnitCode('checkPriceBasic'),
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
