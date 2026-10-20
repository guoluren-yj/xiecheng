/*
 * author: 吴云强
 * createTime: 2018/08/01 18:53:54
 * editTime: 2018/08/01 18:54:30
 * feature: 租户级调查表模板历史查询
 */

import { createPagination, getResponse, getCurrentOrganizationId } from 'utils/utils';
import { fetchInvestigateList } from '@/services/orgInvestigateTemplateHistoryService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'investigationTemHistoryOrg',

  state: {
    investigateList: [],
    pagination: {},
    dataSourceMap: {}, // 修改的记录
    createSourceMap: {}, // 新增的记录
    query: {},
    selectedRowKeys: [],
    selectedRows: [],
    modalVisible: false,
    orgAddModalVisible: false, // 新增弹窗visible
    investigateTypes: [], // 调查表类型
  },

  effects: {
    // 查询
    *queryInvestigateList({ payload }, { call, put }) {
      const { page = 0, size = 10, ...query } = payload;
      const result = yield call(fetchInvestigateList, { ...query, page, size });
      if (result && !result.failed) {
        yield put({
          type: 'updateState',
          payload: {
            query,
            investigateList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    *init(params, { call, put }) {
      const lovCode = {
        investigateCode: 'SSLM.INVESTIGATE_TYPE',
        tenantId,
      };
      const res = getResponse(yield call(queryMapIdpValue, lovCode));
      if (res) {
        yield put({
          type: 'updateState',
          payload: { investigateTypes: res.investigateCode },
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
