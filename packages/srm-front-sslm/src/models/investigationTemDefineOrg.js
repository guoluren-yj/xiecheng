/*
 * investigationTemDefineOrg - 租户级调查表模板定义
 * @date: 2018/10/13 09:00:39
 * @author: HB <bin.huang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { createPagination, getResponse } from 'utils/utils';
import {
  fetchInvestigateList,
  addInvestigate,
  changeInvestigate,
  handleEffect,
  fetchUnassignedCompanies,
  fetchAssignedCompanies,
  investigateAssign,
  investigateUnAssign,
  queryUpdateTemplateId,
  updateBasicInfo,
  investigateTemptCopy,
} from '@/services/orgInvestigateTemplateService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'investigationTemDefineOrg',

  state: {
    investigateList: [],
    pagination: {},
    dataSourceMap: {}, // 修改的记录
    createSourceMap: {}, // 新增的记录
    selectedRowKeys: [],
    selectedRows: [],
    investigateTypes: [], // 调查表类型
    dataSouceQueryCompany: [], // 未分配公司列表
    dataSouceQueryCompanyPagination: {}, // 未分配公司分页参数
    dataSouceSelectCompany: [], // 已分配公司列表
    dataSouceSelectCompanyPagination: {}, // 已分配公司分页参数
  },

  effects: {
    // 查询列表
    *queryInvestigateList({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchInvestigateList, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            investigateList: result.content.map(item => ({ ...item, _status: 'update' })),
            pagination: createPagination(result),
          },
        });
      }
    },
    // 获取值集
    *init({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            enabledList: res.enabledList,
            investigateTypes: res.investigateTypes,
          },
        });
      }
    },
    // 查询更新的调查表模板id
    *queryUpdateTemplateId({ payload }, { call }) {
      const data = getResponse(yield call(queryUpdateTemplateId, payload.investigateTemplateId));
      return data;
    },
    // 新增调查表
    *addInvestigate({ payload }, { call }) {
      const data = getResponse(yield call(addInvestigate, payload));
      return data;
    },
    // 更新调查表
    *changeInvestigate({ payload }, { call }) {
      const data = yield call(changeInvestigate, payload);
      return getResponse(data);
    },
    // 更新调查表基础信息
    *updateBasicInfo({ payload }, { call }) {
      const response = yield call(updateBasicInfo, payload);
      return getResponse(response);
    },
    *handleEffect({ payload }, { call }) {
      const data = yield call(handleEffect, payload);
      return getResponse(data);
    },
    // 查询调查表未分配的公司
    *fetchUnassignedCompanies({ payload }, { call, put }) {
      const res = yield call(fetchUnassignedCompanies, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            dataSouceQueryCompany: list.content,
            dataSouceQueryCompanyPagination: createPagination(list),
          },
        });
      }
    },
    // 查询调查表已分配的公司
    *fetchAassignedCompanies({ payload }, { call, put }) {
      const res = yield call(fetchAssignedCompanies, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            dataSouceSelectCompany: list.content,
            dataSouceSelectCompanyPagination: createPagination(list),
          },
        });
      }
    },
    // 增加调查表模板
    *investigateAssign({ payload }, { call }) {
      const data = getResponse(yield call(investigateAssign, { ...payload }));
      return data;
    },
    // 移除调查表模板
    *investigateUnAssign({ payload }, { call }) {
      const data = getResponse(yield call(investigateUnAssign, { ...payload }));
      return data;
    },
    // 复制调查表模板
    *handleTemplateCopy({ payload }, { call }) {
      const data = getResponse(yield call(investigateTemptCopy, { ...payload }));
      return data;
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
