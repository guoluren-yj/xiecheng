export default {
  namespace: 'hmde',

  state: {},

  reducers: {
    setTenantId(state, { payload }) {
      return { ...state, ...payload };
    },
  },
};
