import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  queryList,
  queryOperationRecList,
  submit,
  fetchLine,
  creation,
  createCombineProtocol,
  handleOrderType,
  fetchCopyOrderList,
  copyOrder,
  // fetchOrderMergeRuleList,
  check,
  pendingFlag,
} from '@/services/orderMaintenanceEntryService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

/**
 * model 采购订单维护入口
 * @date: 2019-02-27
 * @author: zhengmin.liang <zhengmin.liang@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
export default {
  namespace: 'orderMaintenanceEntry',
  state: {
    dataSource: [], // 汇总页数据
    pagination: [], // 汇总页分页
    opRecordDataSource: [], // 操作记录数据
    opRecordPage: [], // 操作记录分页
    docSource: [], // 单据来源
    sourcePlatform: [], // 来源平台
    copyOrderList: [], // 订单复制数据
    copyOrderPagination: {}, // 订单复制分页
  },
  effects: {
    // 获取采购订单维护入口数据
    *fetchList({ payload }, { call, put }) {
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
      return result;
    },
    // 获取采购订单维护入口数据(count)
    *fetchListPage({ payload }, { call, put }) {
      const result = getResponse(yield call(queryList, { ...payload, onlyCountFlag: 'Y' }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            pagination: createPagination(result),
          },
        });
      }
    },
    // 获取采购订单维护入口操作记录数据
    *fetchOperationRecList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryOperationRecList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            opRecordDataSource: result.content,
            opRecordPage: createPagination(result),
          },
        });
      }
    },
    // 提交
    *submit({ payload }, { call }) {
      return getResponse(yield call(submit, payload));
    },
    // 获取lov
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          docSource: 'SODR.DOC_SOURCE',
          sourcePlatform: 'SPRM.SRC_PLATFORM',
          pcKindCode: 'SPCM.CONTRACT.KIND',
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
      return result;
    },
    *fetchLine({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchLine, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            // orderMaintenanceEntryQuery: payload,
            orderMaintenanceEntryList: result.content,
            orderMaintenanceEntryPage: createPagination(result),
          },
        });
      }
      return result;
    },
    *fetchLinePage({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchLine, { ...payload, onlyCountFlag: 'Y' }));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            orderMaintenanceEntryPage: createPagination(result),
          },
        });
      }
      return result;
    },
    *creation({ payload }, { call }) {
      const result = getResponse(yield call(creation, payload));
      return result;
    },
    *createCombineProtocol({ payload }, { call }) {
      const result = getResponse(yield call(createCombineProtocol, payload));
      return result;
    },
    *handleOrderType(_, { call }) {
      const result = getResponse(yield call(handleOrderType));
      return result;
    },
    *fetchCopyOrderList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchCopyOrderList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            copyOrderList: result.content,
            copyOrderPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *fetchCopyOrderListPage({ payload }, { call, put }) {
      const result = getResponse(
        yield call(fetchCopyOrderList, { ...payload, onlyCountFlag: 'Y' })
      );
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            copyOrderPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    *copyOrder({ payload }, { call }) {
      const result = getResponse(yield call(copyOrder, payload));
      return result;
    },
    // *fetchOrderMergeRuleList(_, { call }) {
    //   const result = getResponse(yield call(fetchOrderMergeRuleList));
    //   return result;
    // },
    // 查询Table页
    *check({ payload }, { call }) {
      const res = getResponse(yield call(check, payload));
      return res;
    },
    // 暂挂按钮
    *pendingFlag({ payload }, { call }) {
      const res = getResponse(yield call(pendingFlag, payload));
      return res;
    },
  },
  reducers: {
    // 合并state状态数据,生成新的state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
