/**
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-08-24 11:36:49
 * @FilePath: /srm-front-sslm/src/models/supplierLifeSearch.js
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
/*
 * model - 供应商生命周期申请单查询
 * @date: 2018-9-18
 * @author: WH <heng.wei@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import { searchApplyForm } from '@/services/supplierLifeSearchService';
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'supplierLifeSearch',
  state: {
    pagination: {}, // 分页参数
    formList: [], // 申请单数据
    formType: [], // 申请单类型
    formStatus: [], // 申请单状态
    stageList: [], // 阶段列表
  },
  effects: {
    // 获取阶段类型
    *fetchStageList({ payload }, { call, put }) {
      const result = getResponse(
        yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_STAGE', {
          tenantId: payload.tenantId,
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          stageList: result,
        },
      });
      return result;
    },
    // 获取申请单类型
    *fetchFormType(_, { call, put }) {
      const lovCode = {
        formType: 'SSLM.LIFE_CYCLE_REQ_TYEP',
        tenantId,
      };
      const result = getResponse(yield call(queryMapIdpValue, lovCode));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            formType: result.formType,
          },
        });
      }
    },
    // 获取申请单状态
    *fetchFormStatus(_, { call, put }) {
      const lovCode = {
        formStatus: 'SSLM.LIFE_CYCLE_REQ_STATUS',
        tenantId,
      };
      const result = getResponse(yield call(queryMapIdpValue, lovCode));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            formStatus: result.formStatus,
          },
        });
      }
    },
    // 获取申请单
    *fetchApplyForm({ payload }, { call, put }) {
      const result = getResponse(yield call(searchApplyForm, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            pagination: createPagination(result),
            formList: result.content,
          },
        });
      }
    },
  },
  reducers: {
    // 更新state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
