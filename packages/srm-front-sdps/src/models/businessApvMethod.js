/**
 * model 企业审批方式
 * @date: 2018-7-30
 * @author: WH <heng.wei@hand-china.com>
 * @copyright Copyright (c) 2018, Hand
 */

export default {
  namespace: 'businessApvMethod',
  state: {
    list: [],
    pagination: {},
    methodList: [], // 审批方式
  },
  effects: {
    // 获取业务审批列表
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
