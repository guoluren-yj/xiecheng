import { isEmpty, forEach, isNumber, isNaN } from 'lodash';
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';

import {
  queryMapIdpValue,
  queryLovData,
  queryIdpValue,
  queryUnifyIdpValue,
} from 'hzero-front/lib/services/api';
import {
  companySearchQueryPageSupplier,
  companySearchIndustry,
  companySearchInvitePurchaser,
  companySearchInviteRegisterSupplier,
  queryInvestigateTemplates,
  queryCompanyInformation,
  companySearchInvited,
  fetchSettings,
  fetchRiskScan,
  riskEmbedPage,
  riskEmbedFlag,
  fetchOnlyShowMySupplierFlag,
  querySupplierCategory,
  saveSupplierCategory,
  companySearchOwn,
  querySupplierCategoryDate, // 查询供应商分类
  queryInviterData, // 查询邀请方信息
  fetchGetPurchaser,
  checkClassify, // 供应商分类校验
  fetchCompanyMainIdentity,
  queryCurrentUserPurchaseAgent,
  checkBlacklist,
  fetchOpenNewRegister,
} from '@/services/companySearchService';

export default {
  namespace: 'companySearchSupplier',
  state: {
    // 值集
    code: {},
    // 行业信息
    // childIndustryLength 所有二级行业的 数量, 在选中 全部的 二级行业时, 不传二级行业给 接口
    // industries 所有的一级行业
    // industryMap 一级行业的Map  industryId: industry
    industries: {},
    // 后台 返回的 分页数据
    list: {},
    investigateTemplates: [],
    settings: {}, // 配置中心配置
    riskScanList: [], // 查询风险扫描列表
    invitedList: [],
    invitedPagination: {},
    supplierCategoryList: [], // 供应商分类树数据
    supplierCategoryKeys: [], // 所有分类的 key 列表
    tagList: [],
    categoryCodeList: [], // 准入品类列表
    supplierCategoryDate: {}, // 供应商分类信息
    inviterData: {}, // 邀请方信息
    inviteStatus: [], // 邀请状态
    lifeCycleList: [], // 生命周期阶段
    listPage: {}, // 列表分页
  },
  effects: {
    // 合并请求 值集
    *batchCode({ payload }, { put, call }) {
      const { lovCodes } = payload;
      const code = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(code)) {
        yield put({
          type: 'updateState',
          payload: {
            code,
          },
        });
      }
    },
    // 查询sql值集
    *queryLifeCycleStage(_, { put, call }) {
      const res = getResponse(yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_STAGE'));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            lifeCycleList: res,
          },
        });
      }
    },
    // 获取状态
    *fetchInviteStatus(_, { call, put }) {
      const result = yield call(queryIdpValue, 'SPFM.INVITE_QUERY_STATUS');
      const inviteStatus = getResponse(result);
      if (inviteStatus) {
        yield put({
          type: 'updateState',
          payload: {
            inviteStatus,
          },
        });
      }
    },
    // 查询准入品类列表
    *fetchcategoryCodeList({ payload }, { call, put }) {
      const response = yield call(
        queryLovData,
        `/smdm/v1/${getCurrentOrganizationId()}/item-categories/category-agent/lov`,
        payload
      );
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { categoryCodeList: data },
        });
      }
    },
    // 初始化 行业
    *initIndustry(_, { call, put }) {
      const industries = getResponse(yield call(companySearchIndustry));
      if (!isEmpty(industries)) {
        const dealIndustries = { industries: [], industryMap: {}, childIndustryLength: 0 };
        forEach(industries, (industry) => {
          const { children, ...copyIndustry } = industry;
          copyIndustry.children = [];
          dealIndustries.industries.push(copyIndustry);
          dealIndustries.industryMap[copyIndustry.industryId] = copyIndustry;
          forEach(children, (childIndustry) => {
            copyIndustry.children.push(childIndustry);
          });
          dealIndustries.childIndustryLength += copyIndustry.children.length;
        });
        // 对 行业做处理，转换为需要的形式
        yield put({
          type: 'updateState',
          payload: {
            industries: dealIndustries,
          },
        });
      }
    },
    // 查询公司信息
    *queryList({ payload }, { call, put }) {
      const { params, pagination, organizationId } = payload;
      const res = getResponse(
        yield call(companySearchQueryPageSupplier, organizationId, params, pagination)
      );
      if (!isEmpty(res)) {
        yield put({
          type: 'updateState',
          payload: {
            list: res,
            listPage: createPagination(res),
          },
        });
      }
      return res;
    },
    // 查询公司分页
    *queryListPage({ payload }, { call, put }) {
      const { params, pagination, organizationId } = payload;
      // 异步获取 totalElements
      const newPagination = {
        ...pagination,
        onlyCountFlag: 'Y',
      };
      const pageInfo = yield call(
        companySearchQueryPageSupplier,
        organizationId,
        params,
        newPagination
      );
      if (getResponse(pageInfo)) {
        yield put({
          type: 'updateState',
          payload: {
            listPage: createPagination(pageInfo),
          },
        });
      }
    },
    // 发送供应商邀约
    *invite({ payload }, { call }) {
      const response = yield call(companySearchInvitePurchaser, payload);
      return getResponse(response);
    },
    // 查询供应商分类信息
    *querySupplierCategoryDate({ payload }, { call, put }) {
      const response = yield call(querySupplierCategoryDate, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { supplierCategoryDate: data },
        });
      }
    },
    // 查询供应商分类信息
    *queryInviterData({ payload }, { call, put }) {
      const response = yield call(queryInviterData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: { inviterData: data },
        });
      }
    },
    // 发起 邀请 供应商 注册
    *inviteRegister({ payload }, { call }) {
      const res = yield call(companySearchInviteRegisterSupplier, payload);
      return getResponse(res);
    },
    // 调查表模板信息查询
    *queryInvestigateTemplates({ payload }, { call, put }) {
      const res = yield call(queryInvestigateTemplates, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            investigateTemplates: list,
          },
        });
      }
    },

    // 查询公司信息
    *queryCompanyInformation({ payload }, { call, put }) {
      const response = yield call(queryCompanyInformation, payload);
      const data = getResponse(response);
      if (data) {
        const { basic = {}, business = {}, contactList = [], attachmentList = [], financeList = [] } = data;
        yield put({
          type: 'updateState',
          payload: { companyInformation: { ...basic, ...business, contactList, attachmentList, financeList } },
        });
      }
    },

    // 查询已邀约公司
    *queryCompanyInvited({ payload }, { call, put }) {
      const response = yield call(companySearchInvited, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            invitedList: data.content,
            invitedPagination: createPagination(data),
          },
        });
      }
    },

    // 查询是否启用仅展示我的供应商
    *fetchOnlyShowMySupplier({ payload }, { call }) {
      const res = yield call(fetchOnlyShowMySupplierFlag, payload);
      return getResponse(res);
    },

    // 查询配置信息
    *fetchSettings(_, { call, put }) {
      const result = getResponse(yield call(fetchSettings));
      const res = getResponse(yield call(fetchRiskScan));
      if (result && res) {
        const newResult = {};
        for (const key in result) {
          if (isNumber(+result[key]) && !isNaN(+result[key]) && result[key] !== null) {
            newResult[key] = +result[key];
          } else if (result[key] === null) {
            newResult[key] = undefined;
          } else {
            newResult[key] = result[key];
          }
        }
        yield put({
          type: 'updateState',
          payload: {
            settings: newResult,
            riskScanList: res,
          },
        });
      }
      return result;
    },

    // 风控服务是否开启
    *riskEmbedFlag({ payload }, { call }) {
      const response = yield call(riskEmbedFlag, payload);
      return getResponse(response);
    },

    // 斯瑞德风险扫描内嵌页
    *riskEmbedPage({ payload }, { call }) {
      const response = yield call(riskEmbedPage, payload);
      return getResponse(response);
    },

    // 查询供应商标签
    *querySupplierCategory({ payload }, { call, put }) {
      const response = yield call(querySupplierCategory, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            tagList: data,
          },
        });
        return data;
      }
    },

    // 查询当前分配公司
    *companyOwn({ payload }, { call }) {
      const res = yield call(companySearchOwn, payload);
      return res;
    },

    // 保存标签
    *saveSupplierCategoryList({ payload }, { call }) {
      const response = yield call(saveSupplierCategory, payload);
      return getResponse(response);
    },
    // 自动带出采购员与手机号
    *fetchGetPurchaser({ payload }, { call }) {
      const response = yield call(fetchGetPurchaser, payload);
      return getResponse(response);
    },
    // 供应商分类校验
    *checkClassify({ payload }, { call }) {
      const response = getResponse(yield call(checkClassify, payload));
      return response;
    },
    // 查询租户下公司是否都有[我要采购][我要销售]标识
    *fetchCompanyMainIdentity(_, { call }) {
      const response = yield call(fetchCompanyMainIdentity);
      return getResponse(response);
    },
    // 查询查询当前登录人对应的采购员
    *queryCurrentUserPurchaseAgent(_, { call }) {
      const response = yield call(queryCurrentUserPurchaseAgent);
      return getResponse(response);
    },
    *checkBlacklist({ payload }, { call }) {
      const response = yield call(checkBlacklist, payload);
      return getResponse(response);
    },
    // 查询当前采购方租户任意二级域名是否开启了新注册
    *fetchOpenNewRegister(_, { call }) {
      const response = yield call(fetchOpenNewRegister);
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
