/**
 * financeDS.js - 财务DS
 * @date: 2020-09-09
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import intl from 'utils/intl';
import { getCurrentLanguage } from 'utils/utils';

const language = getCurrentLanguage();

function financeDS() {
  return {
    autoQuery: false,
    fields: [
      {
        name: 'year',
        type: 'string',
        required: true,
        pattern: /([1-9])([0-9]{3})/,
        label: intl.get('spfm.finance.model.financeInfo.year').d('年份'),
        maxLength: 4,
      },
      {
        name: 'currencyLov',
        label: intl.get('spfm.common.model.currency').d('币种'),
        type: 'object',
        required: true,
        lovCode: 'HPFM.CURRENCY',
        textField: 'currencyName',
        ignore: 'always',
      },
      {
        name: 'currencyId',
        required: true,
        bind: 'currencyLov.currencyId',
      },
      {
        name: 'currencyName',
        label: intl.get('spfm.common.model.currency').d('币种'),
        bind: 'currencyLov.currencyName',
      },
      {
        name: 'totalAssets',
        required: true,
        type: 'number',
        label: intl.get('spfm.finance.model.financeInfo.totalAssets').d('企业总资产(万)'),
        transformResponse: (value) => {
          return language === 'en_US' ? value / 100 : value;
        },
      },
      {
        name: 'totalLiabilities',
        required: true,
        type: 'number',
        label: intl.get('spfm.finance.model.financeInfo.totalLiabilities').d('总负债(万)'),
        transformResponse: (value) => {
          return language === 'en_US' ? value / 100 : value;
        },
      },
      {
        name: 'currentAssets',
        required: true,
        type: 'number',
        label: intl.get('spfm.finance.model.financeInfo.currentAssets').d('流动资产(万)'),
        transformResponse: (value) => {
          return language === 'en_US' ? value / 100 : value;
        },
      },
      {
        name: 'currentLiabilities',
        required: true,
        type: 'number',
        label: intl.get('spfm.finance.model.financeInfo.currentLiabilities').d('流动负债(万)'),
        transformResponse: (value) => {
          return language === 'en_US' ? value / 100 : value;
        },
      },
      {
        name: 'revenue',
        required: true,
        type: 'number',
        label: intl.get('spfm.finance.model.financeInfo.revenue').d('营业收入(万)'),
        transformResponse: (value) => {
          return language === 'en_US' ? value / 100 : value;
        },
      },
      {
        name: 'netProfit',
        required: true,
        type: 'number',
        label: intl.get('spfm.finance.model.financeInfo.netProfit').d('净利润(万)'),
        transformResponse: (value) => {
          return language === 'en_US' ? value / 100 : value;
        },
      },
      {
        name: 'assetLiabilityRatio',
        type: 'string',
        label: intl.get('spfm.finance.model.financeInfo.assetLiabilityRatio').d('资产负债率'),
      },
      {
        name: 'currentRatio',
        type: 'string',
        label: intl.get('spfm.finance.model.financeInfo.currentRatio').d('流动比率'),
      },
      {
        name: 'totalAssetsEarningsRatio',
        type: 'string',
        label: intl
          .get('spfm.finance.model.financeInfo.totalAssetsEarningsRatio')
          .d('总资产收益率'),
      },
      {
        name: 'remark',
        label: intl.get('hzero.common.remark').d('备注'),
      },
    ],
  };
}

export default financeDS;
