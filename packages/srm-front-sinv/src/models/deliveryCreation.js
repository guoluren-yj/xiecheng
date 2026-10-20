/*
 * deliveryCreation - 订单确认
 * @date: 2018/12/13
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { isEmpty } from 'lodash';
import { createPagination, getResponse, parseParameters, filterNullValueObject } from 'utils/utils';
import {
  queryCreateList,
  queryMaintenanceList,
  queryCode,
  queryDetailHeader,
  queryDetailList,
  saveDetail,
  batchCreateDelivery,
  batchDeleteDelivery,
  submitDelivery,
  queryOperationRecord,
  queryDetailCreateList,
  addDetailLines,
  deleteDetailLines,
  getHeaderAttachmentUuid,
  getLineAttachmentUuid,
  getPurLineAttachmentUuid,
  fetchSettings,
  fetchBusinessRule,
  fetchDetailTable,
  over,
  fetchBOM,
  saveBOM,
  regulation,
} from '@/services/deliveryCreationService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

// import { isString, isNumber } from 'util'

export default {
  namespace: 'deliveryCreation',

  state: {
    code: {},
    creationQueryParams: {},
    maintenanceQueryParams: {},
    tabsActiveKeyCache: 'deliveryCreationTab',
  },

  effects: {
    // 查询列表
    *queryCreateList({ params }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          creationQueryParams: filterNullValueObject(parseParameters(params)),
        },
      });
      const response = getResponse(yield call(queryCreateList, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 查询列表
    *queryMaintenanceList({ params }, { call, put }) {
      yield put({
        type: 'updateState',
        payload: {
          maintenanceQueryParams: filterNullValueObject(parseParameters(params)),
        },
      });
      const response = getResponse(yield call(queryMaintenanceList, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 查询值集
    *queryCode({ payload }, { put, call }) {
      const response = yield call(queryCode, payload);
      if (response && !response.failed) {
        yield put({
          type: 'setCodeReducer',
          payload: {
            [payload.lovCode]: response,
          },
        });
      }
    },
    // 查询值集
    *fetchLov(_, { call, put }) {
      const result = getResponse(
        yield call(queryMapIdpValue, {
          orderSource: 'SPRM.SRC_PLATFORM',
          planFlags: 'HPFM.FLAG',
          phone: 'HPFM.IDD',
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
    },
    // 查询业务规则定义及配置中心
    *fetchBusinessRule({ payload }, { call }) {
      const res = getResponse(yield call(fetchBusinessRule, payload));
      return res;
    },

    // 查询业务规则定义及配置中心
    *regulation({ payload }, { call }) {
      const res = getResponse(yield call(regulation, payload));
      return res;
    },

    // 查询明细头
    *queryDetailHeader({ payload }, { call }) {
      const response = yield call(queryDetailHeader, payload);
      return getResponse(response);
    },
    // 查询明细行
    *queryDetailList({ params }, { call }) {
      const res = yield call(queryDetailList, params);
      return getResponse(res);
    },
    // 保存明细
    *saveDetail({ params }, { call }) {
      const res = yield call(saveDetail, params);
      return { success: isEmpty(res), response: res };
    },
    // 批量创建送货单
    *batchCreateDelivery({ data }, { call }) {
      const res = yield call(batchCreateDelivery, data);
      return getResponse(res);
    },
    // 批量删除送货单
    *batchDeleteDelivery({ data }, { call }) {
      const res = yield call(batchDeleteDelivery, data);
      return getResponse(res);
    },
    // 删除送货单
    *deleteDelivery({ data }, { call }) {
      const res = yield call(batchDeleteDelivery, data);
      // return isEmpty(getResponse(res));
      return getResponse(res);
    },
    // 提交送货单
    *submitDelivery({ payload }, { call }) {
      const res = yield call(submitDelivery, payload);
      return { success: isEmpty(res), response: res };
    },
    // 批量提交送货单
    *batchSubmitDelivery({ payload }, { call }) {
      const res = yield call(submitDelivery, payload);
      return getResponse(res);
      // return { success: isEmpty(response), response };
    },
    // 查询操作记录
    *queryOperationRecord({ asnHeaderId, params }, { call }) {
      const res = yield call(queryOperationRecord, asnHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 查询明细可创建行
    *queryDetailCreateList({ asnHeaderId, params }, { call }) {
      const res = yield call(queryDetailCreateList, asnHeaderId, params);
      const response = getResponse(res);
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    // 添加明细行
    *addDetailLines({ asnHeaderId, data }, { call }) {
      const res = yield call(addDetailLines, asnHeaderId, data);
      return getResponse(res);
    },
    // 删除/作废明细行
    *deleteDetailLines({ asnHeaderId, data }, { call }) {
      const res = yield call(deleteDetailLines, asnHeaderId, data);
      return isEmpty(getResponse(res));
    },
    // 获取明细头附件uuid
    *getHeaderAttachmentUuid({ data }, { call }) {
      const res = yield call(getHeaderAttachmentUuid, data);
      return getResponse(res);
    },
    // 获取明细行附件uuid
    *getLineAttachmentUuid({ data }, { call }) {
      const res = yield call(getLineAttachmentUuid, data);
      return getResponse(res);
    },
    // 获取附件列表
    *queryFileListOrg({ payload }, { call }) {
      const res = getResponse(yield call(queryFileListOrg, payload));
      return res;
    },

    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = getResponse(yield call(removeFileOrg, payload));
      return response;
    },
    // 获取采购方明细行附件uuid
    *getPurLineAttachmentUuid({ data }, { call }) {
      const res = yield call(getPurLineAttachmentUuid, data);
      return getResponse(res);
    },
    // 查询配置
    *fetchSettings({ payload }, { call }) {
      const res = getResponse(yield call(fetchSettings, payload));
      return res;
    },

    // 查询Table页
    *fetchDetailTable({ payload }, { call }) {
      const res = getResponse(yield call(fetchDetailTable, payload));
      return res;
    },
    // 销毁Table页
    *over({ payload }, { call }) {
      const res = getResponse(yield call(over, payload));
      return res;
    },

    // fetchBOM - 查询BOM数据
    *fetchBOM({ payload }, { call }) {
      const res = getResponse(yield call(fetchBOM, payload));
      return res;
    },
    // 保存明细
    *saveBOM({ listDataSource }, { call }) {
      const res = yield call(saveBOM, listDataSource);
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
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },
  },

  subscriptions: {
    setup({ dispatch, history }) {
      history.listen((location) => {
        dispatch({
          type: 'updateState',
          payload: {
            tabsActiveKeyCache:
              location.search.substr(1) === 'deliveryOrder' &&
              location.pathname === '/sinv/delivery-creation/list/'
                ? 'deliveryMaintenanceTab'
                : 'deliveryCreationTab',
          },
        });
      });
    },
  },
};
