/**
 * BankAccount - 银行账户
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { isNil } from 'lodash';
import { Table, Tooltip } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import { renderStatus } from '../utils';

const CompareBankAccount = props => {
  const { dataSet, customizeTable, custLoading, code, onlyShowChange } = props;
  const columns = [
    {
      name: 'objectFlag',
      renderer: ({ value }) => renderStatus(value),
    },
    {
      name: 'countryId',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.countryIdFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.countryIdFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.countryNameOld || '-'}`}
              >
                {data.countryName}
              </Tooltip>
            ) : (
              data.countryName
            )}
          </div>
        );
      },
    },
    {
      name: 'bankCode',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.bankCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.bankCodeFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.bankCodeOld || '-'}`}
              >
                {data.bankCode}
              </Tooltip>
            ) : (
              data.bankCode
            )}
          </div>
        );
      },
    },
    {
      name: 'bankName',
      width: 200,
    },
    {
      name: 'correspondentLov',
      width: 200,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.bankFirmFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.bankFirmFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.bankFirmOld || '-'}`}
              >
                {data.bankFirm}
              </Tooltip>
            ) : (
              data.bankFirm
            )}
          </div>
        );
      },
    },
    {
      name: 'bankBranchName',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'bankAccountName',
      width: 200,
    },
    {
      name: 'bankAccountNum',
      width: 200,
    },
    {
      name: 'intlBankAccountNum',
      width: 200,
    },
    {
      name: 'bankIdentifyCodeType',
      width: 120,
    },
    {
      name: 'bankIdentifyCode',
      width: 200,
    },
    {
      name: 'masterFlag',
      width: 100,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.masterFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.masterFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${
                  !isNil(record.get('masterFlagOld'))
                    ? yesOrNoRender(record.get('masterFlagOld'))
                    : '-'
                }`}
              >
                {isNil(value) ? '-' : yesOrNoRender(value)}
              </Tooltip>
            ) : isNil(value) ? (
              '-'
            ) : (
              yesOrNoRender(value)
            )}
          </div>
        );
      },
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.enabledFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.enabledFlagFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${
                  !isNil(record.get('enabledFlagOld'))
                    ? yesOrNoRender(record.get('enabledFlagOld'))
                    : '-'
                }`}
              >
                {isNil(value) ? '-' : yesOrNoRender(value)}
              </Tooltip>
            ) : isNil(value) ? (
              '-'
            ) : (
              yesOrNoRender(value)
            )}
          </div>
        );
      },
    },
    {
      name: 'remark',
      width: 200,
    },
  ].map(n => ({
    renderer: ({ record }) => {
      const data = record.toData();
      return (
        <div
          style={{
            color: data[`${n.name}Flag`] === 'UPDATE' && data.objectFlag !== 'CREATE' && 'red',
          }}
        >
          {data[`${n.name}Flag`] === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
            <Tooltip
              title={`${intl.get('sslm.supplierWarehouse.view.beforeUpdate').d('修改前')}:${data[
                `${n.name}MeaningOld`
              ] ||
                data[`${n.name}Old`] ||
                '-'}`}
            >
              {data[`${n.name}Meaning`] || data[`${n.name}`] || '-'}
            </Tooltip>
          ) : (
            data[`${n.name}Meaning`] || data[`${n.name}` || '-']
          )}
        </div>
      );
    },
    ...n,
  }));

  return customizeTable(
    {
      code,
      readOnly: true,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      pagination={!onlyShowChange}
      custLoading={custLoading}
      onRow={({ record }) => ({
        style: {
          color:
            record.get('objectFlag') === 'CREATE' ||
            (record.get('objectFlag') === 'DELETE' && 'red'),
          textDecoration: record.get('objectFlag') === 'DELETE' && 'line-through',
          textDecorationThickness: '2px',
        },
      })}
    />
  );
};

export default CompareBankAccount;
