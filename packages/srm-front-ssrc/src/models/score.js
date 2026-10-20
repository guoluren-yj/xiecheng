/**
 * model - 评分要素及模板
 * @date: 2018-8-9
 * @author: YB <bo.yang02@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { isEmpty } from 'lodash';
import { getResponse, createPagination } from 'utils/utils';
import {
  fetchTemplate,
  saveTemplate,
  fetchElements,
  saveElements,
  fetchDetail,
  deleteDetail,
  saveDetail,
  fetchElementsDetailLine,
  saveElementsDetail,
  saveElementsDetailTwo,
  deleteElementsDetail,
} from '@/services/scoreServices';
import { queryMapIdpValue } from 'services/api';

/**
 * 重构数组
 * @param {Array} dataList
 */
function setField(dataList = []) {
  const newDataList = dataList.map(o => ({ ...o, _scoreMode: o.scoreMode }));
  return newDataList;
}

/**
 * 设置行内编辑状态
 * @param {Array} dataList
 */
function setUpdate(dataList = []) {
  const newDataList = dataList.map(o => ({ ...o, _status: 'update' }));
  return newDataList;
}

export default {
  namespace: 'score',
  state: {
    scoreCode: {}, // 值集
    elementsList: [], // 评分要素list
    elementsPagination: {}, // 评分要素分页
    elementsDetailLineList: [], // 评分要素细项列表
    elementsDetailLinePagination: {}, // 评分要素细项分页
    modalList: [], // 评分要素list
    modalPagination: {}, // 评分要素分页
    templateList: [], // 评分模板List
    templatePagination: {}, // 评分模板分页
    elementsDetailList: [], // 分配评分要素List
    elementsDetailPagination: {}, // 分配评分要素分页
  },
  effects: {
    // 查询值集
    *queryValueCode({ payload }, { call, put }) {
      const code = getResponse(yield call(queryMapIdpValue, payload));
      if (code) {
        yield put({
          type: 'updateState',
          payload: {
            code: {
              ...code,
              genderList:
                code.genderList && code.genderList.filter(o => o.value === '0' || o.value === '1'),
            },
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
            scoreCode: result,
          },
        });
      }
    },
    // 查询评分模板定义
    *fetchTemplate({ payload }, { call, put }) {
      const response = yield call(fetchTemplate, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            templateList: setField(data.content),
            templatePagination: createPagination(data),
          },
        });
      }
    },

    // 保存评分模板
    *saveTemplate({ payload }, { call }) {
      const response = yield call(saveTemplate, payload);
      return getResponse(response);
    },

    // 查询评分要素定义
    *fetchElements({ payload }, { call, put }) {
      const response = yield call(fetchElements, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            elementsList: data.content,
            elementsPagination: createPagination(data),
          },
        });
      }
    },

    // 评分要素细项-行-查询
    *fetchElementsDetailLine({ payload }, { call, put }) {
      const { templateEleDetailFlag, ...otherPayload } = payload;
      const response = yield call(fetchElementsDetailLine, otherPayload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            elementsDetailLineList: templateEleDetailFlag ? setUpdate(data.content) : data.content,
            elementsDetailLinePagination: createPagination(data),
          },
        });
      }
    },

    // 评分要素细项-行-保存
    *saveElementsDetail({ payload }, { call }) {
      const response = yield call(saveElementsDetail, payload);
      return getResponse(response);
    },
    // 评分要素细项-行-二级要素保存
    *saveElementsDetailTwo({ payload }, { call }) {
      const response = yield call(saveElementsDetailTwo, payload);
      return getResponse(response);
    },

    // 评分要素细项-行-删除
    *deleteElementsDetail({ payload }, { call }) {
      const response = yield call(deleteElementsDetail, payload);
      return getResponse(response);
    },

    // 查询评分要素定义
    *fetchElementsModal({ payload }, { call, put }) {
      const response = yield call(fetchElements, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            modalList: data.content,
            modalPagination: createPagination(data),
          },
        });
      }
    },

    // 保存评分模板
    *saveElements({ payload }, { call }) {
      const response = yield call(saveElements, payload);
      return getResponse(response);
    },

    // 查询分配评分要素
    *fetchDetail({ payload }, { call, put }) {
      const response = yield call(fetchDetail, payload);
      const data = getResponse(response);
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            elementsDetailList: data.content,
            elementsDetailPagination: createPagination(data),
          },
        });
      }
    },

    // 保存评分模板
    *saveDetail({ payload }, { call }) {
      const response = yield call(saveDetail, payload);
      return getResponse(response);
    },

    // 保存评分模板
    *deleteDetail({ payload }, { call }) {
      const response = yield call(deleteDetail, payload);
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
