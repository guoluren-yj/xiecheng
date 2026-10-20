/**
 * index.js - 质量报表
 * @date: 2020-01-07
 * @author: lc <chao.li03@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { queryList, queryInspectionLotList } from '@/services/qualityReportService';

export default {
  namespace: 'qualityReport',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
    listQuery: {},
    inspectionLotList: [], // 批次检验明细数据
    inspectionLotPaginaition: {}, // 批次检验明细数据分页参数
  },

  effects: {
    // -查询列表
    *queryList({ payload }, { call, put }) {
      const { page, ...otherParams } = payload;
      const response = getResponse(yield call(queryList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            listQuery: otherParams,
            dataSource: response.content.map((n) => ({
              ...n,
              _status: 'update',
            })),
            pagination: createPagination(response),
          },
        });
      }
    },
    // -获取检验批次明细数据
    *queryInspectionLotList({ payload }, { call, put }) {
      const response = getResponse(yield call(queryInspectionLotList, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            inspectionLotList: response.content,
            inspectionLotPaginaition: createPagination(response),
          },
        });
      }
    },
    // -查询列表值集
    *fetchLov(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          compromise: 'SQAM.COMING_COMPROMISE',
          goods: 'SQAM.COMMING_RETURN_GOODS',
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
