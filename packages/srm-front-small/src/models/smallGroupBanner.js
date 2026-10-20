/**
 * CompanyBanner - 集团Banner管理
 * @date: 2019-2-26
 * @author: CJ <juan.chen01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchGroupBannerList,
  fetchCurrentCompanyValue,
  operatingBanner,
  saveGroupBanner,
  fetchGroupBannerHeader,
  fetchGroupBannerLine,
  saveGoodsLine,
  deleteGoodsLines,
  fetchHistoryRecord,
  fetchModalList,
  fetchAssignCompany,
  saveAssignCompany,
  fetchProduct,
  delBanner,
} from '@/services/groupBannerService';
import { fetchTypeTree } from '@/services/groupCustomBarService';
import { queryIdpValue } from 'services/api';

function dealDataState(data) {
  // 处理行 处理字段为update
  let config = [];
  if (Array.isArray(data) && data.length > 0) {
    config = data.map((item) => {
      return {
        ...item,
        _status: 'update',
      };
    });
  }
  return config;
}

export default {
  namespace: 'smallGroupBanner',
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
    modalList: [], // 商品列表数据
    modalPagination: {}, // 商品列表分页
    assignCompanyList: [], // 分配公司列表
    assignCompanyPagination: {},
    assignStatus: [], // 分配状态值集
    treeList: [],
  },
  effects: {
    // 获取集团banner数据
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
      return result;
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
            currentCompany: result,
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
    // 获取分配状态
    *fetchAssignStatus(_, { call, put }) {
      const res = yield call(queryIdpValue, 'SMAL.BANNER_DISTRIBUTE_TYPE');
      const assignStatus = getResponse(res);
      yield put({
        type: 'updateState',
        payload: { assignStatus },
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
    // 新建集团banner
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

    *fetchAssignCompany({ payload }, { call, put }) {
      const response = yield call(fetchAssignCompany, payload);
      const list = getResponse(response);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            assignCompanyList: list.content,
            assignCompanyPagination: createPagination(list),
          },
        });
      }
      return list;
    },

    *saveAssignCompany({ payload }, { call }) {
      const response = yield call(saveAssignCompany, payload);
      return getResponse(response);
    },

    *fetchProduct({ payload }, { call }) {
      const response = yield call(fetchProduct, payload);
      return getResponse(response || {});
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
    *delBanner({ payload }, { call }) {
      return getResponse(yield call(delBanner, payload));
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
