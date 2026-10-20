/**
 * index.js - 总账科目定义
 * @date: 2019-11-13
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { queryList } from '@/services/generalLedgerAccountServices';
// import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'generalLedgerAccount',
  state: {
    dataSource: [], // 数据
    pagination: {},
    selectedRows: [],
    selectedRowKeys: [],
  },
  effects: {
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map(n => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
      }
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
