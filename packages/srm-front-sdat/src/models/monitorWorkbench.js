/**
 * 数据表 采集中状态集中管理
 */

export default {
  namespace: 'monitorWorkbench',
  state: {
    collecting: false,
    monitorConfigDetail: {},
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
