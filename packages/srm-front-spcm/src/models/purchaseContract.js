/**
 * index.js - 协议类型管理
 * @date: 2019-05-15
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryList } from '@/services/purchaseContractType';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'purchaseContract',
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
      }
    },
  },
  // -查询值集
  *init(params, { call, put }) {
    const enumMap = getResponse(
      yield call(queryMapIdpValue, {
        erpStatus: 'SODR.ERP_STATUS',
        flag: 'HPFM.FLAG',
        orderSource: 'SPRM.SRC_PLATFORM',
      })
    );
    yield put({
      type: 'updateState',
      payload: {
        enumMap: enumMap || {},
      },
    });
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
