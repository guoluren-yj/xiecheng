import { getResponse, createPagination, parseParameters } from 'utils/utils';
import {
  fetchLanguageInfo,
  fetchLanguageData,
  saveLanguageTranslate,
  createLanguageTranslate,
} from '@/services/promptTranslateService';

export default {
  namespace: 'promptTranslate',

  state: {
    languageInfo: [],
    pagination: [],
    promptLanguageList: [],
  },

  effects: {
    *fetchLanguageInfo(_, { call, put }) {
      const data = getResponse(yield call(fetchLanguageInfo));
      if (data) {
        yield put({
          type: 'updateState',
          payload: {
            languageInfo: data,
          },
        });
      }
      return data;
    },
    *fetchLanguageData({ payload }, { call, put, select }) {
      const res = yield call(fetchLanguageData, parseParameters(payload));
      const list = getResponse(res);
      const languageInfo = yield select((state) => state.promptTranslate.languageInfo);
      if (list) {
        yield put({
          type: 'updateState',
          payload: {
            promptLanguageList:
              list.content &&
              list.content.map((li) => {
                const promptDescData = {};
                languageInfo.forEach((info) => {
                  promptDescData[info.code] =
                    li.promptDetailConfig[info.code] &&
                    li.promptDetailConfig[info.code].description;
                });
                return {
                  ...li,
                  ...promptDescData,
                };
              }),
            pagination: createPagination(list),
          },
        });
      }
      return list;
    },
    *saveLanguageTranslate({ payload }, { call }) {
      const data = yield call(saveLanguageTranslate, payload);
      return getResponse(data);
    },
    *createLanguageTranslate({ payload }, { call }) {
      const data = yield call(createLanguageTranslate, payload);
      return getResponse(data);
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
