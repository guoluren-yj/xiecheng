/**
 * AddressInfo - 地址信息
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { sum, isNumber } from 'lodash';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { formatYesOrNo } from '@/routes/components/utils';

export default class AddressInfo extends Component {
  render() {
    const { dataSource, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.countryName').d('国家'),
        dataIndex: 'countryId',
        width: 120,
        render: (_, record) => record.countryName,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.regionPathName').d('省/市/区'),
        dataIndex: 'regionPathName',
        width: 200,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.businessAddress').d('经营地址'),
        dataIndex: 'addressDetail',
        width: 200,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.postCode').d('邮政编码'),
        dataIndex: 'postCode',
        width: 100,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.address.description').d('地址备注'),
        dataIndex: 'description',
        width: 150,
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: val => formatYesOrNo(val),
      },
    ].map(n => ({
      ...n,
      render: (val, record) => {
        return (
          <div
            style={{
              color:
                (record.objectFlag === 'CREATE' || record[`${n.dataIndex}Flag`] === 'UPDATE') &&
                'red',
            }}
          >
            {n.render ? n.render(val, record) : val}
          </div>
        );
      },
    }));

    const scrollX = sum(columns.map(n => (isNumber(n.width) ? n.width : 150)));
    return customizeTable(
      {
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.ADDRESS_INFO',
        readOnly: true,
      },
      <Table
        bordered
        rowKey="addressReqId"
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: scrollX }}
      />
    );
  }
}
