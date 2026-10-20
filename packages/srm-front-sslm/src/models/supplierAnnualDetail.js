/**
 * model 年度考评结果详情
 * @date: 2018-12-29
 * @version: 0.0.1
 * @author: lixiaolong <xiaolong.li02@hand-china.com>
 * @copyright: Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse } from 'utils/utils';
import { querySupplierAnnualDetail } from '@/services/supplierAnnualDetailService';

export default {
  namespace: 'supplierAnnualDetail',

  state: {
    detailData: {},
    tableData: [],
    pagination: {},
  },
  effects: {
    /**
     * 请求页面数据
     * @param {!string} params.id - 页面数据的Id
     */
    *fetchDetail({ payload }, { call, put }) {
      const { params } = payload;
      const code = getResponse(yield call(querySupplierAnnualDetail, params));
      if (!isEmpty(code)) {
        yield put({
          type: 'updateState',
          payload: code,
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
