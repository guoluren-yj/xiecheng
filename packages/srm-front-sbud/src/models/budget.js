/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-15 15:34:11
 * @LastEditors: yanglin
 * @LastEditTime: 2022-05-27 11:09:47
 */
export default {
  namespace: 'budget',

  state: {
    tabType: 'wholeEditing', // tab 页签
    templateFields: null, // 模板字段
  },

  effects: {},

  reducers: {
    updateState(state, { payload }) {
      return {
        ...state,
        ...payload,
      };
    },
  },
};
