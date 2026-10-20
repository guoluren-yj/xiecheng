/**
 * Address - 地址
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';

const Address = ({ dataSet, customizeTable, custLoading, code }) => {
  const columns = [
    {
      name: 'countryLov',
      width: 150,
      renderer: ({ record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.countryIdFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {data.countryIdMeaning}
          </div>
        );
      },
    },
    {
      name: 'regionPathName',
      width: 240,
      tooltip: 'overflow',
    },
    {
      name: 'addressDetail',
      tooltip: 'overflow',
    },
    {
      name: 'postCode',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'remark',
      width: 200,
      tooltip: 'overflow',
    },
    {
      name: 'enabledFlag',
      width: 100,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.enabledFlagFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
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
  return customizeTable(
    {
      code, // 单元编码，必传
      readOnly: true,
    },
    <Table dataSet={dataSet} columns={columns} custLoading={custLoading} />
  );
};

export default Address;
