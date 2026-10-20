import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  getCurrentCompany,
  fetchBarHeader,
  fetchBannerHeader,
  fetchPackageHeader,
  getBarProduct,
  getBannerProduct,
  getPackageProduct,
  saveBar,
  saveBanner,
  savePackage,
  enablePackage,
  delBarGoodsLines,
  delBannerGoodsLines,
  delPackageGoodsLines,
  quickAddProduct,
  fetchTypeTree,
  fetchProduct,
  saveChannel,
} from '@/services/mallHomePlateManageService';

export default {
  namespace: 'mallHomePlate',
  state: {
    treeList: [], // 分类树
    currentCompany: {}, // 当前公司
    barHeaderInfo: {}, // 自定义栏头信息
    bannerHeaderInfo: {}, // banner头信息
    packageHeaderInfo: {}, // 采购套餐头信息
    bannerProductList: [], // banner下商品列表
    bannerProductPage: {}, // banner下商品列表分页
    barProductList: [], // 自定义栏下商品列表
    barProductPage: {}, // 自定义栏下商品列表分页
    packageProductList: [], // 采购套餐下商品列表
    packageProductPage: {}, // 采购套餐下商品列表分页
    customBarStatus: [],
    customBarType: [], // 自定义栏类型
    sourceType: [], // 商品来源
    bannerType: [],
    barType: '', // 自定义栏类型
    bannerStatus: [],
    assignStatus: [], // 分配状态
  },
  effects: {
    // 初始化 值集 这类在页面生存周期不会变的变量
    *init(_, { call, put }) {
      const lovBatchRes = yield call(queryMapIdpValue, {
        customBarType: 'SMAL.CUSTOM_BAR_TYPE', // 自定义栏类型
        customBarStatus: 'SMAL.CUSTOM_BAR_STATUS', // 自定义栏状态
        sourceType: 'SMAL.PRODUCT_SOURCE_FROM', // 商品来源
        assignStatus: 'SMAL.BANNER_DISTRIBUTE_TYPE', // 分配状态
        bannerType: 'SMAL.BANNER_TYPE', // banner类型
        bannerStatus: 'SMAL.BANNER_STATUS', // banner状态
        nostockType: 'SMAL.NOT_ENOUGH_STOCK', // 是否显示无货
      });
      const lovBatch = getResponse(lovBatchRes);
      if (lovBatch) {
        yield put({
          type: 'updateState',
          payload: {
            customBarType: lovBatch.customBarType,
            customBarStatus: lovBatch.customBarStatus,
            sourceType: lovBatch.sourceType,
            bannerType: lovBatch.bannerType,
            bannerStatus: lovBatch.bannerStatus,
            assignStatus: lovBatch.assignStatus,
            nostockType: lovBatch.nostockType,
          },
        });
      }
    },
    // 查询当前公司
    *getCurrentCompany({ payload }, { call, put }) {
      const response = getResponse(yield call(getCurrentCompany, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            currentCompany: response[0],
          },
        });
      }
      return response;
    },
    // 查询分类
    *fetchTypeTree({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchTypeTree, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            treeList: response,
          },
        });
      }
      return response;
    },
    // 获取明细信息
    // 获取banner的明细
    *fetchBannerHeader({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchBannerHeader, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            bannerHeaderInfo: response,
          },
        });
      }
      return response;
    },
    // 获取自定义栏的明细
    *fetchBarHeader({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchBarHeader, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            barHeaderInfo: response,
            barType: response.barType,
          },
        });
      }
      return response;
    },
    // 获取采购套餐的明细
    *fetchPackageHeader({ payload }, { call, put }) {
      const response = getResponse(yield call(fetchPackageHeader, payload));
      if (response) {
        const header = response.content[0] || {};
        yield put({
          type: 'updateState',
          payload: {
            packageHeaderInfo: header,
          },
        });
      }
      return response;
    },
    // 商品行操作+明细保存
    // 查询banner的商品行列表
    *getBannerProduct({ payload }, { call, put }) {
      const response = getResponse(yield call(getBannerProduct, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            bannerProductList: response.content.map((i) => ({ ...i, _status: 'update' })),
            bannerProductPage: createPagination(response),
          },
        });
      }
      return response;
    },
    // 查询自定义栏的商品行列表
    *getBarProduct({ payload }, { call, put }) {
      const response = getResponse(yield call(getBarProduct, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            barProductList: response.content.map((item) => ({ ...item, _status: 'update' })),
            barProductPage: createPagination(response),
          },
        });
      }
      return response;
    },
    // 查询采购套餐的商品行列表
    *getPackageProduct({ payload }, { call, put }) {
      const response = getResponse(yield call(getPackageProduct, payload));
      if (response) {
        yield put({
          type: 'updateState',
          payload: {
            packageProductList: response.content.map((item) => ({ ...item, _status: 'update' })),
            packageProductPage: createPagination(response),
          },
        });
      }
      return response;
    },
    // 保存/新增banner的商品行+明细
    *saveBanner({ payload }, { call }) {
      return getResponse(yield call(saveBanner, payload));
    },
    // 删除banner的商品行
    *delBannerGoodsLines({ payload }, { call }) {
      return getResponse(yield call(delBannerGoodsLines, payload));
    },
    // 保存/新增自定义栏的商品行+明细
    *saveBar({ payload }, { call }) {
      return getResponse(yield call(saveBar, payload));
    },
    // 删除自定义栏的商品行
    *delBarGoodsLines({ payload }, { call }) {
      return getResponse(yield call(delBarGoodsLines, payload));
    },
    // 保存/新增采购套餐的商品行+明细
    *savePackage({ payload }, { call }) {
      return getResponse(yield call(savePackage, payload));
    },
    // 删除采购套餐的商品行
    *delPackageGoodsLines({ payload }, { call }) {
      return getResponse(yield call(delPackageGoodsLines, payload));
    },
    // 启用/禁用采购套餐
    *enablePackage({ payload }, { call }) {
      return getResponse(yield call(enablePackage, payload));
    },
    // 快速添加商品
    *quickAddProduct({ payload }, { call }) {
      return getResponse(yield call(quickAddProduct, payload));
    },
    *fetchProduct({ payload }, { call }) {
      const response = yield call(fetchProduct, payload);
      return getResponse(response || {});
    },
    // 频道保存
    *saveChannel({ payload }, { call }) {
      const response = yield call(saveChannel, payload);
      return getResponse(response || {});
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
