import React, { memo } from 'react';
import { Lov, TextField, TextArea, CheckBox, Output, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';
import querystring from 'querystring';

import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import C7nPrecisionInputNumber from '@/routes/components/Precision/C7nPrecisionInputNumber';

import Styles from '../index.less';

const BasicForm = observer((props) => {
  const {
    customizeCollapseForm = noop,
    custLoading,
    basicFormDS = {},
    // organizationId,
    getCustomizeUnitCode = noop,
    changeCompany = noop,
    viewApplicationOrgModal = noop,
    changeCurrency = noop,
    history,
  } = props;

  // 跳转项目详情
  const handleJumpToProjectDetail = () => {
    const sourceProjectId = basicFormDS?.current?.get('sourceProjectId');
    if (!sourceProjectId || !history) return;
    const search = querystring.stringify({
      current: 'newProjectSetup',
    });
    history.push({
      pathname: `/ssrc/new-project-setup/detail/${sourceProjectId}`,
      search,
    });
  };

  return (
    <div>
      {customizeCollapseForm(
        {
          code: getCustomizeUnitCode('baseForm'),
          dataSet: basicFormDS,
          gutter: 8,
        },
        <CollapseForm
          dataSet={basicFormDS}
          labelLayout="float"
          showLines={6}
          columns={3}
          custLoading={custLoading}
          // className="c7n-pro-vertical-form-display"
          firstShowFields={[
            'rfxTitle',
            'companyId',
            'purOrganizationId',
            'purchaserId',
            'sourceCategory',
            'totalPrice',
            'multiCurrencyFlag',
            'currencyCode',
            'checkRemark',
            'paymentTermId',
            'paymentTermFlag',
            'paymentTypeId',
          ]}
          useWidthPercent
        >
          <TextField name="rfxTitle" />
          <Lov name="companyId" onChange={changeCompany} />
          <Lov name="purOrganizationId" />
          <Lov name="purchaserId" />
          <TextField
            name="sourceCategory"
            // optionsFilter={(currentRecord) =>
            //   sourceCategoryFilter(currentRecord, basicFormDS.current)
            // }
            renderer={({ value, record }) => {
              return !record ? value : record.get('sourceCategoryMeaning');
            }}
          />
          <Output
            name="applicationScopeFlag"
            labelLayout="none"
            renderer={({ value = 1 }) => {
              return (
                <span className={Styles['ssrc-collapse-form-common-application-scope-wrapper']}>
                  <CheckBox name="applicationScopeFlag" />
                  <a
                    disabled={!value}
                    style={{ marginLeft: '8px' }}
                    onClick={() => viewApplicationOrgModal()}
                  >
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
                      .d('适用其他组织')}
                  </a>
                </span>
              );
            }}
          />
          <C7nPrecisionInputNumber
            name="totalPrice"
            disabled
            financial="currencyCode"
            record={basicFormDS?.current}
          />
          <Lov name="currencyCode" onChange={(data) => changeCurrency(data)} />
          <CheckBox name="multiCurrencyFlag" />
          <Lov name="paymentTypeId" />
          <Lov name="paymentTermId" />
          <CheckBox name="paymentTermFlag" />
          <TextArea name="checkRemark" resize="both" colSpan={2} />
          {basicFormDS?.current?.get('sourceFrom') === 'PROJECT' && (
            <Output
              name="sourceProjectNum"
              renderer={({ value }) => (
                <Button
                  funcType="link"
                  onClick={handleJumpToProjectDetail}
                  style={{ userSelect: 'auto' }}
                >
                  {value}
                </Button>
              )}
            />
          )}
        </CollapseForm>
      )}
    </div>
  );
});

export default memo(BasicForm);
