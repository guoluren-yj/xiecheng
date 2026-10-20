/*
 * @Date: 2023-04-12 14:48:30
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import React from 'react';
import { Form, Table, Output } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { TopSection, SecondSection } from '_components/Section';
import { renderStatus, handleExtTextRenderIntercept } from '@/routes/components/utils';

const PurchaseFinance = ({
  custLoading,
  customizeForm,
  customizeTable,
  handleCompareRender,
  customizeUnitCode,
  customizeTableCode,
  handleFieldProp = () => {},
  dataSet: { supChangeSync, supChangeSyncPf },
  showUpdateFlag,
}) => {
  const fields = [
    {
      name: 'programmeGroups',
      type: 'select',
    },
    {
      name: 'schemeGroup',
    },
    {
      name: 'accountGroup',
      displayField: 'meaning',
    },
    {
      name: 'reconciliationAccount',
      displayField: 'meaning',
    },
    {
      name: 'ouId',
      displayField: 'ouCode',
    },
    {
      name: 'termId',
      displayField: 'termName',
    },
    {
      name: 'frozenFlag',
      type: 'boolean',
    },
    {
      name: 'paymentFrozen',
      type: 'select',
    },
  ].map(column => {
    const { type, displayField, ...others } = column;
    const { name: fileName, hidden } = others;
    return {
      renderer: ({ value, record, name }) =>
        handleCompareRender({ value, record, name, type, displayField }),
      ...handleFieldProp({
        currentRecord: supChangeSync && supChangeSync.current,
        fileName,
        hidden,
      }),
      ...others,
    };
  });

  const columns = [
    showUpdateFlag && {
      type: 'select',
      name: 'objectFlag',
      renderer: renderStatus,
    },
    {
      name: 'organizationCode',
      width: 150,
      alias: 'purchaseOrgId', // alias 别名，lov标红标识为id
      displayField: 'organizationCode',
    },
    {
      name: 'organizationName',
      width: 120,
      alias: 'purchaseOrgId',
    },
    {
      name: 'purchaseAgentId',
      width: 150,
      displayField: 'purchaseAgentName',
    },
    {
      name: 'termId',
      width: 150,
      displayField: 'termName',
    },
    {
      name: 'typeCode',
      width: 160,
      displayField: 'typeName',
    },
    {
      name: 'tradeTerms',
      width: 160,
      type: 'select',
    },
    {
      name: 'tradeTermsSite',
      width: 160,
    },
    {
      name: 'currencyCode',
      width: 150,
      displayField: 'currencyName',
    },
    {
      name: 'reconciliationAccount',
      width: 150,
      displayField: 'meaning',
    },
    {
      name: 'sortNumber',
      width: 150,
    },
    {
      name: 'frozenFlag',
      width: 120,
      type: 'boolean',
    },
  ]
    .filter(Boolean)
    .map(column => {
      const { type, alias, displayField, ...others } = column;
      return {
        renderer: ({ value, record, name }) =>
          handleCompareRender({ value, record, name: alias || name, type, displayField }),
        ...others,
      };
    });

  return (
    <TopSection>
      <SecondSection
        title={intl.get('sslm.common.view.title.purchaseHeaderInfo').d('采购财务头信息')}
      >
        {customizeForm(
          {
            code: customizeUnitCode,
            readOnly: true,
            extTextRenderIntercept: handleExtTextRenderIntercept,
          },
          <Form
            columns={3}
            labelLayout="vertical"
            dataSet={supChangeSync}
            custLoading={custLoading}
            className="c7n-pro-vertical-form-display"
            style={{ width: '90%', maxWidth: 1172, marginBottom: 32 }}
          >
            {fields.map(field => (
              <Output {...field} />
            ))}
          </Form>
        )}
      </SecondSection>
      <SecondSection
        title={intl.get('sslm.common.view.title.purchaseLineInfo').d('采购财务行信息')}
      >
        {customizeTable(
          {
            code: customizeTableCode,
            readOnly: true,
            extTextRenderIntercept: handleExtTextRenderIntercept,
          },
          <Table
            columns={columns}
            dataSet={supChangeSyncPf}
            style={{ maxHeight: 430 }}
            custLoading={custLoading}
            selectionMode="none"
          />
        )}
      </SecondSection>
    </TopSection>
  );
};

export default PurchaseFinance;
