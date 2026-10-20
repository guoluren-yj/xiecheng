/**
 * model 我发起的8D
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import { 
  fetchList,
  fetchDetailHeader,
  fetchDetectionList,
  fetchDefectList,
  fetchOperationRecordList,
  fetchApprovalRecordList,
  fetchListPrint,
  fetchRecordPrint,
  fetchSync,
  fetchCancel,
  fetchOtherList,
} from '@/services/incomingInspectionQueryService';
import { removeFileOrg, queryFileListOrg } from 'services/api';

export default {
  namespace: 'incomingInspectionQuery',
  state: {
    list: [], // 数据列表
    listAllData:{},
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
    EXPERIMENTALList: {
      list: [],
      pagination: {},
    },
    ASSEMBLYList: {
      list: [],
      pagination: {},
    },
    INSPECTIONList: {
      list: [],
      pagination: {},
    },
  },
  effects: {
    // 其他信息查询
    *fetchOtherList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchOtherList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            [`${payload.queryType}List`]: {
              list: result.content,
              pagination: createPagination(result),
            },
          },
        });
      }
    },
    // 来料检验单查询
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            listAllData: result,
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
              campCustom: 'PURCHASE',
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
    *fetchApprovalRecordList({ payload }, { call }) {
      const result = yield call(fetchApprovalRecordList, payload);
      return getResponse(result);
    },
    // 明细页面打印
    *fetchRecordPrint({ payload }, { call }) {
      const res = getResponse(yield call(fetchRecordPrint, payload));
      return res;
    },
    // 批量打印
    *fetchListPrint({ payload }, { call }) {
      const res = getResponse(yield call(fetchListPrint, payload));
      return res;
    },
    // 同步
    *fetchSync({ payload }, { call }) {
      const { incomingInspectionIds } = payload;
      const res = getResponse(yield call(fetchSync, incomingInspectionIds));
      return res;
    },
    // 取消
    *fetchCancel({ payload }, { call }) {
      const res = getResponse(yield call(fetchCancel, payload));
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
