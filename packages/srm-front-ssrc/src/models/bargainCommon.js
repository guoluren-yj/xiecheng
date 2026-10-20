/**
 * model - 议价
 * @date: 2019-12-31
 * @author: ZXM <ximin.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
// import { queryEvaluationList, evaluationSave } from '@/services/evaluationService';
import { operateResponseMessagePrompt } from '@/utils/common.js';

import {
  fetchBargainFullDetails,
  fetchBargainFullDetailsApproval,
  fetchBargainHeader,
  fetchSupplierLineBargainPrice,
  fetchItemDetailsInfo,
  saveCounterOffersBulk,
  saveCounterOffersOffline,
  handleSaveAllOffline,
  handleSaveAllOnline,
  handleStartAll,
  handleStartAllNew,
  bargainOnEnd,
  bargainOnFinished,
  uploadAttachement,
} from '@/services/bargainService';

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

// 将表格的分页关联上对应头supplierId
function relatedLinePagination(data, lineId) {
  const newData = {};
  newData[lineId] = data;
  return newData;
}

// 覆盖旧数据
function filterDuplicateData(data, newData) {
  data.forEach((value) => {
    newData.forEach((val) => {
      if (value.quotationLineId === val.quotationLineId) {
        Object.assign(value, val);
      }
    });
  });
  return data;
}

// 分页切换过滤数据
function filterPageData(data, newData, lineId) {
  const filterData = data.filter((item) => item.rfxLineSupplierId !== lineId);
  const dataAll = lineId ? [...filterData, ...newData] : [...newData, ...filterData];
  const keysObj = {};
  const dataProcess = [];
  dataAll.forEach((item) => {
    if (keysObj[item.quotationLineId]) {
      return;
    }
    dataProcess.push(item);
    keysObj[item.quotationLineId] = item;
  });
  return dataProcess;
}

const getModel = (modelName = 'bargain') => ({
  namespace: modelName,
  state: {
    bargainHeader: {}, // 议价头信息
    bargainFullDetails: [], // 议价全部报价明细
    bargainFullDetPagination: {}, // 议价全部报价明细分页
    bargainSupplierLine: [], // 议价供应商列表
    bargainSupplierLinePagination: {}, // 议价供应商列表分页
    supplierLine: [], // 供应商行表格
    supplierLinePagination: {}, // 供应商行表格分页
    bargainItemLine: [], // 物品明细头
    bargainItemLinePagination: {}, // 物品明细分页
    itemLine: [], // 物品明细行查询
    itemLinePagination: {}, // 物品行分页查询
  },
  effects: {
    // 获取议价头信息
    *fetchBargainHeader({ payload }, { call, put }) {
      const { routerParam } = payload;
      const result = getResponse(yield call(fetchBargainHeader, payload));
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'examinationDetail') {
            yield put({
              type: 'updateState',
              payload: {
                bargainHeader: result,
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                bargainHeader: result,
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              bargainHeader: result,
            },
          });
        }
      }
      return result;
    },

    // 全部报价明细
    *fetchBargainFullDetails({ payload }, { call, put }) {
      const { flag, isApproval = null, ...otherPayload } = payload;
      let result = null;
      if (isApproval === 'Approval') {
        result = yield call(fetchBargainFullDetailsApproval, payload); // 工作流审批
      } else {
        result = yield call(fetchBargainFullDetails, otherPayload);
      }

      result = getResponse(result);
      if (result) {
        if (payload.flag === 1) {
          const supplierLinePagination = relatedLinePagination(
            createPagination(result),
            // payload.supplierCompanyId
            payload.rfxLineSupplierId
          );
          yield put({
            type: 'updateSupplierQuoteLineData',
            payload: {
              supplierLine: dealDataState(result.content),
              supplierLinePagination,
            },
          });
        } else if (payload.flag === 2) {
          const itemLinePagination = relatedLinePagination(
            createPagination(result),
            payload.rfxLineItemId
          );
          yield put({
            type: 'updateItemQuoteLineData',
            payload: {
              itemLine: dealDataState(result.content),
              itemLinePagination,
            },
          });
        } else {
          yield put({
            type: 'updateState',
            payload: {
              bargainFullDetails: dealDataState(result.content),
              bargainFullDetPagination: {
                ...createPagination(result),
                pageSizeOptions: ['10', '20', '50', '100', '200'],
              },
            },
          });
        }
      }
      return result;
    },

    // 全部报价明细 - 特殊查询
    *fetchBargainDetails({ payload }, { call, put }) {
      const { flag, dataSource, type, ...otherPayload } = payload;
      let result = yield call(fetchBargainFullDetails, otherPayload);
      result = getResponse(result);
      if (result) {
        if (payload.flag === 1) {
          const supplierLinePagination = relatedLinePagination(
            createPagination(result),
            // payload.supplierCompanyId
            payload.rfxLineSupplierId
          );
          yield put({
            type: 'updateState',
            payload: {
              supplierLine:
                type === 'pageSave'
                  ? filterPageData(
                      dataSource,
                      dealDataState(result.content),
                      // otherPayload.supplierCompanyId,
                      otherPayload.rfxLineSupplierId
                    )
                  : filterDuplicateData(dataSource, dealDataState(result.content)),
              supplierLinePagination,
            },
          });
        } else {
          const itemLinePagination = relatedLinePagination(
            createPagination(result),
            payload.rfxLineItemId
          );
          yield put({
            type: 'updateState',
            payload: {
              itemLine:
                type === 'pageSave'
                  ? filterPageData(dataSource, dealDataState(result.content))
                  : filterDuplicateData(dataSource, dealDataState(result.content)),
              itemLinePagination,
            },
          });
        }
      }
      return result;
    },

    // 获取供应商议价列表
    *fetchSupplierLineBargainPrice({ payload }, { call, put }) {
      let result = yield call(fetchSupplierLineBargainPrice, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bargainSupplierLine: dealDataState(result.content),
            bargainSupplierLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // 物品明细查询
    *fetchItemDetailsInfo({ payload }, { call, put }) {
      let result = yield call(fetchItemDetailsInfo, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bargainItemLine: dealDataState(result.content),
            bargainItemLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // 批量填写还价保存接口 - 线上
    *saveCounterOffersBulk({ payload }, { call }) {
      const result = yield call(saveCounterOffersBulk, payload);
      return getResponse(result);
    },

    // 批量填写还价保存接口 - 线下
    *saveCounterOffersOffline({ payload }, { call }) {
      const result = yield call(saveCounterOffersOffline, payload);
      return getResponse(result);
    },

    // 保存当前table页数据 - 线下
    *handleSaveAllOffline({ payload }, { call }) {
      const result = yield call(handleSaveAllOffline, payload);
      return operateResponseMessagePrompt({
        res: result,
      });
    },
    // 保存当前table页数据 - 线上
    *handleSaveAllOnline({ payload }, { call }) {
      const result = yield call(handleSaveAllOnline, payload);
      return getResponse(result);
    },

    // 发起议价
    *handleStartAll({ payload }, { call }) {
      const result = yield call(handleStartAll, payload);
      return getResponse(result);
    },
    // 发起议价-new
    *handleStartAllNew({ payload }, { call }) {
      const result = yield call(handleStartAllNew, payload);
      return getResponse(result);
    },

    // 结束议价
    *bargainOnEnd({ payload }, { call }) {
      const result = yield call(bargainOnEnd, payload);
      return getResponse(result);
    },

    // 完成议价
    *bargainOnFinished({ payload }, { call }) {
      const result = yield call(bargainOnFinished, payload);
      return getResponse(result);
    },

    // 上传传递uuid
    *uploadAttachement({ payload }, { call }) {
      const result = yield call(uploadAttachement, payload);
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

    // // 更行供应商数据
    // updateStateSupplierLine(state, { payload }) {
    //   // return {
    //   //   ...state,
    //   //   supplierLine: [...state.supplier],
    //   // };
    // },

    // 针对供应商表格平铺的数据处理
    updateSupplierQuoteLineData(state, { payload }) {
      return {
        ...state,
        supplierLine: [...state.supplierLine, ...payload.supplierLine],
        supplierLinePagination: {
          ...state.supplierLinePagination,
          ...payload.supplierLinePagination,
        },
      };
    },
    // 针对物品明细表格平铺的数据处理
    updateItemQuoteLineData(state, { payload }) {
      return {
        ...state,
        itemLine: [...state.itemLine, ...payload.itemLine],
        itemLinePagination: {
          ...state.itemLinePagination,
          ...payload.itemLinePagination,
        },
      };
    },
  },
});

export default getModel;
