/**
 * model 我收到的考评结果
 * @date: 2018-12-28
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import {
  queryList,
  queryDetailData,
  queryScoreDetail,
  saveScoreDetail,
  submitComplaint,
  handleConfirm,
} from '@/services/receivedEvaluationResultService';

export default {
  namespace: 'receivedEvaluationResult',

  state: {
    dataSource: [], // 考评结果列表
    pagination: {}, // 分页器
    detailData: {}, // 详情页数据
    supplierList: [], // 供应商信息列表
    supplierListPagination: {}, // 供应商信息分页参数
    archiveStatus: [], // 档案状态
    levelValue: [],
    scoreDetailList: [], // 评分明细数据
  },
  effects: {
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          levelValue: 'SSLM.KPI_EVAL_DIMENSION',
        })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ...result,
          },
        });
      }
    },
    /**
     * 获取我收到的考评结果列表
     * @param {?Object} payload - 请求参数
     */
    *fetchList({ payload }, { put, call }) {
      const result = getResponse(yield call(queryList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    /**
     * 请求页面数据
     * @param {!string} params.id - 页面数据的Id
     */
    *fetchDetailData({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDetailData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: result,
            supplierList:
              result.kpiEvalDetailLineDTOPage && result.kpiEvalDetailLineDTOPage.content,
            supplierListPagination: result.kpiEvalDetailLineDTOPage
              ? createPagination(result.kpiEvalDetailLineDTOPage)
              : {},
          },
        });
      }
      return result;
    },
    // 获取评分明细数据
    *fetchScoreDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(queryScoreDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoreDetailList: result,
          },
        });
      }
    },
    // 保存
    *saveScoreDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveScoreDetail, payload));
      return result;
    },
    // 供应商确认
    *handleConfirm({ payload }, { call }) {
      const result = getResponse(yield call(handleConfirm, payload));
      return result;
    },
    // 提交申诉
    *submitComplaint({ payload }, { call }) {
      const result = getResponse(yield call(submitComplaint, payload));
      return result;
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
