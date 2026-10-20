/**
 * model 寻源服务/询报价控制
 * @date: 2018-12-25
 * @author: <baocheng.li@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  fetchDataList,
  fetchInquiryHeaderDetail,
  fetchItemLine,
  fetchSupplierLine,
  fetchSupplier,
  quotationControll,
  handleAdjustTime,
  fetchAddSupplierLine,
  getStage,
  fetchMaterial,
  fetchLadderLevelTable,
  fetchScoringElementData,
} from '@/services/inquiryHallService';
import { finishQuotation } from '@/services/offlineResultEntryService';
import { queryMapIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'quotationController',
  state: {
    list: [], // 寻源大厅数据列表
    oldTotalElements: 0, // 寻源大厅数据列表总条数
    code: {}, // 值集
    pagination: {}, // 分页器
    header: {}, // 寻源大厅维护页面头
    itemLine: [], // 物品明细数据
    supplierLine: [], // 供应商列表数据
    itemLinePagination: {}, // 物品明细分页
    supplierLinePagination: {}, // 供应商列表数据分页
    addSupplierLine: [],
    materialLine: [], // 询报价控制页面分配可见物品行
    scoringElement: [], // 评分要素数据
  },
  effects: {
    // 获取列表
    *fetchDataList({ payload }, { call, put }) {
      let result = yield call(fetchDataList, payload);
      result = getResponse(result);
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  list: result.content,
                  pagination: createPagination(result),
                }
              : {
                  pagination: createPagination(result),
                  oldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端,
                },
        });
      }
      return result;
    },
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
    // 获取寻源大厅维护头
    *fetchInquiryHeaderDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInquiryHeaderDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      return result;
    },
    // 获取物品明细列表
    *fetchItemLine({ payload }, { call, put }) {
      let result = yield call(fetchItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLine: dealDataState(result.content),
            itemLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 获取阶梯报价数据
    *fetchLadderLevelTable({ payload }, { call, put }) {
      let result = yield call(fetchLadderLevelTable, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quotaLadderLevelData: dealDataState(result.content),
          },
        });
      }
    },
    // 获取供应商列表
    *fetchSupplierLine({ payload }, { call, put }) {
      let result = yield call(fetchSupplierLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierLine: dealDataState(result.content),
            supplierLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 供应商list
    *supplierRecord({ payload }, { call, put }) {
      let result = yield call(fetchSupplier, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierData: dealDataState(result),
          },
        });
      }
    },
    // 获取评分要素定义数据
    *fetchScoringElementData({ payload }, { call, put }) {
      let result = yield call(fetchScoringElementData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringElement: dealDataState(result),
          },
        });
      }
    },
    // 请求stage
    *getStage({ payload }, { call, put }) {
      let res = yield call(getStage, payload);
      res = getResponse(res);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            stageData: dealDataState(res),
          },
        });
      }
    },
    // 暂停询报价
    *pause({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 关闭询报价
    *close({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 重启询报价
    *resume({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 结束
    *over({ payload }, { call }) {
      const res = yield call(quotationControll, payload);
      return getResponse(res);
    },
    // 调整时间
    *handleAdjustTime({ payload }, { call }) {
      const res = yield call(handleAdjustTime, payload);
      return getResponse(res);
    },
    // 添加供应商物料
    *fetchMaterial({ payload }, { call, put }) {
      let result = yield call(fetchMaterial, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            materialLine: dealDataState(result),
          },
        });
      }
    },
    // 添加供应商
    *fetchAddSupplierLine({ payload }, { call, put }) {
      let result = yield call(fetchAddSupplierLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            addSupplierLine: dealDataState(result.content),
          },
        });
      }
    },
    // 一键终止报价
    *finishQuotation({ payload }, { call }) {
      return getResponse(yield call(finishQuotation, payload));
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
