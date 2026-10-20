/*
 * 供应商生命周期管理
 * @date: 2018-9-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  searchSupplier,
  searchSupplierPost,
  queryCurrentConfig,
  querySubsidiary,
  isValidation,
} from '@/services/supplierLifeManageService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'supplierLifeManage',
  state: {
    configId: null, // 生命周期配置 id
    stageLane: [], // 供应商信息(含阶段信息、供应商数据)
    dimensionList: [], // 管控维度数据
  },
  effects: {
    *fetchDimension(_, { call, put }) {
      const lovCode = {
        dimensionList: 'SSLM.LIFE_CYCLE_DIMENSION',
        tenantId,
      };
      const result = getResponse(yield call(queryMapIdpValue, lovCode));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dimensionList: result.dimensionList,
          },
        });
      }
    },
    // 查询当前租户生命周期管控维度
    *queryCurrentConfig({ payload }, { call }) {
      const result = yield call(queryCurrentConfig, payload);
      return getResponse(result);
    },
    // 获取各个阶段的供应商数据
    *fetchSuppliers({ payload }, { call, put }) {
      const { stageId = 'ALL', ...others } = payload;
      let result = yield call(searchSupplier, { stageId, ...others });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateSupplier',
          payload: {
            stageId,
            data: result,
          },
        });
      }
    },
    // 获取各个阶段的供应商数据
    *fetchSuppliersPost({ payload }, { call, put }) {
      const { stageId = 'ALL', ...others } = payload;
      let result = yield call(searchSupplierPost, { stageId, ...others });
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateSupplier',
          payload: {
            stageId,
            data: result,
          },
        });
      }
      return result;
    },

    // 查询当前租户下的子公司
    *querySubsidiary({ payload }, { call }) {
      const res = getResponse(yield call(querySubsidiary, payload));
      return res;
    },
    // 校验是否通过第三方校验
    *isValidation({ payload }, { call }) {
      const res = getResponse(yield call(isValidation, payload));
      return res;
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateSupplier(state, { payload }) {
      const { stageId, query, data } = payload;
      const { stageLane } = state;
      if (stageId === 'ALL') {
        // 全局查询
        return {
          ...state,
          query,
          configId: data.configId,
          stageLane: data.lifeCycleStageLanes, // [TODO]
        };
      } else {
        // 分阶段查询
        const stage = stageLane.find(item => item.stageId === stageId);
        const index = stageLane.findIndex(item => item.stageId === stageId);
        return {
          ...state,
          query,
          configId: data.configId,
          stageLane: [
            ...stageLane.slice(0, index),
            {
              ...stage,
              stageLifeCycles: { ...data },
            },
            ...stageLane.slice(index + 1),
          ],
        };
      }
    },
  },
};
