/**
 * model 质量检验审批
 * @date: 2020-8-5
 * @author: JSS <shangshang.jing@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  fetchList,
  fetchDetailHeader,
  fetchDetectionList,
  fetchDefectList,
  fetchOperationRecordList,
  fetchApprovalRecordList,
  approvalData,
} from '@/services/qualityInspectApprovalService';
import { removeFileOrg, queryFileListOrg, queryMapIdpValue } from 'services/api';

export default {
  namespace: 'qualityInspectApproval',
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
    // 获取值集
    *fetchLov({ payload }, { call, put }) {
      const { tenantId } = payload;
      const result = getResponse(
        yield call(queryMapIdpValue, {
          assessmentResult: 'SQAM.ASSESSMENT_RESULT',
          decisionResult: 'SQAM.DECISION_RESULT', // 决策结果
          inspectionState: 'SQAM.INSPECTION_STATE',
          tenantId,
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap: result,
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
    *approval({ payload }, { call }) {
      const result = getResponse(yield call(approvalData, payload));
      return result;
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
