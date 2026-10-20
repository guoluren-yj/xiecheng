/**
 * ecDeliveryAddress -收单地址 model
 * @date: 2019-1-25
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchEcAddress,
  addEcAddress,
  updateEcAddress,
  loadCityData,
} from '@/services/ecAddressService';
import { queryUnifyIdpValue } from 'services/api';

const addressType = { addressType: 'INVOICE' };

export default {
  namespace: 'ecAcquirerAddress',
  state: {
    list: {},
    pagination: {},
  },
  effects: {
    // 初始化查询地区第一级
    *queryDefaultCity(_, { call }) {
      const countryRes = getResponse(
        yield call(queryUnifyIdpValue, 'HPFM.COUNTRY', { condition: 'CN' })
      );
      if (countryRes) {
        const { countryId } = countryRes[0];
        const cityResponse = getResponse(yield call(loadCityData, { countryId }));
        if (!isEmpty(cityResponse)) {
          const newCityResponse = cityResponse.map(n => {
            const m = {
              ...n,
            };
            m.isLeaf = false;
            return m;
          });
          return newCityResponse;
        }
        return [];
      }
    },

    // 查询城市列表
    *queryCity({ payload }, { call }) {
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.map(n => {
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

    // 查询收单地址
    *fetchEcAcquirerAddress({ payload }, { call, put }) {
      const response = yield call(fetchEcAddress, { ...addressType, ...payload });
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            list,
            pagination: createPagination(list),
          },
        });
      }
    },

    // 新增收单地址
    *addEcAcquirerAddress({ payload }, { call }) {
      const response = yield call(addEcAddress, { ...addressType, ...payload });
      return getResponse(response);
    },

    // 编辑收单地址
    *updateEcAcquirerAddress({ payload }, { call }) {
      const response = yield call(updateEcAddress, { ...addressType, ...payload });
      return getResponse(response);
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
