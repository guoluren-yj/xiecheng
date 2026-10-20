/**
 * model - 供应商信息变更
 * @date: 2019-12-11
 * @author: WXM <xiaomin.wang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';
import {
  queryApplication, // 查询申请单信息
  queryApplicationRecord, // 查询操作记录信息
  saveApplication, // 保存申请单
  deleteApplication, // 批量删除申请单
  queryDetailHeader, // 申请单明细页面头部
  submitApplication, // 提交申请单明细页面内容
  allSave, // 批量大保存
  querySupplierCapacity, // 查询供货能力清单数据
  querySupChangeOther, // 查询其他信息
  saveSupplyCapacity, // 保存新建和编辑的供货能力清单数据
  deleteSupplyCapacity, // 删除供货能力清单数据
  queryPurchaseHeadInform, // 查询财务/采购
  queryPurchaseInform, // 查询财务/采购数据
  savePurchase, // 保存财务/采购数据
  deletePurchase, // 删除采购/财务数据
  queryLocationInform, // 查询地点层信息
  saveLocationInform, // 保存地点层信息数据
  deleteLocationInform, // 删除地点层信息数据
  queryOUMessageInfo, // OU信息明细数据
  saveOUMessage, // 保存OU信息
  deleteOUMessage, // 删除OU信息
  fetchOuList, // OU层信息比对
  querySupplierClassify, // 查询供应商分类信息
  saveSupplierClassifyList, // 保存供应商分类
  queryDataSource, // 调查表明细查询
  saveSmallDataSource, // 调查表小保存
  queryInvestigateConfig, // 调查表配置查询
  queryInvestigate,
  queryLineAttachment,
  queryLineAttachmentcontrast,
  saveLineAttachment,
  deleteLineAttachment,
  queryCustomize,
  onDraggerUploadRemove,
} from '@/services/supplierInformService';
import { querySupplierInfo } from '@/services/commonService';
import { checkBankAccount, checkedSupplierChangeReq } from '@/services/enterpriseInformService';

export default {
  namespace: 'supplierInform',
  state: {
    code: {}, // 值集集合
    applicationStatus: [], // 供应商地点值集
    billPeriodMap: [], // 账期值集
    applicationList: [], // 申请单列表
    applicationPagination: {}, // 申请单分页参数
    applicationConfirmList: [], // 确认申请单列表
    applicationConfirmPagination: [], // 确认申请单分页参数
    recordsList: [], // 操作记录
    recordsPagination: {}, // 操作记录分页参数
    detailHeader: {}, // 明细页头部
    supplyCapacityList: [], // 供货能力数据
    supplyCapacityPagination: {}, // 供货能力分页信息
    purchaseHeadInfo: {}, // 采购/财务头信息
    purchaseList: [], // 采购/财务数据
    purchasePagination: {}, // 采购/财务分页信息
    locationList: [], // 地点层数据
    locationPagination: {}, // 地点层分页信息
    ouMessageList: [], // OU信息明细数据
    ouMessagePagination: {}, // OU信息分页信息
    otherInform: {}, // 其他信息
    collapseCodeList: [], // 个性化配置的折叠面板code集合
    supplierClassifyList: [], // 供应商分类数据源
    supplierClassifyPagination: {}, // 供应商分类分页参数
  },
  effects: {
    // 值集查询
    *init({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            code: res,
            applicationStatus: res.applicationStatus || [],
            billPeriodMap: res.billPeriodMap || [],
          },
        });
      }
      return res;
    },
    // 申请单查询
    *queryApplication({ payload }, { call, put }) {
      const res = getResponse(yield call(queryApplication, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            applicationList: res.content,
            applicationPagination: createPagination(res),
          },
        });
      }
    },

    // 申请单操作记录查询
    *queryApplicationRecord({ payload }, { call, put }) {
      const res = getResponse(yield call(queryApplicationRecord, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            recordsList: res.content,
            recordsPagination: createPagination(res),
          },
        });
      }
      return res;
    },

    // 保存申请单
    *saveApplication({ payload }, { call }) {
      const res = getResponse(yield call(saveApplication, payload));
      return res;
    },

    // 删除申请单
    *deleteApplication({ payload }, { call }) {
      const res = getResponse(yield call(deleteApplication, payload));
      return res;
    },

    // 明细头查询
    *queryDetailHeader({ payload }, { call, put }) {
      const res = getResponse(yield call(queryDetailHeader, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { detailHeader: res },
        });
      }
      return res;
    },
    // 查询供货能力清单数据
    *querySupplierList({ payload }, { call, put }) {
      const res = getResponse(yield call(querySupplierCapacity, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplyCapacityList: res.content || [],
            supplyCapacityPagination: createPagination(res),
          },
        });
      }
    },
    // 保存供货能力清单数据
    *saveSupplyCapacity({ payload }, { call }) {
      const res = getResponse(yield call(saveSupplyCapacity, payload));
      return res;
    },
    // 删除供货能力清单
    *deleteSupplyCapacity({ payload }, { call }) {
      const res = getResponse(yield call(deleteSupplyCapacity, payload));
      return res;
    },
    // 查询采购/财务数据头部数据
    *queryPurchaseHeadInform({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPurchaseHeadInform, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseHeadInfo: res || {},
          },
        });
      }
    },
    // 查询采购/财务数据
    *queryPurchaseInform({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPurchaseInform, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            purchaseList: res.content || [],
            purchasePagination: createPagination(res),
          },
        });
      }
    },
    // 保存采购/财务数据
    *savePurchaseList({ payload }, { call }) {
      const res = getResponse(yield call(savePurchase, payload));
      return res;
    },

    // 删除采购/ 财务信息
    *deletePurchaseList({ payload }, { call }) {
      const res = getResponse(yield call(deletePurchase, payload));
      return res;
    },

    // 查询地点层信息
    *queryLocationInform({ payload }, { call, put }) {
      const res = getResponse(yield call(queryLocationInform, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            locationList: res.content || [],
            locationPagination: createPagination(res),
          },
        });
      }
    },
    // 保存地点层数据
    *saveLocationInform({ payload }, { call }) {
      const res = getResponse(yield call(saveLocationInform, payload));
      return res;
    },

    // 删除地点层信息
    *deleteLocationInform({ payload }, { call }) {
      const res = getResponse(yield call(deleteLocationInform, payload));
      return res;
    },

    // OU信息明细数据查询
    *fetchOUMessage({ payload }, { call, put }) {
      const res = getResponse(yield call(queryOUMessageInfo, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { ouMessageList: res.content || [], ouMessagePagination: createPagination(res) },
        });
      }
    },

    // 保存供应商OU信息
    *saveOUMessage({ payload }, { call }) {
      const res = getResponse(yield call(saveOUMessage, payload));
      return res;
    },
    // 删除供应商OU信息
    *deleteOUMessage({ payload }, { call }) {
      const res = getResponse(yield call(deleteOUMessage, payload));
      return res;
    },

    // 查询其他信息
    *querySupChangeOther({ payload }, { call, put }) {
      const res = getResponse(yield call(querySupChangeOther, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { otherInform: res },
        });
      }
      return res;
    },

    // 明细提交
    *submitApplication({ payload }, { call }) {
      const res = getResponse(yield call(submitApplication, payload));
      return res;
    },

    // 明细大保存
    *allSave({ payload }, { call }) {
      const res = getResponse(yield call(allSave, payload));
      return res;
    },

    // 查询供应商分类
    *querySupplierClassify({ payload }, { call, put }) {
      const res = getResponse(yield call(querySupplierClassify, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierClassifyList: res.content,
            supplierClassifyPagination: createPagination(res),
          },
        });
      }
    },
    // 保存/更新供应商分类
    *saveSupplierClassifyList({ payload }, { call }) {
      const res = getResponse(yield call(saveSupplierClassifyList, payload));
      return res;
    },

    *fetchOuList({ payload }, { call }) {
      const response = yield call(fetchOuList, payload);
      const data = getResponse(response);
      return data;
    },
    // 调查表配置查询
    *queryInvestigateConfig({ payload }, { call }) {
      const res = getResponse(yield call(queryInvestigateConfig, payload));
      return res;
    },

    // 调查表变更申请-值集
    *queryValueSet(
      {
        payload: { lovCode, ...rest },
      },
      { call }
    ) {
      return getResponse(yield call(queryUnifyIdpValue, lovCode, rest));
    },
    // 调查表明细查询
    *queryDataSource({ payload }, { call }) {
      const res = getResponse(yield call(queryDataSource, payload));
      return res;
    },
    // 调查表小保存
    *saveSmallDataSource({ payload }, { call }) {
      const res = getResponse(yield call(saveSmallDataSource, payload));
      return res;
    },
    // 调查表对比查询
    *queryInvestigate({ payload }, { call }) {
      const res = getResponse(yield call(queryInvestigate, payload));
      return res;
    },
    // 查询供货能力清单行附件
    *queryLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(queryLineAttachment, payload));
      return res;
    },

    // 信息对比--查询供货能力清单行附件
    *queryLineAttachmentcontrast({ payload }, { call }) {
      const res = getResponse(yield call(queryLineAttachmentcontrast, payload));
      return res;
    },
    // 保存供货能力清单行附件
    *saveLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(saveLineAttachment, payload));
      return res;
    },
    // 删除供货能力清单行附件
    *deleteLineAttachment({ payload }, { call }) {
      const res = getResponse(yield call(deleteLineAttachment, payload));
      return res;
    },
    // 根据附件url删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const response = yield call(onDraggerUploadRemove, payload);
      return getResponse(response);
    },
    // 查询个性化
    *queryCustomize({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCustomize, payload));
      if (res) {
        const data = (res['SSLM.SUPPLIER_INFORM_CHANGE_DETAIL.COLLAPSE'] || {}).fields || [];
        const collapseCodeList = [];
        data.forEach(n => {
          if (n.visible !== 0) {
            collapseCodeList.push(n.fieldCode);
          }
        });
        yield put({
          type: 'updateState',
          payload: {
            collapseCodeList,
          },
        });
      }
    },
    // 校验银行信息账户名称是否一致
    *checkBankAccount({ payload }, { call }) {
      const res = getResponse(yield call(checkBankAccount, payload));
      return res;
    },

    *checkedSupplierChange({ payload }, { call }) {
      const res = getResponse(yield call(checkedSupplierChangeReq, payload));
      return res;
    },

    // 供应商管理工作台，操作指引跳转,查询供应商基础信息
    *querySupplierInfo({ payload }, { call }) {
      const res = getResponse(yield call(querySupplierInfo, payload));
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
