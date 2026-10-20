export default [
  { code: 'SODR_MANUALCREATEION_REMOTE' },
  {
    process: {
      cuxSubmitValidate: undefined,
      // 点击单价/选择物料调用价格库带出字段
      handleIncludedPriceFcousSetFields: (fields) => fields,
      processReferPriceSetFields: (fields) => fields,
      // 订单头按钮组buttons
      processHeaderBtn(btns) {
        return btns;
      },
    },
  },
];
