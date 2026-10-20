/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';

export const getFinancialDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.year').d('年份'),
      name: 'year',
    },
    {
      label: intl.get('sslm.enterpriseInform.model.supplierInform.currencyName').d('币种'),
      name: 'currencyName',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.totalAssets').d('企业总资产(万)'),
      name: 'totalAssets',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.totalLiabilities').d('总负债(万)'),
      name: 'totalLiabilities',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.currentAssets').d('流动资产(万)'),
      name: 'currentAssets',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.currentLiab').d('流动负债(万)'),
      name: 'currentLiabilities',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.revenue').d('营业收入(万)'),
      name: 'revenue',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.netProfit').d('净利润(万)'),
      name: 'netProfit',
      type: 'number',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.assetLiabRatio').d('资产负债率'),
      name: 'assetLiabilityRatio',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.currentRatio').d('流动比率'),
      name: 'currentRatio',
    },
    {
      label: intl.get('sslm.supplierDetail.model.companyInfo.totalEarnRatio').d('总资产收益率'),
      name: 'totalAssetsEarningsRatio',
    },
    {
      label: intl.get('hzero.common.remark').d('备注'),
      name: 'remark',
    },
  ],
});
