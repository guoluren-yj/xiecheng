/**
 * models - 报价作业
 * @date: 2019-05-27
 * @version: 1.0.0
 * @author: zoukang <kang.zou@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import {
  fetchDataList,
  saveTaskAction,
  submitTaskAction,
  fetchScoringElement,
  fetchScoringAssign,
  fetchScoringElementDelete,
  fetchScoringElementSave,
  fetchScoringAssignSave,
  fetchScoringTemplate,
  fetchProfessional,
  fetchProfessionalSave,
  fetchProfessionalDelete,
} from '@/services/bidTaskService';
import {
  fetchItemLine,
  fetchSupplier,
  fetchBidMembers,
  fetchSupplierLine,
  fetchScoringElementData,
  fetchTempelateDetailData,
  fetchInquiryHeaderDetail,
  fetchExpertAllocationData,
  fetchEvaluateIndicAssign,
  fetchClarifyDetail,
  fetchClarifyReferIssue,
  fetchClarifyViewDataList,
} from '@/services/bidHallService';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
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

  config = data.map(item => {
    if (item.children) {
      let subConfig = [];
      subConfig = item.children.map(subItem => {
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
  // return data;
}
export default {
  namespace: 'bidTask',
  state: {
    dataList: [], // bidTast data list
    pagination: {},
    code: {}, // LOV code
    header: {}, // 招标书明细头部数据
    itemLine: [], // 物品明细数据
    itemLinePagination: {}, // 物品明细分页
    supplierLine: [], // 供应商列表数据
    supplierLinePagination: {}, // 供应商列表数据分页
    bidMembersList: [], // 招标小组数据
    supplierData: [], // 查看筛选供应商数据
    scoringNoneTempelate: [], // 模板明细不区分数据
    scoringBusinessTempelate: [], // 模板明细商务组数据
    scoringTechnologyTempelate: [], // 模板明细技术组数据
    evaluateExpertList: [], // none/diff 合并
    scoringElement: [], // 评分要素数据
    currentScoringExperts: [], // 当前评分要素专家数据
    clarificationQuestionList: [], // 澄清函引用问题列表
    clarificationQuestionPagination: {}, // 澄清函引用问题分页参数
    clarificationDetails: {}, // 澄清函详情
    clarifyViewList: [], // 投标澄清查看列表
    clarifyViewPagination: {}, // // 投标澄清查看列表分页
    historys: '', // 页面路由记录
  },
  effects: {
    *fetchDataList({ payload }, { call, put }) {
      let result = yield call(fetchDataList, payload);
      result = getResponse(result);

      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dataList: result.content,
            pagination: createPagination(result),
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

    // 评分要素-查询
    *fetchScoringElement({ payload }, { call, put }) {
      let result = yield call(fetchScoringElement, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ScoringElement: {
              businessIndicList: dealDataState(result.businessIndicList),
              otherIndicList: dealDataState(result.otherIndicList),
              technologyIndicList: dealDataState(result.technologyIndicList),
            },
          },
        });
      }
      return result;
    },

    // 专家-查询
    *fetchProfessional({ payload }, { call, put }) {
      let result = yield call(fetchProfessional, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ProfElement: {
              evaluateExpertList: dealDataState(result.evaluateExpertList),
            },
          },
        });
      }
      return result;
    },

    // 专家分配-查询
    *fetchScoringAssign({ payload }, { call, put }) {
      let result = yield call(fetchScoringAssign, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ScoringAssign: dealDataState(result),
          },
        });
      }
      return result;
    },

    // 参考模板-查询
    *fetchScoringTemplate({ payload }, { call, put }) {
      let result = yield call(fetchScoringTemplate, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ScoringElement: {
              businessIndicList: dealDataState(result.businessIndicList),
              otherIndicList: dealDataState(result.otherIndicList),
              technologyIndicList: dealDataState(result.technologyIndicList),
            },
          },
        });
      }
      return result;
    },

    // 招标作业-保存
    *saveTaskAction({ payload }, { call }) {
      const result = getResponse(yield call(saveTaskAction, payload));
      return result;
    },
    // 招标作业-提交
    *submitTaskAction({ payload }, { call }) {
      const result = getResponse(yield call(submitTaskAction, payload));
      return result;
    },
    // 评分要素-保存
    *fetchScoringElementSave({ payload }, { call }) {
      const result = getResponse(yield call(fetchScoringElementSave, payload));
      return result;
    },

    // 专家-保存
    *fetchProfessionalSave({ payload }, { call }) {
      const result = getResponse(yield call(fetchProfessionalSave, payload));
      return result;
    },

    // 专家分配-保存
    *fetchScoringAssignSave({ payload }, { call }) {
      const result = getResponse(yield call(fetchScoringAssignSave, payload));
      return result;
    },

    // 评分要素-批量删除
    *fetchScoringElementDelete({ payload }, { call }) {
      const result = getResponse(yield call(fetchScoringElementDelete, payload));
      return result;
    },

    // 专家-批量删除
    *fetchProfessionalDelete({ payload }, { call }) {
      const result = getResponse(yield call(fetchProfessionalDelete, payload));
      return result;
    },

    // 获取招标大厅维护头
    *fetchBidHeaderDetail({ payload }, { call, put }) {
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
            itemLine: dealDataStateRecursive(result),
            itemLinePagination: createPagination(result),
          },
        });
      }
      return result;
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
    // 获取模板明细数据
    *fetchTempelateDetailData({ payload }, { call, put }) {
      let result = yield call(fetchTempelateDetailData, payload);
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
    // 获取专家分配数据
    *fetchExpertAllocationData({ payload }, { call, put }) {
      let result = yield call(fetchExpertAllocationData, payload);
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
    // 澄清函详情
    *fetchClarifyDetail({ payload }, { call, put }) {
      let result = yield call(fetchClarifyDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarificationDetails: result,
          },
        });
      }
      return result;
    },
    // 澄清函关联问题查询
    *fetchClarifyReferIssue({ payload }, { put, call }) {
      const result = getResponse(yield call(fetchClarifyReferIssue, payload));
      yield put({
        type: 'updateState',
        payload: {
          clarificationQuestionList: dealDataState(result.content),
          clarificationQuestionPagination: createPagination(result),
        },
      });
    },
    // 采购方澄清函查看list
    *fetchClarifyViewDataList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchClarifyViewDataList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            clarifyViewList: dealDataState(result.content),
            clarifyViewPagination: createPagination(result),
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
  },
};
