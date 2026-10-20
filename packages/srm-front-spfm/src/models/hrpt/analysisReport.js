/**
 * model 采购额分析报表
 * @date: 2020-1-10
 * @author: mjq <jiaqi.mao@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */

import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';

import { fetchAnalysisReport } from '@/services/hrpt/analysisReportService';

export default {
  namespace: 'analysisReport',

  state: {
    code: {}, // 值集
    dataSource: [], // 列表数据
    pagination: {}, // 列表分页参数
  },
  effects: {
    // 查询值集
    *fetchCode(_, { call, put }) {
      const code = getResponse(
        yield call(queryMapIdpValue, {
          statisticalDimension: 'SODR.STATISTICAL_DIMENSION',
          orderSource: 'SPRM.SRC_PLATFORM',
          timeStatistics: 'SODR.REPORT_TIME_DIMENSION',
        })
      );
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 查询报表列表
    *fetchAnalysisReport({ payload }, { call }) {
      const response = getResponse(yield call(fetchAnalysisReport, payload));
      return response;
    },
    // 查询柱状图数据
    *fetchAnalysisReportHistogram({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchAnalysisReport, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            histogramDataSource: (response.content || []).filter((item, index) => {
              return index < (response.size || 0);
            }),
          },
        });
      }
      return response;
    },
  },
  reducers: {
    // 更新state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
