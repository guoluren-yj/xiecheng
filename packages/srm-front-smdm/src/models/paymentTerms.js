/**
 * paymentTerms - 付款条款定义 - model
 * @date: 2018-7-11
 * @author: lokya <kan.li01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryTerms, addTerms, queryAll } from '@/services/paymentTermsService';

export default {
  namespace: 'paymentTerms',
  state: {
    data: {
      list: [],
      pagination: {},
    },
    allData: {},
    termData: [], // 明细列表
    termPagination: {}, // 明细分页参数
    tenantId: null,
  },
  effects: {
    *fetchTermList({ payload }, { call, put }) {
      const response = yield call(queryTerms, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'queryTerms',
          payload: data,
        });
      }
    },
    *addTerms({ payload }, { call }) {
      const response = yield call(addTerms, payload);
      return getResponse(response);
    },
    *fetchAllData({ payload }, { call, put }) {
      const response = yield call(queryAll, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            allData: data,
            termData: data.paymentTermDtlDTOList.content,
            termPagination: createPagination(data.paymentTermDtlDTOList),
          },
        });
      }
    },
  },
  reducers: {
    queryTerms(state, action) {
      return {
        ...state,
        data: {
          ...action.payload,
          list: action.payload.content,
          pagination: createPagination(action.payload),
        },
      };
    },
    // addNewData(state, action) {
    //   return {
    //     ...state,
    //     allData: {
    //       ...state.allData,
    //       line: {
    //         ...state.allData.line,
    //         size:
    //           state.allData &&
    //           state.allData.line &&
    //           state.allData.line.list &&
    //           state.allData.line.list.length >= state.allData.line.size
    //             ? state.allData.line.size + 1
    //             : state.allData.line.size,
    //         totalElements: state.allData.line.totalElements
    //           ? state.allData.line.totalElements + 1
    //           : 0,
    //         list: [...state.allData.line.list, action.payload],
    //       },
    //     },
    //   };
    // },
    editRow(state, action) {
      return {
        ...state,
        allData: {
          ...state.allData,
          line: {
            ...state.allData.line,
            list: action.payload.list,
          },
        },
      };
    },
    setTenantId(state, action) {
      return {
        ...state,
        tenantId: action.payload,
      };
    },
    removeNewAdd(state, action) {
      return {
        ...state,
        allData: {
          ...state.allData,
          line: {
            ...state.allData.line,
            size:
              state.allData.line &&
              state.allData.line.list &&
              state.allData.line.list.length >= state.allData.line.size
                ? state.allData.line.size - 1
                : state.allData.line.size,
            totalElements: state.allData.line.totalElements - 1,
            list: action.payload,
          },
        },
      };
    },
    // queryAll(state, action) {
    //   return {
    //     ...state,
    //     allData: {
    //       head: action.payload,
    //       line: {
    //         ...action.payload.paymentTermDtlDTOList,
    //         list: action.payload.paymentTermDtlDTOList.content,
    //       },
    //     },
    //   };
    // },
    clear(state) {
      return {
        ...state,
        allData: {
          // head: {},
          // line: {
          //   list: [],
          // },
        },
      };
    },
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
