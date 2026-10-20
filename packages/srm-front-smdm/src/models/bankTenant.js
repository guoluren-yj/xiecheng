import {
  bankTenantQueryPage,
  bankTenantImportManual,
  bankTenantUpdate,
  bankTenantBranchQueryPage,
  bankTenantBranchUpdateList,
  bankTenantBranchCreate,
  syncBankOrgInfo,
  queryConfigSetting,
} from '@/services/bankTenantService';
import { getCurrentOrganizationId, getResponse } from 'utils/utils';

import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'bankTenant',
  state: {
    enumMap: {},
    list: {},
    enableTenantBankFlag: false,
    branch: {
      list: {},
      bankBranch: {},
    },
  },
  effects: {
    *fetchEnums(_, { call, put }) {
      const res = getResponse(
        yield call(queryMapIdpValue, {
          bankType: 'HPFM.BANK_TYPE',
          flag: 'HPFM.FLAG.NEW',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: {
            bankType: res.bankType,
            flag: res.flag,
          },
        },
      });
    },
    *fetchBankHeadList({ payload: { organizationId, pagination, query } }, { call, put }) {
      const res = getResponse(yield call(bankTenantQueryPage, organizationId, query, pagination));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            list: res,
          },
        });
      }
    },
    *importManual({ payload: { organizationId } }, { call }) {
      return getResponse(yield call(bankTenantImportManual, organizationId));
    },
    *queryConfigSetting(_, { call, put }) {
      const res = getResponse(yield call(queryConfigSetting));
      if ([1, '1'].includes(res?.refPlatform)) {
        yield put({
          type: 'updateState',
          payload: {
            enableTenantBankFlag: true,
          },
        });
      }
    },
    *syncBankOrgInfo(_, { call }) {
      return getResponse(yield call(syncBankOrgInfo));
    },
    *updateBankHeadList({ payload: { list, organizationId } }, { call }) {
      // 不要多传数据
      return getResponse(yield call(bankTenantUpdate, organizationId, list));
    },
    *fetchBankBranchList(
      { payload: { bankId, pagination, organizationId, params } },
      { call, put }
    ) {
      const res = getResponse(
        yield call(bankTenantBranchQueryPage, organizationId, bankId, pagination, params)
      );
      if (res) {
        yield put({
          type: 'updateBranch',
          payload: {
            list: res,
          },
        });
      }
    },
    *updateBankBranchList({ payload }, { call }) {
      const organizationId = getCurrentOrganizationId();
      return getResponse(yield call(bankTenantBranchUpdateList, organizationId, payload));
    },
    *createBank({ payload }, { call }) {
      const organizationId = getCurrentOrganizationId();
      return getResponse(yield call(bankTenantBranchCreate, organizationId, payload));
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateBranch(state, { payload }) {
      return {
        ...state,
        branch: {
          ...state.branch,
          ...payload,
        },
      };
    },
  },
};
