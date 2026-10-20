export default [
  { code: 'SODR.WORKSPACE_FEEDBACK_DETAIL' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      beforeActionFn: undefined,
      // 明细信息表格ds配置
      processDetailInfoDsConfig: (config) => config,
      processColumns: (columns) => columns,
      processPanels: (panels) => panels,
      processDetailLineButton: (btns) => btns,
      processDetailSelectMode: (flag) => flag,
    },
  },
];
