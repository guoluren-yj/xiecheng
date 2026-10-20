export default [
  { code: 'SODR.PURCHASE_ORDER_MAINTAIN.PURCHASING_REQUISITION' },
  {
    process: {
      // 订单头按钮组buttons
      processHeaderBtn(btns) {
        return btns;
      },
      // 外部附件是否需要调用接口绑定uuid到订单
      isBindUUIDtoHeader(_) {
        return _;
      },
      // 绑定uuid接口调用结束后所需更新的state
      getHeaderAttachmentUuidStates(state) {
        return state;
      },
    },
  },
];
