/*
 * orderTypeOrg - 租户级采购订单类型维护
 * @date: 2018/10/13 11:19:56
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isArray } from 'lodash';

import {
  queryOrderTypeList,
  queryDemandTypeList,
  queryRpTypeDetail,
  queryRpTypeList,
  queryProTypeList,
  saveProType,
  saveRpType,
  addOrderType,
  addDemandType,
  queryLineTypeList,
  queryLineTypeDetail,
  addLineType,
  queryAccountList,
  saveAccount,
  queryFielsList,
  saveFielsList,
  queryCategory,
  queryCurrentCategory,
  queryDemandTypeDetail,
  queryProTypeDetail,
} from '@/services/orderTypeOrgService';
import { getResponse, createPagination } from 'utils/utils';
import { queryIdpValue } from 'services/api';

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
  namespace: 'orderTypeOrg',

  state: {
    orderTypeList: [],
    orderTypePagination: {},
    flags: [],
    dataSources: [],
    demandTypeList: [],
    demandTypePagination: {},
    lineTypeList: [],
    lineTypePagination: {},
    rpTypeList: [],
    rpTypePagination: {},
    proTypePagination: {},
    proTypeList: [],
  },

  effects: {
    // 查询值集
    *init(params, { call, put }) {
      const flags = getResponse(yield call(queryIdpValue, 'HPFM.FLAG'));
      const dataSources = getResponse(yield call(queryIdpValue, 'HPFM.DATA_SOURCE'));
      yield put({
        type: 'updateState',
        payload: {
          flags: flags || [],
          dataSources: dataSources || [],
        },
      });
    },
    // 查询采购订单类型列表
    *queryOrderTypeList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryOrderTypeList, payload));
      if (result) {
        const total = isArray(result) ? result.length : 0;
        yield put({
          type: 'updateState',
          payload: {
            orderTypeList: result,
            orderTypePagination: {
              total,
              pageSize: total,
            },
          },
        });
      }
    },
    // 查询需求计划类型列表
    *queryRpTypeList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryRpTypeList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            rpTypeList: dealDataState(result.content),
            rpTypePagination: createPagination(result),
          },
        });
      }
    },

    // 查询需求计划类型列表
    *queryProTypeList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryProTypeList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            proTypeList: dealDataState(result.content),
            proTypePagination: createPagination(result),
          },
        });
      }
    },

    // 添加需求计划类型维护
    *saveProType({ payload }, { call }) {
      const result = yield call(saveProType, payload);
      return getResponse(result);
    },

    // 查询需求类型维护列表
    *queryDemandTypeList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDemandTypeList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            demandTypeList: dealDataState(result.content),
            demandTypePagination: createPagination(result),
          },
        });
      }
    },
    // 添加采购订单类型
    *addOrderType({ payload }, { call }) {
      const orderType = yield call(addOrderType, payload);
      return getResponse(orderType);
    },
    // 添加需求类型维护
    *addDemandType({ payload }, { call }) {
      const result = yield call(addDemandType, payload);
      return getResponse(result);
    },
    // 添加需求计划类型维护
    *saveRpType({ payload }, { call }) {
      const result = yield call(saveRpType, payload);
      return getResponse(result);
    },
    // 查询账户分配类别列表
    *queryAccountList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryAccountList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            accountList: result.content,
            accountPagination: createPagination(result),
          },
        });
      }
    },
    // 查询采购行类型列表
    *queryLineTypeList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryLineTypeList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            lineTypeList: result.content,
            lineTypePagination: createPagination(result),
          },
        });
      }
    },
    // 查询采购行详情
    *queryLineTypeDetail({ payload }, { call }) {
      const result = getResponse(yield call(queryLineTypeDetail, payload));
      return result;
    },
    // 保存采购行
    *addLineType({ payload }, { call }) {
      const result = getResponse(yield call(addLineType, payload));
      return result;
    },
    // 保存账户分配类别
    *saveAccount({ payload }, { call }) {
      const result = getResponse(yield call(saveAccount, payload));
      return result;
    },
    // 查询字段必输设置
    *queryFielsList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryFielsList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            fieldsList: result.content.map((item) => ({ ...item, _status: 'update' })),
            filesPagination: createPagination(result),
          },
        });
      }
    },
    // 保存字段必输设置
    *saveFielsList({ payload }, { call }) {
      const result = getResponse(yield call(saveFielsList, payload));
      return result;
    },
    // 查询自主品类数据
    *queryCategory({ payload }, { call }) {
      const result = getResponse(yield call(queryCategory, payload));
      return result;
    },
    // 查询当前行的自主品类信息
    *queryCurrentCategory({ payload }, { call }) {
      const result = getResponse(yield call(queryCurrentCategory, payload));
      return result;
    },
    // 查询需求计划行详情
    *queryRpTypeDetail({ payload }, { call }) {
      const result = getResponse(yield call(queryRpTypeDetail, payload));
      return result;
    },
    // 查询申请类型行详情
    *queryDemandTypeDetail({ payload }, { call }) {
      const result = getResponse(yield call(queryDemandTypeDetail, payload));
      return result;
    },
    // 查询项目类型行详情
    *queryProTypeDetail({ payload }, { call }) {
      const result = getResponse(yield call(queryProTypeDetail, payload));
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
