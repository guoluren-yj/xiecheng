import intl from 'utils/intl';

const indexDS = (nodeTemplateCode) => ({
  dataToJSON: 'normal',
  autoCreate: true,
  paging: false,
  forceValidate: true,
  fields: fieldsCondition(nodeTemplateCode),
});

const fieldsCondition = (nodeTemplateCode) => {
  const ASN = [
    // !doubleUnitEnabled && {
    //   name: 'actualQuantity',
    //   type: 'number',
    //   label: doubleUnitEnabled
    //     ? intl.get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity').d('本次创建基本数量')
    //     : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    // },
    {
      name: 'unitPackageQuantity',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
      // dynamicProps: {
      //   max: ({ record }) => record?.get('secondaryQuantity'),
      // },
    },
    {
      name: 'netWeight',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.netWeight').d('净重（KG)'),
    },
    {
      name: 'grossWeight',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.grossWeight').d('毛重（KG)'),
    },
    {
      name: 'lotNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.lotNum').d('批次号'),
    },
    {
      name: 'productionDate',
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.productionDate').d('生产日期'),
    },
    {
      name: 'lotExpirationDate',
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.lotExpirationDate').d('批次有效期'),
    },
    {
      name: 'serialNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.serialNum').d('序列号'),
    },
    {
      name: 'deliveryAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
    },
    {
      name: 'receiveAddress',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddress').d('收货地址'),
    },
    {
      name: 'purchaseLineRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseLineRemark').d('采购方行备注'),
    },
    {
      name: 'supplierLineRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierLineRemark').d('供应商行备注'),
    },
  ];
  const PLAN = [
    {
      name: 'plannedArrivalDate',
      type: 'date',
      label: intl
        .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
        .d('本次计划到货日期'),
    },
  ];
  const LABEL = [
    {
      name: 'unitPackageQuantity',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
    },
    {
      name: 'volumeLength',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeLength').d('体积长（CM)'),
    },
    {
      name: 'volumeWidth',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeWidth').d('体积宽（CM)'),
    },
    {
      name: 'volumeHeight',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.volumeHeight').d('体积高（CM)'),
    },
    {
      name: 'netWeight',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.netWeight').d('净重（KG)'),
    },
    {
      name: 'grossWeight',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.grossWeight').d('毛重（KG)'),
    },
  ];
  if (nodeTemplateCode === 'ASN') return ASN;
  if (nodeTemplateCode === 'PLAN') return PLAN;
  if (['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateCode)) return LABEL;
};

export { indexDS };
