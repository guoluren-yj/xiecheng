export default [
  { code: 'SODR.SUPPLIERWORKSPACE_LIST' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      // 获取详情页按钮
      getDetailAllButtons: (buttons) => buttons,
      getColumns: (columns) => columns,
    },
    events: {
      // 批量反馈前置埋点
      beforFeedback: async () => true,
    },
  },
];
