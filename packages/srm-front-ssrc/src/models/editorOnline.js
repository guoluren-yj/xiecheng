/**
 * editorOnline - 在线编辑
 * @date: 2019年5月20日 15:47:52
 * @author: Jehu <zhihao.zeng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import {
  // fetchEditorOnlineHTML,
  fetchEditorOnlineTemplateHTML,
  fetchEditorOnlineHTML,
} from '@/services/editorOnlineService';

export default {
  namespace: 'ssrcEditorOnline',

  state: {
    editorHTML: '',
  },

  effects: {
    *fetchEditorOnlineTemplateHTML({ payload }, { call, put }) {
      const editorHTML = yield call(fetchEditorOnlineTemplateHTML, payload);
      if (editorHTML) {
        yield put({
          type: 'updateState',
          payload: {
            editorHTML: `${editorHTML}`,
          },
        });
      }
      return editorHTML;
    },
    *fetchEditorOnlineHTML({ payload }, { call, put }) {
      const editorHTML = yield call(fetchEditorOnlineHTML, payload);
      if (editorHTML) {
        yield put({
          type: 'updateState',
          payload: {
            editorHTML: `${editorHTML}`,
          },
        });
      }
      return editorHTML;
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
