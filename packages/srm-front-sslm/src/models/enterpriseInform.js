/**
 * model - 企业信息变更
 * @date: 2019-11-04
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { isEmpty } from 'lodash';
import { queryMapIdpValue, queryUnifyIdpValue } from 'services/api';
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  queryApplication,
  queryApplicationRecord,
  saveApplication,
  deleteApplication,
  // queryInvestigationFields,
  queryPlatformInvoice,
  queryPlatformContact,
  savePlatformContact,
  queryPlatformBank,
  queryPlatformAddress,
  savePlatformBank,
  savePlatformAddress,
  queryAddressList,
  queryProvinceCity,
  saveAddressList,
  loadCityData,
  // fetchDataSource,
  // saveDataSource,
  queryCompanyBasicReq,
  queryCompanyBusinessReq,
  queryCompanyFinance,
  fetchIndustryCategories,
  saveFinancialList,
  saveAttachmentsList,
  queryAttachmentsList,
  queryAttachmentType,
  fetchIndustries,
  queryDetailHeader,
  submitApplication,
  allSave,
  fetchFileNumber,
  addAttachment,
  queryInfoChangeApprovalDetail,
  queryInvestigate,
  queryPlatformInfo,
  queryConfirmApplication,
  approve,
  confirm,
  approveReject,
  reject,
  tripartite,
  tripartiteVerification,
  queryPlatformApplication,
  queryDataSource,
  saveSmallDataSource,
  deleteDataSource,
  querySupplierClassify,
  saveSupplierClassify,
  querySupChangeOther, // 查询其他信息
  checkBankAccount,
  fetchSettings,
  getDefaultBankCountryInfo,
  queryPaltformList,
  tenantConfirm,
  deleteAttachment,
  fetchWeburl,
  tenantConfirmBefore,
  updateLicenceUrl,
  updateUploadDate,
  queryApprovalDetailHeader,
} from '@/services/enterpriseInformService';
import { queryCustomize } from '@/services/supplierInformService';
import { checkBankAccountCommon } from '@/services/commonService';

const tenantId = getCurrentOrganizationId();

// 打平树形数组
function smoothingArray(industryCategories = []) {
  if (!isEmpty(industryCategories)) {
    const list = industryCategories.map(o => o.children || []);
    const arr = []; // 打平后的数组
    for (let j = 0; j < list.length; j++) {
      for (let i = 0; i < list[j].length; i++) {
        arr.push(list[j][i].categoryId);
      }
    }
    return arr;
  }
}

export default {
  namespace: 'enterpriseInform',
  state: {
    code: {}, // 值集集合
    applicationList: [], // 申请单列表
    applicationPagination: {}, // 申请单分页参数
    applicationConfirmList: [], // 确认申请单列表
    applicationConfirmPagination: [], // 确认申请单分页参数
    recordsList: [], // 操作记录
    recordsPagination: {}, // 操作记录分页参数
    platformInvoice: {}, // 平台级开票信息
    platformContactList: [], // 平台级联系人信息列表
    platformBankList: [], // 平台级银行信息列表
    platformAddressList: [], // 平台级地址信息列表
    addressList: [],
    cityDataMap: {}, // 国家和城市数据
    investigationCustomersList: [], // 调查表主要客户情况
    detailHeader: {}, // 明细头信息

    sslmInvestgBasic: {}, // 基础信息
    sslmInvestgBusiness: {}, // 业务信息
    sslmInvestgProservice: [], // 产品及服务
    sslmInvestgFin: [], // 近三年财务状况
    sslmInvestgFinBranch: [], // 分支机构
    sslmInvestgAuth: [], // 资质信息
    sslmInvestgContact: [], // 联系人信息
    sslmInvestgAddress: [], // 地址信息
    otherInform: {}, // 其他信息
    sslmInvestgBankAccount: [], // 开户行信息
    sslmInvestgCustomer: [], // 主要客户情况
    sslmInvestgSubSupplier: [], // 分供方情况
    sslmInvestgEquipment: [], // 设备信息
    sslmInvestgRd: {}, // 研发能力
    sslmInvestgProduce: {}, // 生产能力
    sslmInvestgQa: {}, // 质保能力
    sslmInvestgCustservice: {}, // 售后服务
    sslmInvestgAttachment: [], // 附件信息
    companyBasic: {}, // 登记信息
    companyBussiness: {}, // 业务信息
    companyFinanceList: [],
    industryList: [],
    attachmentsList: [],
    attactmentType: [],
    subType: [],
    industries: [],
    servicesAreas: [],
    attachmentCode: {
      AttachmentType: [],
    },
    supplierClassifyList: [], // 供应商分类列表
    approveStatus: [],
    collapseCodeList: [], // 个性化配置的折叠面板code集合
    enterpriseInfoDefault: {}, // 企业信息变更默认值
    supplierInfoDefault: {}, // 供应商信息变更默认值
    paltformListDataSource: [], // 平台级变更确认数据源
    paltformListPagination: {}, // 平台级变更确认分页

    customizeConfig: {}, // 手动查询的个性化配置
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

    // 确认申请单查询
    *queryConfirmApplication({ payload }, { call, put }) {
      const res = getResponse(yield call(queryConfirmApplication, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            applicationConfirmList: res.content,
            applicationConfirmPagination: createPagination(res),
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
          payload: {
            detailHeader: res,
          },
        });
      }
      return res;
    },

    // 审批明细头查询
    *queryApprovalDetailHeader({ payload }, { call }) {
      const res = getResponse(yield call(queryApprovalDetailHeader, payload));
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

    // 查询平台级开票信息
    *queryPlatformInvoice({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPlatformInvoice, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            platformInvoice: res,
          },
        });
      }
      return res;
    },

    // 查询财务信息
    *queryCompanyFinance({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCompanyFinance, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            companyFinanceList: res,
          },
        });
      }
    },

    // 查询平台级联系人
    *queryPlatformContact({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPlatformContact, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            platformContactList: res,
          },
        });
      }
      return res;
    },

    // 保存平台级联系人
    *savePlatformContact({ payload }, { call }) {
      const res = getResponse(yield call(savePlatformContact, payload));
      return res;
    },

    // 查询平台级银行信息
    *queryPlatformBank({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPlatformBank, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            platformBankList: res,
          },
        });
      }
      return res;
    },

    // 查询业务信息
    *queryCompanyBusinessReq({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCompanyBusinessReq, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            companyBussiness: res,
          },
        });
      }
      return res;
    },

    // 查询登记信息
    *queryCompanyBasicReq({ payload }, { call, put }) {
      const res = getResponse(yield call(queryCompanyBasicReq, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            companyBasic: res,
          },
        });
      }
      return res;
    },

    // 保存平台级银行信息
    *savePlatformBank({ payload }, { call }) {
      const res = getResponse(yield call(savePlatformBank, payload));
      return res;
    },

    // 查询平台级地址信息
    *queryPlatformAddress({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPlatformAddress, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            platformAddressList: res,
          },
        });
      }
      return res;
    },

    // 保存平台级地址信息
    *savePlatformAddress({ payload }, { call }) {
      const res = getResponse(yield call(savePlatformAddress, payload));
      return res;
    },

    // 查询城市列表
    *queryCity({ payload }, { call }) {
      const cityResponse = getResponse(
        yield call(queryProvinceCity, { ...payload, enabledFlag: 1 })
      );
      if (cityResponse) {
        return cityResponse;
      }
      return [];
    },
    // 查询地址列表
    *queryAddressList({ payload }, { call, put }) {
      const addressResponse = getResponse(yield call(queryAddressList, payload));
      if (addressResponse) {
        yield put({
          type: 'updateState',
          payload: {
            addressList: addressResponse,
          },
        });
      }
      return addressResponse;
    },
    // 新增  , put, select
    *saveAddressList({ payload }, { call }) {
      const addressResponse = getResponse(yield call(saveAddressList, payload));
      return addressResponse;
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

    // 初始化查询地区第一级
    *queryDefaultCity({ payload }, { call }) {
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.map(n => {
          const m = {
            ...n,
          };
          m.isLeaf = false;
          return m;
        });
        return newCityResponse;
      }
      return [];
    },

    // 查询城市列表
    *queryCitys({ payload }, { call }) {
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.map(n => {
          const m = {
            ...n,
          };
          // 地区级联判断最后一级地区
          m.isLeaf = !!Number(m.isLeaf);
          return m;
        });
        return newCityResponse;
      }
      return [];
    },

    *fetchIndustryCategories({ payload }, { call, put }) {
      const industryCategories = getResponse(yield call(fetchIndustryCategories, payload));
      yield put({
        type: 'updateState',
        payload: {
          industryCategories,
          industryAllCategoryList: smoothingArray(industryCategories),
        },
      });
      return smoothingArray(industryCategories);
    },

    // 保存平台级地址信息
    *saveFinancialList({ payload }, { call }) {
      const res = getResponse(yield call(saveFinancialList, payload));
      return res;
    },

    // 保存平台级银行信息
    *saveAttachmentsList({ payload }, { call }) {
      const res = getResponse(yield call(saveAttachmentsList, payload));
      return res;
    },

    *queryAttachmentsList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryAttachmentsList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            attachmentsList: res,
          },
        });
      }
    },

    *fetchAttachmentType({ payload }, { call, put }) {
      const response = yield call(queryAttachmentType, payload);
      const data = getResponse(response);
      if (data) {
        const arr = [];
        data.map(d => {
          return arr.push({
            ...d,
            isLeaf: false,
          });
        });
        yield put({
          type: 'queryAttachmentType',
          payload: arr,
        });
      }
      return data;
    },

    *bussinessInit({ payload }, { call, put }) {
      const industries = yield call(fetchIndustries, payload);
      if (!isEmpty(industries)) {
        yield put({
          type: 'updateState',
          payload: {
            industries,
          },
        });
      }
    },
    *addAttachment({ payload }, { call }) {
      const response = yield call(addAttachment, payload);
      return getResponse(response);
    },

    *fetchFileNumber({ payload }, { call }) {
      const response = yield call(fetchFileNumber, payload);
      return getResponse(response);
    },

    // 信息变更审批查询
    *queryInfoChangeApprovalDetail({ payload }, { call }) {
      const res = getResponse(yield call(queryInfoChangeApprovalDetail, payload));
      return res;
    },
    // 企业信息变更明细查询
    *queryInvestigate({ payload }, { call }) {
      const res = getResponse(yield call(queryInvestigate, payload));
      return res;
    },
    // 审批通过
    *approve({ payload }, { call }) {
      const res = getResponse(yield call(approve, payload));
      return res;
    },
    // 申请状态
    *approveStatus(_, { call, put }) {
      const lovCode = {
        approveStatus: 'SSLM.ENTERPRISE_CHANGE_CONFIRM_STATUS',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            approveStatus: res.approveStatus,
          },
        });
      }
    },
    // 审批确认
    *confirm({ payload }, { call }) {
      const res = getResponse(yield call(confirm, payload));
      return res;
    },
    // 审批拒绝
    *approveReject({ payload }, { call }) {
      const res = getResponse(yield call(approveReject, payload));
      return res;
    },
    // 审批拒绝
    *reject({ payload }, { call }) {
      const res = getResponse(yield call(reject, payload));
      return res;
    },
    // 三证认证
    *tripartite({ payload }, { call }) {
      const res = getResponse(yield call(tripartite, payload));
      return res;
    },
    // 新三证认证
    *tripartiteVerification({ payload }, { call }) {
      const res = getResponse(yield call(tripartiteVerification, payload));
      return res;
    },
    // 企业信息变更明细查询-平台
    *queryPlatformInfo({ payload }, { call }) {
      const res = getResponse(yield call(queryPlatformInfo, payload));
      return res;
    },
    // 申请单查询-平台
    *queryPlatformApplication({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPlatformApplication, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            platformApplicationList: res.content,
            platformApplicationPagination: createPagination(res),
          },
        });
      }
    },

    // 调查表变更申请-值集
    *changeApprovalCode(
      {
        payload: { lovCode, ...rest },
      },
      { call }
    ) {
      return getResponse(yield call(queryUnifyIdpValue, lovCode, rest));
    },

    // 企业信息变更明细查询
    *queryDataSource({ payload }, { call }) {
      const res = getResponse(yield call(queryDataSource, payload));
      return res;
    },

    // 保存调查表数据
    *saveSmallDataSource({ payload }, { call }) {
      const res = getResponse(yield call(saveSmallDataSource, payload));
      return res;
    },

    // 删除调查表数据
    *deleteDataSource({ payload }, { call }) {
      const res = getResponse(yield call(deleteDataSource, payload));
      return res;
    },

    // 查询供应商分类
    *querySupplierClassify({ payload }, { call, put }) {
      const res = getResponse(yield call(querySupplierClassify, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierClassifyList: res,
          },
        });
      }
    },
    // 查询中国值集对象
    *getDefaultBankCountryInfo({ payload }, { call, put }) {
      const res = getResponse(yield call(getDefaultBankCountryInfo, {}));
      const { domesticForeignRelation, companyName, source } = payload || {};
      if (res) {
        let data = {};
        if (source === 'enterprise') {
          data = {
            enterpriseInfoDefault: {
              ...res,
              domesticForeignRelation,
              companyName,
            },
          };
        } else {
          data = {
            supplierInfoDefault: {
              ...res,
              domesticForeignRelation,
              companyName,
            },
          };
        }
        yield put({
          type: 'updateState',
          payload: data,
        });
      }
    },

    // 保存供应商分类
    *saveSupplierClassify({ payload }, { call }) {
      const res = getResponse(yield call(saveSupplierClassify, payload));
      return res;
    },
    // 校验银行信息账户名称是否一致
    *checkBankAccount({ payload }, { call }) {
      const res = getResponse(yield call(checkBankAccount, payload));
      return res;
    },
    // 校验银行数据（账户是否重复、银行信息账户名称是否一致）
    *checkBankAccountCommon({ payload }, { call }) {
      const res = getResponse(yield call(checkBankAccountCommon, payload));
      return res;
    },
    // 查询征信配置
    *fetchSettings(_, { call }) {
      const res = getResponse(yield call(fetchSettings));
      return res;
    },
    // 查询个性化
    *queryCustomize({ payload }, { call, put }) {
      const { isSecondaryDomain = 'false', ...other } = payload;
      let customizeMap = {};
      const code =
        isSecondaryDomain === 'true'
          ? 'SSLM.ENTERPRISE_INFORM_CHANGE_SUPPLIER.COLLAPSE'
          : 'SSLM.ENTERPRISE_INFORM_CHANGE_DETAIL.COLLAPSE';
      const res = getResponse(yield call(queryCustomize, other));
      if (res) {
        const data = (res[`${code}`] || {}).fields || [];
        const collapseCodeList = [];
        data.forEach(n => {
          if (n.visible !== 0) {
            collapseCodeList.push(n.fieldCode);
          }
        });
        // 平台级企业信息变更，防止全部隐藏页签时个性化失效
        if (isSecondaryDomain === 'true') {
          collapseCodeList.push('platformDefault');
        }
        customizeMap = {
          collapseCodeList,
          customizeConfig: res,
        };
        yield put({
          type: 'updateState',
          payload: {
            collapseCodeList,
            customizeConfig: res,
          },
        });
      }
      return customizeMap;
    },
    // 查询平台级变更确认折叠面板个性化配置
    *queryCustomizePlatform({ payload }, { call }) {
      const { unitCode } = payload;
      let customizeMap = {};
      const res = getResponse(yield call(queryCustomize, payload));
      if (res) {
        const data = (res[`${unitCode}`] || {}).fields || [];
        const collapseCodeList = [];
        const activeCollapseList = [];
        data.forEach(n => {
          if (n.visible !== 0) {
            collapseCodeList.push(n.fieldCode);
          }
          // 获取配置的页签
          if (n.defaultActive !== -1) {
            activeCollapseList.push({
              configName: n.fieldCode,
              activeFlag: !!n.defaultActive,
            });
          }
        });
        // 防止全部隐藏页签时个性化失效
        collapseCodeList.push('platformDefault');
        customizeMap = {
          collapseCodeList,
          activeCollapseList,
          customizeConfig: res,
        };
      }
      return customizeMap;
    },
    // 查询平台级变更确认
    *queryPaltformList({ payload }, { call, put }) {
      const res = getResponse(yield call(queryPaltformList, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            paltformListDataSource: res.content,
            paltformListPagination: createPagination(res),
          },
        });
      }
    },
    // 平台级租户确认前
    *tenantConfirmBefore({ payload }, { call }) {
      const res = getResponse(yield call(tenantConfirmBefore, payload));
      return res;
    },
    // 平台级租户确认
    *tenantConfirm({ payload }, { call }) {
      const res = getResponse(yield call(tenantConfirm, payload));
      return res;
    },
    // 删除附件
    *deleteAttachment({ payload }, { call }) {
      const res = getResponse(yield call(deleteAttachment, payload));
      return res;
    },
    //
    // 查询二级域名对应租户
    *fetchWeburl({ payload }, { call }) {
      const res = getResponse(yield call(fetchWeburl, payload));
      return res;
    },
    // 更新登记信息营业执照
    *updateLicenceUrl({ payload }, { call }) {
      const res = getResponse(yield call(updateLicenceUrl, payload));
      return res;
    },
    // 更新附件最后上传日期
    *updateUploadDate({ payload }, { call }) {
      const res = getResponse(yield call(updateUploadDate, payload));
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
    updateCityMap(state, { payload }) {
      const { countryId, cityResponse } = payload;
      const { cityDataMap } = state;
      cityDataMap[countryId] = cityResponse;
      return {
        ...state,
        cityDataMap,
      };
    },
    queryAttachmentType(state, action) {
      return {
        ...state,
        attachmentCode: {
          ...state.attachmentCode,
          AttachmentType: action.payload,
        },
      };
    },
  },
};
