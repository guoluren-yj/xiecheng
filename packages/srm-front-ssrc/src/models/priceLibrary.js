/**
 * model 价格库管理/价格库
 * @date: 2019-10-23
 * @author: jing.chen05@hand-china.com
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { isEmpty } from 'lodash';
import {
  fetchPriceLibList,
  fetchHistoryPriceDetail,
  updatePriceLib,
  fetchPriceLibDetail,
  savePriceLib,
  deletePriceLine,
  releasePriceLib,
  fetchLadderList,
  saveLadderList,
  deleteLadderQuot,
  querySetting,
  fetchHisSimilarItem,
  fetchPriceAnalysis,
  fetchPriceChange,
  fetchPriceChangeOrderDetail,
  fetchDetailList,
  deleteDetailInfo,
  releaseDetailInfo,
  savePriceLibDetail,
  fetchDetailLadderList,
  importToErp,
} from '@/services/priceLibraryService';
import { queryMapIdpValue } from 'services/api';

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
  namespace: 'priceLibrary',
  state: {
    priceLibList: [], // 价格库数据列表
    priceLibPagination: {}, // 价格库分页器
    code: {}, // 值集
    historyPriceList: [], // 历史价格数据列表
    historyPricePagination: {}, // 历史价格分页器
    itemPriceList: [], // 物料价格信息维护数据列表
    itemPricePagination: {}, // 物料价格信息维护分页器
    ladderPriceList: [], // 阶梯价格
    settings: {}, // 配置中心配置项
    hisSimilarItemData: [], // 历史价格分析-相似物品最低一览表
    hisSimilarItemPagination: {}, // 历史价格分析-相似物品最低一览表
    priceAnalysisList: [], // 历史价格分析-折线图数据
    priceChangePagination: {}, // 价格库变查询数据分页
    priceChangeList: [], // 价格库变更查询数据列表
    applicationDeatil: [], // 价格库变更申请单号数据详情
    applicationDetailPagination: {}, // 价格库变更申请单号数据详情分页
    header: {}, // 价格库变更申请单号数据详情头信息
    activeKey: 'itemPriceInfoMaint', // 选中的tab页
  },
  effects: {
    // 询报价入口查询
    *fetchPriceLibList({ payload }, { call, put }) {
      let result = yield call(fetchPriceLibList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceLibList: result.content,
            priceLibPagination: createPagination(result),
          },
        });
      }
    },
    // 获取多个值集
    *batchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (!isEmpty(result)) {
        yield put({
          type: 'updateState',
          payload: {
            code: result,
          },
        });
      }
    },
    // 查询配置中心配置项
    *querySetting({ payload }, { call, put }) {
      const settings = getResponse(yield call(querySetting, payload));
      if (settings) {
        yield put({
          type: 'updateSetting',
          payload: {
            settings,
          },
        });
      }
    },
    // 历史价格明细数据查询
    *fetchHistoryPriceDetail({ payload }, { call, put }) {
      let result = yield call(fetchHistoryPriceDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            historyPriceList: result.content,
            historyPricePagination: createPagination(result),
          },
        });
      }
    },
    // 价格库更新保存API
    *updatePriceLib({ payload }, { call }) {
      const result = getResponse(yield call(updatePriceLib, payload));
      return result;
    },
    // 物料价格查询
    *fetchPriceLibDetail({ payload }, { call, put }) {
      let result = yield call(fetchPriceLibDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            itemPriceList: dealDataState(result.content),
            itemPricePagination: createPagination(result),
          },
        });
      }
    },
    // 价格库变更查询数据
    *fetchPriceChange({ payload }, { call, put }) {
      let result = yield call(fetchPriceChange, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceChangeList: dealDataState(result.content),
            priceChangePagination: createPagination(result),
          },
        });
      }
    },
    // 获取价格库变成查询的申请单详情头信息
    *fetchPriceChangeOrderDetail({ payload }, { call, put }) {
      let result = yield call(fetchPriceChangeOrderDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            header: result,
          },
        });
      }
    },
    // 获取价格库变成查询的申请单详情行信息
    *fetchDetailList({ payload }, { call, put }) {
      let result = yield call(fetchDetailList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            applicationDeatil: dealDataState(result.content),
            applicationDetailPagination: createPagination(result),
          },
        });
      }
    },
    // 物料价格行保存
    *savePriceLib({ payload }, { call }) {
      const result = getResponse(yield call(savePriceLib, payload));
      return result;
    },
    // 物料价格行-批量删除
    *deletePriceLine({ payload }, { call }) {
      const result = getResponse(yield call(deletePriceLine, payload));
      return result;
    },
    // 物料价格行-发布
    *releasePriceLib({ payload }, { call }) {
      const result = getResponse(yield call(releasePriceLib, payload));
      return result;
    },
    // 物料价格行-批量删除
    *deleteDetailInfo({ payload }, { call }) {
      const result = getResponse(yield call(deleteDetailInfo, payload));
      return result;
    },
    // 物料价格行-发布
    *releaseDetailInfo({ payload }, { call }) {
      const result = getResponse(yield call(releaseDetailInfo, payload));
      return result;
    },
    // 获取阶梯价格明细列表
    *fetchLadderList({ payload }, { call, put }) {
      let result = yield call(fetchLadderList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ladderPriceList: dealDataState(result.content),
          },
        });
      }
      return result;
    },
    // 保存阶梯价格
    *saveLadderList({ payload }, { call }) {
      return getResponse(yield call(saveLadderList, payload));
    },
    // 阶梯价格-批量删除
    *deleteLadderQuot({ payload }, { call }) {
      const result = getResponse(yield call(deleteLadderQuot, payload));
      return result;
    },
    // 查询历史价格分析-相似物品最低一览表
    *fetchHisSimilarItem({ payload }, { call, put }) {
      let result = yield call(fetchHisSimilarItem, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            hisSimilarItemData: result.content,
            hisSimilarItemPagination: createPagination(result),
          },
        });
      }
    },
    // 查询历史价格分析-折线图表
    *fetchPriceAnalysis({ payload }, { call, put }) {
      let result = yield call(fetchPriceAnalysis, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            priceAnalysisList: result,
          },
        });
      }
      return result;
    },
    // 申请单详情保存
    *savePriceLibDetail({ payload }, { call }) {
      const result = getResponse(yield call(savePriceLibDetail, payload));
      return result;
    },
    // 导入ERP
    *importToErp({ payload }, { call }) {
      const result = yield call(importToErp, payload);
      return result;
    },
    // 申请单阶梯价格明细
    *fetchDetailLadderList({ payload }, { call, put }) {
      let result = yield call(fetchDetailLadderList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            ladderPriceList: dealDataState(result.content),
          },
        });
      }
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
    updateSetting(state, { payload }) {
      const { settings } = payload;
      return {
        ...state,
        settings: {
          ...state.settings,
          ...settings,
        },
      };
    },
  },
};
