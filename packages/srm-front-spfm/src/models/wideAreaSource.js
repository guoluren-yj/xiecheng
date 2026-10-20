import { queryMapIdpValue } from 'services/api';
import { getResponse, createPagination } from 'utils/utils';
import { fetchWideList } from '@/services/wideAreaService';

export default {
  namespace: 'wideAreaSource',
  state: {
    goodsList: [],
    cacheList: [],
    inputMsg: null,
    dataSource: [],
    pagination: {},
    bestSellingGoods: [], // 值集
    areaCodeList: [],
    capitalTypeList: [],
  },
  effects: {
    /**
     * 查询广域寻源列表
     * @param {*} param
     */
    *fetchList({ payload }, { call, put }) {
      const data = yield call(fetchWideList, payload);
      const result = getResponse(data);
      const pagination = createPagination(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            dataSource: result.content,
            pagination,
          },
        });
      }
      return result;
    },

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
