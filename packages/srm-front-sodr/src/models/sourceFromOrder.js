/**
 *  SourceFromOrder- 引用寻源结果
 * @date: 2019-12-23
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import { fetchList, createOrder, showLadderInquiry } from '@/services/sourceFromOrderService';

export default {
  namespace: 'sourceFromOrder',
  state: {
    collapse: true, // 是否收起查询
  },
  effects: {
    // 查询初始数据
    // *fetchToleranceRule({ payload }, { call, put }) {
    //   const response = yield call(fetchToleranceRule, payload);
    //   const data = getResponse(response);
    //   if (data) {
    //     yield put({
    //       type: 'updateState',
    //       payload: { toleranceRuleData: data },
    //     });
    //   }
    // },
    // // 新建或编辑数据
    // *saveToleranceRule({ payload }, { call }) {
    //   const response = yield call(saveToleranceRule, payload);
    //   return getResponse(response);
    // },
    //  查询列表数据
    *fetchList({ payload }, { call }) {
      const result = getResponse(yield call(fetchList, payload));
      return result;
    },

    *createOrder({ payload }, { call }) {
      const result = getResponse(yield call(createOrder, payload));
      return result;
    },

    // 批量查询值级
    *fetchLovCode(_, { call, put }) {
      const enumMap = getResponse(
        yield call(queryMapIdpValue, {
          templates: 'SODR.PO_PRINT_TYPE',
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
    // 批量查询值级
    *showLadderInquiry({ payload }, { call }) {
      const result = getResponse(yield call(showLadderInquiry, payload));
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
