/**
 * model - 处理邀约
 * @date: 2018-8-13
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.2
 * @copyright Copyright (c) 2018, Hand
 */
import {
  getInvitingInformation,
  approveCoop,
  rejectCoop,
  queryInviteCompanyInfo,
  sendInvestigate,
  fetchHeaderInfo,
  fetchInvestigationDetail,
  fetchPrivacyPolicy,
  fetchPrivacyPolicyText,
  querySupplierCategoryDate,
  checkClassify, // 供应商分类校验
  getDefaultCountryInfo,
  handlePrint,
  handleExcelPrint,
  saveOperatorInfo,
  fetchSinglePrivacyPolicyText,
  checkPartner,
  handleWithdrawnInvite,
} from '@/services/disposeInviteService';
import {
  handleAgree,
  handleReject,
  handleInvestigateReject,
} from '@/services/investigationApprovalService';
// import { queryIdpValue } from 'hzero-front/lib/services/api';
import { getResponse } from 'utils/utils';
import { queryMapIdpValue, queryUnifyIdpValue } from 'hzero-front/lib/services/api';
import { isEmpty } from 'lodash';
import { fetchGetPurchaser, queryCurrentUserPurchaseAgent } from '@/services/companySearchService';

export default {
  namespace: 'disposeInvite',
  state: {
    headerInfo: {}, // 调查表头部信息
    invitingInfo: {}, // 邀约信息
    detail: {},
    companyInfo: {}, // 公司信息
    privacyPolicyText: [],
    Enums: {},
    lifeCycleList: [],
  },
  effects: {
    // 查询生命周期阶段sql值集
    *queryLifeCycleStage(_, { put, call }) {
      const res = getResponse(yield call(queryUnifyIdpValue, 'SSLM.LIFE_CYCLE_STAGE'));
      if (res) {
        yield put({
          type: 'update',
          payload: {
            lifeCycleList: res,
          },
        });
      }
    },
    // 合并请求 值集
    *fetchEnums(_, { put, call }) {
      const Enums = getResponse(
        yield call(queryMapIdpValue, {
          roleTypeSet: 'SPFM.PARTNER_INVITE_ROLE_TYPE',
          investigateTypeList: 'SSLM.INVESTIGATE_TYPE',
          idd: 'HPFM.IDD',
          yesOrNoFlag: 'HPFM.FLAG',
          printType: 'SSLM_INVESTIGATE_PRINT_CODE',
        })
      );
      if (!isEmpty(Enums)) {
        yield put({
          type: 'update',
          payload: {
            Enums,
          },
        });
      }
    },
    // 获取邀请信息
    *getInvitingInformation({ payload }, { call, put }) {
      const response = yield call(getInvitingInformation, payload);
      // const { inviteId } = payload;
      const invitingInfo = getResponse(response);
      if (invitingInfo) {
        yield put({
          type: 'updateState',
          payload: { invitingInfo },
        });
      }
      return invitingInfo;
    },
    // 同意邀约
    *approveCoop({ payload }, { call }) {
      const response = yield call(approveCoop, payload);
      return getResponse(response);
    },
    // 拒绝邀约
    *rejectCoop({ payload }, { call }) {
      const response = yield call(rejectCoop, payload);
      return getResponse(response);
    },
    // 发送调查表
    *sendInvestigate({ payload }, { call }) {
      const response = yield call(sendInvestigate, payload);
      return getResponse(response);
    },
    // 查询公司信息
    *queryCompany({ payload }, { call, put }) {
      const response = yield call(queryInviteCompanyInfo, payload);
      const data = getResponse(response);
      if (data) {
        const { basic = {}, business = {}, contactList = [], attachmentList = [] } = data;
        yield put({
          type: 'updateState',
          payload: { companyInfo: { ...basic, ...business, contactList, attachmentList } },
        });
      }
    },
    // // 查询值集
    // *init({ payload }, { call, put }) {
    //   const { investigateType } = payload;
    //   const investigateTypeList = yield call(queryIdpValue, investigateType);
    //   yield put({
    //     type: 'updateState',
    //     payload: {
    //       investigateTypeList,
    //     },
    //   });
    // },
    // // 查询调查表
    // *fetchTemplate({ payload }, { call, put }) {
    //   const { investigateTemplateId } = payload;
    //   const config = getResponse(
    //     yield call(investigationTemplateHeaderQueryAll, investigateTemplateId)
    //   );
    //   if (!isEmpty(config)) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         config: dealConfigData(config),
    //       },
    //     });
    //   }
    // },
    // 查询头部信息
    *fetchHeaderInfo({ payload }, { call, put }) {
      const response = yield call(fetchHeaderInfo, payload);
      const headerInfo = getResponse(response);
      if (headerInfo) {
        yield put({
          type: 'updateState',
          payload: {
            headerInfo,
          },
        });
      }
      return headerInfo;
    },
    // 查询详情
    *fetchInvestigationHeader({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInvestigationDetail, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
      return result;
    },
    // 审批通过
    *handleAgree({ payload }, { call, put }) {
      const result = getResponse(yield call(handleAgree, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
      return result;
    },
    // 邀约拒绝
    *handleReject({ payload }, { call, put }) {
      const result = getResponse(yield call(handleReject, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            detail: result,
          },
        });
      }
      return result;
    },

    // 查询是否启用隐私政策
    *fetchPrivacyPolicy({ payload }, { call }) {
      const res = yield call(fetchPrivacyPolicy, payload);
      return getResponse(res);
    },

    // 隐私政策文档
    *fetchPrivacyPolicyText({ payload }, { call, put }) {
      const res = yield call(fetchPrivacyPolicyText, payload);
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            privacyPolicyText: res || [],
          },
        });
      }
    },
    // 查询平台静态文本
    *fetchPlatformPolicyText({ payload }, { call }) {
      const res = yield call(fetchSinglePrivacyPolicyText, payload);
      return getResponse(res);
    },
    // 查询供应商分类信息
    *querySupplierCategoryDate({ payload }, { call }) {
      const response = yield call(querySupplierCategoryDate, payload);
      const data = getResponse(response);
      return data;
    },
    // 调查表审批拒绝
    *handleInvestigateReject({ payload }, { call }) {
      const result = getResponse(yield call(handleInvestigateReject, payload));
      // if (result) {
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       detail: result,
      //     },
      //   });
      // }
      return result;
    },
    // 供应商分类校验
    *checkClassify({ payload }, { call }) {
      const response = getResponse(yield call(checkClassify, payload));
      return response;
    },
    // 自动带出采购员与手机号
    *fetchGetPurchaser({ payload }, { call }) {
      const response = yield call(fetchGetPurchaser, payload);
      return getResponse(response);
    },
    // 查询查询当前登录人对应的采购员
    *queryCurrentUserPurchaseAgent(_, { call }) {
      const response = yield call(queryCurrentUserPurchaseAgent);
      return getResponse(response);
    },
    // 查询中国值集对象
    *getDefaultCountryInfo(_, { call }) {
      const res = getResponse(yield call(getDefaultCountryInfo, {}));
      return getResponse(res);
    },
    // pdf打印
    *handlePrint({ payload }, { call }) {
      const res = getResponse(yield call(handlePrint, payload));
      return res;
    },
    // excel打印
    *handleExcelPrint({ payload }, { call }) {
      const res = getResponse(yield call(handleExcelPrint, payload));
      return res;
    },
    // 保存操作人信息
    *saveOperatorInfo({ payload }, { call }) {
      const response = yield call(saveOperatorInfo, payload);
      const res = getResponse(response);
      return res;
    },
    // 校验合作伙伴
    *checkPartner({ payload }, { call }) {
      const res = yield call(checkPartner, payload);
      return getResponse(res);
    },
    // 撤回邀约
    *withdrawInvite({ payload }, { call }) {
      const res = yield call(handleWithdrawnInvite, payload);
      return getResponse(res);
    },
  },
  reducers: {
    update(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateState(state, { payload }) {
      const inviteId = payload.inviteId ? payload.inviteId : state.inviteId;
      const object = {
        [inviteId]: {
          headerInfo: {},
          invitingInfo: {},
          detail: {},
          companyInfo: {},
          privacyPolicyText: [],
          ...state[inviteId],
          ...payload,
        },
      };
      return {
        ...state,
        ...object,
        inviteId,
      };
    },
  },
};
