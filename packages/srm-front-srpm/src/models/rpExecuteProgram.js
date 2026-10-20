export default {
  namespace: 'rpExecuteProgram',
  state: {
    documentList: [],
    rpCurrentTab: 'todo',
    containerLov: {},
    currentSelected: [],
    rpCurrentSubmittedTableStatus: 'header',
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
