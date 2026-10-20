/**
 * purchaseRequisitionCancel - 需求取消
 * @date: 2019-1-25
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryIdpValue, queryMapIdpValue } from 'services/api';

import {
  fetchOperationRecordList,
  fetchUpdateRecordList,
  cancelPurchase,
  cancelPurchaseByWhole,
  searchList,
  searchSingleList,
  // fetchSingleData,
  cancelERP,
  cancel,
  queryDetailHeader,
  queryErpHeader, // erp详情头获取
  queryDetailList,
  queryErpList, // erp详情行获取
  fetchPurchaseClose,
  fetchPurchaseLinesClose,
  sendBack,
  fetchPurchaseSubmit,
  fetchPrChangeConfigs,
  fetchDoExecute,
  revokeChange,
} from '@/services/purchaseRequisitionCancelService';

export default {
  namespace: 'purchaseRequisitionCancel',
  state: {
    statusList: [], // 状态值集
    sourceList: [], // 单据来源值集
    abcList: [],
    tableData: [], // 列表数据源
    pagination: {}, // 分页信息
    dataSource: [], // 整单取消tab页数据源
    singlePagination: {}, // 整单取消tab页分页数据
    erpDataSource: [], // erp页数据源
    erpPagination: {}, // erp页分页数据
    erpBasicInfo: {}, // erp页基本数据
    prChangeConfigs: [], // pr配置

    lastActiveTabKey: 'lineCancel',
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
      return result;
    },
    *fetchTotalCountAsync({ options }, { call, put }) {
      const { payload, needCountFlag, pageStateName, queryRequest } = options || {};
      if (!payload || needCountFlag !== 'Y') return;
      const response = yield call(queryRequest, { ...payload, onlyCountFlag: 'Y' });
      const result = getResponse(response);
      if (!result) return;
      yield put({
        type: 'updateState',
        payload: {
          [pageStateName]: createPagination(result),
        },
      });
    },
    // 按行取消tab页查询请求
    *searchList({ payload }, { call, put }) {
      const res = getResponse(yield call(searchList, { ...payload, asyncCountFlag: 'DEFAULT' }));
      if (!isEmpty(res)) {
        const { content, needCountFlag } = res;
        yield put({
          type: 'updateState',
          payload: {
            tableData: content,
            pagination: createPagination(res),
          },
        });
        yield put({
          type: 'fetchTotalCountAsync',
          options: {
            payload,
            needCountFlag,
            pageStateName: 'pagination',
            queryRequest: searchList,
          },
        });
      }
      return res;
    },
    // 整单取消tab页查询请求
    *searchSingleOrder({ payload }, { call, put }) {
      const res = getResponse(
        yield call(searchSingleList, { ...payload, asyncCountFlag: 'DEFAULT' })
      );
      if (!isEmpty(res)) {
        const { content, needCountFlag } = res;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: content,
            singlePagination: createPagination(res),
          },
        });
        yield put({
          type: 'fetchTotalCountAsync',
          options: {
            payload,
            needCountFlag,
            pageStateName: 'singlePagination',
            queryRequest: searchSingleList,
          },
        });
      }
    },
    // // 获取erp页面基本数据
    // *fetchData({ payload }, { call, put }) {
    //   const res = getResponse(yield call(fetchSingleData, payload));
    //   if (!isEmpty(res)) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         erpDataSource: res.content,
    //         erpPagination: createPagination(res),
    //         erpBasicInfo: res.erpBasicInfo,
    //       },
    //     });
    //   }
    // },
    // 取消erp采购申请
    *cancelERP({ payload }, { call }) {
      const res = getResponse(yield call(cancelERP, payload));
      return res;
    },
    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },
    // 获取操作记录列表数据
    *fetchUpdateRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchUpdateRecordList, payload));
      return result;
    },
    // 需求取消 - 按行统一事务处理
    *cancelPurchase({ payload }, { call }) {
      const { selectedRows } = payload;
      const res = getResponse(yield call(cancelPurchase, selectedRows));
      return res;
    },
    // 需求取消 - 按单分事务处理
    *cancelPurchaseByWhole({ payload }, { call }) {
      const { selectedRows } = payload;
      const res = getResponse(yield call(cancelPurchaseByWhole, selectedRows));
      return res;
    },

    // 查询明细头 - Detail
    *queryDetailHeader({ payload }, { call }) {
      const response = yield call(queryDetailHeader, payload);
      return getResponse(response);
    },

    // 查询明细行 - Detail
    *queryDetailList({ payload }, { call }) {
      const res = yield call(queryDetailList, payload);
      return getResponse(res);
    },

    // 查询明细头 - ERP
    *queryErpHeader({ payload }, { call }) {
      const response = yield call(queryErpHeader, payload);
      return getResponse(response);
    },

    // 查询明细行 - Erp
    // *queryErpList({ payload }, { call }) {
    //   const res = yield call(queryErpList, payload);
    //   return getResponse(res);
    // },
    *queryErpList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryErpList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            erpDataSource: result.content,
            erpPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // 取消采购申请
    *cancel({ payload }, { call }) {
      const response = getResponse(yield call(cancel, payload.prHeaderDTOs));
      return response;
    },
    // 关闭
    *fetchPurchaseClose({ payload }, { call }) {
      const response = getResponse(yield call(fetchPurchaseClose, payload));
      return response;
    },
    // 行关闭
    *fetchPurchaseLinesClose({ payload }, { call }) {
      const response = getResponse(yield call(fetchPurchaseLinesClose, payload));
      return response;
    },
    // 退回
    *sendBack({ payload }, { call }) {
      const response = getResponse(yield call(sendBack, payload));
      return response;
    },
    *fetchPurchaseSubmit({ payload }, { call }) {
      const response = getResponse(yield call(fetchPurchaseSubmit, payload));
      return response;
    },
    *fetchPrChangeConfigs({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchPrChangeConfigs, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            prChangeConfigs: result,
          },
        });
      }
      return result;
    },
    *fetchValue(_, { call, put, all }) {
      const [statusCode, sourceCode, abcCode] = yield all([
        call(queryIdpValue, 'SPRM.PR_LIST_CANCEL_STATUS'),
        call(queryIdpValue, 'SPRM.SRC_PLATFORM'),
        call(queryIdpValue, 'SMDM.ITEM_ABC'),
      ]);
      const statusRes = getResponse(statusCode);
      const sourceRes = getResponse(sourceCode);
      const abcRes = getResponse(abcCode);
      yield put({
        type: 'updateState',
        payload: {
          statusList: statusRes,
          sourceList: sourceRes,
          abcList: abcRes,
        },
      });
    },
    // 查询业务规则定义中的执行策略
    *fetchDoExecute({ payload }, { call }) {
      const result = getResponse(yield call(fetchDoExecute, payload));
      return result;
    },

    // 撤销变更
    *revokeChange({ payload }, { call }) {
      const response = getResponse(yield call(revokeChange, payload));
      return response;
    },
  },

  reducers: {
    // 更新页面状态
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
