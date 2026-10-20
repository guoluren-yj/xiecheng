export default [
  { code: 'SODR.WORKSPACE_CANCEL_DETAIL' },
  {
    events: {
      beforAction: async (_) => _,
      processColumns: (columns) => columns,
      processPanels: (panels) => panels,
    },
  },
];
