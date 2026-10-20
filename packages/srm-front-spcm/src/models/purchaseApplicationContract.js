/**
 * index.js - 协议引用采购申请列表
 * @date: 2019-12-13
 * @author: liliang <liang.li@06@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryList, verified } from '@/services/purchaseContractService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'purchaseApplicationContract',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [],
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
  },
  effects: {
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: response.content,
            pagination: createPagination(response),
          },
        });
        // 查询分页信息
        if (response && response.needCountFlag === 'Y') {
          const pageInfo = getResponse(yield call(queryList, { ...payload, onlyCountFlag: 'Y' }));
          if (pageInfo) {
            yield put({
              type: 'updateState',
              payload: {
                pagination: createPagination(pageInfo),
              },
            });
          }
        }
      }
    },
    // 初始化值集查询
    *fetchEnum(params, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          orderSources: 'SPRM.SRC_PLATFORM',
          executionStatus: 'SPRM.PR_EXECUTION_STATUS',
        })
      );
      if (enumMap) {
        yield put({
          type: 'updateState',
          payload: {
            enumMap,
          },
        });
      }
    },
    // -验证采购申请
    *verified({ payload }, { call }) {
      return getResponse(yield call(verified, payload));
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
