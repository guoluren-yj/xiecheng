import intl from 'utils/intl';

const feedbackGetVerification = () => ({
  fields: [
    {
      name: 'displayPoNumAndLineNum',
      label: intl
        .get('sodr.common.model.common.purchaseOrderNumberAndLineNumber')
        .d('采购订单号-行号'),
    },
    {
      name: 'itemCode',
      label: intl.get('sodr.common.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('sodr.common.model.common.materialDescription').d('物料描述'),
    },
    {
      name: 'closeOrCancelQuantity',
      label: intl.get('sodr.common.model.common.clsoeOrCancelQuantity').d('取消/关闭数量'),
    },
    {
      name: 'uomCodeAndName',
      label: intl.get('sodr.common.model.common.unitName').d('单位'),
    },
  ],
});

export { feedbackGetVerification };
