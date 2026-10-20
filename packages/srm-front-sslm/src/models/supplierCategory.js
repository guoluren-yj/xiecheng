/**
 * supplierCategory.js - 供应商分类定义 model
 * @date: 2018-10-29
 * @author: geekrainy <chao.zheng02@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */

import { isArray, isEmpty } from 'lodash';

import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import {
  querySupplierCategory,
  saveSupplierCategory,
  disableSupplierCategory,
  enableSupplierCategory,
  checkCategoryCode,
} from '@/services/supplierCategoryService';
import { fetchLifeCyclesStages } from '@/services/supplierQueryService';
import { queryMapIdpValue } from 'services/api';

const organizationId = getCurrentOrganizationId();

export default {
  namespace: 'supplierCategory',

  state: {
    lifeCycleStages: [], // 供应商生命周期
    supplierCategoryList: [], // 供应商分类树数据
    supplierCategoryKeys: [], // 所有分类的 key 列表
    approveMethodList: [], // 审批方式值集
    labelConfigList: [], // 标签层级配置值集
  },

  effects: {
    // 初始化值集
    *init({ payload }, { call, put }) {
      const res = getResponse(yield call(queryMapIdpValue, payload));
      if (res) {
        const { approveMethodList, labelConfigList } = res;
        yield put({
          type: 'updateState',
          payload: { approveMethodList, labelConfigList },
        });
      }
    },
    // 查询供应商分类树
    *querySupplierCategory({ payload }, { call, put }) {
      const res = yield call(querySupplierCategory, payload);
      const supplierCategoryList = getResponse(res);
      const supplierCategoryKeys = [];
      const flatKeys = (supplierCategory) => {
        if (isArray(supplierCategory.children) && !isEmpty(supplierCategory.children)) {
          supplierCategoryKeys.push(supplierCategory.categoryId);
          supplierCategory.children.forEach((item) => flatKeys(item));
        } else {
          supplierCategoryKeys.push(supplierCategory.categoryId);
        }
      };
      supplierCategoryList.forEach((item) => {
        flatKeys(item);
      });
      function formatData(dataItems) {
        const dataItem = dataItems;
        const { lifeCycleStageDTOS, children } = dataItem;
        if (Array.isArray(lifeCycleStageDTOS) && lifeCycleStageDTOS.length) {
          lifeCycleStageDTOS.forEach((item) => {
            if (item.stageCode === null) {
              dataItem.ALL = item;
            } else {
              dataItem[item.stageCode] = item;
            }
          });
        }
        if (Array.isArray(children) && children.length) {
          dataItem.children = children.map((item) => formatData(item));
        }
        return dataItem;
      }
      const result = supplierCategoryList.map((item) => formatData(item));

      yield put({
        type: 'updateState',
        payload: {
          supplierCategoryList: result,
          supplierCategoryKeys,
        },
      });
    },
    // 新增或修改供应商分类节点
    *saveSupplierCategory({ payload }, { call }) {
      const res = yield call(saveSupplierCategory, payload);
      return getResponse(res);
    },
    // 校验供应商分类编码
    *checkCategoryCode({ payload }, { call }) {
      const res = yield call(checkCategoryCode, payload);
      return res;
    },
    // 禁用当前节点及其子节点
    *disableSupplierCategory({ payload }, { call }) {
      const res = yield call(disableSupplierCategory, payload);
      return getResponse(res);
    },
    // 启用当前节点及其子节点
    *enableSupplierCategory({ payload }, { call }) {
      const res = yield call(enableSupplierCategory, payload);
      return getResponse(res);
    },

    *fetchLifeCycleStages(_, { call, put }) {
      const res = yield call(fetchLifeCyclesStages, { organizationId });
      const lifeCycleStages = getResponse(res);
      if (lifeCycleStages && lifeCycleStages.lifeCycleStageLanes) {
        const { lifeCycleStageLanes } = lifeCycleStages;
        yield put({
          type: 'updateState',
          payload: {
            lifeCycleStages: lifeCycleStageLanes,
          },
        });
        return lifeCycleStageLanes;
      }
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
