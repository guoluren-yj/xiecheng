/*
 * @Description: certificateAuthority- CA认证
 * @Author: zhutian <tian.zhu@hand-china.com>
 * @Date: 2019-08-06 16:09:07
 * @LastEditTime: 2022-09-06 13:54:38
 * @version: 0.0.1
 * @copyright: Copyright (c) 2019, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  save,
  fetchDetailInfo,
  saveDetail,
  submitDetail,
  approve,
  resetProcess,
  fetchAuthentication,
  fetchAuthInfo,
  companyVerify,
  commonCompanyVerify,
  fetchElectronicSignatureUrl,
  fetchElectronicSignatureFlag,
  addRelationship,
  removeRelationship,
} from '@/services/certificateSdatAuthorityService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'certificateAuthoritySdat',
  state: {
    formEnumMap: {}, // 查询表单值集
    detailEnumMap: {}, // 详情值集
    dataSource: [],
    pagination: {},
  },
  effects: {
    // 查询表单值集
    *fetchFormEnum(params, { put, call }) {
      const formEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          enableFlag: 'HPFM.FLAG',
          CAStatusFlag: 'SPFM.CA_STATUS',
        })
      );
      if (formEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            formEnumMap: formEnumMap || {},
          },
        });
      }
    },

    // 获取值集
    *fetchDetailEnum(_, { call, put }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          certificatesType: 'SPFM.ID_TYPE',
          legalPersonPlace: 'SPFM.AUTH_INFO_LEAGA_AREA',
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap: detailEnumMap || {},
          },
        });
      }
    },

    // 查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content.map((n) => ({ ...n, _status: 'update' })),
            pagination: createPagination(response),
          },
        });
      }
      return response;
    },
    // 公司法大大认证页面跳转
    *companyVerify({ payload }, { call }) {
      const response = getResponse(yield call(companyVerify, payload));
      return response;
    },
    // 公司认证页面跳转
    *commonCompanyVerify({ payload }, { call }) {
      const response = getResponse(yield call(commonCompanyVerify, payload));
      return response;
    },
    // 查询认证类型
    *fetchauthentication({ payload }, { call }) {
      const response = getResponse(yield call(fetchAuthentication, payload));
      return response;
    },

    // 查询明细
    *fetchDetailInfo({ payload }, { call }) {
      const response = getResponse(yield call(fetchDetailInfo, payload));
      return response;
    },

    // 保存列表
    *save({ payload }, { call }) {
      const response = getResponse(yield call(save, payload));
      return response;
    },

    // 保存明细
    *saveDetail({ payload }, { call }) {
      const response = getResponse(yield call(saveDetail, payload));
      return response;
    },

    // 提交明细
    *submitDetail({ payload }, { call }) {
      const response = getResponse(yield call(submitDetail, payload));
      return response;
    },
    // 提交
    *approve({ payload }, { call }) {
      const response = getResponse(yield call(approve, payload));
      return response;
    },

    // 重置流程
    *resetProcess({ payload }, { call }) {
      const response = getResponse(yield call(resetProcess, payload));
      return response;
    },

    // 实名认证是否成功判断
    *fetchAuthInfo({ payload }, { call }) {
      const response = getResponse(yield call(fetchAuthInfo, payload));
      return response;
    },

    // 获取开通电子签服务地址
    *fetchElectronicSignatureUrl({ payload }, { call }) {
      const response = getResponse(yield call(fetchElectronicSignatureUrl, payload));
      return response;
    },

    // 查询是否有公司开通了电子签章服务
    *fetchElectronicSignatureFlag({ payload }, { call }) {
      const response = getResponse(yield call(fetchElectronicSignatureFlag, payload));
      return response;
    },

    // 法大大添加关系
    *addRelationship({ payload }, { call }) {
      const response = getResponse(yield call(addRelationship, payload));
      return response;
    },

    // 法大大移除关系
    *removeRelationship({ payload }, { call }) {
      const response = getResponse(yield call(removeRelationship, payload));
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
