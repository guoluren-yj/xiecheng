export default [
  { code: 'SODR.SENDORDER_DETAIL' },
  {
    process: {
      // 关联单据右侧表格columns
      associatedInvoiceColumns(columns) {
        return columns;
      },
      // 外部附件埋点
      externalAttachments(attachment) {
        return attachment;
      },
      // 是否绑定外部附件uuid到订单
      isBindUUIDtoHeader(_) {
        return _;
      },
    },
  },
];
