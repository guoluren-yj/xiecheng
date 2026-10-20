export default [
  { code: 'SODR.ORDER_MAINTENANCE_LIST' },
  {
    process: {
      // 提交弱校验弹框内容埋点
      cuxSubmitValidate: undefined,
      getConfirmModalProps: () => {},
    },
  },
];
