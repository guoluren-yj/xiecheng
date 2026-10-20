/**
 * mallAgreementApprove - 商城协议审批
 * @date: 2020-05-26
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */

import { getResponse, createPagination } from 'utils/utils';
import {
  fetchAgreementList,
  // fetchDetailLine,
  agreementApprove,
  agreementReject,
  agreementPublish,
  fetchOperate,
} from '@/services/mallAgreementApproveService';
import { queryMapIdpValue } from 'services/api';

export default {
  namespace: 'mallAgreementApprove',
  state: {
    agreementApproveList: [],
    agreementPublishList: [],
    approvePagination: {},
    publishPagination: {},
    agreementStatus: [],
    materialType: [],
    agreementType: [],
    paymentType: [],
    sourceFrom: [],
    agreementPricingMethods: [],
    agreementPricingTypes: [],
    approveFormData: {},
    publishFormData: {},
    approveLineList: [],
    publishLineList: [],
    approveLinePagination: {},
    publishLinePaginaton: {},
    operateRecord: [],
    operatePagination: {},
    attachmentUUId: '', // 附件的uuid
  },
  effects: {
    *queryMapIdpValue(_, { call, put }) {
      const res = yield call(queryMapIdpValue, {
        agreementStatus: 'SMAL.AGREEMENT.STATUS',
        materialType: 'SMAL.MATERIAL_TYPE',
        agreementType: 'SMAL.PUR_AGREEMENT_TYPE',
        paymentType: 'SMAL.PAYMENT_TYPE',
        sourceFrom: 'SMAL.AGREEMENT_FROM',
        agreementPricingMethods: 'SMAL.AGREEMENT_PRICING_METHOD',
        agreementPricingTypes: 'SMAL.AGREEMENT_PRICING_TYPE',
      });
      const result = getResponse(res);
      if (result) {
        const {
          agreementStatus,
          materialType,
          agreementType,
          paymentType,
          sourceFrom,
          agreementPricingMethods,
          agreementPricingTypes,
        } = result;
        yield put({
          type: 'updateState',
          payload: {
            agreementStatus,
            materialType,
            agreementType,
            paymentType,
            sourceFrom,
            agreementPricingMethods,
            agreementPricingTypes,
          },
        });
      }
    },

    *fetchAgreementList({ payload }, { call, put }) {
      const { isApprove, ...other } = payload;
      const res = yield call(fetchAgreementList, other);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            [isApprove ? 'agreementApproveList' : 'agreementPublishList']: result.content,
            [isApprove ? 'approvePagination' : 'publishPagination']: createPagination(result),
          },
        });
      }
    },

    *fetchDetailHeader({ payload }, { call }) {
      const res = getResponse(yield call(fetchAgreementList, payload));
      return res;
    },

    *agreementApprove({ payload }, { call }) {
      const res = getResponse(yield call(agreementApprove, payload));
      return res;
    },

    *agreementReject({ payload }, { call }) {
      const res = getResponse(yield call(agreementReject, payload));
      return res;
    },

    *agreementPublish({ payload }, { call }) {
      const res = getResponse(yield call(agreementPublish, payload));
      return res;
    },

    *fetchOperate({ payload }, { call }) {
      const res = getResponse(yield call(fetchOperate, payload));
      return res;
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
