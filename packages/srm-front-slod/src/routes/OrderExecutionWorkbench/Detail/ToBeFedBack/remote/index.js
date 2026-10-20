export default [
  { code: 'SODR.SUPPLIERWORKSPACE_TOFEEDBACK_DETAIL' },
  {
    process: {
      // 外部系统金额字段是否做精度控制
      bySourceCode: () => true,
      // 附件信息-内部附件额外表单字段
      insideAttachmentExtraForm: (_) => _,
      // 附件信息-外部附件额外表单字段
      externalAttachmentExtraForm: (_) => _,
      processColumns: (columns) => columns,
      processPanels: (panels) => panels,
      toBeFedBackDetailButtons: (buttons) => buttons,
      signTypeEstimateFn: () => false,
    },
    events: {
      // 反馈前置埋点
      beforFeedback: async () => true,
      beforeSave: async () => true,
    },
  },
];
