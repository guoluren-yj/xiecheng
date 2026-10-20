/**
 * index.js - 我收到的协议
 * @date: 2019-05-24
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { queryList, queryButtonAuthority } from '../services/supplierContractViewService';

export default {
  namespace: 'supplierContractView',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
  },

  effects: {
    // -查询列表
    *queryList({ payload }, { call, put, select }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        const loading = yield select((state) => state.loading);
        loading.effects['supplierContractView/queryList'] = false;
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            dataSource: response.content,
            pagination: createPagination(response),
            paginationLoading: response?.needCountFlag === 'Y',
          },
        });
      }
      // 异步获取 totalElements
      if (response?.needCountFlag === 'Y') {
        const resForCount = yield call(queryList, { ...payload, onlyCountFlag: 'Y' });
        const pageCount = getResponse(resForCount);
        yield put({
          type: 'updateState',
          payload: {
            paginationLoading: false,
            pagination: createPagination(pageCount),
          },
        });
      }
    },
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          status: 'SPCM.CONTRACT.KIND',
          source: 'SPRM.SRC_PLATFORM',
          flag: 'SPCM.CONTRACT.STATUS',
          orderSign: 'SPCM.PC_SHOW_PO_FLAG',
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
    // 查询下载文本、打印按钮权限
    *queryButtonAuthority({ payload }, { call }) {
      const response = getResponse(yield call(queryButtonAuthority, payload));
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
