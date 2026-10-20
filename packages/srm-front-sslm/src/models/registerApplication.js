/**
 * registerApplication.js - 供应商生命周期注册申请单
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  queryRegisterDetail,
  saveRegister,
  releaseRegister,
  deleteRegister,
} from '@/services/registerApplicationService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'registerApplication',

  state: {
    registerInfo: {}, // 注册申请单详情
    previewConfig: [], // 调查表预览配置
    investigateTypes: [], // 调查表类型
    tmplKey: null, // 调查表模板 key
  },

  effects: {
    *init(_, { call, put }) {
      const lovCode = {
        investigateTypes: 'SSLM.INVESTIGATE_TYPE',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { investigateTypes: res.investigateTypes },
        });
      }
    },
    *queryRegisterDetail({ payload }, { call, put }) {
      const { requisitionId } = payload;
      const registerInfo = getResponse(yield call(queryRegisterDetail, { requisitionId }));
      if (!isEmpty(registerInfo)) {
        yield put({
          type: 'updateState',
          payload: { registerInfo },
        });
      }
      return registerInfo || {};
    },
    *deleteRegister({ payload }, { call }) {
      const { requisitionId } = payload;
      const res = getResponse(yield call(deleteRegister, { requisitionId }));
      return res;
    },
    *saveRegister({ payload }, { call }) {
      const res = getResponse(yield call(saveRegister, payload));
      return res;
    },
    *releaseRegister({ payload }, { call }) {
      const res = getResponse(yield call(releaseRegister, payload));
      return res;
    },
  },

  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
