/*
 * pcnmanageWorkbench - PCN工作台model
 * @date: 2021-06-07
 * @author: ZYF <yanfengz.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  headerBtnAffairHandle,
  batchApprovePass,
  batchApproveRefused,
} from '@/services/pcnmanageWorkbenchService';

export default {
  namespace: 'pcnmanageWorkbench',
  state: {
    dataSource: [], // 列表数据
    pagination: {}, // 分页参数
    headerButtonConfig: {}, // 头部按钮配置
  },

  effects: {
    // 查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
          },
        });
      }
    },
    // 头部按钮事务处理
    *headerBtnAffairHandle({ payload }, { call }) {
      const response = getResponse(yield call(headerBtnAffairHandle, payload));
      return response;
    },
    // 批量审批通过
    *batchApprovePass({ payload }, { call }) {
      const response = getResponse(yield call(batchApprovePass, payload));
      return response;
    },
    // 批量审批拒绝
    *batchApproveRefused({ payload }, { call }) {
      const response = getResponse(yield call(batchApproveRefused, payload));
      return response;
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
