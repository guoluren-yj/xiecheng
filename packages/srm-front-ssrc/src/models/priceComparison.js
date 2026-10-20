/**
 * models - 比价助手
 * @date: 2020-03-23
 * @version: 1.0.0
 * @author: cj <juan.chen01@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';

import { getResponse, createPagination } from 'utils/utils';

import {
  fetchSideBarMenu,
  fetchPriceComparisonHeader,
  fetchPriceComparisonItem,
  fetchPriceComparisonSupplier,
  fetchQuotationDetailSideMenu,
  fetchQuotationDetailFilter,
  fetchQuotationDetailData,
  fetchLatestQuotation,
  fetchThisQuoteProcessTable,
  fetchThisQuoteProcessChart,
  fetchThisQuoteTotalChart,
  fetchThisQuoteTotalTable,
  fetchHistoryPriceAnalysisChart,
  fetchHistoryPriceAnalysisTable,
  exportQuotationDetail,
  exportLatestOffer,
  exportPriceComparison,
  savePriceComparisonConfig,
  fetchPriceComparisonConfigs,
  exportThisQuoteProcess,
} from '@/services/priceComparisonService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'priceComparison',
  state: {
    code: {}, // 值集编码
    priceComparisonHeader: {}, // 比价助手头
    priceComparisonItemList: [], // 比价助手物品
    priceComparisonSupplierList: [], // 比价助手供应商
    priceComparisonConfigs: {}, // 比价助手配置项
    quotationDetailSideMenu: [], // 报价明细侧边导航栏
    quotationDetailFilter: {}, // 报价明细筛选框数据
    quotationDetailData: [], // 报价明细右边表格
    sideBarMenuList: [], // 侧边物料导航栏
    latestQuotationList: [], // 最新报价表格数据
    thisQuoteProcessTableList: [], // 本次报价过程物料表格
    thisQuoteProcessTablePagination: {}, // 本次报价过程物料表格分页
    thisQuoteProcessChartList: [], // 本次报价过程物料柱状图
    thisQuoteTotalTableList: [], // 本次报价过程总价表格
    thisQuoteTotalTablePagination: {}, // 本次报价过程总价表格分页
    historyPriceAnalysisChartList: [], // 历史价格分析物料折线图
    historyPriceAnalysisTableList: [], // 历史价格分析物料表格
    historyPriceAnalysisPagination: {}, // 历史价格分析物料表格分页
  },
  effects: {
    // 获取多个值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    // 比价助手头
    *fetchPriceComparisonHeader({ payload }, { call, put }) {
      let result = yield call(fetchPriceComparisonHeader, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceComparisonHeader: result,
          },
        });
        return result;
      }
    },
    // 比价助手物品
    *fetchPriceComparisonItem({ payload }, { call, put }) {
      let result = yield call(fetchPriceComparisonItem, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceComparisonItemList: result,
          },
        });
      }
      return result;
    },
    // 比价助手供应商
    *fetchPriceComparisonSupplier({ payload }, { call, put }) {
      let result = yield call(fetchPriceComparisonSupplier, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceComparisonSupplierList: result,
          },
        });
      }
      return result;
    },
    // 报价明细侧边栏
    *fetchQuotationDetailSideMenu({ payload }, { call, put }) {
      let result = yield call(fetchQuotationDetailSideMenu, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetailSideMenu: result,
          },
        });
      }
      return result;
    },
    // 报价明细筛选框
    *fetchQuotationDetailFilter({ payload }, { call, put }) {
      let result = yield call(fetchQuotationDetailFilter, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetailFilter: result,
          },
        });
      }
      return result;
    },
    // 报价明细右边表格
    *fetchQuotationDetailData({ payload }, { call, put }) {
      let result = yield call(fetchQuotationDetailData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotationDetailData: result,
          },
        });
      }
      return result;
    },
    // 最新报价
    *fetchLatestQuotation({ payload }, { call, put }) {
      let result = yield call(fetchLatestQuotation, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            latestQuotationList: result.content,
          },
        });
      }
    },
    // 本次报价过程、历史价格分析物料导航栏
    *fetchSideBarMenu({ payload }, { call, put }) {
      let result = yield call(fetchSideBarMenu, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            sideBarMenuList: result,
          },
        });
      }
      return result;
    },
    // 本次报价过程物料表格
    *fetchThisQuoteProcessTable({ payload }, { call, put }) {
      let result = yield call(fetchThisQuoteProcessTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            thisQuoteProcessTableList: result.content,
            thisQuoteProcessTablePagination: createPagination(result),
          },
        });
      }
    },
    // 本次报价过程物料图表
    *fetchThisQuoteProcessChart({ payload }, { call, put }) {
      let result = yield call(fetchThisQuoteProcessChart, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            thisQuoteProcessChartList: result,
          },
        });
      }
      return result;
    },
    // 本次报价过程总价图表
    *fetchThisQuoteTotalChart({ payload }, { call }) {
      let result = yield call(fetchThisQuoteTotalChart, payload);
      result = getResponse(result);
      return result;
    },
    // 本次报价过程总价表格
    *fetchThisQuoteTotalTable({ payload }, { call, put }) {
      let result = yield call(fetchThisQuoteTotalTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            thisQuoteTotalTableList: result.content,
            thisQuoteTotalTablePagination: createPagination(result),
          },
        });
      }
    },
    // 查询历史价格分析-折线图表
    *fetchHistoryPriceAnalysisChart({ payload }, { call, put }) {
      let result = yield call(fetchHistoryPriceAnalysisChart, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historyPriceAnalysisChartList: result,
          },
        });
      }
      return result;
    },
    // 查询历史价格分析-相似物品最低一览表
    *fetchHistoryPriceAnalysisTable({ payload }, { call, put }) {
      let result = yield call(fetchHistoryPriceAnalysisTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historyPriceAnalysisTableList: result.content,
            historyPriceAnalysisPagination: createPagination(result),
          },
        });
      }
    },
    // 比价助手-报价明细-导出
    *exportQuotationDetail({ payload }, { call }) {
      const result = yield call(exportQuotationDetail, payload);
      return getResponse(result);
    },
    // 比价助手-最新报价-导出
    *exportLatestOffer({ payload }, { call }) {
      const result = yield call(exportLatestOffer, payload);
      return getResponse(result);
    },
    // 比价助手-导出
    *exportPriceComparison({ payload }, { call }) {
      const result = yield call(exportPriceComparison, payload);
      return getResponse(result);
    },
    // 比价助手-查询配置项
    *fetchPriceComparisonConfigs({ payload }, { call, put }) {
      let result = yield call(fetchPriceComparisonConfigs, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceComparisonConfigs: result,
          },
        });
      }
      return result;
    },
    // 比价助手-保存配置项
    *savePriceComparisonConfig({ payload }, { call }) {
      const result = yield call(savePriceComparisonConfig, payload);
      return getResponse(result);
    },
    // 比价助手-本次报价过程-导出
    *exportThisQuoteProcess({ payload }, { call }) {
      const result = yield call(exportThisQuoteProcess, payload);
      return getResponse(result);
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
