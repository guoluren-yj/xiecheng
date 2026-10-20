/**
 * externalSystems - 外部系统定义 - medal
 * @date: 2018-09-06
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryIdpValue,
  querySystems,
  queryCompany,
  saveSystems,
  queryCheckedCompany,
  addCompany,
  removeCompany,
  queryUnitOptions,
  queryCheckedUnitOptions,
  addUnitOptions,
  removeUnitOptions,
  queryInterface,
  queryCheckedInterface,
  addInterface,
  removeInterface,
  fetchRelationData,
  saveRelationData,
  fetchESService,
  saveESService,
  fetchESInfo,
  refreshCache,
  fetchPublickKey,
} from '@/services/externalSystemsService';

export default {
  namespace: 'externalSystems',
  state: {
    esInfo: {}, // 外部系统信息
    // 外部系统列表数据
    data: {
      list: [],
      pagination: {},
    },
    // 外部系统关系数据
    esRelationsdata: [],
    // 外部系统服务数据
    esServiceData: {
      list: [],
    },
    // 值集块码
    code: {
      SystemType: [],
      ESRelationType: [],
    },
    // 分配公司信息
    companyData: [],
    // 已经分配的公司集合
    companyTargetKeys: [],
    // 业务实体信息
    unitOptionsData: [],
    // 已经分配的业务实体集合
    ouTargetKeys: [],
    // 接口信息
    interfaceData: [],
    // 已经分配的接口信息集合
    interfaceTargetKeys: [],
    // 值集
    lovCode: {},
  },
  effects: {
    // 值级查询
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const response = yield call(queryMapIdpValue, lovCodes);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            lovCode: list,
          },
        });
      }
    },
    /**
     * 查询外部系统数据
     */
    *fetchSystemList({ payload }, { call, put }) {
      const response = yield call(querySystems, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            data: {
              ...data,
              list: data.content,
              pagination: createPagination(data),
            },
          },
        });
      }
    },
    /**
     * 查询外部系统类型
     */
    *fetchSystemType(_, { call, put }) {
      const response = yield call(queryIdpValue, { code: 'SITF.EXTERNAL_SYSTEM_TYPE' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateCode',
          payload: {
            SystemType: data,
          },
        });
      }
    },
    /**
     * 查询外部系统分配公司数据
     */
    *fetchCompanyData({ payload }, { call, put }) {
      const response = yield call(queryCompany, { organizationId: payload.organizationId });
      const data = getResponse(response);
      const res = yield call(queryCheckedCompany, { relationId: payload.relationId });
      const checkedData = getResponse(res);
      if (checkedData && data) {
        yield put({
          type: 'updateState',
          payload: {
            companyData: data,
            companyTargetKeys: checkedData.map((d) => d.companyId),
          },
        });
      }
    },
    /**
     * 查询外部系统分配业务实体数据
     */
    *fetchUnitOptions({ payload }, { call, put }) {
      const response = yield call(queryUnitOptions, { organizationId: payload.organizationId });
      const data = getResponse(response);
      const res = yield call(queryCheckedUnitOptions, { relationId: payload.relationId });
      const checkedData = getResponse(res);
      if (checkedData && data) {
        yield put({
          type: 'updateState',
          payload: {
            unitOptionsData: data,
            ouTargetKeys: checkedData.map((d) => d.ouId),
          },
        });
      }
    },
    /**
     * 查询外部系统分配接口数据
     */
    *fetchInterface({ payload }, { call, put }) {
      const response = yield call(queryInterface, payload);
      const data = getResponse(response);
      const res = yield call(queryCheckedInterface, payload);
      const checkedData = getResponse(res);
      if (checkedData && data) {
        yield put({
          type: 'updateState',
          payload: {
            interfaceData: data,
            interfaceTargetKeys: checkedData.map((d) => d.interfaceId),
          },
        });
      }
    },
    /**
     * 查询关系类型
     */
    *queryRelationType(_, { call, put }) {
      const response = yield call(queryIdpValue, { code: 'SITF.RELATION_TYPE' });
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateCode',
          payload: {
            ESRelationType: data,
          },
        });
      }
    },
    /**
     * 查询关系数据
     */
    *fetchRelationData({ payload }, { call, put }) {
      const response = yield call(fetchRelationData, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            esRelationsdata: data,
          },
        });
      }
    },
    /**
     * 查询外部系统服务
     */
    *fetchESService({ payload }, { call, put }) {
      const response = yield call(fetchESService, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            esServiceData: {
              ...data,
              list: data.content,
            },
          },
        });
      }
    },
    /**
     * 保存外部系统数据
     */
    *saveSystem({ payload }, { call }) {
      const response = yield call(saveSystems, payload);
      return getResponse(response);
    },
    /**
     * 分配公司
     */
    *addCompany({ payload }, { call }) {
      const response = yield call(addCompany, payload);
      return getResponse(response);
    },
    /**
     * 取消分配公司
     */
    *removeCompany({ payload }, { call }) {
      const response = yield call(removeCompany, payload);
      return getResponse(response);
    },
    /**
     * 分配业务实体
     */
    *addUnitOptions({ payload }, { call }) {
      const response = yield call(addUnitOptions, payload);
      return getResponse(response);
    },
    /**
     * 取消分配业务实体
     */
    *removeUnitOptions({ payload }, { call }) {
      const response = yield call(removeUnitOptions, payload);
      return getResponse(response);
    },
    /**
     * 分配接口
     */
    *addInterface({ payload }, { call }) {
      const response = yield call(addInterface, payload);
      return getResponse(response);
    },
    /**
     * 取消分配接口
     */
    *removeInterface({ payload }, { call }) {
      const response = yield call(removeInterface, payload);
      return getResponse(response);
    },
    /**
     * 保存关系数据
     */
    *saveRelationData({ payload }, { call }) {
      const response = yield call(saveRelationData, payload);
      return getResponse(response);
    },
    /**
     * 保存外部系统服务数据
     */
    *saveESService({ payload }, { call }) {
      const response = yield call(saveESService, payload);
      return getResponse(response);
    },
    /**
     * 外部系统信息
     */
    *fetchESInfo({ payload }, { call, put }) {
      const response = yield call(fetchESInfo, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            esInfo: data,
          },
        });
      }
    },

    /**
     * 获取key
     */
    *fetchPublickKey({ payload }, { call }) {
      const response = yield call(fetchPublickKey, payload);
      return response;
    },

    *refreshCache({ payload }, { call }) {
      const response = yield call(refreshCache, payload);
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
    updateCode(state, { payload }) {
      return {
        ...state,
        code: {
          ...state.code,
          ...payload,
        },
      };
    },
    editRow(state, action) {
      return {
        ...state,
        data: {
          ...state.data,
          list: action.payload,
        },
      };
    },
    addPagination(state) {
      return {
        ...state,
        data: {
          ...state.data,
          size: state.data.list.length >= state.data.size ? state.data.size + 1 : state.data.size,
          totalElements: state.data.totalElements + 1,
        },
      };
    },
    removePagination(state) {
      return {
        ...state,
        data: {
          ...state.data,
          size: state.data.list.length >= state.data.size ? state.data.size - 1 : state.data.size,
          totalElements: state.data.totalElements - 1,
        },
      };
    },
  },
};
