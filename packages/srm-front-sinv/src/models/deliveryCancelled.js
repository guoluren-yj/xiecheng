import { createPagination, getResponse } from 'utils/utils';
import {
  queryDeliveryCancelledList,
  fetchOperationRecordList,
  cancelDeliveryOrder,
  resyncDeliveryOrder,
  fetchBOM,
  queryDetailHeader,
  queryDetailList,
  fetchSettings,
} from '@/services/deliveryCancelledService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'deliveryCancelled',

  state: {
    cancelList: [],
    cancelSelectList: [],
    cancelSelectDetailList: [],
    cancelListPagination: {},
    listQuery: {}, // 列表查询条件
    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表
    selectedListRowKeys: [], // 列表页选中的项主键
    detailHeaderDataSource: [], // 详情页头信息
    detailListDataSource: [], // 详情页列表数据
    detailListPagination: [], // 详情页分页信息
    enumMap: {}, // 值集对象
  },

  effects: {
    // 查询送货单审批列表
    *queryDeliveryCancelledList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDeliveryCancelledList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            cancelList: result.content,
            cancelListPagination: createPagination(result),
          },
        });
      }
    },
    // 查询值集
    *init(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          cancelStatus: 'SINV.ASN.CANCEL_TO_ERP_STATUS',
          asnCancelStatus: 'SPUC.ASN_CANCEL_STATUS',
        })
      );
      yield put({
        type: 'updateState',
        payload: {
          enumMap: enumMap || {},
        },
      });
    },
    // 获取操作记录
    *fetchOperationRecordList({ payload }, { call, put }) {
      const { asnHeaderId, ...otherParams } = payload;
      const result = getResponse(yield call(fetchOperationRecordList, asnHeaderId, otherParams));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordList: result.content,
            operationRecordPagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 送货单取消
    *cancelDeliveryOrder({ payload }, { call }) {
      const result = getResponse(yield call(cancelDeliveryOrder, payload));
      return result;
    },
    // 送货单重新同步
    *resyncDeliveryOrder({ payload }, { call }) {
      const result = getResponse(yield call(resyncDeliveryOrder, payload));
      return result;
    },
    // // 导出送货单
    // *exportDeliveryOrder({ payload }, { call }) {
    //   const result = getResponse(yield call(exportDeliveryOrder, payload));
    //   return result;
    // },
    // 查询送货单审批详情列表信息
    *queryDetailList({ payload }, { call, put }) {
      const result = getResponse(yield call(queryDetailList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detailListDataSource: result.content,
            detailListPagination: createPagination(result),
          },
        });
      }
      return result;
    },

    // *queryDetailList({ payload }, { call }) {
    //   const result = getResponse(yield call(queryDetailList, payload));
    //   return result;
    // },

    // 查询送货单审批详情头信息
    *queryDetailHeader({ payload }, { call }) {
      const result = getResponse(yield call(queryDetailHeader, payload));
      return result;
    },
    // 获取附件列表
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
    },
    // 查询配置中心
    *fetchSettings({ payload }, { call }) {
      const res = yield call(fetchSettings, payload);
      return getResponse(res);
    },
    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = getResponse(yield call(removeFileOrg, payload));
      return response;
    },

    // fetchBOM - 查询BOM数据
    *fetchBOM({ payload }, { call }) {
      const res = getResponse(yield call(fetchBOM, payload));
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
