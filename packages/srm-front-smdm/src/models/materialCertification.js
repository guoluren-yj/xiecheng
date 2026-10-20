export default {
  namespace: 'materialCertification',

  state: {
    tabType: 'awaitAuths', // tab 页签
    allType: 'whole',
    cancelType: 'whole',
    certifiedType: 'whole',
    pendingType: 'whole',
    testResultEntryType: 'whole',
    initFlag: false,
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
