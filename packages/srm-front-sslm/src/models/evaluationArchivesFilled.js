/**
 * model - 已填制的考评档案
 * @date: 2019-01-02
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2019, Hand
 */
import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  queryList,
  queryDetailData,
  activityLogFetch,
  handleScoreCancel,
} from '@/services/evaluationArchivesFilledService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'evaluationArchivesFilled',

  state: {
    dataSource: [], // 考评结果列表
    detailData: {}, // 已填制考评档案详情页
    pagination: {}, // 分页器
    evaluationCycle: [], // 考评周期
    evaluationDim: [], // 考评维度
    archiveStatus: [], // 档案状态
    methodValue: [],
    detailLinePage: {}, // 详情页行数据分页
  },

  effects: {
    // 获取已填制的考评档案列表
    *fetchList({ payload = {} }, { put, call }) {
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
    // 获取已填制考评档案详情页数据
    *fetchDetail({ payload = {} }, { put, call }) {
      const result = getResponse(yield call(queryDetailData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailData: result,
            detailLinePage: createPagination(result.kpiEvalDetailLineDTOPage),
          },
        });
      }
    },
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          evaluationCycle: 'SSLM.KPI_EVAL_CYCLE',
          evaluationDim: 'SSLM.KPI_EVAL_DIMENSION',
          archiveStatus: 'SSLM.KPI_EVAL_STATUS',
          methodValue: 'SSLM.KPI_EVAL_METHOD',
          tenantId,
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
     *获取操作记录 modal 数据
     *@params {object} payload - 页面/档案 id 的对象
     */
    *fetchActivityLog({ payload = {} }, { put, call }) {
      const res = getResponse(yield call(activityLogFetch, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            modalData: res.content,
            modalPagination: createPagination(res),
          },
        });
      }
      return res;
    },
    // 考评分数编辑保存
    *handleScoreCancel({ payload }, { call }) {
      return getResponse(yield call(handleScoreCancel, payload));
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
