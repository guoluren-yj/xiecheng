import { isEmpty } from 'lodash';
import {
  // initValueList,
  queryCompanyBasic,
  // queryProvinceCity,
  saveLegalInfo,
  validateUnifiedSocialCode,
  validateCompanyName,
  saveOrgLegalInfo,
  queryCompanyName,
  fetchCompanyInfoFromOcr,
  loadCityData,
} from '@/services/legalService';
import { getResponse } from 'utils/utils';
// import { fetchCountryList } from 'hzero-front-hpfm/lib/services/countryService';
// import { queryUnifyIdpValue } from 'hzero-front/lib/services/api';

export default {
  namespace: 'enterpriseLegal',

  state: {
    legalInfo: {},
    legalInfoOcr: {},
    companyType: [],
    taxpayerType: [],
    countryList: [],
    cityList: [],
    companyName: '', // 查询当前用户注册的企业名称
  },

  effects: {
    *init({ payload }, { call, put }) {
      // const vl = yield call(initValueList, payload);
      const legalInfo = yield call(queryCompanyBasic, payload);
      // const countryList = yield call(fetchCountryList, payload);

      yield put({
        type: 'updateState',
        payload: {
          // companyType: vl.companyType || [],
          // taxpayerType: vl.taxpayerType || [],
          // countryList: countryList.content || [],
          legalInfo,
        },
      });
    },

    *queryCompanyBasic({ payload }, { call, put }) {
      const legalInfo = getResponse(yield call(queryCompanyBasic, payload));
      yield put({
        type: 'updateState',
        payload: {
          legalInfo,
        },
      });
      return legalInfo;
    },

    // 初始化查询地区第一级
    *queryDefaultCity({ payload }, { call }) {
      // const countryRes = getResponse(
      //   yield call(queryUnifyIdpValue, 'HPFM.COUNTRY', { condition: 'CN' })
      // );
      // if (countryRes) {
      // const { countryId } = countryRes[0];
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
    *queryCity({ payload }, { call }) {
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

    // *queryProvinceCity({ payload }, { call, put }) {
    //   const cityList = yield call(queryProvinceCity, payload);
    //   const safeCityList = getResponse(cityList);
    //   if (safeCityList) {
    //     yield put({
    //       type: 'updateState',
    //       payload: {
    //         cityList,
    //       },
    //     });
    //   }
    // },

    *queryCompanyName({ payload }, { call, put }) {
      const { companyName } = yield getResponse(call(queryCompanyName, payload));
      yield put({
        type: 'updateState',
        payload: {
          companyName,
        },
      });
    },

    // 从百度OCR接口获取企业信息
    *fetchCompanyInfoFromOcr({ payload }, { call, put }) {
      const response = yield call(fetchCompanyInfoFromOcr, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            legalInfoOcr: data,
          },
        });
      }
    },

    *saveLegalInfo({ payload }, { call }) {
      const response = yield call(saveLegalInfo, payload);
      return getResponse(response);
    },

    *saveOrgLegalInfo({ payload }, { call }) {
      const response = yield call(saveOrgLegalInfo, payload);
      return getResponse(response);
    },

    *validateUnifiedSocialCode({ payload }, { call }) {
      const response = yield call(validateUnifiedSocialCode, payload);
      return getResponse(response);
    },

    *validateCompanyName({ payload }, { call }) {
      const response = yield call(validateCompanyName, payload);
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
