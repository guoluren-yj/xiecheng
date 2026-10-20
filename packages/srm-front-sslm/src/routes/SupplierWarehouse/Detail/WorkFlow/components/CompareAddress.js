/**
 * Address - 地址
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

const CompareAddress = ({ dataSet, customizeTable, custLoading, code, onlyShowChange }) => {
  const columns = [
    {
      name: 'objectFlag',
      renderer: ({ value }) => renderStatus(value),
    },
    {
      name: 'countryLov',
      width: 150,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.countryIdMeaningFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? 'red' : '',
            }}
          >
            {data.countryIdMeaningFlag === 'UPDATE' && data.objectFlag !== 'CREATE' ? (
              <Tooltip
                title={`${intl
                  .get('sslm.supplierWarehouse.view.beforeUpdate')
                  .d('修改前')}:${data.countryIdMeaningOld || '-'}`}
              >
                {data.countryIdMeaning || '-'}
              </Tooltip>
            ) : (
              data.countryIdMeaning || '-'
            )}
          </div>
        );
      },
    },
    {
      name: 'regionPathName',
      width: 240,
    },
    {
      name: 'addressDetail',
      width: 150,
    },
    {
      name: 'postCode',
      width: 150,
    },
    {
      name: 'remark',
      width: 200,
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
      code, // 单元编码，必传
      readOnly: true,
    },
    <Table
      dataSet={dataSet}
      columns={columns}
      custLoading={custLoading}
      pagination={!onlyShowChange}
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

export default CompareAddress;
