const supPermissions = [
  // 【批量生效】，【批量失效】，【基础数据下载】【新建商品】 - 商品工作台（供）-操作头 -button
  {
    name: 'batchValid',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.supplierHeader`,
  },
  {
    name: 'batchInvalid',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.supplierHeader`,
  },
  {
    name: 'baseDownload',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.supplierHeader`,
  },
  {
    name: 'batchExport',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.supplierHeader`,
  },
  {
    name: 'skuCreate',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.supplierHeader`,
  },
  {
    name: 'skuBatchImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.batch-import-new',
  },
  // 【商品组合】 商品工作台（供）- 商品组合
  {
    name: 'skuCompose',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.compose`,
  },
  // 【批量导出】商品工作台供-(新)批量导出
  {
    name: 'batchExportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.cata-sku-export-new',
  },
  // 【批量提交】
  {
    name: 'batchSubmit',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.supplierHeader`,
  },
  // 【批量编辑】
  {
    name: 'batchEdit',
    code: `srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.supplierHeader`,
  },
  // 【导入库存新】 商品工作台供-(新)导入库存
  {
    name: 'stockImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.stock-import-new',
  },
  // 【(新)便捷修改】  商品工作台供-(新)便捷修改
  {
    name: 'fastUpdateNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.fast-update-import-new',
  },
  // 【批量修改商品信息-旧】 商品工作台供-批量修改商品信息
  {
    name: 'batchUpdateSku',
    code:
      'srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.batch-edit-sku.import',
  },
  // 【(新)批量修改商品信息】
  {
    name: 'batchUpdateSkuNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-sup.smpc.sku-workbench-sup.list.button.batch-edit-sku.import-new',
  },
];

const purPermissions = [
  // 商品工作台采-(新)引用价格库导入
  {
    name: 'quotePriceImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.button.priceLib-import-newpriceLib-import-new',
  },
  // 商品工作台采-(新)商品批量导入
  {
    name: 'skuBatchImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.batch-import-new',
  },
  // 商品工作台（采）-可编辑商品权限
  {
    name: 'skuCreate',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【新建领用商品】
  {
    name: 'receiveCreateGroup',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【生成领用商品】
  {
    name: 'ecCreateReceive',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【批量弃用】
  {
    name: 'batchDeprecation',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【分配领用规则】
  {
    name: 'allocateReceiveRule',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【批量恢复】
  {
    name: 'batchLive',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【批量提交】
  {
    name: 'batchSubmit',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【批量审批】 商品工作台（采）-批量审批
  {
    name: 'batchApprove',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.approve',
  },
  // 【生成领用商品】
  {
    name: 'createReceiveMain',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【批量编辑】
  {
    name: 'batchEdit',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'stockImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.stock-import-new',
  },
  // 【批量生效】
  {
    name: 'batchValid',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【批量恢复】商品工作台（采）-电商商品高级权限集
  {
    name: 'batchRestore',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc',
  },
  // 【领用规则管理】
  {
    name: 'receiveRuleManage',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 【导入图片】
  {
    name: 'receiveImageImport',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'batchCancel', // 【批量弃用】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc',
  },
  {
    name: 'skuComment', // 【商品评价管理】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc',
  },
  {
    name: 'sameSkuFeedback', // 【同款商品反馈管理】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc',
  },
  {
    name: 'skuOptsImport', // 【导入商品操作】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 商品工作台采-(新)导入商品操作
  {
    name: 'skuOptsImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.sku-opts-import-new',
  },
  // '商品工作台采-按商品条件批量操作',
  {
    name: 'skuConditionOperate',
    code: 'srm.mall.tenant.product-center.sku-workbench-pur.button.sku-condition-operate',
  },
  {
    name: 'ecSkuEdit', // 【编辑商品信息】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'skuFeedback',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc',
  },
  {
    name: 'batchDeleteRemark', // 【批量删除备注】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'batchUpdateSku', // 【批量修改商品信息】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'batchUpdateSkuNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.batch-edit-sku.import-new',
  },
  {
    name: 'skuLabelConfig', // 【商品标签定义】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'skuComment', // 【商品评价管理】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'labelImport', // 【导入标签】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'labelImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.label-import-new',
  },
  {
    name: 'skuOptsImport', // 【导入商品操作】
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  // 商品工作台采-(新)导入商品操作
  {
    name: 'skuOptsImportNew',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.sku-opts-import-new',
  },
  {
    name: 'custSkuTemp', // [定制品属性模版管理]
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'batchInvalid', // [批量失效]
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.editSkuAuth',
  },
  {
    name: 'batchShelf', // 商品工作台（采）-批量上下架
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.shelf',
  },
  {
    name: 'batchUnshelf',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.shelf',
  },
  {
    name: 'ecBatchShelf',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc',
  },
  {
    name: 'ecBatchUnshelf',
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.purchaseEc',
  },
  {
    name: 'skuCompose', // 商品工作台（采）- 商品组合
    code:
      'srm.mall.tenant.product-center.sku-workbench-pur.smpc.sku-workbench-pur.list.button.compose',
  },
  {
    name: 'newPackageSku', // 商品工作台（采）- 新建套餐商品
    code: 'srm.mall.tenant.product-center.sku-workbench-pur.button.new-package-sku',
  },
  {
    name: 'cataBatchUpdateStock',
    code: 'srm.mall.tenant.product-center.sku-workbench-pur.button.cata-batch-update-stock',
  },
];

export { supPermissions, purPermissions };
