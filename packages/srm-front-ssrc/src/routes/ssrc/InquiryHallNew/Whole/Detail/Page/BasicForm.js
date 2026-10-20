import React from 'react';
import { Output, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react-lite';
import { noop } from 'lodash';
import querystring from 'querystring';

import { yesOrNoRender } from 'utils/renderer';
import CollapseForm from '_components/CollapseForm';
import intl from 'utils/intl';
import { numberSeparatorRender } from '@/utils/renderer';

const BasicForm = observer((props) => {
  const {
    customizeCollapseForm = noop,
    custLoading,
    basicFormDS = {},
    // organizationId,
    getCustomizeUnitCode = noop,
    viewApplicationOrgModal = noop,
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
          labelLayout: 'vertical',
        },
        <CollapseForm
          dataSet={basicFormDS}
          labelLayout="vertical"
          className="c7n-pro-vertical-form-display"
          showLines={6}
          columns={3}
          custLoading={custLoading}
          firstShowFields={[
            'rfxTitle',
            'companyName',
            'purOrganizationName',
            'purchaserName',
            'sourceCategoryMeaning',
            'totalPrice',
            'multiCurrencyFlag',
            'currencyCode',
            'checkRemark',
            'paymentTermName',
            'paymentTermFlag',
            'paymentTypeName',
            'applicationScopeFlag',
          ]}
          useWidthPercent
        >
          <Output name="rfxTitle" />
          <Output name="companyName" />
          <Output name="purOrganizationName" />
          <Output name="purchaserName" />
          <Output name="sourceCategoryMeaning" />
          <Output
            // labelLayout="none"
            name="applicationScopeFlag"
            renderer={({ value = 0 }) => {
              return (
                <span style={{ display: 'inline-flex', alignItems: 'start' }}>
                  {yesOrNoRender(value)}
                  <a
                    disabled={!value}
                    style={{ marginLeft: '8px' }}
                    onClick={viewApplicationOrgModal}
                  >
                    {intl
                      .get(`ssrc.inquiryHall.model.inquiryHall.applicationOrganization`)
                      .d('适用其他组织')}
                  </a>
                </span>
              );
            }}
          />
          <Output name="totalPrice" renderer={({ value }) => numberSeparatorRender(value)} />
          <Output name="currencyCode" />
          <Output name="multiCurrencyFlag" renderer={({ value }) => yesOrNoRender(value)} />
          <Output name="paymentTypeName" />
          <Output name="paymentTermName" />
          <Output name="paymentTermFlag" renderer={({ value }) => yesOrNoRender(value)} />
          <Output disabled name="checkRemark" />
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

export default BasicForm;
