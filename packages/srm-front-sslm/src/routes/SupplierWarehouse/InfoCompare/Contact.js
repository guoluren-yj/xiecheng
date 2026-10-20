/**
 * Contact - 联系人
 * @date: 2020-12-29
 * @author: lvxiaomei <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import React from 'react';
import { Table } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { formatInternationalTel } from '@/routes/components/utils';

const Contact = ({ dataSet, customizeTable, custLoading }) => {
  const columns = [
    {
      name: 'name',
      width: 150,
      tooltip: 'overflow',
    },
    // {
    //   name: 'gender',
    //   width: 100,
    // },
    {
      name: 'idType',
      width: 150,
    },
    {
      name: 'idNumber',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'department',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'position',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'contactType',
      width: 150,
    },
    {
      name: 'mobilephone',
      width: 200,
      tooltip: 'overflow',
      renderer: ({ record = {} }) => {
        const { data: { internationalTelMeaning, mobilephone } = {} } = record;
        const data = record.toData();
        return (
          <div
            style={{
              color:
                data.mobilephoneFlag === 'UPDATE' ||
                data.internationalTelCodeFlag === 'UPDATE' ||
                data.objectFlag === 'CREATE'
                  ? 'red'
                  : '',
            }}
          >
            {formatInternationalTel(internationalTelMeaning, mobilephone)}
          </div>
        );
      },
    },
    {
      name: 'mail',
      width: 200,
    },
    {
      name: 'officePhone',
      width: 150,
    },
    {
      name: 'defaultFlag',
      width: 150,
      renderer: ({ value, record }) => {
        const data = record.toData();
        return (
          <div
            style={{
              color: data.defaultFlagFlag === 'UPDATE' || data.objectFlag === 'CREATE' ? 'red' : '',
            }}
          >
            {value
              ? intl.get('hzero.common.status.yes').d('是')
              : intl.get('hzero.common.status.no').d('否')}
          </div>
        );
      },
    },
    {
      name: 'remark',
      width: 150,
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
      code: 'SSLM.EASY_SUPPLIER_WAREHOUSE.CONTACT_INFO', // 单元编码，必传
      readOnly: true,
    },
    <Table dataSet={dataSet} columns={columns} custLoading={custLoading} />
  );
};

export default Contact;
