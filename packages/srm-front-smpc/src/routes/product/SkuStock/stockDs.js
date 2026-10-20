import { getCurrentOrganizationId, getUserOrganizationId } from 'utils/utils';
import intl from 'utils/intl';
import { SRM_SMPC } from '_utils/config';
import { maxSMPCMessageValidator } from '@/utils/validator';

const organizationId = getCurrentOrganizationId();
const userOrganizationId = getUserOrganizationId();

const getStockListDs = ({ isSup = false, stockType = 'SALE', customizeUnitCode }) => ({
  autoQuery: false,
  fields: [
    {
      name: 'skuCode',
      type: 'string',
      label: intl.get('smpc.product.model.skuCode').d('商品编码'),
    },
    {
      name: 'productInfo',
      type: 'string',
      label: intl.get('smpc.product.model.productInfo').d('商品信息'),
    },
    {
      name: 'itemCode',
      label: intl.get('smpc.product.model.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      label: intl.get('smpc.product.model.itemName').d('物料名称'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('smpc.product.model.supplier').d('供应商'),
    },
    {
      name: 'warningStock',
      type: 'number',
      label: intl.get('smpc.product.model.warningStock').d('提醒阈值'),
    },
    {
      name: 'consumedStock',
      type: 'number',
      label: intl.get('smpc.product.model.consumeStock').d('消耗库存'),
    },
    {
      name: 'surplusStock',
      type: 'number',
      label: intl.get('smpc.product.model.surplusStock').d('可用库存'),
    },
    {
      name: 'totalStock',
      type: 'number',
      label: intl.get('smpc.product.model.totalStock').d('总库存'),
    },
    {
      name: 'inventoryName',
      label: intl.get('smpc.product.view.storeroom').d('库房'),
    },
    {
      name: 'stockTypeMeaning',
      label: intl.get('smpc.product.model.stockType').d('库存类型'),
    },
    {
      name: 'replenishmentStock',
      type: 'number',
    },
    {
      name: 'action',
      label: intl.get('hzero.common.action').d('操作'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const url = isSup
        ? `${SRM_SMPC}/v1/${organizationId}/sku-stocks/supplier`
        : `${SRM_SMPC}/v1/${organizationId}/sku-stocks`;
      return {
        url,
        method: 'GET',
        data: { ...data, stockType, customizeUnitCode },
      };
    },
    submit: ({ data }) => {
      return {
        url: `${SRM_SMPC}/v1/${organizationId}/sku-stocks`,
        method: 'PUT',
        data,
      };
    },
  },
});

const getStockCreateDs = (isSup, stockType) => {
  const skuLovPara = { tenantId: organizationId };
  const skuLovCode =
    stockType === 'SALE'
      ? 'SMPC.CATA_SKU_NOT_EXIST_STOCK'
      : 'SMPC.CATA_SKU_NOT_EXIST_STOCK_RECEIVE';
  if (isSup) skuLovPara.supplierTenantId = userOrganizationId;
  return {
    autoCreate: false,
    fields: [
      {
        name: 'skuLov',
        type: 'object',
        lovCode: skuLovCode,
        required: true,
        valueField: 'skuId',
        textField: 'skuCode',
        ignore: 'always',
        lovPara: skuLovPara,
        label: intl.get('smpc.product.model.skuCode').d('商品编码'),
      },
      {
        name: 'skuId',
        bind: 'skuLov.skuId',
      },
      {
        name: 'skuCode',
        bind: 'skuLov.skuCode',
      },
      {
        name: 'skuName',
        bind: 'skuLov.skuName',
        disabled: true,
        label: intl.get('smpc.product.view.skuName').d('商品名称'),
      },
      {
        name: 'supplierCompanyName',
        bind: 'skuLov.supplierCompanyName',
        disabled: true,
        label: intl.get('smpc.product.model.supplier').d('供应商'),
      },
      {
        name: 'stockType',
        disabled: true,
        lookupCode: 'SMPC.STOCK_TYPE',
        // defaultValue: 'SALE', // RECEIVE
        label: intl.get('smpc.product.model.stockType').d('库存类型'),
      },
      {
        name: 'inventoryLov',
        type: 'object',
        ignore: 'always',
        lovCode: 'HPFM.INVENTORY',
        lovPara: { tenantId: organizationId, enabledFlag: 1 },
        valueField: 'inventoryId',
        textField: 'inventoryName',
        label: intl.get('smpc.product.view.storeroom').d('库房'),
        dynamicProps: {
          required: ({ record }) => record.get('stockType') === 'RECEIVE',
        },
      },
      {
        name: 'inventoryId',
        bind: 'inventoryLov.inventoryId',
      },
      {
        name: 'warningStock',
        min: 0,
        step: 1,
        // max: '99999999999999999999',
        label: intl.get('smpc.product.model.warningStock').d('提醒阈值'),
        validator: maxSMPCMessageValidator,
      },
      {
        name: 'totalStock',
        min: 1,
        step: 1,
        validator: maxSMPCMessageValidator,
        label: intl.get('smpc.product.model.totalStock').d('总库存'),
        required: true,
      },
    ],
    transport: {
      submit: ({ data }) => {
        return {
          url: `${SRM_SMPC}/v1/${organizationId}/sku-stocks/save`,
          method: 'POST',
          data: data[0],
        };
      },
    },
  };
};

const getStockEditDs = () => ({
  autoCreate: true,
  fields: [
    {
      name: 'stockOpt',
      required: true,
      label: intl.get('hzero.common.action').d('操作'),
      lookupCode: 'SMPC.SKU_STOCK_OPT',
      // defaultValue: 'INC',
    },
    {
      name: 'replenishmentStock',
      label: intl.get('smpc.product.model.stock').d('库存'),
      min: 0,
      step: 1,
      validator: maxSMPCMessageValidator,
      dynamicProps: {
        required: ({ record }) => ['INC', 'DEC'].includes(record.get('stockOpt')),
      },
    },
    {
      name: 'warningStock',
      label: intl.get('smpc.product.model.warningStock').d('提醒阈值'),
      type: 'number',
      min: 0,
      step: 1,
      // max: '99999999999999999999',
      validator: maxSMPCMessageValidator,
      dynamicProps: {
        required: ({ record }) => record.get('stockOpt') === 'SETWARNING',
      },
    },
    {
      name: 'remark',
      label: intl.get('smpc.product.model.remark').d('备注'),
      maxLength: 180,
      dynamicProps: {
        required: ({ record }) => record.get('stockOpt') === 'DEC',
      },
    },
  ],
});

// const getRecordQueryFields = (isSup) => {
//   const queryFields = [
//     {
//       name: 'creatimeDateFrom',
//       type: 'dateTime',
//       max: 'creatimeDateTo',
//       label: intl.get('smpc.workbench.model.operateTimeFrom').d('操作时间从'),
//     },
//     {
//       name: 'creatimeDateTo',
//       type: 'dateTime',
//       min: 'creatimeDateFrom',
//       label: intl.get('smpc.workbench.model.operateTimeTo').d('操作时间至'),
//     },
//     // 库存记录采 为文本库, 不可放在lov形式后面，会覆盖
//     {
//       name: 'operate',
//       type: 'string',
//       label: intl.get('smpc.workbench.model.operatedBy').d('操作人'),
//       show: !isSup,
//     },
//     {
//       name: 'operate',
//       type: 'object',
//       ignore: 'always',
//       label: intl.get('smpc.workbench.model.operatedBy').d('操作人'),
//       lovCode: 'HIAM.TENANT.USER',
//       lovPara: { organizationId },
//       valueField: 'id',
//       textField: 'realName',
//       show: isSup,
//     },
//     {
//       name: 'operationUser',
//       bind: 'operate.id',
//       show: isSup,
//     },
//   ];
//   return queryFields.filter((f) => f.show !== false);
// };

const getStockRecordDs = () => ({
  selection: false,
  autoQuery: false,
  // queryFields: getRecordQueryFields(isSup),
  fields: [
    {
      name: 'realName',
      label: intl.get('smpc.workbench.model.operatedBy').d('操作人'),
    },
    {
      name: 'operationCodeMeaning',
      label: intl.get('smpc.workbench.model.operateType').d('操作类型'),
    },
    {
      name: 'quantity',
      type: 'number',
      label: intl.get('smpc.workbench.view.operateContent').d('操作内容'),
    },
    {
      name: 'availableStock',
      type: 'number',
      label: intl.get('smpc.product.view.availableStock').d('当前可用库存'),
    },
    {
      name: 'remarkMeaning',
      type: 'string',
      label: intl.get('smpc.product.model.remark').d('备注'),
    },
    {
      name: 'operationTime',
      type: 'dateTime',
      label: intl.get('smpc.workbench.view.operateTime').d('操作时间'),
    },
  ],
  transport: {
    read: ({ data }) => ({
      ...data,
      url: `${SRM_SMPC}/v1/${organizationId}/sku-stock-records`,
      method: 'GET',
    }),
  },
});

const getNewStockRecordDs = () => ({
  selection: false,
  pageSize: 20,
  autoQuery: false,
  fields: [
    {
      name: 'operationUserName',
      label: intl.get('smpc.workbench.model.operatedBy').d('操作人'),
    },
    {
      name: 'operationTime',
      type: 'dateTime',
      label: intl.get('smpc.workbench.view.operateTime').d('操作时间'),
    },
    {
      name: 'transactionTypeMeaning',
      label: intl.get('smpc.workbench.view.transactionTypeMeaning').d('事务类型'),
    },
    {
      name: 'operationTypeMeaning',
      label: intl.get('smpc.workbench.view.operationTypeMeaning').d('事务动作'),
    },
    {
      name: 'modifiedNum',
      type: 'number',
      label: intl.get('smpc.workbench.view.transactionNum').d('事务数量'),
    },
    {
      name: 'sourceCode',
      label: intl.get('smpc.workbench.view.sourceCode').d('来源单据号'),
    },
    {
      name: 'sourceLineCode',
      label: intl.get('smpc.workbench.view.sourceLineCode').d('来源单据行号'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('smpc.product.model.remark').d('备注'),
    },
  ],
  transport: {
    read: {
      url: `/stck/v1/${organizationId}/stock-transactions`,
      method: 'GET',
    },
  },
});

export { getStockListDs, getStockEditDs, getStockCreateDs, getStockRecordDs, getNewStockRecordDs };
