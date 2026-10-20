export default [
  {
    code: 'SODR.ORDER_MAINTENANCE_SEARCHFORTHESOURCE',
  },
  {
    process: {
      cuxSubmitValidate: undefined,
      // 订单头按钮组buttons
      processHeaderBtn(btns) {
        return btns;
      },
    },
  },
];
