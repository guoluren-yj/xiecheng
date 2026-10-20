/**
 * modal 考评结果查询
 * @date: 2018-12-29
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  queryList,
  fetchDetailList,
  queryDetailData,
  queryScoreDetail,
  queryOperationRecs,
  handlePrint,
  handleExport,
  handleLevel,
  handleArchivesPrint,
} from '@/services/evaluationQueryService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'evaluationQuery',

  state: {
    cycleValue: [], // 考评周期 select 组件值集
    dataSource: [], // 年度考评结果列表
    pagination: {}, // 分页器
    detailData: {}, // 详情页数据
    tableData: [],
    levelValue: [],
    scoreDetailList: [], // 评分明细数据
    archiveStatus: [],
    methodValue: [],
    operationRecs: [], // 操作记录列表
    operationRecsPage: [], // 操作记录列表分页
    detailLinePage: {}, // 详情页行数据分页
    detailList: [], // 考评结果查询-明细列表
    detailPagination: {}, // 考评结果查询-明细分页器
  },
  effects: {
    /**
     * 获取年度考评结果列表
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
    // 获取明细查询列表
    *fetchDetailList({ payload }, { put, call }) {
      const result = getResponse(yield call(fetchDetailList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailList: result.content,
            detailPagination: createPagination(result),
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
            detailLinePage: createPagination(result.kpiEvalDetailLineDTOPage),
          },
        });
      }
    },
    // 获取值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          archiveStatus: 'SSLM.KPI_EVAL_ALL_STATUS',
          cycleValue: 'SSLM.KPI_EVAL_CYCLE',
          methodValue: 'SSLM.KPI_EVAL_METHOD',
          levelValue: 'SSLM.KPI_EVAL_DIMENSION',
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
    // 获取操作记录
    *fetchOperationRecs({ payload }, { call, put }) {
      const result = getResponse(yield call(queryOperationRecs, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecs: result.content,
            operationRecsPage: createPagination(result),
          },
        });
      }
    },
    // 打印
    *handlePrint({ payload }, { call }) {
      const res = getResponse(yield call(handlePrint, payload));
      return res;
    },

    // 打印
    *handleArchivesPrint({ payload }, { call }) {
      const res = getResponse(yield call(handleArchivesPrint, payload));
      return res;
    },

    // 按档案导出
    *handleExport({ payload }, { call }) {
      const res = getResponse(yield call(handleExport, payload));
      return res;
    },

    // 查询等级分布
    *handleLevel({ payload }, { call }) {
      const res = getResponse(yield call(handleLevel, payload));
      return res;
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
