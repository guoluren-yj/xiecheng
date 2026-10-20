/**
 * 创建预付款申请
 * @date: 2020-03-09
 * @author zuoxiangyu <xiangyu.zuog@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { fetchTotalCountGen } from '@/utils/utils';
import {
  listSettle,
  saveList,
  handleSubmit,
  deleteHeader,
  handleSearchHeader,
  fetchInvoiceLine,
  fetchModalList,
  deleteList,
  handleSubmitList,
  bindHeaderAttachmentUuid,
  fetchOperationRecordList,
} from '@/services/advancePaymentRecordServices';
import { validateSubmit, batchValidateSubmit } from '@/services/paymentServices';

export default {
  namespace: 'advancePaymentRecord',
  state: {
    listQuery: {},
  },
  effects: {
    *listSettle({ payload, setPagination }, { call, put, spawn }) {
      const { page, ...otherParams } = payload;
      const response = yield call(listSettle, { ...payload, asyncCountFlag: 'DEFAULT' });
      const res = getResponse(response) || {};
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: response,
          queryRequest: listSettle,
          setPagination,
        });
      }
      return [res.content || [], createPagination(res)];
    },

    // 预付款申请列表/明细页-提交
    *handleSubmitList({ payload }, { call }) {
      const res = yield call(handleSubmitList, payload);
      return getResponse(res);
    },

    // 预付款申请明细页面-查询明细头
    *handleSearchHeader({ payload }, { call }) {
      const response = getResponse(yield call(handleSearchHeader, payload));
      return response;
    },

    // 预付款申请明细页面-查询明细行
    *fetchInvoiceLine({ payload }, { call }) {
      const InvoiceLine = getResponse(yield call(fetchInvoiceLine, payload));
      return InvoiceLine;
    },

    // 预付款申请明细页面-保存
    *saveList({ payload }, { call }) {
      const res = yield call(saveList, payload);
      return getResponse(res);
    },

    // 预付款申请列表/明细页-提交
    *handleSubmit({ payload }, { call }) {
      const res = yield call(handleSubmit, payload);
      return getResponse(res);
    },

    // 预付款申请明细页-删除数据-明细头
    *deleteHeader({ payload }, { call }) {
      const response = yield call(deleteHeader, payload);
      return getResponse(response);
    },

    // 预付款申请明细页新增列表 -新增列表
    *fetchModalList({ payload }, { call }) {
      const response = yield call(fetchModalList, payload);
      const data = getResponse(response);
      return data;
    },

    // 预付款申请明细页删除-删除行
    *deleteList({ payload }, { call }) {
      const response = yield call(deleteList, payload);
      return getResponse(response);
    },

    // 绑定附件
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },

    // 操作记录
    *fetchOperationRecordList({ payload }, { call }) {
      const response = yield call(fetchOperationRecordList, payload);
      return getResponse(response);
    },

    // 校验提交
    *validateSubmit({ payload }, { call }) {
      const response = yield call(validateSubmit, payload);
      return getResponse(response);
    },

    // 校验提交
    *batchValidateSubmit({ payload }, { call }) {
      const response = yield call(batchValidateSubmit, payload);
      return getResponse(response);
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
