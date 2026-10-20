/**
 * @date 2018-06-25
 * @author NJQ
 */
import { stringify } from 'qs';
import { getResponse, isTenantRoleLevel, getCurrentOrganizationId } from 'utils/utils';
import request from 'utils/request';
import { SRM_MDM } from '_utils/config';
import { queryIdpValue } from 'hzero-front/lib/services/api';

export const SERVICE_URL = `${SRM_MDM}/v1/${isTenantRoleLevel()}platform/banks`;
const isTenantRoleLevelFlag = isTenantRoleLevel();

export function serviceUrl() {
  return !isTenantRoleLevelFlag
    ? `${SRM_MDM}/v1/platform/banks`
    : `${SRM_MDM}/v1/${getCurrentOrganizationId()}/banks`;
}

export const service = {
  async init() {
    return queryIdpValue('HPFM.BANK_TYPE');
  },

  async queryConfigSetting() {
    return request(
      `${SRM_MDM}/v1/${getCurrentOrganizationId()}/banks/tenant-config`
    );
  },

  async syncBankInfo() {
    return request(
      `${SRM_MDM}/v1/${getCurrentOrganizationId()}/banks/ref-platform`,
      { method: 'POST' }
    );
  },

  async queryBanks(params = {}) {
    const {
      page = { current: 1, pageSize: 10 },
      sort = { name: 'bankCode', order: 'asc' },
      body,
    } = params;
    return request(
      `${serviceUrl(params)}?page=${page.current - 1}&size=${page.pageSize}&sort=${sort.name},${sort.order
      }&${stringify(body)}`
    );
  },

  async updateBank(params = {}) {
    return request(serviceUrl(params), {
      method: params.bankId ? 'PUT' : 'POST',
      // 平台级：保存+更新都是单条,租户级：保存单条，批量更新
      body: !isTenantRoleLevelFlag || !params.bankId ? params : [params],
    });
  },

  async remove(params) {
    return request(serviceUrl(params), {
      method: 'DELETE',
      body: params,
    });
  },
};

export default {
  namespace: 'bank',

  state: {
    modalVisible: false,
    bankTypeList: [],
    list: {},
    EnableTenantBankFlag: false,
  },

  effects: {
    *init({ payload }, { call, put }) {
      const response = yield call(service.init, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            bankTypeList: data,
          },
        });
      }
    },
    *queryConfigSetting({ payload }, { call, put }) {
      const response = yield call(service.queryConfigSetting, payload);
      const data = getResponse(response);
      if ([1, '1'].includes(data?.refPlatform)) {
        yield put({
          type: 'updateState',
          payload: {
            EnableTenantBankFlag: true,
          },
        });
      }
    },

    *syncBankInfo({ payload }, { call }) {
      const response = yield call(service.syncBankInfo, payload);
      return getResponse(response);
    },

    *fetch({ payload }, { call, put }) {
      const response = yield call(service.queryBanks, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
          },
        });
      }
    },
    *action({ method, payload }, { call }) {
      const response = yield call(service[method], payload);
      return getResponse(response);
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
