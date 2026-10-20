/**
 * invoice.js - 发票协同 Model
 * @date: 2018-11-27
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { isNil } from 'lodash';
import { createPagination } from 'utils/utils';
import { getResponse, fetchTotalCountGen } from '@/utils/utils';
import {
  fetchInf,
  createInvoice,
  removeInvoice,
  cancelRemoveInvoice,
  saveInvoice,
  deleteInvoice,
  cancelInvoice,
  submitInvoice,
  queryList,
  batchQuerySetting,
  queryInvoiceRule,
  confirm,
  reject,
  queryDetailHeader,
  queryDetailLine,
  querySupplierDetailHeader,
  querySupplierDetailLine,
  queryRecordList,
  syncInvoice,
  returnInvoice,
  fetchInvoiceDownloadList,
  queryTaxInvoiceLine,
  deleteTaxInvoiceLine,
  saveTaxLine,
  queryLogisticsInfo,
  submitLogisticsInfo,
  inspection,
  ocrImport,
  ofdImport,
  getAttachmentuuid,
  querySetting,
  checkARinvoice,
  checkValidator,
  fetchPreviewData,
  confirmeInvoice,
  fetchInvoiceData,
  printDetailList,
  printInvoice,
  fetchInvoiceView,
  fetchInvoicePage,
  print,
  fetchAcceptanceForm,
  defaultFetch,
  defaultFetchBusinessType,
  createAcceptanceForm,
  removeAcceptance,
  returnAcceptance,
  createValidateInvoice,
  saveLines,
  addLines,
  deleteLines,
  updateTax,
  queryTaxationData,
  queryTreeData,
  saveAllLines,
  queryApproveRecordList,
  createAll,
  queryInvoiceDetailLine,
  fetchModalList,
  fetchInvoiceSave,
  deteleinvoiceSave,
  fetchInvoiceHistory,
} from '@/services/invoiceService';
import { queryUnifyIdpValue, removeFileOrg } from 'services/api';

const DETAIL_SUPPLIER_LIST = ['create', 'update', 'supplier']; // 供应方调用详情页 API
// const DETAIL_LIST = ['approve', 'return', 'review', 'sync', 'summary']

// /**
//  * 过滤值级，不要新建状态
//  * @param {Object} data
//  */
// function filterCode(data = []) {
//   const dataValue = data.filter(item => {
//     return item.value !== 'NEW';
//   });
//   return dataValue;
// }

export default {
  namespace: 'invoice',

  state: {
    settings: {}, // 配置中心配置项
    invoiceRule: [], // 发票规则配置
    list: {
      approve: {}, // 应付发票审核
      create: {}, // 应收发票创建查询事务
      return: {}, // 应付发票退回
      review: {}, // 应付发票复核
      summary: {}, // 应付发票汇总
      supplier: {}, // 应收发票汇总
      supplierInvoice: {},
      suppliertaxinvoice: {}, // 应收发票税务发票行
      summarytaxinvoice: {}, // 应收发票税务发票行
      summaryInvoice: {},
      sync: {}, // 应付发票导入
      update: {}, // 应收发票维护汇总
    },
    pagination: {
      approve: {}, // 应付发票审核
      create: {}, // 应收发票创建查询事务
      return: {}, // 应付发票退回
      review: {}, // 应付发票复核
      summary: {}, // 应付发票汇总
      supplier: {}, // 应收发票汇总
      supplierInvoice: {},
      suppliertaxinvoice: {}, // 应收发票税务发票行
      summarytaxinvoice: {}, // 应收发票税务发票行
      summaryInvoice: {},
      sync: {}, // 应付发票导入
      update: {}, // 应收发票维护汇总
    },
    invoiceVerifyDetailHeader: {},
    detailHeader: {
      approve: {}, // 应付发票审核
      create: {}, // 应收发票创建查询事务
      return: {}, // 应付发票退回
      review: {}, // 应付发票复核
      summary: {}, // 应付发票汇总
      supplier: {}, // 应收发票汇总
      sync: {}, // 应付发票导入
      update: {}, // 应收发票维护汇总
    },
    detailLine: {
      approve: {}, // 应付发票审核
      create: {}, // 应收发票创建查询事务
      return: {}, // 应付发票退回
      review: {}, // 应付发票复核
      summary: {}, // 应付发票汇总
      supplier: {}, // 应收发票汇总
      sync: {}, // 应付发票导入
      update: {}, // 应收发票维护汇总
    },
    detailLinePagination: {
      approve: {}, // 应付发票审核
      create: {}, // 应收发票创建查询事务
      return: {}, // 应付发票退回
      review: {}, // 应付发票复核
      summary: {}, // 应付发票汇总
      supplier: {}, // 应收发票汇总
      sync: {}, // 应付发票导入
      update: {}, // 应收发票维护汇总
    },
    expand: {
      approve: false,
      create: false,
      return: false,
      review: false,
      summary: false,
      supplier: false,
      suppliertaxinvoice: false, // 应收发票税务发票行是否展开
      summarytaxinvoice: false, // 应付发票税务发票行是否展开
      sync: false,
      update: false,
    }, // 查询条件展开收起
    selectedRows: [], // 开票创建入口table主键
    createRows: [], // 开票创建入口table行
    cacheList: [], // 缓存发票创建勾选事务行的编辑数据
    syncCacheList: [], // 缓存的同步页面的编辑数据
    operationRecordPagination: {}, // 详情页面的操作记录分页
    operationRecordList: [], // 详情页面的操作记录列表
    approvalData: [], // 新增审批流记录
    // approvalRecordPagination: {}, // 新增审批流记录分页
    invoiceStatusSelect: [], // 我的应付发票状态
    invoiceRcvStatusSelect: [], // 我的应收发票状态
    invoiceDownloadPagination: {}, // 详情页面的发票下载分页
    invoiceDownloadList: [], // 详情页面的发票下载列表
    taxInvoiceLineIds: [], // 电子发票显示
    selectedInfo: {
      // 阳光照明我的应付发票Tab个性化按钮访问state地址，勿删！！！
      summary: {
        selectedRowKeys: [],
        selectedRows: [],
      },
    },
  },

  effects: {
    // 树形菜单查询
    *queryTaxationData({ payload }, { call }) {
      const response = yield call(queryTaxationData, payload);
      return getResponse(response);
    },

    // 树形菜单查询
    *queryTreeData({ payload }, { call }) {
      const response = yield call(queryTreeData, payload);
      return getResponse(response);
    },

    // 批量查询配置中心配置项
    *batchQuerySetting({ payload }, { call, put }) {
      const settings = getResponse(yield call(batchQuerySetting, payload));
      if (settings) {
        yield put({
          type: 'updateSetting',
          payload: {
            settings,
          },
        });
      }
    },

    // 查询发票规则配置
    *queryInvoiceRule(_, { call, put }) {
      const invoiceRule = getResponse(yield call(queryInvoiceRule));
      if (invoiceRule) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceRule,
          },
        });
      }
    },

    // 默认查询条件
    *defaultFetch({ payload }, { call }) {
      const response = yield call(defaultFetch, payload);
      return getResponse(response);
    },

    // 创建开票通知默认查询条件-业务类别
    *defaultFetchBusinessType({ payload }, { call }) {
      const response = yield call(defaultFetchBusinessType, payload);
      return getResponse(response);
    },

    // 创建开票通知-操作记录
    *fetchInvoiceHistory({ payload }, { call }) {
      const response = yield call(fetchInvoiceHistory, payload);
      return getResponse(response);
    },
    *fetchTotalCountGen({ options }, { call, put }) {
      const { type, payload, needCountFlag, queryRequest } = options || {};
      if (!payload || needCountFlag !== 'Y') return;
      const result = getResponse(yield call(queryRequest, { ...payload, onlyCountFlag: 'Y' }));
      if (!result) return;
      yield put({
        type: 'updateList',
        payload: {
          type,
          pagination: createPagination(result),
        },
      });
    },
    // 查询列表
    *queryList({ payload }, { call, put, spawn }) {
      const { type } = payload;
      const list = getResponse(yield call(queryList, { ...payload, asyncCountFlag: 'DEFAULT' }));
      if (list) {
        yield put({
          type: 'updateList',
          payload: {
            type,
            list,
            pagination: createPagination(list),
          },
        });
        yield spawn(fetchTotalCountGen, {
          payload,
          firstResult: list,
          queryRequest: queryList,
          *setPagination(pagination) {
            yield put({
              type: 'updateList',
              payload: { type, pagination },
            });
          },
        });
      }
      return list;
    },

    // 查询列表
    *fetchAcceptanceForm({ payload }, { call, put }) {
      const { type } = payload;
      const list = getResponse(yield call(fetchAcceptanceForm, payload));
      const pagination = createPagination(list);

      if (list) {
        yield put({
          type: 'updateList',
          payload: {
            type,
            list,
            pagination,
          },
        });
      }
      return list;
    },

    // 查询总账科目table - 明细
    *fetchInf({ payload }, { call }) {
      const response = yield call(fetchInf, payload);
      const data = getResponse(response);
      return data;
      // if (data) {
      //   yield put({
      //     type: 'updateState',
      //     payload: { infDataSource: setStatus(data), infPagination: createPagination(data) },
      //   });
      // }
    },
    // 查询总账科目table - 明细
    *fetchInvoicePage({ payload }, { call }) {
      const response = yield call(fetchInvoicePage, payload);
      const data = getResponse(response);
      return data;
      // if (data) {
      //   yield put({
      //     type: 'updateState',
      //     payload: { infDataSource: setStatus(data), infPagination: createPagination(data) },
      //   });
      // }
    },
    // 非寄销发票创建
    *createInvoice({ payload }, { call }) {
      return getResponse(yield call(createInvoice, payload));
    },

    // 非寄销发票创建
    *createAcceptanceForm({ payload }, { call }) {
      return getResponse(yield call(createAcceptanceForm, payload));
    },

    // 非寄销发票移除
    *removeInvoice({ payload }, { call }) {
      return getResponse(yield call(removeInvoice, payload));
    },

    // 非寄销发票撤销移除
    *cancelRemoveInvoice({ payload }, { call }) {
      return getResponse(yield call(cancelRemoveInvoice, payload));
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

    // 发票维护保存
    *saveInvoice({ payload }, { call }) {
      return getResponse(yield call(saveInvoice, payload));
    },

    // 发票维护删除
    *deleteInvoice({ payload }, { call }) {
      return getResponse(yield call(deleteInvoice, payload));
    },

    // 发票维护取消
    *cancelInvoice({ payload }, { call }) {
      return getResponse(yield call(cancelInvoice, payload));
    },

    // 发票维护提交
    *submitInvoice({ payload }, { call }) {
      return getResponse(yield call(submitInvoice, payload));
    },

    // 通过
    *confirm({ payload }, { call }) {
      return getResponse(yield call(confirm, payload));
    },

    // 拒绝
    *reject({ payload }, { call }) {
      return getResponse(yield call(reject, payload));
    },

    // 发票详情页面头查询
    *queryDetailHeader({ payload }, { call, put }) {
      const { type, isInvoiceVerify } = payload;
      let header;
      if (DETAIL_SUPPLIER_LIST.includes(type)) {
        header = getResponse(yield call(querySupplierDetailHeader, payload));
      } else {
        header = getResponse(yield call(queryDetailHeader, payload));
      }
      if (header) {
        yield put({
          type: 'updateDetailHeader',
          payload: {
            type,
            header,
            isInvoiceVerify,
          },
        });
      }
      return header;
    },

    // 税务发票行列表查询
    *queryTaxInvoiceLine({ payload }, { call }) {
      return getResponse(yield call(queryTaxInvoiceLine, payload));
    },

    // 税务发票行列表删除
    *deleteTaxInvoiceLine({ payload }, { call }) {
      return getResponse(yield call(deleteTaxInvoiceLine, payload));
    },
    // 税务发票行列表保存
    *saveTaxLine({ payload }, { call }) {
      return getResponse(yield call(saveTaxLine, payload));
    },

    // 发票详情页面行查询
    *queryDetailLine({ payload }, { call, put }) {
      const { type } = payload;
      let lines;
      if (DETAIL_SUPPLIER_LIST.includes(type)) {
        lines = getResponse(yield call(querySupplierDetailLine, payload));
      } else {
        lines = getResponse(yield call(queryDetailLine, payload));
      }
      const pagination = createPagination(lines);
      if (lines) {
        yield put({
          type: 'updateDetailLine',
          payload: {
            type,
            lines: {
              ...lines,
              content: (lines.content || []).map((item) =>
                ['create', 'update', 'review'].includes(type)
                  ? { _status: 'update', ...item }
                  : item
              ),
            },
            pagination,
          },
        });
      }
      return lines;
    },
    *queryInvoiceDetailLine({ payload }, { call, put }) {
      const { type } = payload;
      let lines;
      if (DETAIL_SUPPLIER_LIST.includes(type)) {
        lines = getResponse(yield call(queryInvoiceDetailLine, payload));
      } else {
        lines = getResponse(yield call(queryDetailLine, payload));
      }
      const pagination = createPagination(lines);
      if (lines) {
        yield put({
          type: 'updateDetailLine',
          payload: {
            type,
            lines: {
              ...lines,
              content: (lines.content || []).map((item) =>
                ['create', 'update'].includes(type) ? { _status: 'update', ...item } : item
              ),
            },
            pagination,
          },
        });
      }
      return lines;
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
    // 审批记录
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

    // 发票同步 - 明细
    *syncInvoice({ payload }, { call }) {
      const response = yield call(syncInvoice, payload);
      return getResponse(response);
    },

    // 非寄销发票退回 - 明细
    *returnInvoice({ payload }, { call }) {
      const response = yield call(returnInvoice, payload);
      return getResponse(response);
    },

    // 我的应付发票状态值级
    *fetchFilterInvoiceStatus(_, { call, put }) {
      const data = getResponse(yield call(queryUnifyIdpValue, 'SFIN.INVOICE_STATUS'));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceStatusSelect: data,
          },
        });
      }
    },
    // 我的应收发票状态值级
    *fetchRcvInvoiceStatus(_, { call, put }) {
      const data = getResponse(yield call(queryUnifyIdpValue, 'SFIN.INVOICE_STATUS'));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceRcvStatusSelect: data,
          },
        });
      }
    },
    // 查验状态值级
    *fetchCheckStatusList(_, { call, put }) {
      const data = getResponse(
        yield call(queryUnifyIdpValue, 'SFIN.INVOICE_HEADER_VALIDATE_STATUS')
      );
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            checkStatusList: data,
          },
        });
      }
    },
    // 发票下载
    *fetchInvoiceDownloadList({ payload }, { call, put }) {
      const response = yield call(fetchInvoiceDownloadList, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            invoiceDownloadList: data.content,
            invoiceDownloadPagination: createPagination(data),
          },
        });
      }
    },
    // 物流信息录入查询
    *queryLogisticsInfo({ payload }, { call }) {
      return getResponse(yield call(queryLogisticsInfo, payload));
    },
    // 物流信息录入修改
    *submitLogisticsInfo({ payload }, { call }) {
      return getResponse(yield call(submitLogisticsInfo, payload));
    },
    // 发票查验
    *inspection({ payload }, { call }) {
      return getResponse(yield call(inspection, payload));
    },
    // ocr识别
    *ocrImport({ payload }, { call }) {
      return getResponse(yield call(ocrImport, payload));
    },
    *ofdImport({ payload }, { call }) {
      return getResponse(yield call(ofdImport, payload));
    },
    // 获取附件uuid
    *getAttachmentuuid({ payload }, { call }) {
      return getResponse(yield call(getAttachmentuuid, payload));
    },
    // 删除附件
    *removeFile({ payload }, { call }) {
      const response = yield call(removeFileOrg, payload);
      return getResponse(response);
    },
    // 查询配置中心配置
    *querySetting({ payload }, { call }) {
      const response = yield call(querySetting, payload);
      return getResponse(response);
    },
    // 发票查验
    *checkARinvoice({ payload }, { call }) {
      const response = yield call(checkARinvoice, payload);
      return getResponse(response);
    },
    // 重复检验
    *checkValidator({ payload }, { call }) {
      const response = yield call(checkValidator, payload);
      return getResponse(response);
    },

    // 获取预览发票数据
    *fetchPreviewData({ payload }, { call }) {
      const response = getResponse(yield call(fetchPreviewData, payload));
      return response;
    },

    // 确认开票
    *confirmeInvoice({ payload }, { call }) {
      const response = getResponse(yield call(confirmeInvoice, payload));
      return response;
    },

    // 查询真实发票数据
    *fetchInvoiceData({ payload }, { call }) {
      const response = getResponse(yield call(fetchInvoiceData, payload));
      return response;
    },

    // 打印销货清单
    *printDetailList({ payload }, { call }) {
      const response = getResponse(yield call(printDetailList, payload));
      return response;
    },

    *printInvoice({ payload }, { call }) {
      const response = getResponse(yield call(printInvoice, payload));
      return response;
    },

    // 获取预览发票数据
    *fetchInvoiceView({ payload }, { call }) {
      const response = getResponse(yield call(fetchInvoiceView, payload));
      return response;
    },
    // -打印功能
    *print({ invoiceHeaderId }, { call }) {
      const res = getResponse(yield call(print, invoiceHeaderId));
      return res;
    },
    // 创建应付发票 - 创建时校验
    *createValidateInvoice({ payload }, { call }) {
      const response = yield call(createValidateInvoice, payload);
      return getResponse(response);
    },
    // 保存行信息
    *saveLines({ payload }, { call }) {
      const response = yield call(saveLines, payload);
      return getResponse(response);
    },
    // 新增行信息
    *addLines({ payload }, { call }) {
      const response = yield call(addLines, payload);
      return getResponse(response);
    },
    // 删除行信息
    *deleteLines({ payload }, { call }) {
      const response = yield call(deleteLines, payload);
      return getResponse(response);
    },
    // 保存所有行信息
    *saveAllLines({ payload }, { call }) {
      const response = yield call(saveAllLines, payload);
      return getResponse(response);
    },

    *updateTax({ payload }, { call }) {
      const response = yield call(updateTax, payload);
      return getResponse(response);
    },

    // 创建开票申请单- 全选入口
    *createAll({ payload }, { call }) {
      const response = yield call(createAll, payload);
      return getResponse(response);
    },

    // 查询扣款列表信息 - 明细
    *fetchModalList({ payload }, { call }) {
      const response = yield call(fetchModalList, payload);
      const data = getResponse(response);
      return data;
    },

    // 查询扣款列表-确认 - 明细
    *fetchInvoiceSave({ payload }, { call }) {
      const response = yield call(fetchInvoiceSave, payload);
      const data = getResponse(response);
      return data;
    },

    // 查询扣款列表-删除 - 明细
    *deteleinvoiceSave({ payload }, { call }) {
      const response = yield call(deteleinvoiceSave, payload);
      const data = getResponse(response);
      return data;
    },
  },

  reducers: {
    updateSetting(state, { payload }) {
      const { settings } = payload;
      return {
        ...state,
        settings: {
          ...state.settings,
          ...settings,
        },
      };
    },
    updateList(state, { payload }) {
      const { list, pagination, type } = payload;
      const data = { ...state };
      if (!isNil(list)) {
        data.list = {
          ...state.list,
          [type]: list,
        };
      }
      if (!isNil(pagination)) {
        data.pagination = {
          ...state.pagination,
          [type]: pagination,
        };
      }
      return data;
    },
    updateDetailHeader(state, { payload }) {
      const { header, type, isInvoiceVerify } = payload;
      if (isInvoiceVerify) {
        return {
          ...state,
          invoiceVerifyDetailHeader: {
            ...state.detailHeader,
            [type]: header,
          },
        };
      } else {
        return {
          ...state,
          detailHeader: {
            ...state.detailHeader,
            [type]: header,
          },
        };
      }
    },
    updateDetailLine(state, { payload }) {
      const { lines, type, pagination } = payload;
      return {
        ...state,
        detailLine: {
          ...state.detailLine,
          [type]: lines,
        },
        detailLinePagination: {
          ...state.detailLinePagination,
          [type]: pagination,
        },
      };
    },
    updateExpand(state, { payload }) {
      const { type, expand } = payload;
      return {
        ...state,
        expand: {
          ...state.expand,
          [type]: expand,
        },
      };
    },
    updateSelectedInfo(state, { payload }) {
      const { type, ...selectedInfo } = payload;
      return {
        ...state,
        selectedInfo: {
          ...state.selectedInfo,
          [type]: { ...state.selectedInfo[type], ...selectedInfo },
        },
      };
    },

    // *querySetting({ payload }, { call }) {
    //   const result = getResponse(yield call(querySetting, payload));
    //   return result;
    // },
    // // 电子发票PDF
    // updateElectricPDF(state, { payload }) {
    //   const { taxInvoiceLineIds } = payload;
    //   if (isArray(taxInvoiceLineIds)) {
    //     return {
    //       ...state,
    //       taxInvoiceLineIds,
    //     };
    //   } else {
    //     return {
    //       ...state,
    //       taxInvoiceLineIds: [taxInvoiceLineIds],
    //     };
    //   }
    // },
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
