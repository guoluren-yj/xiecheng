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
  loadNationData,
} from '@/services/ecAddressService';
import { queryUnifyIdpValue } from 'services/api';

const addressType = { addressType: 'INVOICE' };

export default {
  namespace: 'smallEcAcquirerAddress',
  state: {
    list: {}, // 地址
    pagination: {}, //
    countList: {}, // count
  },
  effects: {
    // 初始化查询地区第一级
    *queryDefaultCity({ payload }, { call }) {
      const countryRes = getResponse(
        yield call(queryUnifyIdpValue, 'HPFM.COUNTRY', { condition: 'CN' })
      );
      if (countryRes) {
        const { countryId } = countryRes[0];
        const cityResponse = getResponse(yield call(loadCityData, { countryId, ...payload }));
        if (!isEmpty(cityResponse)) {
          const newCityResponse = cityResponse.content.map((n) => {
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

    *queryDefaultNation({ payload }, { call }) {
      const nationRes = getResponse(yield call(loadNationData, { ...payload }));
      const { content } = nationRes;
      const newNationRes = content.map((val) => ({
        countryId: val.countryId,
        countryName: val.countryName,
        regionName: val.countryName,
        regionId: val.countryId,
        regionCode: val.countryId,
        _token: val._token,
        leaf: false,
        isLeaf: false,
      }));
      return newNationRes;
    },

    // 查询城市列表
    *queryCity({ payload }, { call }) {
      const cityResponse = getResponse(yield call(loadCityData, { ...payload }));
      if (!isEmpty(cityResponse)) {
        const newCityResponse = cityResponse.content.map((n) => {
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
      const payloadData = {
        list,
        pagination: createPagination(list),
      };
      if (list) {
        if (payload.belongType === 0) {
          payloadData.pagination = createPagination(list.allInvoiceAddress);
          if (payload.first) {
            payloadData.countList = {
              invoiceAllNum: list.invoiceAllNum,
              invoiceCompanyNum: list.invoiceCompanyNum,
              invoicePersonalNum: list.invoicePersonalNum,
            };
          }
        }

        yield put({
          type: 'updateState',
          payload: payloadData,
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
