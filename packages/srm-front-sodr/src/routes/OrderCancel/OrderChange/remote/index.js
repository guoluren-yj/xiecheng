export default [
  { code: 'SODR.ORDER_CHANGE_H0' },
  {
    process: {
      // 提交弱校验弹框内容埋点
      getConfirmModalProps: () => {},
      // 头按钮组埋点
      processHeaderBtnsRender: (buttons) => buttons,
    },
  },
];
