/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-15 15:34:11
 * @LastEditors: yanglin
 * @LastEditTime: 2022-08-19 15:28:49
 */
export default {
    namespace: 'categoryAttribute',

    state: {
      tabType: 'attributeDefined', // tab 页签
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
