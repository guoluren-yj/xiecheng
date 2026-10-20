/**
 * index.js - 协议审批
 * @date: 2019-05-20
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2018, Hand
 */
import { createPagination, getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'hzero-front/lib/services/api';
import { queryList, approveList, rejectApprovalList } from '@/services/contractApprovalService';

export default {
  namespace: 'contractApproval',
  state: {
    enumMap: {}, // 列表值集
    detailEnumMap: {}, // 详情值集
    dataSource: [], // 列表数据
    pagination: {},
    operationRecordPagination: {},
    operationRecordList: [],
  },

  effects: {
    // -查询列表值集
    *init(params, { put, call }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          kind: 'SPCM.CONTRACT.KIND',
          status: 'SPRM.PR_STATUS',
          source: 'SPRM.SRC_PLATFORM',
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
    // 查询详情值集
    *fetchDetailEnum(params, { put, call }) {
      const detailEnumMap = getResponse(
        yield call(queryMapIdpValue, {
          invoiceMethod: 'SPRM.PR_INVOICE_METHOD',
          invoiceType: 'SPRM.PR_INVOICE_TYPE',
          invoiceTitleType: 'SPRM.PR_INVOICE_TITLE_TYPE',
          invoiceDetailType: 'SPRM.PR_INVOICE_DETAIL_TYPE',
          paymentMethod: 'SCEC.COMPANYP_PAYMENT',
        })
      );
      if (detailEnumMap) {
        yield put({
          type: 'updateState',
          payload: {
            detailEnumMap,
          },
        });
      }
    },
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
    // -订单审批通过
    *approveList({ payload }, { call }) {
      const result = getResponse(yield call(approveList, payload));
      return result;
    },
    // -订单审拒绝
    *rejectApprovalList({ payload }, { call }) {
      const result = getResponse(yield call(rejectApprovalList, payload));
      return result;
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
