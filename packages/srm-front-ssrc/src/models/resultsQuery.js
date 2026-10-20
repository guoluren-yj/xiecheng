/**
 * model 寻源服务/询价结果查询
 * @date: 2019-2-18
 * @author: HZL <zili.hou@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import {
  fetchEntranceList,
  fetchQuoteLine,
  fetchResultsHeaderDetail,
} from '@/services/resultsQueryService';

import {
  fetchBasicInfoDetail,
  fetchExpertsInfo,
  fetchScorElementsData,
  fetchSupplierListData,
  fetchItemLine,
  fetchSupplierRecord,
  fetchEvaluateIndicAssign,
  fetchLinePackDetail,
  fetchLineNoneDetail,
  fetchAloneItemLine,
  fetchCalibrationQuotation,
  fetchBidMembers,
  fetchScoringElementData,
} from '@/services/bidEventQueryService';

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

function dealDataStateRecursive(data) {
  let config = [];

  config = data.map((item) => {
    if (item.children) {
      let subConfig = [];
      subConfig = item.children.map((subItem) => {
        return {
          ...subItem,
          _status: 'update',
        };
      });

      // eslint-disable-next-line
      item.children = subConfig;
    }

    return {
      ...item,
      _status: 'update',
    };
  });

  return config;
}

export default {
  namespace: 'resultsQuery',
  state: {
    resultsList: [], // 询报结果入口所有数据
    pagination: {}, // 询报结果入口所有数据分页
    oldTotalElements: 0, // 寻源大厅数据列表总条数
    header: {}, // 寻源结果明细页面头
    importHeader: {}, // 寻源结果导入页面头
    quoteLine: [], // 全部报价明细
    quoteLinePagination: {}, // 全部报价明细分页
    importQuoteLine: [], // 寻源结果全部报价明细
    importQuoteLinePagination: {}, // 寻源结果全部报价明细分页
    path: '', // 列表路径
    code: {}, // 值集
    supplierLine: [], // 供应商列表数据
    supplierLinePagination: {}, // 供应商列表数据分页
    itemLine: [], // 物品明细数据
    evaluateExpertList: [], // none/diff 合并
    scoringNoneTempelate: [], // 评分要素不区分数据
    scoringBusinessTempelate: [], // 评分要素商务组数据
    scoringTechnologyTempelate: [], // 评分要素技术组数据
    LineNoneList: [], // 行信息-不分标段数据
    LinePackList: [], // 行信息-分标段数据
    supplierData: [], // 物品明细供应商数据
    currentScoringExperts: [], // 当前评分要素专家数据
    bidMembersList: [], // 招标小组列表
    scoringElement: [], // 评分要素数据
    aloneItemLine: {}, // 招标事件查询：根据物料头id获取物料明细列表
    calibQuotationList: [], // 定标供应商下物品列表
  },
  effects: {
    // 询报价入口查询
    *fetchEntranceList({ payload }, { call, put }) {
      let result = yield call(fetchEntranceList, payload);
      result = getResponse(result);
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  resultsList: dealDataState(result.content),
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
    // 获取寻源结果头部信息
    *fetchResultsHeaderDetail({ payload }, { call, put }) {
      const { routerParam } = payload;
      const result = getResponse(yield call(fetchResultsHeaderDetail, payload));
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'resultImportDetail') {
            yield put({
              type: 'updateState',
              payload: {
                importHeader: result,
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                header: result,
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              header: result,
            },
          });
        }
      }
      return result;
    },
    // 获取寻源结果全部报价明细
    *fetchQuoteLine({ payload }, { call, put }) {
      const { routerParam } = payload;
      let result = yield call(fetchQuoteLine, payload);
      result = getResponse(result);
      if (result) {
        if (routerParam) {
          if (routerParam.typeName === 'resultImportDetail') {
            yield put({
              type: 'updateState',
              payload: {
                importQuoteLine: result.content,
                importQuoteLinePagination: createPagination(result),
              },
            });
          } else {
            yield put({
              type: 'updateState',
              payload: {
                quoteLine: result.content,
                quoteLinePagination: createPagination(result),
              },
            });
          }
        } else {
          yield put({
            type: 'updateState',
            payload: {
              quoteLine: result.content,
              quoteLinePagination: createPagination(result),
            },
          });
        }
        return result;
      }
    },
    // 获取招标事件查询明细头信息
    *fetchBasicInfoDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchBasicInfoDetail, payload));
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
    // 招标事件查询获取供应商列表
    *fetchSupplierListData({ payload }, { call, put }) {
      let result = yield call(fetchSupplierListData, payload);
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
    // 获取物品明细列表
    *fetchItemLine({ payload }, { call, put }) {
      let result = yield call(fetchItemLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemLine: dealDataStateRecursive(result),
          },
        });
      }
      return result;
    },
    // 获取招标事件查询专家分配数据
    *fetchExpertsInfo({ payload }, { call, put }) {
      let result = yield call(fetchExpertsInfo, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            evaluateExpertList: dealDataState(result.evaluateExpertList),
          },
        });
      }
    },
    // 获取招标事件查询评分要素数据
    *fetchScorElementsData({ payload }, { call, put }) {
      let result = yield call(fetchScorElementsData, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            scoringNoneTempelate: dealDataState(result.otherIndicList),
            scoringBusinessTempelate: dealDataState(result.businessIndicList),
            scoringTechnologyTempelate: dealDataState(result.technologyIndicList),
          },
        });
      }
    },
    // 行信息-不分标段查询
    *fetchLineNoneDetail({ payload }, { call, put }) {
      let result = yield call(fetchLineNoneDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            LineNoneList: dealDataStateRecursive(result),
          },
        });
      }
      return result;
    },
    // 行信息--区分标段查询
    *fetchLinePackDetail({ payload }, { call, put }) {
      let result = yield call(fetchLinePackDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            LinePackList: result,
          },
        });
      }
      return result;
    },
    // 物品明细供应商list
    *supplierRecord({ payload }, { call, put }) {
      let result = yield call(fetchSupplierRecord, payload);
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
    // 评分要素-专家分配-查询
    *fetchEvaluateIndicAssign({ payload }, { call, put }) {
      let result = yield call(fetchEvaluateIndicAssign, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentScoringExperts: dealDataState(result),
          },
        });
      }
    },
    // 获取招标小组
    *fetchBidMembers({ payload }, { call, put }) {
      let result = yield call(fetchBidMembers, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            bidMembersList: dealDataState(result),
          },
        });
      }
      return result;
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
    // 招标事件查询--单独获取物料行
    *fetchAloneItemLine({ payload }, { call, put }) {
      const { bidLineItemId } = payload;
      let result = yield call(fetchAloneItemLine, payload);
      result = getResponse(result);
      if (result) {
        const pagination = createPagination(result);
        yield put({
          type: 'updateItemList',
          payload: {
            bidLineItemId,
            pagination,
            list: dealDataState(result.content),
          },
        });
      }
    },
    // 招标事件查询区分标段供应商投标物料行查询API  ===> 展开物料行信息
    *fetchCalibrationQuotation({ payload }, { call, put }) {
      const { quotationHeaderId, sectionId } = payload;
      let result = yield call(fetchCalibrationQuotation, payload);
      result = getResponse(result);

      if (result) {
        const pagination = createPagination(result);
        yield put({
          type: 'updateCalibItemList',
          payload: {
            quotationHeaderId,
            sectionId,
            list: result.content,
            pagination,
          },
        });
      }
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
    updateItemList(state, { payload }) {
      const { aloneItemLine } = state;
      const { bidLineItemId, list, pagination } = payload;
      return {
        ...state,
        aloneItemLine: {
          ...aloneItemLine,
          [`${bidLineItemId}`]: {
            list,
            pagination,
          },
        },
      };
    },
    updateCalibItemList(state, { payload }) {
      const { calibQuotationList } = state;
      const { quotationHeaderId, sectionId, list, pagination } = payload;
      return {
        ...state,
        calibQuotationList: {
          ...calibQuotationList,
          [`${sectionId}#${quotationHeaderId}`]: {
            list,
            pagination,
          },
        },
      };
    },
  },
};
