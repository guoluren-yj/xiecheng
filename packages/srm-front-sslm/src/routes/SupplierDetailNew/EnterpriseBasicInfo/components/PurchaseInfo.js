/*
 * PurchaseInfo - 采购财务信息
 * @Date: 2023-08-17 16:00:09
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { Form, Table, useDataSet, Output } from 'choerodon-ui/pro';
import React, { useEffect, useContext } from 'react';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';
import { TopSection, SecondSection } from '_components/Section';

import { Context } from '@/routes/SupplierDetailNew/Context';
import { getPurchaseHeaderDS, getPurchaseLineDS } from '../stores/getPurchaseInfoDS';

const customizeCode = [
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.PURCHASE_HEADER',
  'SSLM.SUPPLIER_360_PAGE_ENTERPRISE.PURCHASE_LINE',
]; // 顺序不可动

const PurchaseInfo = () => {
  const headerDs = useDataSet(() => getPurchaseHeaderDS(), []);
  const tableDs = useDataSet(() => getPurchaseLineDS(), []);

  const context = useContext(Context);
  const {
    tenantId,
    companyId,
    customizeForm,
    customizeTable,
    supplierCompanyId,
    tableMaxHeight,
  } = context;

  useEffect(() => {
    if (companyId && supplierCompanyId) {
      tableDs.setQueryParameter('params', {
        companyId,
        supplierCompanyId,
        customizeUnitCode: customizeCode[1],
      });
      tableDs.query();
      headerDs.setQueryParameter('params', {
        tenantId,
        companyId,
        supplierCompanyId,
        customizeUnitCode: customizeCode[0],
        sourceKey: 'c7n', // 用于后端标识，返回空对象而不是204
      });
      headerDs.query();
    }
  }, [companyId]);

  const columns = [
    {
      name: 'organizationCode',
      width: 120,
    },
    {
      width: 150,
      name: 'organizationName',
    },
    {
      width: 150,
      name: 'purchaseAgentName',
    },
    {
      name: 'termName',
      width: 120,
    },
    {
      width: 160,
      name: 'typeName',
    },
    {
      width: 160,
      name: 'tradeTermsMeaning',
    },
    {
      width: 160,
      name: 'tradeTermsSite',
    },
    {
      name: 'currencyName',
      width: 100,
    },
    {
      name: 'reconciliationAccountMeaning',
    },
    {
      name: 'sortNumber',
      width: 100,
    },
    {
      name: 'frozenFlag',
      width: 120,
      renderer: ({ value }) => yesOrNoRender(value),
    },
  ];

  const fields = [
    {
      name: 'programmeGroupsMeaning',
    },
    {
      name: 'schemeGroup',
    },
    {
      name: 'accountGroupMeaning',
    },
    {
      name: 'reconciliationAccountMeaning',
    },
    {
      name: 'ouCode',
    },
    {
      name: 'termName',
    },
    {
      name: 'frozenFlag',
      renderer: ({ value }) => yesOrNoRender(value),
    },
    {
      name: 'paymentFrozenMeaning',
    },
  ];

  return (
    <TopSection className="no-top-section">
      <SecondSection
        title={intl.get('sslm.common.view.title.purchaseHeaderInfo').d('采购财务头信息')}
      >
        {customizeForm(
          {
            code: customizeCode[0],
            readOnly: true,
          },
          <Form
            columns={3}
            dataSet={headerDs}
            labelLayout="vertical"
            style={{ marginBottom: 32 }}
            className="c7n-pro-vertical-form-display"
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
            code: customizeCode[1],
          },
          <Table columns={columns} dataSet={tableDs} style={{ maxHeight: tableMaxHeight }} />
        )}
      </SecondSection>
    </TopSection>
  );
};

export default PurchaseInfo;
