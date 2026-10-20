/**
 * model 质检结果查询
 * @date: 2020-4-9
 * @author: JSS <shangshang.jing@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  fetchList,
  fetchDetailHeader,
  fetchDetectionList,
  fetchDefectList,
  fetchOperationRecordList,
  fetchListPrint,
  fetchRecordPrint,
} from '@/services/qualityResultService';
import { removeFileOrg, queryFileListOrg } from 'services/api';

export default {
  namespace: 'qualityResult',
  state: {
    list: [], // 数据列表
    pagination: {}, // 分页信息
    detailHeader: {},
    detectionList: {
      list: [],
      pagination: {},
    },
    defectList: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    // 来料检验单查询
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 来料检验单查询
    *fetchDetailHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDetailHeader, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailHeader: {
              ...result,
              campCustom: 'SUPPLIER',
            },
          },
        });
      }
      return result;
    },
    // 来料检验单查询
    *fetchDetectionList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDetectionList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detectionList: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    // 来料检验单查询
    *fetchDefectList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchDefectList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            defectList: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    // 删除附件
    *removeAttachment({ payload }, { call }) {
      const result = yield call(removeFileOrg, payload);
      return getResponse(result);
    },
    // 获取已上传附件
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },
    // fetchOperationRecordList
    *fetchOperationRecordList({ payload }, { call }) {
      const result = yield call(fetchOperationRecordList, payload);
      return getResponse(result);
    },
    // 批量打印
    *fetchListPrint({ payload }, { call }) {
      const res = getResponse(yield call(fetchListPrint, payload));
      return res;
    },
    // 明细页面打印
    *fetchRecordPrint({ payload }, { call }) {
      const res = getResponse(yield call(fetchRecordPrint, payload));
      return res;
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
