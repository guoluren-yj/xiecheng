export default [
  { code: 'SODR.ORDER_CHANGE_C7N' },
  {
    process: {
      // 提交弱校验弹框内容埋点
      getConfirmModalProps: () => {},
      detailLineButtons: undefined,
    },
    events: {
      onSubmit(eventProps) {
        const { onSubmit } = eventProps || {};
        if (onSubmit) onSubmit();
      },
    },
  },
];
