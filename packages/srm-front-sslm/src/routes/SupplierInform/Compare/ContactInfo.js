/**
 * ContactInfo - 联系人信息
 * @date: 2021-04-01
 * @author: xiaomei.lv <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */

import React, { Component } from 'react';
import { sum, isNumber } from 'lodash';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import { formatInternationalTel, formatYesOrNo } from '@/routes/components/utils';

export default class ContactInfo extends Component {
  render() {
    const { dataSource, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.name').d('姓名'),
        dataIndex: 'name',
        width: 100,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.gender').d('性别'),
        dataIndex: 'gender',
        width: 80,
        render: (val, record) => record.genderMeaning,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.mail').d('邮箱'),
        dataIndex: 'mail',
        width: 200,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.mobilephone').d('手机号码'),
        dataIndex: 'mobilephone',
        width: 220,
        render: (val, record) => (
          <div
            style={{
              color:
                (record.objectFlag === 'CREATE' ||
                  record.mobilephoneFlag === 'UPDATE' ||
                  record.internationalTelCodeFlag === 'UPDATE') &&
                'red',
            }}
          >
            {formatInternationalTel(record.internationalTelMeaning, val)}
          </div>
        ),
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.contactPerson.contactType')
          .d('联系人类型'),
        dataIndex: 'contactTypeMeaning',
        width: 100,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.department').d('部门'),
        dataIndex: 'department',
        width: 100,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.position').d('职位'),
        dataIndex: 'position',
        width: 100,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.telephone').d('固定电话'),
        dataIndex: 'telephone',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.description').d('备注'),
        dataIndex: 'description',
        width: 200,
      },
      {
        title: intl
          .get('sslm.enterpriseInform.view.model.contactPerson.defaultFlag')
          .d('默认联系人'),
        dataIndex: 'defaultFlag',
        width: 80,
        render: val => formatYesOrNo(val),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.contactPerson.enabledFlag').d('启用'),
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
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.CONTACT_INFO',
        readOnly: true,
      },
      <Table
        bordered
        rowKey="contactReqId"
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: scrollX }}
      />
    );
  }
}
