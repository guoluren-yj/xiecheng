export default {
  namespace: 'purchaseplatform',
  state: {
    // activeKey: 'beforeSubmit',
    wholeType: 'beforeSubmit',
    isDetailTab: 'wholeTab',
    assignTab: 'approved',
    executionTab: 'order',
    detailTab: 1,
    initPrFlag: false, // 采购申请工作台初始化标志
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
