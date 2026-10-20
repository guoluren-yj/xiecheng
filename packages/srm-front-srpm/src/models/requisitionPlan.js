/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-15 15:34:11
 * @LastEditors: yanglin
 * @LastEditTime: 2021-11-15 15:38:37
 */
export default {
  namespace: 'requisitionPlan',

  state: {
    tabType: 'beforeSubmit', // tab 页签
    initRpFlag: false, // 需求非计划工作台初始化标志
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
