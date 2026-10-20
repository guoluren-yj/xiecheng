import { getStoragePurchase } from '@/utils/utils';
import { getResponse } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  saveCustomService,
  initCustomService,
  applyCustomService,
  fetchBanerListService,
  applyBannerService,
  fetchPermission,
  saveAndApplyGonggao,
  fetchZhuanqu,
  saveAndApplyAZhuanqu,
  fetchBannerSpeed,
  saveProductCartConfig,
  fetchSortList,
  saveSortSearch,
} from '@/services/mallHomeConfigService';
import { queryMapIdpValue } from 'services/api';

const { role = 'purchase', purchase = {} } = getStoragePurchase() || {};
export default {
  namespace: 'mallHome',
  state: {
    mallType: '', // 会员购则为 sigl
    currentRole: role,
    purchase,
    isSeconed: undefined,
    customBarList: [], // 企业购 自定义栏
    bannerList: [], // 企业购 banner
    siglcustomBarList: [], // 会员购 自定义栏
    siglbannerList: [], // 会员购 banner
    lovBatch: {},
    gonggaoList: [], // 公告列表
    siglgonggaoList: [], // 会员购公告列表
    bannerSpeedObj: {},
    zhuanquList: [], // 企业购 专区
    siglzhuanquList: [], // 会员购 专区
    sortData: {}, // 排序数据
  },
  effects: {
    *initQueryIdp(_, { call, put }) {
      const lovBatchRes = yield call(queryMapIdpValue, {
        bannerType: 'SMAL.PAGE_NEW_BANNER_TYPE',
        enabledFlag: 'SMAL.PRODUCT_GROUP_ENABLED_FLAG',
        productCardList: 'SMAL.PRODUCT_CARD_ELEMENT_TYPE', // 商品卡片元素
        searchType: 'SMAL.PRODUCT_SEARCH_TYPE',
        opreateList: 'SMAL.PRODUCT_CARD_OPERATE_TYPE', // 列表页的操作配置
        menuList: 'SMAL.QUICK_LINK',
        sortMenu: 'SMAL.MY_MENU_CONFIG', // 我的商城排序
      });
      const lovBatch = getResponse(lovBatchRes);
      if (lovBatch) {
        yield put({
          type: 'updateState',
          payload: {
            lovBatch,
          },
        });
      }
    },
    *saveAndPreview({ payload }, { call }) {
      const res = yield call(saveCustomService, payload);
      const response = getResponse(res);
      return response;
    },
    *initList({ payload }, { call }) {
      const res = yield call(initCustomService, payload);
      const response = getResponse(res);

      return response;
    },
    *fetchBanner({ payload }, { call }) {
      const res = yield call(fetchBanerListService, payload);
      const response = getResponse(res);
      return response;
    },
    *saveAndApply({ payload }, { call }) {
      const res = yield call(applyCustomService, payload);
      const response = getResponse(res);
      return response;
    },
    *saveAndApplyBanner({ payload }, { call }) {
      const res = yield call(applyBannerService, payload);
      const response = getResponse(res);
      return response;
    },
    *fetchPermission({ payload }, { call, put }) {
      const response = yield call(fetchPermission, payload);
      const result = getResponse(response);
      const data = {
        enterprisePermission: result?.enterprisePermission,
        memberPermission: result?.memberPermission,
      };
      if (result?.enterprisePermission && result?.memberPermission) {
        // todo 会员购企业购
      } else if (result?.enterprisePermission) {
        // todo 仅企业购
        data.mallType = '';
      } else if (result?.memberPermission) {
        // 仅会员购
        data.mallType = 'sigl';
        data.onlySigl = 1;
      }
      yield put({
        type: 'updateState',
        payload: data,
      });
      return result;
    },
    *saveAndApplyGonggao({ payload }, { call }) {
      const response = yield call(saveAndApplyGonggao, payload);
      const result = getResponse(response);
      return result;
    },
    *fetchZhuanqu({ payload }, { call, put }) {
      const response = yield call(fetchZhuanqu, payload);
      const result = getResponse(response);
      // 同一个接口区分企业购会员购数据
      const payloadData = {};
      payloadData[`${payload.channel ? 'sigl' : ''}zhuanquList`] = result?.content || [];
      yield put({
        type: 'updateState',
        payload: payloadData,
      });
      return result;
    },
    *saveAndApplyZhuanqu({ payload }, { call }) {
      const response = yield call(saveAndApplyAZhuanqu, payload);
      const result = getResponse(response);
      return result;
    },
    *fetchBannerSpeed({ payload }, { call, put }) {
      const response = yield call(fetchBannerSpeed, payload);
      const result = getResponse(response);
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: { bannerSpeedObj: result?.[0] },
        });
      }
      return result;
    },
    *saveProductCartConfig({ payload }, { call }) {
      const response = yield call(saveProductCartConfig, payload);
      const result = getResponse(response);
      return result;
    },
    *fetchSortList({ payload }, { call, put }) {
      const response = yield call(fetchSortList, payload);
      const result = getResponse(response);
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: { sortData: result },
        });
      }
      return result;
    },
    *saveSortSearch({ payload }, { call }) {
      const response = yield call(saveSortSearch, payload);
      const result = getResponse(response);
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
