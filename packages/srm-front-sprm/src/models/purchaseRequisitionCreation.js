/*
 * deliveryCreation - 订单确认
 * @date: 2018/12/13
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import { queryMapIdpValue } from 'services/api';
import {
  update,
  add,
  submit,
  cancel,
  queryList,
  deleteHeader,
  deleteLines,
  queryDetailHeader,
  queryAllDetailList,
  fetchOperationRecordList,
  bindHeaderAttachmentUuid,
  bindExternalAttachmentUuid,
  bindLineAttachmentUuid,
  queryPaymentMethod,
  fetchCategory,
  singleSubmit,
  fetchPaymentLov,
  fetchInvoiceLov,
  fetchInvoiceTitleLov,
  fetchInvoiceDetailLov,
  fetchInvoiceMethodLov,
  fetchPoLine,
  queryCopyPrList,
  confirmCopyLine,
  fetchPriceList,
  fetchAutoGetCompany,
  fetchAutoGetPurchasing,
  fetchSettings,
  fetchOtherInfo,
  fetchCnyExit,
  fetchDoExecute,
  budgetCheck,
} from '@/services/purchaseRequisitionCreationService';

export default {
  namespace: 'purchaseRequisitionCreation',

  state: {
    selectedRows: [], // 列表选中数据
    code: {}, // 值集
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
    paymentType: [], // 付款方式
    invoiceType: [], // 发票类型
    invoiceTitleType: [], // 发票抬头
    invoiceDetail: [], // 发票明细
    invoiceMethod: [], // 开票方式
    lineDataSource: null, // 明细行
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
    // 查询 是否有cyn币种默认
    *fetchCnyExit({ payload }, { call }) {
      const result = getResponse(yield call(fetchCnyExit, payload));
      return result;
    },
    // 查询列表值集
    *fetchEnum(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPRM.PR_STATUS',
          source: 'SPRM.SRC_PLATFORM',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },
    // 查询批量维护字段值集
    *fetchBatchMaintainsLov(params, { call }) {
      return getResponse(
        yield call(queryMapIdpValue, {
          batchMaintains: 'SPUC.PR_LINE_BATCH_MAINTAIN',
          internationalTelCode: 'HPFM.IDD',
        })
      );
    },
    // 查询详情值集
    *fetchDetailEnum(params, { put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          invoiceMethod: 'SPRM.PR_INVOICE_METHOD', // 开票方式
          invoiceType: 'SPRM.PR_INVOICE_TYPE', // 开票类型
          invoiceTitleType: 'SPRM.PR_INVOICE_TITLE_TYPE', // 发票抬头类型
          invoiceDetailType: 'SPRM.PR_INVOICE_DETAIL_TYPE', // 开票明细类型
          // paymentMethod: 'SCEC.COMPANYP_PAYMENT', // 电商平台公司支付方式
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap,
          },
        });
      }
    },
    // 获取非独立值集-电商平台-付款方式
    *fetchPaymentLov({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchPaymentLov, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            paymentType: response.content,
          },
        });
      }
    },
    // 获取非独立值集-电商平台-发票类型
    *fetchInvoiceLov({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchInvoiceLov, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceType: response.content,
          },
        });
      }
    },
    // 获取非独立值集-电商平台-发票抬头
    *fetchInvoiceTitleLov({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchInvoiceTitleLov, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceTitleType: response.content,
          },
        });
      }
    },
    // 获取非独立值集-电商平台-开票明细
    *fetchInvoiceDetailLov({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchInvoiceDetailLov, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceDetail: response.content,
          },
        });
      }
    },
    // 获取非独立值集-电商平台-开票方式
    *fetchInvoiceMethodLov({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchInvoiceMethodLov, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceMethod: response.content,
          },
        });
      }
    },
    /**
     * 查询支付方式
     * @param {Object} { payload } 查询参数
     * @param {Object} { call, put, select }
     */
    *fetchEnumPaymentMethod({ payload }, { call, put, select }) {
      const detailEnumMap = yield select(
        (state) => state.purchaseRequisitionCreation.detailEnumMap
      );
      const paymentMethod = getResponse(yield call(queryPaymentMethod, payload));
      if (paymentMethod) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap: {
              ...detailEnumMap,
              paymentMethod,
            },
          },
        });
      }
    },
    *fetchTotalCountAsync({ options }, { call, put }) {
      const { payload, needCountFlag, setPagination, pageStateName, queryRequest } = options || {};
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
      if (setPagination) setPagination(createPagination(result));
    },
    // 查询列表
    *queryList({ payload, setPagination }, { call, put }) {
      const response = getResponse(
        yield call(queryList, { ...payload, asyncCountFlag: 'DEFAULT' })
      );
      if (response) {
        const { needCountFlag } = response;
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.filter((item) => item.prSourcePlatform !== 'ERP'),
            pagination: createPagination(response),
          },
        });
        yield put({
          type: 'fetchTotalCountAsync',
          options: {
            payload,
            needCountFlag,
            setPagination,
            pageStateName: 'pagination',
            queryRequest: queryList,
          },
        });
        return {
          dataSource: response?.content?.filter((item) => item.prSourcePlatform !== 'ERP'),
          pagination: createPagination(response),
        };
      }
    },
    // 新增采购申请头
    *add({ payload }, { call }) {
      const response = getResponse(yield call(add, payload.headerData));
      return response;
    },
    // 更新采购申请头
    *update({ payload }, { call }) {
      const response = getResponse(yield call(update, payload.headerData));
      return response;
    },

    // 提交采购申请
    *submit({ payload }, { call }) {
      const response = yield call(submit, payload.prHeaderList);
      return response;
    },

    // 详情页提交单条采购申请
    *singleSubmit({ payload }, { call }) {
      const response = getResponse(yield call(singleSubmit, payload.prHeaderList));
      return response;
    },

    // 删除采购申请
    *delete({ payload }, { call }) {
      const response = getResponse(yield call(deleteHeader, payload.prHeaderDTOs));
      return response;
    },

    // 取消采购申请
    *cancel({ payload }, { call }) {
      const response = getResponse(yield call(cancel, payload.prHeaderDTOs));
      return response;
    },
    // 查询明细头
    *queryDetailHeader({ payload }, { call }) {
      const response = yield call(queryDetailHeader, payload);
      return getResponse(response);
    },
    // // 查询明细行
    // *queryDetailList({ payload }, { call }) {
    //   const res = yield call(queryDetailList, payload);
    //   return getResponse(res);
    // },
    // 不分页查询明细行
    // *queryAllDetailList({ payload }, { call }) {
    //   const res = yield call(queryAllDetailList, payload);
    //   return getResponse(res);
    // },
    // 查询明细行
    *queryAllDetailList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryAllDetailList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            lineDataSource: response.content.filter((item) => item.prSourcePlatform !== 'ERP'),
            pagination: createPagination(response),
          },
        });
      }
    },
    // 查询明细行
    *deleteLines({ payload }, { call }) {
      const res = yield call(deleteLines, payload);
      return getResponse(res);
    },

    // 获取操作记录列表数据
    *fetchOperationRecordList({ payload }, { call }) {
      const result = getResponse(yield call(fetchOperationRecordList, payload));
      return result;
    },
    // 绑定头附件id
    *bindHeaderAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindHeaderAttachmentUuid, payload));
      return result;
    },
    // 绑定外部附件id
    *bindExternalAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindExternalAttachmentUuid, payload));
      return result;
    },
    // 绑定行附件id
    *bindLineAttachmentUuid({ payload }, { call }) {
      const result = getResponse(yield call(bindLineAttachmentUuid, payload));
      return result;
    },
    // 查询品类定义
    *fetchCategory({ payload }, { call }) {
      const res = getResponse(yield call(fetchCategory, payload));
      return res;
    },
    *fetchPoLine({ poLineId }, { call }) {
      const response = yield call(fetchPoLine, poLineId);
      return getResponse(response);
    },
    // 获取复制申请单列表数据
    *queryCopyPrList({ payload }, { call }) {
      const result = yield call(queryCopyPrList, payload);
      return getResponse(result);
    },
    // 保存复制采购申请
    *confirmCopy({ payload }, { call }) {
      const response = yield call(confirmCopyLine, payload);
      return getResponse(response);
    },
    // 比价单查询
    *fetchPriceList({ payload }, { call }) {
      const response = yield call(fetchPriceList, payload);
      return response;
    },
    // 自动获取
    *fetchAutoGetCompany({ payload }, { call }) {
      const response = yield call(fetchAutoGetCompany, payload);
      return response;
    },
    // 自动获取
    *fetchAutoGetPurchasing({ payload }, { call }) {
      const response = yield call(fetchAutoGetPurchasing, payload);
      return response;
    },

    // 查询配置中心
    *fetchSettings(params, { call }) {
      const result = getResponse(yield call(fetchSettings));
      return result;
    },
    // 查询其他基本默认信息
    *fetchOtherInfo(params, { call }) {
      const result = getResponse(yield call(fetchOtherInfo));
      return result;
    },
    // 查询业务规则定义中的执行策略
    *fetchDoExecute({ payload }, { call }) {
      const result = getResponse(yield call(fetchDoExecute, payload));
      return result;
    },

    // 采购申请预算校验
    *budgetCheck({ payload }, { call }) {
      const response = getResponse(yield call(budgetCheck, payload));
      return response;
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
