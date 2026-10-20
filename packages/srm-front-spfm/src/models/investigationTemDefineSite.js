/*
 * author: huang bin
 * createTime: 2018/08/01 14:11:57
 * editTime: 2018/08/01 14:12:19
 * feature: 平台级调查表模板定义
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  fetchInvestigateList,
  changeInvestigate,
} from '@/services/siteInvestigateTemplateService';
import { queryIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'investigationTemDefineSite',

  state: {
    investigateList: [],
    pagination: {},
    modalVisible: false, // 新增弹窗显示状态
    investigateTypes: [], // 调查表类型
  },

  effects: {
    // 查询调查表列表
    *fetchInvestigateList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInvestigateList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            investigateList: result.content.map(item => ({ _status: 'update', ...item })),
            pagination: createPagination(result),
          },
        });
      }
    },
    // 新增或者修改调查表
    *changeInvestigate({ payload }, { call }) {
      const data = yield call(changeInvestigate, payload);
      return getResponse(data);
    },
    *fetchEnum(params, { call, put }) {
      const investigateCode = 'SSLM.INVESTIGATE_TYPE';
      const investigateTypes = getResponse(yield call(queryIdpValue, investigateCode));
      if (investigateTypes) {
        yield put({
          type: 'updateState',
          payload: { investigateTypes },
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
