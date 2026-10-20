/*
 * supplierKpiIndicator - 供应商绩效-标准指标定义-平台级model
 * @date: 2018/12/13
 * @author: lijun <jun.li06@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import { isEmpty } from 'lodash';
import { createPagination, getResponse } from 'utils/utils';
import {
  queryList,
  queryListTree,
  queryCode,
  queryFormulaList,
  indicatorsEnable,
  saveIndicatorFmls,
  createIndicator,
  updateIndicator,
} from '@/services/supplierKpiIndicatorService';
import { queryMapIdpValue } from 'services/api';

function assignListTree(collection = [], parentIndicatorName) {
  return collection.map((n) => {
    const item = n;
    if (parentIndicatorName) {
      item.parentIndicatorName = parentIndicatorName;
    }
    if (!isEmpty(item.children)) {
      item.children = assignListTree(item.children, item.indicatorName);
      item.isNoEnableChildren = !item.children.some((o) => o.enabledFlag === 1);
    } else {
      item.isNoChildren = true;
      item.isNoEnableChildren = true;
    }
    return item;
  });
}

export default {
  namespace: 'supplierKpiIndicator',

  state: {
    code: {},
    indicatorTypeCode: [], // 指标类型值集
  },

  effects: {
    // 获得值级
    *batchCode({ payload }, { call, put }) {
      const response = yield call(queryMapIdpValue, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            indicatorTypeCode: list.indicatorTypeMeaning,
          },
        });
      }
    },
    // 查询列表
    *queryList({ params }, { call }) {
      const response = getResponse(yield call(queryList, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *queryListTree({ params }, { call }) {
      const response = getResponse(yield call(queryListTree, params));
      return {
        dataSource: assignListTree(response) || [],
      };
    },
    // 查询值集
    *queryCode({ payload }, { put, call }) {
      const response = yield call(queryCode, payload);
      if (response && !response.failed) {
        yield put({
          type: 'setCodeReducer',
          payload: {
            [payload.lovCode]: response,
          },
        });
      }
    },
    *indicatorsEnable({ enabled, data }, { call }) {
      const response = yield call(indicatorsEnable, enabled, data);
      return response;
    },
    *queryFormulaList({ indicatorId, params }, { call }) {
      const response = getResponse(yield call(queryFormulaList, indicatorId, params));
      return {
        dataSource: (response || {}).content || [],
        pagination: createPagination(response || {}),
      };
    },
    *createIndicator({ data }, { call }) {
      const response = yield call(createIndicator, data);
      return response;
    },
    *updateIndicator({ data }, { call }) {
      const response = yield call(updateIndicator, data);
      return response;
    },
    *saveIndicatorFmls({ indicatorId, data }, { call }) {
      const response = yield call(saveIndicatorFmls, indicatorId, data);
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
    setCodeReducer(state, { payload }) {
      return {
        ...state,
        code: Object.assign(state.code, payload),
      };
    },
  },
};
