/*
 * 供应商生命周期配置
 * @date: 2018-9-7
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import {
  searchStageNodes,
  searchSupplierStage,
  // searchApplyFormList,
  updateStageName,
  saveLifeStage,
  saveNode,
  deleteNode,
  deleteStage,
} from '@/services/supplierLifeConfigService';
import { queryUnifyIdpValue, queryMapIdpValue } from 'services/api';

export default {
  namespace: 'supplierLifeConfig',

  state: {
    nodeList: [], // 租户可选择生命周期节点列表
    lifeStage: [], // 供应商已维护生命周期阶段节点列表
    applyFormList: [], // 申请表单列表
    otherProps: {}, // 生命阶段除节点数组外的其他参数
    code: {}, // 值集
  },

  effects: {
    // 值集查询
    *init({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            code: res,
          },
        });
      }
    },
    // 获取可选用申请表单类型列表
    *fetchApplyForm({ payload }, { put, call }) {
      const applyFormList = getResponse(
        yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_UPGRADE_PAGE', {
          tenantId: payload.tenantId,
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          applyFormList,
        },
      });
    },
    // 查询生命周期阶段
    *fetchLifeCycleStage({ payload }, { call }) {
      const res = getResponse(yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_STAGE_SEQ', payload));
      return res;
    },
    // 获取租户供应商生命周期阶段节点列表
    *fetchStageNode({ payload }, { put, call }) {
      const result = getResponse(yield call(searchStageNodes, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            nodeList: result,
          },
        });
      }
    },
    // 获取已维护(供应商生命周期)配置节点
    *fetchLifeStage({ payload }, { put, call }) {
      const result = getResponse(yield call(searchSupplierStage, payload));
      if (result) {
        const { lifeCycleStgAssigns, ...others } = result;
        yield put({
          type: 'updateState',
          payload: {
            lifeStage: lifeCycleStgAssigns,
            otherProps: { ...others },
          },
        });
      }
    },
    *updateStageName({ payload }, { call }) {
      const result = yield call(updateStageName, payload);
      return getResponse(result);
    },
    // 移除已配置的生命节点
    *deleteStage({ payload }, { call }) {
      const result = yield call(deleteStage, payload);
      return getResponse(result);
    },
    // 租户生命周期维护确认
    *saveLifeStage({ payload }, { call }) {
      const result = yield call(saveLifeStage, payload);
      return getResponse(result);
    },
    // 新增阶段节点
    *saveNode({ payload }, { call }) {
      const result = yield call(saveNode, { ...payload });
      return getResponse(result);
    },
    // 删除阶段节点
    *deleteNode({ payload }, { call }) {
      const result = yield call(deleteNode, { ...payload });
      return getResponse(result);
    },
  },
  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
