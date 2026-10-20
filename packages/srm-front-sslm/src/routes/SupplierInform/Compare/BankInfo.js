/**
 * BankInfo - 银行信息
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

export default class BankInfo extends Component {
  render() {
    const { dataSource, custLoading, customizeTable } = this.props;
    const columns = [
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankCountry').d('国家'),
        dataIndex: 'bankCountryName',
        width: 100,
        render: (val, record) => (
          <div
            style={{
              color:
                (record.objectFlag === 'CREATE' || record.bankCountryIdFlag === 'UPDATE') && 'red',
            }}
          >
            {val}
          </div>
        ),
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankCode').d('银行代码'),
        dataIndex: 'bankCode',
        width: 100,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankName').d('银行名称'),
        dataIndex: 'bankName',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankFirm').d('联行行号'),
        dataIndex: 'bankFirm',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankBranchName').d('开户行名称'),
        dataIndex: 'bankBranchName',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankAccountName').d('账户名称'),
        dataIndex: 'bankAccountName',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.bankAccountNum').d('银行账号'),
        dataIndex: 'bankAccountNum',
        width: 150,
      },
      {
        title: intl.get('spfm.bank.model.bank.intlBankAccount').d('IBAN码'),
        dataIndex: 'intlBankAccountNum',
        width: 150,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.accountNature').d('账户性质'),
        dataIndex: 'accountNature',
        width: 160,
        render: (val, record) => record.accountNatureMeaning,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.accountPurpose').d('账户用途'),
        dataIndex: 'accountPurpose',
        width: 120,
        render: (val, record) => record.accountPurposeMeaning,
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.currencyName`).d('币种'),
        dataIndex: 'currencyId',
        width: 140,
        render: (val, record) => record.currencyIdMeaning,
      },
      {
        title: intl.get(`sslm.enterpriseInform.view.model.bank.paymentType`).d('付款方式'),
        dataIndex: 'paymentType',
        width: 150,
        render: (val, record) => record.paymentTypeIdMeaning,
      },
      {
        title: intl.get('sslm.enterpriseInform.view.model.bank.master').d('主账户'),
        dataIndex: 'masterFlag',
        width: 80,
        render: val => formatYesOrNo(val),
      },
      {
        title: intl.get('hzero.common.status.enable').d('启用'),
        dataIndex: 'enabledFlag',
        width: 80,
        render: val => formatYesOrNo(val),
      },
      {
        title: intl.get('hzero.common.remark').d('备注'),
        dataIndex: 'remark',
        width: 200,
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
        code: 'SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.BANK_INFO',
      },
      <Table
        bordered
        rowKey="bankAccReqId"
        pagination={false}
        dataSource={dataSource}
        columns={columns}
        scroll={{ x: scrollX }}
        custLoading={custLoading}
      />
    );
  }
}
