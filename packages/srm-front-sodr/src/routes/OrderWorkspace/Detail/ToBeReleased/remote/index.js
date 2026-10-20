export default [
  { code: 'SODR.WORKSPACE_TOBERELEASED_DETAIL' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      processColumns: (columns) => columns,
      processPanels: (panels) => panels,
    },
  },
];
