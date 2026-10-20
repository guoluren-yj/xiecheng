/**
 * PurchaseInform - 采购财务
 * @date: 2020-12-29
 * @author: CDJ <dengji.chen@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React, { Fragment } from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

import HeaderInfo from './HeaderInfo';

const PurchaseInform = ({
  headerDs,
  lineDs,
  customizeTable,
  customizeForm,
  custLoading,
  headerCode = '',
  lineCode = '',
}) => {
  const columns = [
    {
      name: 'organizationCode',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.organizationCodeFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.organizationCode}
          </div>
        );
      },
    },
    {
      name: 'organizationName',
      width: 200,
    },
    {
      name: 'purchaseAgentId',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.purchaseAgentIdFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.purchaseAgentName}
          </div>
        );
      },
    },
    {
      name: 'termId',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.termIdFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.termName}
          </div>
        );
      },
    },
    {
      name: 'typeCode',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.typeCodeFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.typeName}
          </div>
        );
      },
    },
    {
      name: 'tradeTerms',
      width: 200,
    },
    {
      name: 'tradeTermsSite',
      width: 100,
    },
    {
      name: 'currencyCode',
      width: 100,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.currencyCodeFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.currencyName}
          </div>
        );
      },
    },
    {
      name: 'reconciliationAccount',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.reconciliationAccount === 'UPDATE' || data.objectFlag === 'CREATE'
                  ? 'red'
                  : '',
            }}
          >
            {data.reconciliationAccountMeaning}
          </div>
        );
      },
    },
    {
      name: 'sortNumber',
      width: 200,
    },
    {
      name: 'frozenFlag',
      width: 200,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.frozenFlagFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {value
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否')}
          </div>
        );
      },
    },
  ].map(n => ({
    renderer: ({ record }) => {
      const data = record.toData();
      return (
        <div
          style={{
            color: (data[`${n.name}Flag`] === 'UPDATE' || data.objectFlag === 'CREATE') && 'red',
          }}
        >
          {data[`${n.name}Meaning`] || data[`${n.name}`]}
        </div>
      );
    },
    ...n,
  }));

  return (
    <Fragment>
      <HeaderInfo
        code={headerCode}
        dataSet={headerDs}
        customizeForm={customizeForm}
        custLoading={custLoading}
      />
      {customizeTable(
        {
          code: lineCode,
          readOnly: true,
        },
        <Table dataSet={lineDs} columns={columns} custLoading={custLoading} />
      )}
    </Fragment>
  );
};

export default PurchaseInform;
