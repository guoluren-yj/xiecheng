/**
 * FinanceList - 企业信息-明细展示页面-财务信息列表组件
 * @date: 2018-7-17
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Table } from 'hzero-ui';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';

@formatterCollections({ code: 'spfm.finance' })
export default class FinanceList extends PureComponent {
  render() {
    const { dataSource, ...others } = this.props;
    const tableProps = {
      columns: [
        {
          title: intl.get('spfm.finance.model.financeInfo.year').d('年份'),
          dataIndex: 'year',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.totalAssets').d('企业总资产(万元)'),
          dataIndex: 'totalAssets',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.totalLiabilities').d('总负债(万元)'),
          dataIndex: 'totalLiabilities',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.currentAssets').d('流动资产(万元)'),
          dataIndex: 'currentAssets',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.currentLiabilities').d('流动负债(万元)'),
          dataIndex: 'currentLiabilities',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.revenue').d('营业收入(万元)'),
          dataIndex: 'revenue',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.netProfit').d('净利润(万元)'),
          dataIndex: 'netProfit',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.assetLiabilityRatio').d('资产负债率'),
          dataIndex: 'assetLiabilityRatio',
        },
        {
          title: intl.get('spfm.finance.model.financeInfo.currentRatio').d('流动比率'),
          dataIndex: 'currentRatio',
        },
        {
          title: intl
            .get('spfm.finance.model.financeInfo.totalAssetsEarningsRatio')
            .d('总资产收益率'),
          dataIndex: 'totalAssetsEarningsRatio',
        },
      ],
      pagination: false,
      dataSource,
      rowKey: 'companyFinanceId',
      ...others,
    };
    return <Table {...tableProps} />;
  }
}
