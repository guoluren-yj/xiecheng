/**
 * scoreReport
 * @date: 2020-06-19
 * @author: LS <shuo.lv@hand-china.com>
 * @copyright Copyright (c) 2020, Hand
 */
import { getResponse, createPagination } from 'utils/utils';
import { queryMapIdpValue } from 'services/api';
import {
  fetchScorRpt,
  fetchDetail,
  fetchTemplateLine,
  saveDetail,
  copyTemplate,
  deleteTemplate,
  onDraggerUploadRemove,
  deleteTemplateLine,
} from '@/services/scoreReportService';

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
  namespace: 'scoreRptTemplate',
  state: {
    resultsList: [], // 查询数据
    pagination: {}, // 查询数据分页
    lovCode: {}, // 复制数据值集
    baseDetail: {}, // 详情
    contentTable: [], // 文档内容表格
  },
  effects: {
    // 询报价入口查询
    *fetchScorRpt({ payload }, { call, put }) {
      let result = yield call(fetchScorRpt, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            resultsList: result.content,
            pagination: createPagination(result),
          },
        });
      }
    },

    *fetchDetail({ payload }, { call, put }) {
      let result = yield call(fetchDetail, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            baseDetail: result,
          },
        });
        return result;
      }
    },
    *fetchTemplateLine({ payload }, { call, put }) {
      let result = yield call(fetchTemplateLine, payload);
      result = getResponse(result);
      if (result) {
        yield put({
          type: 'updateState',
          payload: {
            contentTable: dealDataState(result),
          },
        });
        return result;
      }
    },

    *saveDetail({ payload }, { call }) {
      const result = getResponse(yield call(saveDetail, payload));
      return result;
    },

    *copyTemplate({ payload }, { call }) {
      const result = getResponse(yield call(copyTemplate, payload));
      return result;
    },

    *deleteTemplate({ payload }, { call }) {
      const result = getResponse(yield call(deleteTemplate, payload));
      return result;
    },

    // 删除评分模版表格行
    *deleteTemplateLine({ payload }, { call }) {
      const result = getResponse(yield call(deleteTemplateLine, payload));
      return result;
    },
    // 删除附件
    *onDraggerUploadRemove({ payload }, { call }) {
      const response = yield call(onDraggerUploadRemove, payload);
      return getResponse(response);
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
