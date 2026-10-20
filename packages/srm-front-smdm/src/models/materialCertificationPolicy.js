export default {
  namespace: 'materialCertificationPolicy',

  state: {
    tabType: 'nodeConfig', // tab 页签
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
