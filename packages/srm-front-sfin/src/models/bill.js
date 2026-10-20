/**
 * Bill - 开票申请
 * @date: 2018-11-29
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { createPagination } from 'utils/utils';
import { getResponse, fetchTotalCountGen } from '@/utils/utils';
import {
  retailersPrint,
  print,
  fetchInf,
  fetchWork,
  deleteList,
  createBill,
  syncBill,
  createBillAll,
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
  queryApproveRecordList,
  createNotificationSearch,
  fetchConfirmBill, // 确认开票通知查询
  confirmBillRejectBill, // 确认开票通知 退回
  confirmNotificationBillConfirm, // 确认开票通知确认按钮接口
  createNotificationCreateBill, // 创建开票通知新建接口
  createNotificationCreateBillAll, // 创建开票通知全部勾选接口
  createAcceptanceCreateBill,
  createNotificationDeleteBill, // 创建开票通知-删除
  createNotificationSubmitBill, // 创建开票通知-提交
  fetchMaintainNotificationList, // 维护开票通知-查询
  createNotificationCancelCreateBill, // 创建开票通知-整单取消
  defaultFetch,
  defaultFetchBusinessType,
  fetchAcceptanceForm,
  removeAcceptance,
  returnAcceptance,
  createValidateBill, // 创建开票申请 创建校验
  confirmValidateBill, // 审核开票申请/通知 校验
  submitValidateBill, // 提交开票申请/通知 校验
  fetchDetailSearch,
  fetchSalesDetailSearch,
  reImport,
  confirmEcBill,
  fetchSycnPurchaseNoConsignment,
  fetchBillHistory,
  fetchErrorList,
  billCreateLine,
  deleteBillLine,
  invoiceNotificationBatchSubmit,
  invoiceMaintainBatchSubmit,
} from '@/services/billService';
import { queryIdpValue, queryUnifyIdpValue, queryMapIdpValue } from 'services/api';

/**
 * 设置 _status
 * @param {Object} data
 */
function setStatus(data = {}) {
  const { content = [], ...other } = data;
  const newContent = content.map((o) => ({ ...o, _status: 'update' }));
  return { content: newContent, ...other };
}

/**
 * 过滤值级，只要新建和已退回状态
 * @param {Object} data
 */
function filterCode(data = []) {
  const dataValue = data.filter((item) => {
    return item.value === 'NEW' || item.value === 'REJECTED';
  });
  return dataValue;
}

export default {
  namespace: 'bill',
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
    purchaseSyncNCDataSource: {}, // 采购账单非寄销数据

    purchaseNCPagination: {}, // 采购账单分页参数
    purchaseSyncNCPagination: {}, // 采购账单分页参数

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
    approvalData: [], // 新增审批流记录
    // approvalRecordPagination: {}, // 新增审批流记录分页
    auditRows: [], // 审核入口table行
    lastActiveTabKey: 'row',
    dateRange: [], // 对账事务日期范围
    billList: [], // 多条开票申请单生成数据
    detailList: [], // 采购对账单详情列表数据
    detailPage: [], // 采购对账单详情分页参数
    salesDetailList: [], // 销售对账单详情列表数据
    salesDetailPage: [], // 销售对账单详情分页参数
    errorDataSource: [], // 错误记录列表数据
    errorPagination: {}, // 错误记录分页
  },
  effects: {
    // 查询事务行- 入口
    *fetchWork({ payload }, { call, put, spawn }) {
      const response = yield call(fetchWork, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { workData: data, workPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchWork,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { workPagination: pagination },
            });
          },
        });
      }
      return data;
    },
    // 查询验收单
    *fetchAcceptanceForm({ payload }, { call, put, spawn }) {
      const response = yield call(fetchAcceptanceForm, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { workData: data, workPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchAcceptanceForm,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { workPagination: pagination },
            });
          },
        });
      }
      return data;
    },

    // 创建开票通知默认查询条件
    *defaultFetch({ payload }, { call }) {
      const response = yield call(defaultFetch, payload);
      return getResponse(response);
    },

    // 创建开票通知默认查询条件-业务类别
    *defaultFetchBusinessType({ payload }, { call }) {
      const response = yield call(defaultFetchBusinessType, payload);
      return getResponse(response);
    },

    // 创建开票通知条件查询
    *createNotificationSearch({ payload }, { call, put, spawn }) {
      const response = yield call(createNotificationSearch, {
        ...payload,
        asyncCountFlag: 'DEFAULT',
      });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { workData: data, workPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: createNotificationSearch,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { workPagination: pagination },
            });
          },
        });
      }
      return data;
    },

    // 创建开票通知-操作记录
    *fetchBillHistory({ payload }, { call }) {
      const response = yield call(fetchBillHistory, payload);
      return getResponse(response);
    },

    // 创建开票申请单- 入口
    *createBill({ payload }, { call }) {
      const response = yield call(createBill, payload);
      return getResponse(response);
    },

    // 创建开票申请单- 全部勾选入口
    *createBillAll({ payload }, { call }) {
      const response = yield call(createBillAll, payload);
      return getResponse(response);
    },
    // -打印功能
    *print({ billHeaderId }, { call }) {
      const res = getResponse(yield call(print, billHeaderId));
      return res;
    },
    // -电商打印功能
    *retailersPrint({ billHeaderId }, { call }) {
      const res = getResponse(yield call(retailersPrint, billHeaderId));
      return res;
    },
    // 创建开票申请单- 入口
    *createNotificationCreateBill({ payload }, { call }) {
      const response = yield call(createNotificationCreateBill, payload);
      return getResponse(response);
    },
    // 创建开票申请单- 全选入口
    *createNotificationCreateBillAll({ payload }, { call }) {
      const response = yield call(createNotificationCreateBillAll, payload);
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
    *fetchDetail({ payload }, { call, put, spawn }) {
      const response = yield call(fetchDetail, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { detailDataSource: data, detailPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchDetail,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { detailPagination: pagination },
            });
          },
        });
      }
    },

    // 非寄销开票申请单维护数据
    *fetchMaintainConsigBill({ payload }, { call, put, spawn }) {
      const response = yield call(fetchMaintainConsigBill, { ...payload, asyncCountFlag: 'Y' });
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            maintainConsigDataSource: list,
            maintainConsigPagination: createPagination(list),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: list,
          queryRequest: fetchMaintainConsigBill,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { maintainConsigPagination: pagination },
            });
          },
        });
      }
    },

    // 非寄销开票申请单维护查询
    *fetchMaintainNotificationList({ payload }, { call, put, spawn }) {
      const response = yield call(fetchMaintainNotificationList, {
        ...payload,
        asyncCountFlag: 'DEFAULT',
      });
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            maintainConsigDataSource: list,
            maintainConsigPagination: createPagination(list),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: list,
          queryRequest: fetchMaintainNotificationList,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { maintainConsigPagination: pagination },
            });
          },
        });
      }
    },

    // 非寄销开票单销售账单汇总查询
    *fetchSupplierBill({ payload }, { call, put, spawn }) {
      const response = yield call(fetchSupplierBill, { ...payload, asyncCountFlag: 'DEFAULT' });
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            supplierDataSource: list,
            supplierPagination: createPagination(list),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: list,
          queryRequest: fetchSupplierBill,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { supplierPagination: pagination },
            });
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

    // 电商审核申请单
    *confirmEcBill({ payload }, { call }) {
      const response = yield call(confirmEcBill, payload);
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
    *fetchAuditNoConsignment({ payload }, { call, put, spawn }) {
      const response = yield call(fetchAuditNoConsignment, {
        ...payload,
        asyncCountFlag: 'DEFAULT',
      });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { auditNCDataSource: data, auditNCPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchAuditNoConsignment,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { auditNCPagination: pagination },
            });
          },
        });
      }
    },

    // 查询错误记录
    *fetchErrorList({ payload }, { call, put }) {
      const response = yield call(fetchErrorList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { errorDataSource: data.content, errorPagination: createPagination(data) },
        });
      }
    },

    // 确认开票查询
    *fetchConfirmBill({ payload }, { call, put, spawn }) {
      const response = yield call(fetchConfirmBill, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { auditNCDataSource: data, auditNCPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchConfirmBill,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { auditNCPagination: pagination },
            });
          },
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

    *fetchPurchaseNoConsignment({ payload }, { call, put, spawn }) {
      const response = yield call(fetchPurchaseNoConsignment, {
        ...payload,
        asyncCountFlag: 'DEFAULT',
      });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { purchaseNCDataSource: data, purchaseNCPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchPurchaseNoConsignment,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { purchaseNCPagination: pagination },
            });
          },
        });
      }
    },
    *fetchNCCancelBill({ payload }, { call, put, spawn }) {
      const response = yield call(fetchNCCancelBill, { ...payload, asyncCountFlag: 'DEFAULT' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { cancelBillNCDataSource: data, cancelBillNCPagination: createPagination(data) },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchNCCancelBill,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { cancelBillNCPagination: pagination },
            });
          },
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
    // 审批流
    *fetchApproveRecordList({ payload }, { call, put }) {
      const response = yield call(queryApproveRecordList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            approvalData: data,
            // approvalRecordPagination: createPagination(data),
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
    // 创建开票通知/申请单 - 新建时校验
    *createValidateBill({ payload }, { call }) {
      const response = yield call(createValidateBill, payload);
      return getResponse(response);
    },
    // 审核开票通知/申请- 通知时校验
    *confirmValidateBill({ payload }, { call }) {
      const response = yield call(confirmValidateBill, payload);
      return getResponse(response);
    },
    // 提交开票通知/申请- 提交时校验
    *submitValidateBill({ payload }, { call }) {
      const response = yield call(submitValidateBill, payload);
      return getResponse(response);
    },
    // 获取对账单详情值集
    *fetchEnumMap({ payload }, { call, put }) {
      const { tenantId } = payload;
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          cancelFlags: 'HPFM.FLAG',
          statusCodes: 'SFIN.BILL_STATUS',
          tenantId,
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: { enumMap },
        });
      }
    },
    // 查询采购账单对账单详情
    *fetchDetailSearch({ payload }, { call, put, spawn }) {
      const res = getResponse(
        yield call(fetchDetailSearch, { ...payload, asyncCountFlag: 'DEFAULT' })
      );
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            detailList: res.content,
            detailPage: createPagination(res),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: res,
          queryRequest: fetchDetailSearch,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { detailPage: pagination },
            });
          },
        });
      }
    },
    // 查询销售账单的对账单详情
    *fetchSalesDetailSearch({ payload }, { call, put, spawn }) {
      const res = getResponse(
        yield call(fetchSalesDetailSearch, { ...payload, asyncCountFlag: 'DEFAULT' })
      );
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            salesDetailList: res.content,
            salesDetailPage: createPagination(res),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: res,
          queryRequest: fetchSalesDetailSearch,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { salesDetailPage: pagination },
            });
          },
        });
      }
    },
    // 重新导入
    *reImport({ payload }, { call }) {
      const response = yield call(reImport, payload);
      return getResponse(response);
    },
    // 同步
    *syncBill({ payload }, { call }) {
      const response = yield call(syncBill, payload);
      return getResponse(response);
    },

    *fetchSycnPurchaseNoConsignment({ payload }, { call, put, spawn }) {
      const response = yield call(fetchSycnPurchaseNoConsignment, {
        ...payload,
        asyncCountFlag: 'DEFAULT',
      });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseSyncNCDataSource: data,
            purchaseSyncNCPagination: createPagination(data),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: data,
          queryRequest: fetchSycnPurchaseNoConsignment,
          *setPagination(pagination) {
            yield put({
              type: 'updateState',
              payload: { purchaseSyncNCPagination: pagination },
            });
          },
        });
      }
    },
    *billCreateLine({ payload }, { call }) {
      const response = yield call(billCreateLine, payload);
      return getResponse(response);
    },
    *deleteBillLine({ payload }, { call }) {
      const response = yield call(deleteBillLine, payload);
      return getResponse(response);
    },
    *invoiceNotificationBatchSubmit({ payload }, { call }) {
      const response = yield call(invoiceNotificationBatchSubmit, payload);
      return getResponse(response);
    },
    *invoiceMaintainBatchSubmit({ payload }, { call }) {
      const response = yield call(invoiceMaintainBatchSubmit, payload);
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
