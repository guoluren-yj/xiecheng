/**
 * model 供应商调查问卷维护
 * @date: 2018-8-13
 * @version: 0.0.1
 * @author:  dengtingmin <tingmin.deng@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination, getCurrentOrganizationId } from 'utils/utils';
import {
  investigateRelease,
  investigateCreate,
  investigateCreateAndRelease,
  fetchSupplierLovData,
  fetchSupplierClassify,
  fetTreeSupplierClassify,
  fetchLifeCycleDimConfigs,
  querySupplierInfo,
  getUserDefaultMsg,
  checkSupplier,
  checkReleaseBlackSupplier,
} from '@/services/investigationCreateService';
import { queryMapIdpValue } from 'services/api';

const tenantId = getCurrentOrganizationId();

export default {
  namespace: 'investigationMaintain',
  state: {
    code: {},
    investigationList: {
      content: [],
      investigationPagination: {},
    },
    supplierList: {},
    supplierPagination: {},
    supplierClassifyList: [], // 供应商分类集合
  },
  // 获取单个值级
  effects: {
    *batchCode(_, { put, call }) {
      const lovCode = {
        tenantId,
        investigateTypeList: 'SSLM.INVESTIGATE_TYPE',
        investigateLevelList: 'SSLM.INVESTIGATE_LEVEL',
      };
      const code = getResponse(yield call(queryMapIdpValue, lovCode));
      if (!isEmpty(code)) {
        yield put({
          type: 'updateState',
          payload: {
            code,
          },
        });
      }
    },
    // 调查表发布
    *investigateRelease({ payload }, { call }) {
      const res = yield call(investigateRelease, payload);
      return getResponse(res);
    },

    // 调查表创建
    *investigateCreate({ payload }, { call }) {
      const res = yield call(investigateCreate, payload);
      return getResponse(res);
    },

    // 调查表确定并且发布
    *investigateCreateAndRelease({ payload }, { call }) {
      const res = yield call(investigateCreateAndRelease, payload);
      return res;
    },
    // 发布前校验黑名单供应商
    *checkReleaseBlackSupplier({ payload }, { call }) {
      const res = yield call(checkReleaseBlackSupplier, payload);
      return getResponse(res);
    },
    /**
     * 获得供应商lov数据
     */
    *fetchSupplierLovData({ payload }, { call, put }) {
      const res = yield call(fetchSupplierLovData, payload);
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            supplierList: list,
            supplierPagination: createPagination(list),
          },
        });
      }
    },

    /**
     * 查询供应商分类
     */
    *fetchSupplierClassify({ payload }, { call, put }) {
      const res = getResponse(yield call(fetchSupplierClassify, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierClassifyList: res,
          },
        });
      }
    },

    /**
     * 树结构查询供应商分类
     */
    *fetTreeSupplierClassify({ payload }, { call, put }) {
      const res = getResponse(yield call(fetTreeSupplierClassify, payload));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            supplierClassifyTreeList: res.content,
          },
        });
      }
    },

    /**
     * 查询供应商管控维度配置
     */
    *fetchLifeCycleDimConfigs(_, { call, put }) {
      const res = getResponse(yield call(fetchLifeCycleDimConfigs, _));
      if (res) {
        yield put({
          type: 'updateState',
          payload: {
            dimensionConfig: res,
          },
        });
      }
      return res;
    },

    // 工作台新建时查询供应商信息
    *querySupplierInfo({ payload }, { call }) {
      const res = getResponse(yield call(querySupplierInfo, payload));
      return res;
    },

    /**
     * 查询用户默认信息
     */
    *getUserDefaultMsg(_, { call }) {
      const res = getResponse(yield call(getUserDefaultMsg, _));
      return res;
    },

    // 校验供应商信息
    *checkSupplier({ payload }, { call }) {
      const res = getResponse(yield call(checkSupplier, payload));
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
