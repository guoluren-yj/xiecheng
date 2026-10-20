/**
 * model 部门分配员工
 * @date: 2018-6-20
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

import { getResponse } from 'utils/utils';
import { isNumber } from 'lodash';
import {
  renderTreeData,
  search,
  searchAll,
  saveAdd,
  saveEdit,
  forbindLine,
  enabledLine,
  gainCodeAndName,
  queryCostCenterData,
} from '../services/departmentService';

export default {
  namespace: 'department',

  state: {
    pathMap: {},
    renderTree: [],
    addData: {},
    companyCode: '',
    companyName: '',
    tenantId: '',
    expandedRowKeys: [],
    costCenterData: {},
  },
  effects: {
    // 获取部门信息
    *fetchDepartmentInfo({ payload }, { call, put }) {
      const result = getResponse(yield call(gainCodeAndName, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            companyCode: result.unitCode,
            companyName: result.unitName,
          },
        });
      }
    },
    // 获取部门数据列表(Tree)
    *searchDepartmentData({ payload }, { call, put }) {
      const {
        costId,
        tenantId,
        unitCompanyId,
        enableBudgetFlag,
        unitName,
        unitCode,
        expandFlag,
        customizeUnitCode,
        sort,
        ...others
      } = payload;
      let result = {};
      if (unitCode || unitName || costId || isNumber(enableBudgetFlag)) {
        result = yield call(search, {
          costId,
          tenantId,
          unitCompanyId,
          unitName,
          unitCode,
          enableBudgetFlag,
          customizeUnitCode,
          sort,
        });
      } else {
        result = yield call(searchAll, { tenantId, unitCompanyId, customizeUnitCode, sort });
      }
      result = getResponse(result);

      const { renderTree, pathMap = {} } = renderTreeData(result, {});
      yield put({
        type: 'updateState',
        payload: {
          renderTree,
          pathMap,
          ...others,
        },
      });
    },
    // 添加部门信息(批量)
    *saveAddData({ payload }, { call }) {
      const result = yield call(saveAdd, payload);
      return getResponse(result);
    },
    // 更新部门信息(单条)
    *saveEditData({ payload }, { call }) {
      const result = yield call(saveEdit, payload);
      return getResponse(result);
    },
    // 禁用部门信息
    *forbidLine({ payload }, { call }) {
      const result = yield call(forbindLine, payload);
      return getResponse(result);
    },
    // 启用部门信息
    *enabledLine({ payload }, { call }) {
      const result = yield call(enabledLine, payload);
      return getResponse(result);
    },
    // 获取成本中心信息
    *fetchCostCenterData({ payload }, { call, put }) {
      const result = getResponse(yield call(queryCostCenterData, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            costCenterData: result,
          },
        });
      }
    },
  },
  reducers: {
    // 更新state
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
