export default [
  { code: 'SODR.SUPPLIERWORKSPACE_ALL_DETAIL' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      cuxLineDetailAttrmentUuidChange: undefined,
      // 基础信息额外表单字段
      basicInfoExtraForm: () => {},
      // 附件信息-内部附件额外表单字段
      insideAttachmentExtraForm: (_) => _,
      // 附件信息-外部附件额外表单字段
      externalAttachmentExtraForm: (_) => _,
      // 头按钮组
      dynamicButtons: (_) => _,
      processPanels: (panels) => panels,
    },
  },
];
