import { queryMapIdpValue } from 'services/api';
import { getResponse } from 'utils/utils';

export default {
  namespace: 'wideAreaSource',
  state: {
    bestSellingGoods: [], // 值集
    areaCodeList: [],
    capitalTypeList: [],
  },
  effects: {
    *initFilterValuesJson({ payload }, { call, put }) {
      const chargingMethodJson = yield call(queryMapIdpValue, payload);
      if (getResponse(chargingMethodJson)) {
        yield put({
          type: 'updateState',
          payload: {
            bestSellingGoods: chargingMethodJson.bestSellingGoods || [],
            areaCodeList: chargingMethodJson.areaCodeList || [],
            capitalTypeList: chargingMethodJson.capitalTypeList || [],
          },
        });
      }
    },
  },
  reducers: {
    updateState(state, action) {
      return {
        ...state,
        ...action.payload,
      };
    },
  },
};
