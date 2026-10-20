import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
// import { HZERO_IAM } from 'utils/config';
import { SRM_DATA_SDAT } from '@/utils/config';

/**
 * 监控管理 列表 DS
 * @returns
 */
const CommonTableDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    destroy: ({ data }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/batch-delete`,
        data,
        method: 'POST',
      };
    },
  },
  pageSize: 20,
  cacheSelection: true,
  fields: [
    {
      label: intl.get(`sdat.riskItemConfig.model.status`).d('状态'),
      name: 'status',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.businessName`).d('企业名称'),
      name: 'businessName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.socialCreditCode`).d('统一社会信用代码'),
      name: 'socialCreditCode',
      type: 'string',
    },
    {
      label: intl.get(`sdat.riskItemConfig.model.invalidTime`).d('失效时间'),
      name: 'invalidTime',
      type: 'dateTime',
    },
  ],
  events: {},
});

export { CommonTableDS };
