/**
 * model 我发起的8D
 * @date: 2018-11-23
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  fetchListMaintain,
  fetchDetailHeader,
  fetchDetectionList,
  fetchDefectList,
  fetchSave,
  fetchCount,
  fetchUnInspection,
  fetchSaveAttachmentUuid,
  fetchOperationRecordList,
  fetchApprovalRecordList,
  quoteAndCreate,
  submitData,
  deleteData,
  barCode,
  fetchListDelete,
} from '@/services/incomingInspectionQueryService';
// import { removeFileOrg, queryFileListOrg } from 'services/api';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';

export default {
  namespace: 'incomingInspectionMaintain',
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
    enumMap: {},
  },
  effects: {
    // 查询列表值集
    *fetchEnum(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SQAM.INSPECTION_TYPE',
          badCategoryMap: 'SQAM.BAD_CATEGORY',
          assessmentResultMap: 'SQAM.ASSESSMENT_RESULT',
          decisionResultMap: 'SQAM.DECISION_RESULT',
          inspectionStateMap: 'SQAM.INSPECTION_STATE',
          source: 'SQAM.INSPECTION_SOURCE',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },
    // 来料检验单查询
    *fetchList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchListMaintain, payload));
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
            detailHeader: result,
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
    // 查询阶段列表
    *queryFlagList(_, { call, put }) {
      const flagList = getResponse(yield call(queryUnifyIdpValue, 'SMDM.FLAG_REVERSE'));
      yield put({
        type: 'updateState',
        payload: {
          flagList,
        },
      });
    },
    // // 删除附件
    // *removeAttachment({ payload }, { call }) {
    //   const result = yield call(removeFileOrg, payload);
    //   return getResponse(result);
    // },
    // // 获取已上传附件
    // *fetchAttachment({ payload }, { call }) {
    //   const result = yield call(queryFileListOrg, payload);
    //   return getResponse(result);
    // },
    // fetchSave
    *fetchSave({ payload }, { call }) {
      const result = yield call(fetchSave, payload);
      return getResponse(result);
    },
    // fetchSaveAttachmentUuid
    *fetchSaveAttachmentUuid({ payload }, { call }) {
      const result = yield call(fetchSaveAttachmentUuid, payload);
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

    *fetchCount({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchCount, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            count: result,
          },
        });
      }
      return result;
    },
    *fetchUnInspection({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchUnInspection, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            unInspectionList: result.content,
            unInspectionPage: createPagination(result),
          },
        });
      }
      return result;
    },
    *quoteAndCreate({ payload }, { call }) {
      const result = getResponse(yield call(quoteAndCreate, payload));
      return result;
    },
    *submitData({ payload }, { call }) {
      const result = getResponse(yield call(submitData, payload));
      return result;
    },
    *deleteData({ payload }, { call }) {
      const result = getResponse(yield call(deleteData, payload));
      return result;
    },
    *barCode({ payload }, { call }) {
      const result = getResponse(yield call(barCode, payload));
      return result;
    },
    // 删除-质量整改创建

    *fetchListDelete({ payload }, { call }) {
      const result = yield call(fetchListDelete, payload);
      return getResponse(result);
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
