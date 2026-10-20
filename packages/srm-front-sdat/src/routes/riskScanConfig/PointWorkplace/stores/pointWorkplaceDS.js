import intl from 'utils/intl';
import { getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
// import { HZERO_IAM } from 'utils/config';
import { SRM_DATA_SDAT } from '@/utils/config';

export async function fetchOrderStatus(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/common-platform/${getCurrentOrganizationId()}/is-open-order`,
    {
      method: 'POST',
      body: params,
    }
  );
}

/**
 * 查询额度数据
 * @param {*} params
 * @returns
 */
export async function fetchQuotaDetail(params) {
  return request(
    `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/quota-stand/order-quota-detail`,
    {
      method: 'GET',
      query: params,
    }
  );
}

const DefineListDS = () => ({
  transport: {
    read: ({ data, params }) => {
      return {
        url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/quota-stand/billing-ext-list`,
        params: {
          ...data,
          ...params,
        },
        method: 'GET',
      };
    },
    // destroy: ({ data }) => {
    //   return {
    //     url: `${SRM_DATA_SDAT}/v1/${getCurrentOrganizationId()}/risk-define/batch-delete`,
    //     data,
    //     method: 'POST',
    //   };
    // },
  },
  pageSize: 20,
  // primaryKey: 'defineId',
  // cacheSelection: true,
  selection: false,
  fields: [
    {
      label: intl.get(`sdat.pointWorkplace.model.serviceName`).d(' 服务名称'),
      name: 'serviceName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.pointWorkplace.model.triggerTime`).d('触发时间'),
      name: 'creationDate',
      type: 'dateTime',
    },
    {
      label: intl.get(`sdat.pointWorkplace.model.consTimes`).d('消耗次数'),
      name: 'frequency',
      type: 'number',
    },
    {
      label: intl.get(`sdat.pointWorkplace.model.businessInfo`).d('业务信息'),
      name: 'businessInfo',
      type: 'string',
    },
    {
      label: intl.get(`sdat.pointWorkplace.model.triggerPersonCode`).d('触发人员编码'),
      name: 'operatorLoginName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.pointWorkplace.model.triggerPerson`).d('触发人员'),
      name: 'operatorName',
      type: 'string',
    },
    {
      label: intl.get(`sdat.pointWorkplace.model.triggerType`).d('触发方式'),
      name: 'triggerTypeMeaning',
      type: 'string',
      // lookupCode: 'SDAT.RISK_TRIGGER_TYPE',
    },
    {
      label: intl.get(`sdat.pointWorkplace.model.description`).d('备注'),
      name: 'remark',
      type: 'string',
    },
  ],
  events: {},
});

export { DefineListDS };
