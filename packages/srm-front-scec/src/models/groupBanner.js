import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGroupBannerList,
  fetchCompanyId,
  operatingBanner,
  saveGroupBanner,
  fetchGroupBannerHeader,
  fetchGroupBannerLine,
  saveGoodsLine,
  deleteGoodsLines,
  fetchHistoryRecord,
  fetchBannerSupplier,
} from '@/services/groupBannerService';
import { queryIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map(item => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'groupBanner',
  state: {
    list: [], // 公司Banner表格数据
    pagination: {}, // 公司Banner表格分页
    currentCompany: [], // 当前公司值集
    bannerType: [], // banner类型值集
    bannerStatus: [], // banner状态值集
    header: {}, // 公司banner头
    line: [], // 商品行
    linePagination: {}, // 商品行分页
    sourceType: [], // 商品来源
    goodsLineChange: false, // 商品行改变
    history: [], // 历史纪录
    historyPagination: {}, // 历史纪录分页
    supplier: [], // 采购方值集
  },
  effects: {
    // 获取公司banner数据
    *fetchGroupBannerList({ payload }, { call, put }) {
      const res = yield call(fetchGroupBannerList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            list: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },
    // 获取当前公司值集
    *fetchCompanyId({ payload }, { call }) {
      const res = yield call(fetchCompanyId, payload);
      return getResponse(res);
    },
    // 获取banner类型值集
    *fetchBannerTypeValue(_, { call, put }) {
      const res = yield call(queryIdpValue, 'SCEC.BANNER_TYPE');
      const bannerType = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { bannerType },
      });
    },
    // 获取banner状态
    *fetchBannerStatus(_, { call, put }) {
      const res = yield call(queryIdpValue, 'SCEC.BANNER_STATUS');
      const bannerStatus = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { bannerStatus },
      });
    },
    *fetchBannerSupplier({ payload }, { call, put }) {
      const res = yield call(fetchBannerSupplier, payload);
      const result = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { supplier: result.content },
      });
    },
    // 获取商品来源值集
    *fetchSourceFrom(_, { call, put }) {
      const res = yield call(queryIdpValue, 'SCEC.PRODUCT_SOURCE_FROM');
      const sourceType = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { sourceType },
      });
    },
    // 获取历史记录
    *fetchHistoryRecord({ payload }, { call, put }) {
      const res = yield call(fetchHistoryRecord, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            history: result.content,
            historyPagination: createPagination(result),
          },
        });
      }
    },
    // 上架/下架Banner
    *operatingBanner({ payload }, { call }) {
      const res = yield call(operatingBanner, { ...payload });
      return getResponse(res);
    },
    // 新建公司banner
    *saveGroupBanner({ payload }, { call }) {
      const res = yield call(saveGroupBanner, { ...payload });
      return getResponse(res);
    },
    // 获取公司Banner头信息
    *fetchGroupBannerHeader({ payload }, { call, put }) {
      const res = yield call(fetchGroupBannerHeader, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
      return result;
    },
    // 获取公司banner数据
    *fetchGroupBannerLine({ payload }, { call, put }) {
      const res = yield call(fetchGroupBannerLine, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            line: dealDataState(result.content),
            linePagination: createPagination(result),
          },
        });
      }
    },
    // 新增商品行
    *saveGoodsLine({ payload }, { call }) {
      const result = getResponse(yield call(saveGoodsLine, payload));
      return result;
    },
    // 商品行-批量删除
    *deleteGoodsLines({ payload }, { call }) {
      const result = getResponse(yield call(deleteGoodsLines, payload));
      return result;
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
