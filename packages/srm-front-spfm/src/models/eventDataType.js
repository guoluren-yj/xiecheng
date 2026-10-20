/**
 * EventType - 事件类型定义 - model
 * @date: 2019-3-12
 * @author: Wu <qizheng.wu@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import { getResponse, createPagination, parseParameters } from 'utils/utils';
import { fetchEventDataList, createEventDataType } from '@/services/eventDataTypeService';

export default {
  namespace: 'eventDataType',

  state: {
    modalVisible: false,
    eventDataList: [],
    pagination: {}, // 分页对象
  },

  effects: {
    // 获取事件类型信息
    *fetchEventDataList({ payload }, { call, put }) {
      const res = yield call(fetchEventDataList, parseParameters(payload));
      const list = getResponse(res);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            eventDataList: list.content,
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },

    //  新增事件数据类型
    *createEventDataType({ payload }, { call }) {
      const param = payload;
      const res = yield call(createEventDataType, param);
      return getResponse(res);
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
