/*
 * @Date: 2023-08-25
 * @Author: CDJ <dengji.chen@hand-china.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import intl from 'utils/intl';
import { SRM_PLATFORM, SRM_SSLM } from '_utils/config';
import { round } from 'lodash';
import { getCurrentOrganizationId, getCurrentLanguage } from 'utils/utils';

import { getReadTransport } from '../utils';

const language = getCurrentLanguage();
const organizationId = getCurrentOrganizationId();

export const getFinancialDS = ({
  isAllPlatform = true,
  partnerTenantId,
  readOnlyFlag = false,
  code = '',
  ...rest
} = {}) => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'year',
      type: 'string',
      required: true,
      pattern: /([1-9])([0-9]{3})/,
      label: intl.get('sslm.enterpriseInform.view.model.financial.year').d('年份'),
      maxLength: 4,
    },
    {
      name: 'currencyId',
      label: intl.get('sslm.enterpriseInform.model.supplierInform.currencyName').d('币种'),
      type: 'object',
      required: true,
      textField: 'currencyName',
      valueField: 'currencyId',
      dynamicProps: {
        lovCode: () => (isAllPlatform ? 'HPFM.CURRENCY' : 'SMDM.CURRENCY'),
        lovPara: () => (isAllPlatform ? {} : { tenantId: partnerTenantId }),
      },
      transformRequest: value => value && value.currencyId,
      transformResponse: (value, data) => {
        const { currencyId, currencyName } = data;
        return value
          ? {
              currencyId,
              currencyName,
            }
          : null;
      },
    },
    {
      name: 'totalAssets',
      required: true,
      type: 'number',
      label: intl.get('sslm.enterpriseInform.view.model.financial.totalAssets').d('企业总资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 4) : value) : value;
      },
    },
    {
      name: 'totalLiabilities',
      required: true,
      type: 'number',
      label: intl
        .get('sslm.enterpriseInform.view.model.financial.totalLiabilities')
        .d('总负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 4) : value) : value;
      },
    },
    {
      name: 'currentAssets',
      required: true,
      type: 'number',
      label: intl.get('sslm.enterpriseInform.view.model.financial.currentAssets').d('流动资产(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 4) : value) : value;
      },
    },
    {
      name: 'currentLiabilities',
      required: true,
      type: 'number',
      label: intl.get('sslm.enterpriseInform.view.model.financial.liabilities').d('流动负债(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 4) : value) : value;
      },
    },
    {
      name: 'revenue',
      required: true,
      type: 'number',
      label: intl.get('sslm.enterpriseInform.view.model.financial.revenue').d('营业收入(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 4) : value) : value;
      },
    },
    {
      name: 'netProfit',
      required: true,
      type: 'number',
      label: intl.get('sslm.enterpriseInform.view.model.financial.netProfit').d('净利润(万)'),
      transformResponse: value => {
        return language === 'en_US' ? (value ? round(value / 100, 4) : value) : value;
      },
    },
    {
      name: 'assetLiabilityRatio',
      type: 'string',
      label: intl.get('sslm.enterpriseInform.view.model.financial.assetRatio').d('资产负债率'),
      transformResponse: value => {
        return value ? `${(value * 100).toFixed(2)}%` : value;
      },
    },
    {
      name: 'currentRatio',
      type: 'string',
      label: intl.get('sslm.enterpriseInform.view.model.financial.currentRatio').d('流动比率'),
      transformResponse: value => {
        return value ? `${(value * 100).toFixed(2)}%` : value;
      },
    },
    {
      name: 'totalAssetsEarningsRatio',
      type: 'string',
      label: intl.get('sslm.enterpriseInform.view.model.financial.totalRatio').d('总资产收益率'),
      transformResponse: value => {
        return value ? `${(value * 100).toFixed(2)}%` : value;
      },
    },
    {
      name: 'remark',
      label: intl.get('hzero.common.remark').d('备注'),
    },
    {
      name: 'objectFlag',
      ignore: 'always',
      label: intl.get('sslm.common.model.common.changeType').d('变更类型'),
    },
  ],
  events: {
    // load: ({ dataSet }) => {
    //   dataSet.forEach(record => {
    //     if (record.get('comFinanceReqId') || record.get('financeReqId')) {
    //       Object.assign(record, { selectable: false });
    //     }
    //   });
    // },
  },
  transport: {
    read: ({ dataSet }) => {
      // 只读页面标红用readUrlProps这个接口
      const readUrlProps = getReadTransport({ dataSet, code, ...rest });
      const { changeReqId, companyId, supplierCompanyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/all`
        : `${SRM_SSLM}/v1/${organizationId}/sup-finance-reqs/all`;
      return !readOnlyFlag
        ? {
            url,
            method: 'GET',
            data: {
              changeReqId,
              companyId,
              supplierCompanyId,
              supplierFlag: isAllPlatform ? 0 : 1,
              dataSource: 1,
              customizeUnitCode: isAllPlatform ? null : code,
              customizeTenantId: isAllPlatform ? null : partnerTenantId,
            },
          }
        : readUrlProps;
    },
    submit: ({ dataSet, data }) => {
      const { changeReqId, companyId } = dataSet.getState('dsState') || {};
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs`
        : `${SRM_SSLM}/v1/${organizationId}/sup-finance-reqs`;
      return {
        url,
        method: 'POST',
        data: {
          changeReqId,
          companyId,
          supplierFlag: isAllPlatform ? 0 : 1,
          dataSource: 1,
          [isAllPlatform ? 'companyFinanceList' : 'supFinanceReqs']: data,
        },
        params: {
          customizeUnitCode: isAllPlatform ? null : code,
          customizeTenantId: isAllPlatform ? null : partnerTenantId,
        },
      };
    },
    destroy: ({ data }) => {
      const url = isAllPlatform
        ? `${SRM_PLATFORM}/v1/${organizationId}/com-finance-reqs/delete`
        : `${SRM_SSLM}/v1/${organizationId}/sup-finance-reqs/delete`;
      return {
        url,
        method: 'DELETE',
        data,
      };
    },
  },
});
