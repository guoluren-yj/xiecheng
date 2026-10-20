/**
 * BankList - 企业信息-明细展示页面-银行信息列表组件
 * @date: 2018-7-17
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table, Checkbox } from 'hzero-ui';

import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: 'spfm.bank' })
export default class BankList extends PureComponent {
  render() {
    const { dataSource, ...others } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get('spfm.bank.model.bank.bankTypeCode').d('银行代码'),
          dataIndex: 'bankTypeCode',
        },
        {
          title: intl.get('spfm.bank.model.bank.bankName').d('银行名称'),
          dataIndex: 'bankName',
        },
        {
          title: intl.get('spfm.bank.model.bank.bankBranchName').d('开户行名称'),
          dataIndex: 'bankBranchName',
        },
        {
          title: intl.get('spfm.bank.model.bank.bankAccountName').d('账户名称'),
          dataIndex: 'bankAccountName',
        },
        {
          title: intl.get('spfm.bank.model.bank.bankAccountNum').d('银行账号'),
          dataIndex: 'bankAccountNum',
        },
        {
          title: intl.get('hzero.common.status.enable').d('启用'),
          dataIndex: 'enabledFlag',
          render: text => (
            <Checkbox disabled checked={text === 1}>
              Checkbox
            </Checkbox>
          ),
        },
      ],
      pagination: false,
      dataSource,
      rowKey: 'companyBankAccountId',
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
