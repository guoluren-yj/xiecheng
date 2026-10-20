/*
 * receiptManageConfig - 收货管理配置
 * @date: 2022/10/22
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2022, Hand
 */

export default {
  namespace: 'receiptManageConfig',

  state: {
    createFormInfo: {},
    chartList: {},
    currentPages: 1,
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
