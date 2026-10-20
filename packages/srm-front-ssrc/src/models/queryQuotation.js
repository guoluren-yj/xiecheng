/**
 * model 报价查询
 * @date: 2019-1-25
 * @author: NJQ <jiangqi.nan@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import { fetchPretrialApplication } from '@/services/supplierQutationService';
import {
  fetchEntranceList,
  fetchHeadDataList,
  fetchItemsDataList,
} from '@/services/queryQuotationService';
import { queryMapIdpValue, queryFileListOrg, removeFileOrg } from 'services/api';

export default {
  namespace: 'queryQuotation',
  state: {
    supplierEntranceList: [], // 报价查询入口表格数据
    supplierEntrancePaging: {}, // 报价查询入口表格分页
    oldTotalElements: 0, // 报价查询入口数据列表总条数
    supplierHolderList: {}, // 报价查询明细页面询价单头
    supplierItemsList: [], // 报价查询明细页面询价物料行
    supplierItemsPagination: {}, // 报价查询明细页面物料行分页
    code: {}, // 值集
    fetchPretrialApplicationData: {}, // 预审申请弹窗数据
  },
  effects: {
    // 报价查询入口查询
    *fetchEntranceList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchEntranceList, payload));
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  supplierEntranceList: result.content,
                  supplierEntrancePaging: createPagination(result),
                }
              : {
                  supplierEntrancePaging: createPagination(result),
                  oldTotalElements: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端,
                },
        });
      }
      return result;
    },
    // 报价查询明细页面询价单头
    *fetchHeadDataList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchHeadDataList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierHolderList: result,
          },
        });
      }
      return result;
    },
    // 报价查询明细页面询价物料行
    *fetchItemsDataList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchItemsDataList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            supplierItemsList: result.content,
            supplierItemsPagination: createPagination(result),
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
    // 获取已上传附件
    *fetchAttachment({ payload }, { call }) {
      const result = yield call(queryFileListOrg, payload);
      return getResponse(result);
    },
    // 删除附件
    *removeAttachment({ payload }, { call }) {
      const result = yield call(removeFileOrg, payload);
      return getResponse(result);
    },
    // 获取预审申请弹窗数据
    *fetchPretrialApplication({ payload }, { call, put }) {
      let result = yield call(fetchPretrialApplication, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            fetchPretrialApplicationData: result,
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
