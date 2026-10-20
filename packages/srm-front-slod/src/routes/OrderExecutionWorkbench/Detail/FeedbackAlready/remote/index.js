export default [
  { code: 'SODR.SUPPLIERWORKSPACE_FEEDBACKALREADY_DETAIL' },
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
      processButtons: (buttons) => buttons,
    },
    events: {
      // 供应商附件上传成功回调
      supplierAttachmentAfterUpload() {},
      // 供应商附件删除成功回调
      supplierAttachmentAfterDelete() {},
      // 再次反馈前置埋点
      beforFeedback: async () => true,
    },
  },
];
