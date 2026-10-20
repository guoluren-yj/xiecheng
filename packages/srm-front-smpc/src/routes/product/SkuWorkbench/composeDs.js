import intl from 'utils/intl';

const skuDs = () => ({
  paging: false,
  selection: false,
  fields: [
    {
      label: intl.get('smpc.product.model.displayOrderSeq').d('排序'),
      name: 'displayOrderSeq',
      type: 'number',
      help: intl
        .get('smpc.product.model.displayOrderSeq.helpInfo')
        .d('根据排序在主站搜索时优先展示'),
    },
    {
      label: intl.get('smpc.product.view.skuCode').d('商品编码'),
      name: 'skuCode',
    },
    {
      label: intl.get('smpc.product.view.skuName').d('商品名称'),
      name: 'skuName',
    },
    {
      name: 'itemCode',
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('smpc.product.model.itemName').d('物料名称'),
    },
  ],
});

const composeDs = () => ({
  autoCreate: true,
  fields: [
    {
      label: intl.get('smpc.product.view.primarySku').d('主商品'),
      name: 'skuId',
      valueField: 'skuId',
      textField: 'skuCodeName',
      required: true,
    },
  ],
});

export { skuDs, composeDs };
