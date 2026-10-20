/**
 * Bill - 开票申请
 * @date: 2018-11-29
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  print,
  fetchInf,
  fetchWork,
  deleteList,
  createBill,
  fetchModalList, // 扣款列表信息
  removeInvoiceOrNot,
  fetchHeader,
  fetchRow,
  fetchDetail,
  saveBill,
  saveTotalBill,
  submitBill,
  deleteBill,
  cancelCreateBill,
  confirmBill,
  rejectBill,
  fetchMaintainConsigBill,
  fetchAuditNoConsignment,
  fetchPurchaseNoConsignment,
  fetchNCCancelBill,
  cancelBill,
  fetchSupplierBill,
  queryRecordList,
  createNotificationSearch,
  fetchConfirmBill, // 确认开票通知查询
  confirmBillRejectBill, // 确认开票通知 退回
  confirmNotificationBillConfirm, // 确认开票通知确认按钮接口
  createNotificationCreateBill, // 创建开票通知新建接口
  createAcceptanceCreateBill,
  createNotificationDeleteBill, // 创建开票通知-删除
  createNotificationSubmitBill, // 创建开票通知-提交
  fetchMaintainNotificationList, // 维护开票通知-查询
  createNotificationCancelCreateBill, // 创建开票通知-整单取消
  defaultFetch,
  fetchAcceptanceForm,
  removeAcceptance,
  returnAcceptance,
} from '@/services/billService';
import { queryIdpValue, queryUnifyIdpValue, queryMapIdpValue } from 'services/api';

/**
 * 设置 _status
 * @param {Object} data
 */
function setStatus(data = {}) {
  const { content = [], ...other } = data;
  const newContent = content.map(o => ({ ...o, _status: 'update' }));
  return { content: newContent, ...other };
}

/**
 * 过滤值级，只要新建和已退回状态
 * @param {Object} data
 */
function filterCode(data = []) {
  const dataValue = data.filter(item => {
    return item.value === 'NEW' || item.value === 'REJECTED';
  });
  return dataValue;
}

export default {
  namespace: 'salesBill',
  state: {
    modalDataSource: [], // 扣款列表数据
    modalPagination: {}, // 扣款列表分页
    headerInfo: {}, // 头信息
    infDataSource: {}, // 总账科目数据
    infPagination: {}, // 总账科目分页
    rowDataSource: {}, // 行表数据
    rowPagination: {}, // 行表分页参数
    maintainHeaderInfo: {}, // 头信息
    maintainRowData: {}, // 维护行表数据
    maintainPagination: {}, // 维护行表分页参数
    detailDataSource: {}, // 明细表数据
    detailPagination: {}, // 明细分页参数
    auditNCDataSource: {}, // 审核非寄销数据
    auditNCPagination: {}, // 审核非寄销分页参数
    workData: {}, // 开票申请单头对象
    workPagination: {}, // 开票创建入口分页参数
    supplierDataSource: {}, // 非寄销开票单销售账单数据
    supplierPagination: {}, // 非寄销开票单销售分页参数
    maintainConsigDataSource: {}, // 非寄销开票申请单维护数据
    maintainConsigPagination: {}, // 非寄销开票申请单维护分页参数
    purchaseNCDataSource: {}, // 采购账单非寄销数据
    purchaseNCPagination: {}, // 采购账单分页参数
    cancelBillNCDataSource: {}, // 取消开票申请数据
    cancelBillNCPagination: {}, // 取消开票申请分页参数
    code: {
      BillStatus: [],
      BillFiterStatus: [],
    },
    createRowKeys: [], // 开票创建入口table主键
    createRows: [], // 开票创建入口table行
    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表
    auditRows: [], // 审核入口table行
    lastActiveTabKey: 'row',
    dateRange: [], // 对账事务日期范围
  },
  effects: {
    // 查询事务行- 入口
    *fetchWork({ payload }, { call, put }) {
      const response = yield call(fetchWork, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { workData: data, workPagination: createPagination(data) },
        });
      }
    },

    // 查询验收单
    *fetchAcceptanceForm({ payload }, { call, put }) {
      const response = yield call(fetchAcceptanceForm, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { workData: data, workPagination: createPagination(data) },
        });
      }
      return data;
    },

    // 创建开票通知默认查询条件
    *defaultFetch({ payload }, { call }) {
      const response = yield call(defaultFetch, payload);
      return getResponse(response);
    },

    // 创建开票通知条件查询
    *createNotificationSearch({ payload }, { call, put }) {
      const response = yield call(createNotificationSearch, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { workData: data, workPagination: createPagination(data) },
        });
      }
      return data;
    },

    // 创建开票申请单- 入口
    *createBill({ payload }, { call }) {
      const response = yield call(createBill, payload);
      return getResponse(response);
    },

    // -打印功能
    *print({ billHeaderId }, { call }) {
      const res = getResponse(yield call(print, billHeaderId));
      return res;
    },

    // 创建开票申请单- 入口
    *createNotificationCreateBill({ payload }, { call }) {
      const response = yield call(createNotificationCreateBill, payload);
      return getResponse(response);
    },

    // 创建开票申请单- 入口
    *createAcceptanceCreateBill({ payload }, { call }) {
      const response = yield call(createAcceptanceCreateBill, payload);
      return getResponse(response);
    },
    // 移除或撤销移除 入口
    *removeInvoiceOrNot({ payload }, { call }) {
      const response = yield call(removeInvoiceOrNot, payload);
      return getResponse(response);
    },
    // 移除 入口
    *removeAcceptance({ payload }, { call }) {
      const response = yield call(removeAcceptance, payload);
      return getResponse(response);
    },

    // 撤销移除 入口
    *returnAcceptance({ payload }, { call }) {
      const response = yield call(returnAcceptance, payload);
      return getResponse(response);
    },

    // 查询开票头信息 - 明细
    *fetchHeader({ payload }, { call, put }) {
      const response = yield call(fetchHeader, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { headerInfo: data },
        });
      }
      return data || {};
    },

    // // -打印功能
    // *print({ billHeaderId }, { call }) {
    //   const res = getResponse(yield call(print, billHeaderId));
    //   return res;
    // },

    // 查询开票行table - 明细
    *fetchRow({ payload }, { call, put }) {
      const response = yield call(fetchRow, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { rowDataSource: setStatus(data), rowPagination: createPagination(data) },
        });
      }
    },

    // 查询扣款列表信息 - 明细
    *fetchModalList({ payload }, { call }) {
      const response = yield call(fetchModalList, payload);
      const data = getResponse(response);
      return data;
    },

    // 查询总账科目table - 明细
    *fetchInf({ payload }, { call }) {
      const response = yield call(fetchInf, payload);
      const data = getResponse(response);
      // if (data) {
      //   yield put({
      //     type: 'updateState',
      //     payload: { infDataSource: setStatus(data), infPagination: createPagination(data) },
      //   });
      // }
      return data;
    },

    // 查询维护开票头信息 - 明细
    *fetchMaintainHeader({ payload }, { call, put }) {
      const response = yield call(fetchHeader, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { maintainHeaderInfo: data },
        });
      }
      return data || {};
    },

    // 维护开票行table - 明细
    *fetchMaintainRow({ payload }, { call, put }) {
      const response = yield call(fetchRow, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { maintainRowData: setStatus(data), maintainPagination: createPagination(data) },
        });
      }
    },

    // 查询开票行table - 明细
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(fetchDetail, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { detailDataSource: data, detailPagination: createPagination(data) },
        });
      }
    },

    // 非寄销开票申请单维护数据
    *fetchMaintainConsigBill({ payload }, { call, put }) {
      const response = yield call(fetchMaintainConsigBill, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            maintainConsigDataSource: list,
            maintainConsigPagination: createPagination(list),
          },
        });
      }
    },

    // 非寄销开票申请单维护查询
    *fetchMaintainNotificationList({ payload }, { call, put }) {
      const response = yield call(fetchMaintainNotificationList, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            maintainConsigDataSource: list,
            maintainConsigPagination: createPagination(list),
          },
        });
      }
    },

    // 非寄销开票单销售账单汇总查询
    *fetchSupplierBill({ payload }, { call, put }) {
      const response = yield call(fetchSupplierBill, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            supplierDataSource: list,
            supplierPagination: createPagination(list),
          },
        });
      }
    },

    // 保存申请单 - 明细
    *saveBill({ payload }, { call }) {
      const response = yield call(saveBill, payload);
      return getResponse(response);
    },

    *saveTotalBill({ payload }, { call }) {
      const response = yield call(saveTotalBill, { ...payload });
      return getResponse(response);
    },

    // 提交申请单 - 明细
    *submitBill({ payload }, { call }) {
      const response = yield call(submitBill, payload);
      return getResponse(response);
    },

    // 提交申请单 - 明细
    *createNotificationSubmitBill({ payload }, { call }) {
      const response = yield call(createNotificationSubmitBill, payload);
      return getResponse(response);
    },

    // 删除申请单 - 明细
    *deleteBill({ payload }, { call }) {
      const response = yield call(deleteBill, payload);
      return getResponse(response);
    },

    // 删除总账科目列表数据
    *deleteList({ payload }, { call }) {
      const response = yield call(deleteList, payload);
      return getResponse(response);
    },

    // 创建订单通知 删除申请单 - 明细
    *createNotificationDeleteBill({ payload }, { call }) {
      const response = yield call(createNotificationDeleteBill, payload);
      return getResponse(response);
    },

    // 取消申请单 - 明细
    *cancelCreateBill({ payload }, { call }) {
      const response = yield call(cancelCreateBill, payload);
      return getResponse(response);
    },

    // 创建开票通知取消申请单 - 明细
    *createNotificationCancelCreateBill({ payload }, { call }) {
      const response = yield call(createNotificationCancelCreateBill, payload);
      return getResponse(response);
    },

    // 审核确认申请单 - 明细
    *confirmBill({ payload }, { call }) {
      const response = yield call(confirmBill, payload);
      return getResponse(response);
    },
    // 确认开票通知页面确认
    *confirmNotificationBillConfirm({ payload }, { call }) {
      const response = yield call(confirmNotificationBillConfirm, payload);
      return getResponse(response);
    },
    // 审核退回申请单 - 明细
    *rejectBill({ payload }, { call }) {
      const response = yield call(rejectBill, payload);
      return getResponse(response);
    },

    // 确认开票通知 - 退回
    *confirmBillRejectBill({ payload }, { call }) {
      const response = yield call(confirmBillRejectBill, payload);
      return getResponse(response);
    },
    // 查询审核申请单
    *fetchAuditNoConsignment({ payload }, { call, put }) {
      const response = yield call(fetchAuditNoConsignment, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { auditNCDataSource: data, auditNCPagination: createPagination(data) },
        });
      }
    },

    // 确认开票查询
    *fetchConfirmBill({ payload }, { call, put }) {
      const response = yield call(fetchConfirmBill, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { auditNCDataSource: data, auditNCPagination: createPagination(data) },
        });
      }
    },
    *fetchBillStatus(_, { call, put }) {
      const response = yield call(queryIdpValue, 'SFIN.BILL_STATUS');
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              BillStatus: data,
            },
          },
        });
      }
    },
    // 创建、维护开票页面查询值集
    *queryMapValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 请求订单状态(过滤后的)
    *fetchFilterBillStatus(_, { call, put }) {
      const response = yield call(queryIdpValue, 'SFIN.BILL_STATUS');
      const data = getResponse(response);

      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              BillFiterStatus: filterCode(data),
            },
          },
        });
      }
    },

    *fetchPurchaseNoConsignment({ payload }, { call, put }) {
      const response = yield call(fetchPurchaseNoConsignment, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { purchaseNCDataSource: data, purchaseNCPagination: createPagination(data) },
        });
      }
    },
    *fetchNCCancelBill({ payload }, { call, put }) {
      const response = yield call(fetchNCCancelBill, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { cancelBillNCDataSource: data, cancelBillNCPagination: createPagination(data) },
        });
      }
    },
    *cancelBill({ payload }, { call }) {
      const response = yield call(cancelBill, payload);
      return getResponse(response);
    },

    // 查询阶段列表
    *queryFlagList(_, { call, put }) {
      const flagList = getResponse(yield call(queryUnifyIdpValue, 'SMDM.FLAG_REVERSE'));
      yield put({
        type: 'updateState',
        payload: {
          flagList,
        },
      });
    },

    // 操作记录
    *fetchOperationRecordList({ payload }, { call, put }) {
      const response = yield call(queryRecordList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            operationRecordList: data,
            operationRecordPagination: createPagination(data),
          },
        });
      }
    },

    // 查询对账事务日期范围
    *fetchdateRange(_, { call, put }) {
      const response = yield call(queryIdpValue, 'SINV.INVOICE_TIME_RANGE');
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            dateRange: data,
          },
        });
      }
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
