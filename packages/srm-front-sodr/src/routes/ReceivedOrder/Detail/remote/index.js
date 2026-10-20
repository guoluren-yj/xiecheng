export default [
  { code: 'SODR.RECEIVEDORDER_DETAIL' },
  {
    process: {
      // 外部附件埋点
      processHeaderButtons(buttons) {
        return buttons;
      },
    },
  },
];
