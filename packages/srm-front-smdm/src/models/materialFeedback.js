/*
 * @Descripttion:
 * @version:
 * @Author: yanglin
 * @Date: 2021-11-15 15:34:11
 * @LastEditors: yanglin
 * @LastEditTime: 2023-11-22 16:10:13
 */
export default {
  namespace: 'materialFeedback',

  state: {
    tabType: 'pendingFeedBack', // tab 页签
    allType: 'whole',
    pendingType: 'whole',
    feedBackType: 'whole',
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
