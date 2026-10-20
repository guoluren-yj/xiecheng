/**
 * model 寻源服务/寻源结果导入查询
 * @date: 2019-4-3
 * @author: HZL <zili.hou@hand-china.com>
 * @copyright Copyright (c) 2019, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  saveData,
  getSystem,
  abandonData,
  setFailure,
  fetchQuoteLine,
  sourceImportErp,
  sourceImportToErp,
  fetchEntranceList,
  fetchResultsHeaderDetail,
  getBusinessOu,
  getInventoryOrg,
  createSourceResult,
  updateSourceResult,
  querySourceResult,
  importErpWithSourceResult,
} from '@/services/searchResultImportNewService';

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
  namespace: 'searchResultImportNew',
  state: {
    resultsList: [], // 询报结果入口所有数据
    pagination: {}, // 询报结果入口所有数据分页
    header: {}, // 寻源结果明细页面头
    quoteLine: [], // 全部报价明细
    quoteLinePagination: {}, // 全部报价明细分页
    modelList: [], // 侧弹框的数据
    gotoFlag: false, // 是否是从别的页面跳转过来的
    sourceResultTempList: [], // 价格导入_引用价格-复制数据源
    sourceResultTempPagination: {}, // 价格导入_引用价格-复制数据分页对象
    lovCode: {}, // 复制数据值集
    resultsListOldTotal: 0, // 询报结果入口数据总条数
  },
  effects: {
    // 询报价入口查询
    *fetchEntranceList({ payload }, { call, put }) {
      let result = yield call(fetchEntranceList, payload);
      result = getResponse(result);
      if (result) {
        const { onlyCountFlag } = payload || {};
        yield put({
          type: 'updateState',
          payload:
            onlyCountFlag !== 'Y'
              ? {
                  paginationLoading: result?.needCountFlag === 'Y',
                  resultsList: dealDataState(result.content),
                  pagination: createPagination(result),
                }
              : {
                  paginationLoading: false,
                  pagination: createPagination(result),
                  resultsListOldTotal: result.totalElements, // 异步分页查询到的总条数，后面再查询的时候要传给后端
                },
        });
      }
      return result;
    },

    // model侧边框的数据
    *fetchModleList({ payload }, { call, put }) {
      let result = yield call(fetchEntranceList, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            modelList: dealDataState(result.content),
            // pagination: createPagination(result), // 这里不需要分页，要是需求改了再加
          },
        });
      }
    },
    // 获取寻源结果头部信息
    *fetchResultsHeaderDetail({ payload }, { call, put }) {
      const result = getResponse(yield call(fetchResultsHeaderDetail, payload));
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
    // 获取寻源结果全部报价明细
    *fetchQuoteLine({ payload }, { call, put }) {
      let result = yield call(fetchQuoteLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            quoteLine: result.content,
            quoteLinePagination: createPagination(result),
          },
        });
      }
      return result;
    },
    // 保存询价结果行
    *saveData({ payload }, { call }) {
      const result = getResponse(yield call(saveData, payload));
      return result;
    },
    // 保存询价结果行
    *abandonData({ payload }, { call }) {
      const result = getResponse(yield call(abandonData, payload));
      return result;
    },
    // 置为无效
    *setFailure({ payload }, { call }) {
      const result = getResponse(yield call(setFailure, payload));
      return result;
    },
    // 寻源结果-导入ERP
    *sourceImportErp({ payload }, { call }) {
      const result = getResponse(yield call(sourceImportErp, payload));
      return result;
    },
    // 价格信息-导入ERP(打开侧弹框以后的导入)
    *sourceImportToErp({ payload }, { call }) {
      const result = getResponse(yield call(sourceImportToErp, payload));
      return result;
    },
    // 获取当前租户对接的系统
    *getSystem({ payload }, { call }) {
      const result = getResponse(yield call(getSystem, payload));
      return result;
    },
    // 获取业务实体
    *fetchGetBusinessOu({ payload }, { call }) {
      const result = getResponse(yield call(getBusinessOu, payload));
      return result;
    },
    // 获取库存组织
    *fetchGetInventoryOrg({ payload }, { call }) {
      const result = getResponse(yield call(getInventoryOrg, payload));
      return result;
    },
    // 创建复制行数据
    *fetchCreateSourceResult({ payload }, { call }) {
      const result = getResponse(yield call(createSourceResult, payload));
      return result;
    },
    // 修改复制行数据
    *fetchSaveSourceResult({ payload }, { call }) {
      const result = getResponse(yield call(updateSourceResult, payload));
      return result;
    },
    // 查询复制行数据
    *fetchQuerySourceResult({ payload }, { call, put }) {
      const result = getResponse(yield call(querySourceResult, payload));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            sourceResultTempList: dealDataState(result.content || []),
            sourceResultTempPagination: createPagination(result),
          },
        });
      }
    },
    // 弹窗内导入ERP复制行数据
    *fetchImportErpWithSourceResult({ payload }, { call }) {
      const result = getResponse(yield call(importErpWithSourceResult, payload));
      if (result) {
        return result;
      }
    },
    // 获取多个值集
    *fetchQueryBatchCode({ payload }, { call, put }) {
      const { lovCodes } = payload;
      const result = getResponse(yield call(queryMapIdpValue, lovCodes));
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            lovCode: result,
          },
        });
      }
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
