/**
 * BankInfo - 企业认证预览-银行信息
 * @date: 2018-12-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

import ItemWrapper from './ItemWrapper';
import bankInfoDS from '../store/bankInfoDS';

export default class BankInfo extends React.PureComponent {
  bankInfoDS = new DataSet({
    ...bankInfoDS(),
    selection: false,
    autoQuery: false,
  });

  componentDidMount() {
    const { bankAccountList = [] } = this.props;
    this.bankInfoDS.loadData(bankAccountList);
  }

  render() {
    const columns = [
      {
        name: 'bankCountryObj',
        width: 200,
      },
      {
        name: 'bankCode',
        width: 200,
      },
      {
        name: 'bankName',
        width: 150,
      },
      {
        name: 'bankFirmObj',
        width: 200,
      },
      {
        name: 'bankBranchName',
        width: 200,
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
        name: 'accountNature',
        width: 200,
        editor: false,
      },
      {
        name: 'accountPurpose',
        width: 200,
        editor: false,
      },
      {
        name: 'currencyLov',
        width: 200,
        editor: false,
      },
      {
        name: "bankIdentifyCodeType",
        width: 120,
      },
      {
        name: "bankIdentifyCode",
        width: 200,
      },
      {
        name: 'enabledFlag',
        width: 80,
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        width: 120,
        name: 'masterFlag',
        renderer: ({ value }) => yesOrNoRender(value),
      },
      {
        name: 'remark',
        width: 200,
      },
    ];
    return (
      <ItemWrapper
        title={intl.get('spfm.enterprise.view.message.page.bankInfo').d('银行信息')}
        message={intl
          .get(`spfm.bank.view.message.description`)
          .d('提示: 维护账户信息，后续您向合作企业提供付款账号时，可快速复制。')}
      >
        <Table
          bordered
          rowKey="companyBankAccountId"
          dataSet={this.bankInfoDS}
          columns={columns}
          pagination={false}
          style={{ maxHeight: 450 }}
        />
      </ItemWrapper>
    );
  }
}
