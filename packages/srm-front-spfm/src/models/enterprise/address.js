import { isEmpty } from 'lodash';
import {
  queryProvinceCity,
  queryAddressList,
  saveAddressList,
  deleteAddressList,
} from '@/services/addressService';
import { loadCityData } from '@/services/legalService';
import { getResponse } from 'utils/utils';
// import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'enterpriseAddress',

  state: {
    addressList: [],
    cityDataMap: {}, // 国家和城市数据
  },

  effects: {
    // 查询城市列表
    *queryCity({ payload }, { call }) {
      const cityResponse = getResponse(
        yield call(queryProvinceCity, { ...payload, enabledFlag: 1 })
      );
      if (cityResponse) {
        return cityResponse;
      }
      return [];
    },
    // 查询地址列表
    *queryAddressList({ payload }, { call, put }) {
      const addressResponse = getResponse(yield call(queryAddressList, payload));
      if (addressResponse) {
        yield put({
          type: 'updateState',
          payload: {
            addressList: addressResponse,
          },
        });
      }
      return addressResponse;
    },
    // 新增  , put, select
    *saveAddressList({ payload }, { call }) {
      const addressResponse = getResponse(yield call(saveAddressList, payload));
      // if (!isEmpty(addressResponse)) {
      //   const addressList = yield select(state => state['enterpriseAddress'].addressList);
      //   const newList = addressList.map(_item => {
      //     if (_item.companyAddressId === addressResponse[0].companyAddressId) {
      //       return addressResponse[0];
      //     }
      //     return _item;
      //   });
      //   yield put({
      //     type: 'updateState',
      //     payload: {
      //       addressList: newList,
      //     },
      //   });
      // }
      return addressResponse;
    },

    // 初始化查询地区第一级
    *queryDefaultCity({ payload }, { call }) {
      // const countryRes = getResponse(
      //   yield call(queryUnifyIdpValue, 'HPFM.COUNTRY', { condition: 'CN' })
      // );
      // if (countryRes) {
      //   const { countryId } = countryRes[0];
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.map((n) => {
          const m = {
            ...n,
          };
          m.isLeaf = false;
          return m;
        });
        return newCityResponse;
      }
      return [];
      // }
    },
    // 查询城市列表
    *queryCitys({ payload }, { call }) {
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.map((n) => {
          const m = {
            ...n,
          };
          // 地区级联判断最后一级地区
          m.isLeaf = !!Number(m.isLeaf);
          return m;
        });
        return newCityResponse;
      }
      return [];
    },
    *deleteAddressList({ payload }, { call }) {
      return getResponse(yield call(deleteAddressList, payload));
    },
  },

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
    updateCityMap(state, { payload }) {
      const { countryId, cityResponse } = payload;
      const { cityDataMap } = state;
      cityDataMap[countryId] = cityResponse;
      return {
        ...state,
        cityDataMap,
      };
    },
  },
};
