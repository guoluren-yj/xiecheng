export default [
  { code: 'SODR.CONFIRMORDER_DETAIL' },
  {
    process: {
      // 供应商附件文字二开埋点
      supplierAttachmentText: (text) => text,
      // 外部附件埋点
      externalAttachments(attachment) {
        return attachment;
      },
      // 头信息表单内容埋点
      headerInfoExtraForm() {},
    },
  },
];
