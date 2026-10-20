import { isEmpty, forEach } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';

import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import {
  companySearchQueryPagePurchaser,
  companySearchIndustry,
  companySearchInviteSupplier,
  queryCompanyInformation,
  fetchShowSupplierCategory,
  querySupplierCategoryDate,
  checkClassify, // 供应商分类校验
  fetchCompanyMainIdentity,
  fetchSinglePrivacyPolicyText,
} from '@/services/companySearchService';
import { fetchPrivacyPolicy, fetchPrivacyPolicyText } from '@/services/disposeInviteService';

export default {
  namespace: 'companySearchPurchaser',
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
    settings: {}, // 配置中心配置
    supplierCategoryFlag: {}, // 是否显示供应商分类
    supplierCategoryDate: {}, // 供应商分类信息
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
        yield call(companySearchQueryPagePurchaser, organizationId, params, pagination)
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
    },
    // 发送采购方邀约
    *invite({ payload }, { call }) {
      const response = yield call(companySearchInviteSupplier, payload);
      return getResponse(response);
    },

    // 查询公司信息
    *queryCompanyInformation({ payload }, { call, put }) {
      const response = yield call(queryCompanyInformation, payload);
      const data = getResponse(response);
      if (data) {
        const { basic = {}, business = {}, contactList = [], attachmentList = [] } = data;
        yield put({
          type: 'updateState',
          payload: { companyInformation: { ...basic, ...business, contactList, attachmentList } },
        });
      }
    },
    // 查询是否启用供应商分类
    *fetchShowSupplierCategory({ payload }, { call, put }) {
      const res = yield call(fetchShowSupplierCategory, payload);
      const data = getResponse(res);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            supplierCategoryFlag: data,
          },
        });
      }
    },
    // 查询供应商分类信息
    *querySupplierCategoryDate({ payload }, { call, put }) {
      const response = yield call(querySupplierCategoryDate, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            supplierCategoryDate: data,
          },
        });
      }
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
    // 查询平台静态文本
    *fetchPlatformPolicyText({ payload }, { call }) {
      const res = yield call(fetchSinglePrivacyPolicyText, payload);
      return getResponse(res);
    },
    // 查询采购方分配公司的隐私协议
    *fetchPurchaserPolicyText({ payload }, { call }) {
      let privacyPolicyText = [];
      // 查询采购方是否开启隐私协议
      const res = yield call(fetchPrivacyPolicy, payload);
      const enableRes = getResponse(res);
      if (enableRes) {
        const { settingValue } = enableRes;
        if (settingValue === '1') {
          // 查询采购方分配公司的隐私协议
          const { tenantId, companyId } = payload;
          const param = {
            partnerTenantId: tenantId,
            companyId,
            textCode: 'SSLM.INVITE.PRIVACY_AGREEMENT',
          };
          const purchaserRes = getResponse(yield call(fetchPrivacyPolicyText, param));
          if (purchaserRes) {
            privacyPolicyText = purchaserRes;
          }
        }
      }
      return privacyPolicyText;
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
