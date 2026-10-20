export default [
  {
    code: 'SODR.SENDORDER_LIST',
  },
  {
    process: {
      // 整单查询额外表单字段埋点
      listFilterExtraForm() {},
      // 明细查询额外表单字段埋点
      detailFilterExtraForm() {},
    },
  },
];
