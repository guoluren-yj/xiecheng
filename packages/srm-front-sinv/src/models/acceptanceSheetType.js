/*
 *
 * @date: 2018/11/13 17:47:27
 * @author: FQL <qilin.feng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { queryList, updateType, saveUuid } from '@/services/acceptanceSheetTypeService';

export default {
  namespace: 'acceptanceSheetType',

  state: {
    orderList: [], // 列表
    listPagination: {},
    listQuery: {}, // 列表查询条件
    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表
    selectedListRowKeys: [], // 列表页选中的项主键
    detailListDataSource: [], // 详情页列表数据
    detailListPagination: [], // 详情页分页信息
  },
  effects: {
    // 查询送货单审批列表
    *queryList({ payload }, { call }) {
      const result = getResponse(yield call(queryList, payload));
      if (result) {
        return result;
      }
    },
    *updateType({ payload }, { call }) {
      const result = getResponse(yield call(updateType, payload));
      if (result) {
        return result;
      }
    },

    *saveUuid({ payload }, { call }) {
      const result = getResponse(yield call(saveUuid, payload));
      if (result) {
        return result;
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
