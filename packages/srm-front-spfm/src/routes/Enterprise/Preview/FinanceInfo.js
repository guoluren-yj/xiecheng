/**
 * FinanceInfo - 企业认证预览-财务信息
 * @date: 2018-12-19
 * @author: wangjiacheng <jiacheng.wang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React from 'react';
import { Table, DataSet } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import ItemWrapper from './ItemWrapper';
import financeDS from '../store/financeDS';

export default class FinanceInfo extends React.PureComponent {
  financeDS = new DataSet({
    ...financeDS(),
    selection: false,
    autoQuery: false,
  });

  componentDidMount() {
    const { financeList = [] } = this.props;
    this.financeDS.loadData(financeList);
  }

  render() {
    const columns = [
      {
        name: 'year',
        width: 120,
      },
      {
        name: 'currencyName',
        width: 130,
      },
      {
        name: 'totalAssets',
        width: 180,
      },
      {
        name: 'totalLiabilities',
        width: 180,
      },
      {
        name: 'currentAssets',
        width: 180,
      },
      {
        name: 'currentLiabilities',
        width: 180,
      },
      {
        name: 'revenue',
        width: 180,
      },
      {
        name: 'netProfit',
        width: 180,
      },
      {
        name: 'assetLiabilityRatio',
        width: 180,
        align: 'left',
        renderer: ({ value }) =>
          value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
      },
      {
        name: 'currentRatio',
        align: 'left',
        width: 180,
        renderer: ({ value }) =>
          value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
      },
      {
        name: 'totalAssetsEarningsRatio',
        align: 'left',
        width: 180,
        renderer: ({ value }) =>
          value ? <span>{`${(value * 100).toFixed(2)}%`}</span> : <span>--</span>,
      },
      {
        name: 'remark',
        width: 200,
      },
    ];
    return (
      <ItemWrapper
        title={intl.get('spfm.certificationApproval.view.title.tab.financeTable').d('财务信息')}
        message={intl
          .get('spfm.finance.view.message.description')
          .d('非常重要: 提供贵司的近三年财务报告，有利于展示您的经营与发展状况。')}
      >
        <Table
          bordered
          rowKey="companyFinanceId"
          dataSet={this.financeDS}
          columns={columns}
          pagination={false}
        />
      </ItemWrapper>
    );
  }
}
