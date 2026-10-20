/**
 * riskMonitoring - 企业风险监控
 * @date: 2019-07-02
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  queryMonitoring,
  querySupplier,
  queryGroups,
  saveGroups,
  deleteGroups,
  queryRiskClassify,
  saveRiskClassify,
  enabledRiskClassify,
  assignRiskDim,
  cancelMonitoring,
  queryRiskDimAll,
  queryRiskDimChecked,
  queryEditGroup,
  assignGroup,
  createMonitor,
  queryAllRisk,
  queryEnterpriseRisk,
  queryChildAccount,
  asignChildAccount,
  unAsignChildAccount,
  queryPermissionGroups,
  checkNameRepeat,
} from '@/services/riskMonitoringService';

export default {
  namespace: 'riskMonitoring',
  state: {
    code: {}, // 值集
    monitoringList: [], // 企业监控 Table
    monitoringPagination: {}, // 企业监控 Table分页
    supplierList: [], // 非监控企业供应商 Table
    supplierPagination: {}, // 非监控企业供应商 Table分页
    groupsList: [], // 分组列表
    riskClassifyList: [], // 风险分类列表
    riskClassifyPagination: {}, // 风险分类分页列表
    riskScanList: [], // 风险事件维度列表集合
    riskScanTargetKeys: [], // 已分配维度集合
    groupData: [], // 所有分组集合
    groupTargetKeys: [], // 已分配分组集合
    permissionGroupsList: [], // 带权限控制的分组列表
  },
  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: { code },
        });
      }
    },
    // 查询全量风险监控
    *queryMonitoring({ payload }, { put, call }) {
      const response = getResponse(yield call(queryMonitoring, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            monitoringList: response.content,
            monitoringPagination: createPagination(response),
          },
        });
      }
    },
    // 查询选择供应商
    *querySupplier({ payload }, { put, call }) {
      const response = getResponse(yield call(querySupplier, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            supplierList: response.content,
            supplierPagination: createPagination(response),
          },
        });
      }
    },
    // 查询分组
    *queryGroups({ payload }, { put, call }) {
      const response = getResponse(yield call(queryGroups, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            groupsList: response,
          },
        });
      }
    },
    // 保存分组
    *saveGroups({ payload }, { call }) {
      const response = getResponse(yield call(saveGroups, payload));
      return response;
    },
    // 删除分组
    *deleteGroups({ payload }, { call }) {
      const response = getResponse(yield call(deleteGroups, payload));
      return response;
    },
    // 查询风险分类
    *queryRiskClassify({ payload }, { put, call }) {
      const response = getResponse(yield call(queryRiskClassify, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            riskClassifyList: response.content,
            riskClassifyPagination: createPagination(response),
          },
        });
      }
    },
    // 保存风险分类
    *saveRiskClassify({ payload }, { call }) {
      const response = getResponse(yield call(saveRiskClassify, payload));
      return response;
    },
    // 启用风险分类
    *enabledRiskClassify({ payload }, { call }) {
      const response = getResponse(yield call(enabledRiskClassify, payload));
      return response;
    },
    // 风险分类维度分配
    *assignRiskDim({ payload }, { call }) {
      const response = getResponse(yield call(assignRiskDim, payload));
      return response;
    },
    // 取消监控
    *cancelMonitoring({ payload }, { call }) {
      const response = getResponse(yield call(cancelMonitoring, payload));
      return response;
    },
    // 查询风险事件维度
    *queryRiskDim({ payload }, { put, call }) {
      const riskScanList = getResponse(yield call(queryRiskDimAll, payload));
      const response = getResponse(yield call(queryRiskDimChecked, payload));
      const riskScanTargetKeys = response.map((n) => n.riskDimId);
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            riskScanList,
            riskScanTargetKeys,
          },
        });
      }
      return response;
    },
    // 查询所有分组
    *queryEditGroup({ payload }, { put, call }) {
      const groupData = getResponse(yield call(queryEditGroup, { queryType: 'LEFT' }));
      const res = getResponse(yield call(queryEditGroup, payload));
      if (groupData && res) {
        const groupTargetKeys = res.map((n) => n.monitorGroupId);
        yield put({
          type: 'updateState',
          payload: {
            groupData,
            groupTargetKeys,
          },
        });
      }
    },
    // 分配分组
    *assignGroup({ payload }, { call }) {
      const res = getResponse(yield call(assignGroup, payload));
      return res;
    },
    // 创建风险监控
    *createMonitor({ payload }, { call }) {
      const response = getResponse(yield call(createMonitor, payload));
      return response;
    },
    // 查询风险分析Url
    *queryAllRisk({ payload }, { call }) {
      const response = yield call(queryAllRisk, payload);
      return response;
    },
    // 查询风险动态监控Url
    *queryEnterpriseRisk({ payload }, { call }) {
      const response = yield call(queryEnterpriseRisk, payload);
      return response;
    },
    // 查询子账户
    *queryChildAccount({ payload }, { call }) {
      const response = getResponse(yield call(queryChildAccount, payload));
      return response;
    },
    // 分配子账户
    *asignChildAccount({ payload }, { call }) {
      const response = getResponse(yield call(asignChildAccount, payload));
      return response;
    },
    // 取消分配子账户
    *unAsignChildAccount({ payload }, { call }) {
      const response = getResponse(yield call(unAsignChildAccount, payload));
      return response;
    },
    // 取消分配子账户
    *queryPermissionGroups({ payload }, { call, put }) {
      const response = getResponse(yield call(queryPermissionGroups, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            permissionGroupsList: response,
          },
        });
      }
    },
    // 校验非平台企业是否重复
    *checkNameRepeat({ payload }, { call }) {
      const response = getResponse(yield call(checkNameRepeat, payload));
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
