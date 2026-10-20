/**
 * CompanyBanner - 公司Banner管理
 * @date: 2019-2-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchCompanyBannerList,
  fetchCurrentCompanyValue,
  operatingBanner,
  enableAction,
  saveCompanyBanner,
  fetchCompanyBannerHeader,
  fetchCompanyBannerLine,
  saveGoodsLine,
  deleteGoodsLines,
  fetchHistoryRecord,
  fetchModalList,
} from '@/services/companyBannerService';
import { fetchTypeTree } from '@/services/groupCustomBarService';
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
  namespace: 'smallCompanyBanner',
  state: {
    list: [], // 公司Banner表格数据
    pagination: {}, // 公司Banner表格分页
    currentCompany: {}, // 当前公司
    bannerType: [], // banner类型值集
    bannerStatus: [], // banner状态值集
    header: {}, // 公司banner头
    line: [], // 商品行
    linePagination: {}, // 商品行分页
    sourceType: [], // 商品来源
    goodsLineChange: false, // 商品行改变
    history: [], // 历史纪录
    historyPagination: {}, // 历史纪录分页
    modalList: [], // 商品列表数据
    modalPagination: {}, // 商品列表分页
    treeList: [],
  },
  effects: {
    // 获取公司banner数据
    *fetchCompanyBannerList({ payload }, { call, put }) {
      const res = yield call(fetchCompanyBannerList, payload);
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
    *fetchCurrentCompanyValue({ payload }, { call, put }) {
      // const { page, form, ...otherPayload } = payload;
      const res = yield call(fetchCurrentCompanyValue, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            currentCompany: result.length ? result[0] : {},
          },
        });
      }
      return result;
    },
    // 获取banner类型值集
    *fetchBannerTypeValue(_, { call, put }) {
      const res = yield call(queryIdpValue, 'SMAL.BANNER_TYPE');
      const bannerType = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { bannerType },
      });
    },
    // 获取banner状态
    *fetchBannerStatus(_, { call, put }) {
      const res = yield call(queryIdpValue, 'SMAL.BANNER_STATUS');
      const bannerStatus = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { bannerStatus },
      });
    },
    // 获取商品来源值集
    *fetchSourceFrom(_, { call, put }) {
      const res = yield call(queryIdpValue, 'SMAL.PRODUCT_SOURCE_FROM');
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
    // 获取商品列表数据
    *fetchModalList({ payload }, { call, put }) {
      const res = yield call(fetchModalList, payload);
      const result = getResponse(res);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            modalList: result.content,
            modalPagination: createPagination(result),
          },
        });
      }
    },
    // 上架/下架Banner
    *operatingBanner({ payload }, { call }) {
      const res = yield call(operatingBanner, { ...payload });
      return getResponse(res);
    },
    // 启用/禁用Banner
    *enableAction({ payload }, { call }) {
      const res = yield call(enableAction, { ...payload });
      return getResponse(res);
    },
    // 新建公司banner
    *saveCompanyBanner({ payload }, { call }) {
      const res = yield call(saveCompanyBanner, { ...payload });
      return getResponse(res);
    },
    // 获取公司Banner头信息
    *fetchCompanyBannerHeader({ payload }, { call, put }) {
      const res = yield call(fetchCompanyBannerHeader, payload);
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
    *fetchCompanyBannerLine({ payload }, { call, put }) {
      const res = yield call(fetchCompanyBannerLine, payload);
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

    *fetchTypeTree({ payload }, { call, put }) {
      const typeTree = yield call(fetchTypeTree, payload);
      const result = getResponse(typeTree);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            treeList: result,
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
