/**
 * supplierQuota - 供应商配额model
 * @date: 2020-06-15
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { queryMapIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';

import {
  fetchQuotaAsignList,
  fetchOperationRecords,
  fetchHeaderInfo,
  fetchQuotaAsign,
  deleteQuotaAsign,
  saveQuotaAsign,
  allSave,
  handleRelease,
  fetchQuotaReportList,
  unlock,
  handleEnable,
  linePublish,
  handleBatchRelease,
  batchForbidden,
} from '@/services/supplierQuotaService';

export default {
  namespace: 'supplierQuota',
  state: {
    code: {}, // 值集集合
    quotaAsignManageList: [], // 配额分配管理列表,
    quotaAsignManagePagination: {}, // 额度分配分页
    operationRecordsList: [], // 操作记录列表
    operationRecordsPagination: {}, // 操作记录分页
    headerInfo: {}, // 明细-头信息
    quotaReportList: [], // 配额报表列表
    quotaReportPagination: {}, // 配额报表分页
  },
  effects: {
    // 值集查询
    *init({ payload }, { put, call }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            code: res,
          },
        });
      }
    },
    // 查询配额分配管理列表
    *fetchQuotaAsignList({ payload }, { put, call }) {
      const res = getResponse(yield call(fetchQuotaAsignList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            quotaAsignManageList: res.content,
            quotaAsignManagePagination: createPagination(res),
          },
        });
      }
    },
    // 查询操作记录
    *fetchOperationRecords({ payload }, { put, call }) {
      const res = getResponse(yield call(fetchOperationRecords, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordsList: res.content,
            operationRecordsPagination: createPagination(res),
          },
        });
      }
    },
    // 解锁
    *unlock({ payload }, { call }) {
      const res = getResponse(yield call(unlock, payload));
      return res;
    },
    // 启用／禁用
    *handleEnable({ payload }, { call }) {
      const res = getResponse(yield call(handleEnable, payload));
      return res;
    },
    // 行发布
    *linePublish({ payload }, { call }) {
      const res = getResponse(yield call(linePublish, payload));
      return res;
    },
    // 查询明细-头信息
    *fetchHeaderInfo({ payload }, { put, call }) {
      const res = getResponse(yield call(fetchHeaderInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo: res,
          },
        });
        return res;
      }
    },
    // 查询明细-配额分配
    *fetchQuotaAsign({ payload }, { call }) {
      const res = getResponse(yield call(fetchQuotaAsign, payload));
      return res;
    },
    // 删除配额分配
    *deleteQuotaAsign({ payload }, { call }) {
      const res = getResponse(yield call(deleteQuotaAsign, payload));
      return res;
    },
    // 保存配额分配
    *saveQuotaAsign({ payload }, { call }) {
      const res = getResponse(yield call(saveQuotaAsign, payload));
      return res;
    },
    // 头部大保存
    *allSave({ payload }, { call }) {
      const res = getResponse(yield call(allSave, payload));
      return res;
    },
    // 头部发布
    *handleRelease({ payload }, { call }) {
      const res = getResponse(yield call(handleRelease, payload));
      return res;
    },
    // 查询配额管理报表
    *fetchQuotaReportList({ payload }, { put, call }) {
      const res = getResponse(yield call(fetchQuotaReportList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            quotaReportList: res.content,
            quotaReportPagination: createPagination(res),
          },
        });
      }
    },
    // 列表批量发布
    *handleBatchRelease({ payload }, { call }) {
      const res = getResponse(yield call(handleBatchRelease, payload));
      return res;
    },
    // 批量废弃
    *handleBatchForbidden({ payload }, { call }) {
      const res = getResponse(yield call(batchForbidden, payload));
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
