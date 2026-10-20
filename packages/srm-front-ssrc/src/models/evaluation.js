/**
 * model - 评标方法
 * @date: 2019-5-16
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryEvaluationList, evaluationSave } from '@/services/evaluationService';

export default {
  namespace: 'evaluation',
  state: {
    evaluationList: {}, // 评标方法List
    evaluationPagination: {}, // 评标方法分页参数
  },
  effects: {
    // 查询评标方法列表
    *queryEvaluationList({ payload }, { call, put }) {
      const evaluationList = getResponse(yield call(queryEvaluationList, payload));
      const evaluationPagination = createPagination(evaluationList);
      yield put({
        type: 'updateState',
        payload: { evaluationList, evaluationPagination },
      });
      return evaluationList;
    },

    // 新建／编辑的保存
    *evaluationSave({ payload }, { call }) {
      const data = getResponse(yield call(evaluationSave, payload));
      return data;
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
