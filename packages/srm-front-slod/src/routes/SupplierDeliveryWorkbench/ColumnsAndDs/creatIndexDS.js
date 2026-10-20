import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const createDS = (id, _, doubleUnitEnabled) => ({
  primaryKey: id,
  cacheSelection: true, // 跨页勾选
  pageSize: 20,
  fields: [
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
      name: 'itemCode', // 物料编码
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName', // 物料名称
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryDisplayUom').d('单位'),
      name: 'secondaryDisplayUom', // 单位
      type: 'string',
    },
    {
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
      name: 'displayUom', // 基本单位
      type: 'string',
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondaryCanCreateQuantity')
        .d('可创建数量'),
      name: 'secondaryCanCreateQuantity', // 可创建数量
      type: 'number',
    },
    {
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseCanCreateQuantity').d('可创建基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
      name: 'canCreateQuantity', // 基本可创建数量
      type: 'number',
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondarySourceQuantity')
        .d('来源单据数量'),
      name: 'secondarySourceQuantity', // 来源单据数量
      type: 'number',
    },
    {
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseSourceQuantity').d('来源单据基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
      name: 'sourceQuantity', // 基本来源单据数量
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
      name: 'fromDisplayPoNum', // 来源订单号-行号 fromDisplayPoLineNum 行号
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoLocationNum').d('发运号'),
      name: 'fromDisplayPoLocationNum', // 发运号
      type: 'string',
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
      name: 'sourceDisplayNum', // 来源单据编号-行号 sourceDisplayLineNum 行号
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.sourceTypeMeaning').d('来源单据类型'),
      name: 'sourceNodeConfigName', // 来源单据类型
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.lotNum').d('批次号'),
      name: 'lotNum', // 批次号
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.productionDate').d('生产日期'),
      name: 'productionDate', // 生产日期
      type: 'date',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.lotExpirationDate').d('批次有效期'),
      name: 'lotExpirationDate', // 批次有效期
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.serialNum').d('序列号'),
      name: 'serialNum', // 序列号
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.companyName').d('公司'),
      name: 'companyName', // 公司
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
      name: 'supplierCompanyName', // 供应商
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.agentName').d('采购员'),
      name: 'agentName', // 采购员
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseOrgName').d('采购组织'),
      name: 'purchaseOrgName', // 采购组织
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织'),
      name: 'invOrganizationName', // 收货组织
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.inventoryName').d('库房'),
      name: 'inventoryName', // 库房
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.locationName').d('库位'),
      name: 'locationName', // 库位
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.productNum').d('商品编码'),
      name: 'productNum', // 商品编码
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.productName').d('商品名称'),
      name: 'productName', // 商品名称
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.poSourceCode').d('订单来源'),
      name: 'poSourcePlatformMeaning', // 订单来源
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.poTypeCode').d('订单类型'),
      name: 'poTypeName', // 订单类型
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.immedShippedFlag').d('是否直发'),
      name: 'immedShippedFlag', // 是否直发
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.neededDate').d('需求日期'),
      name: 'neededDate', // 需求日期
      type: 'date',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.promisedDate').d('承诺交货日期'),
      name: 'promisedDate', // 承诺交货日期
      type: 'date',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.strategyName').d('发货策略'),
      name: 'strategyName', // 发货策略
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
      name: 'deliveryAddress', // 发货地址   计划-待创建
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
      name: 'receiveAddress', // 收货地址 计划-待创建
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.receiveQuantity').d('净接收'),
      name: 'receiveQuantity', // 净接收 送货-待创建
      type: 'number',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoReleaseNum').d('发放号'),
      name: 'fromDisplayPoReleaseNum', // 发放号   送货-待创建
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.poSourcePlatform').d('订单来源系统'),
      name: 'poSourcePlatformMeaning', // 订单来源系统  送货-待创建
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocContName').d('联系人'),
      name: 'shipToLocContName', // 联系人  送货-待创建
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocTelNum').d('联系电话'),
      name: 'shipToLocTelNum', // 联系电话  送货-待创建
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.categoryNames').d('物料类别'),
      name: 'categoryName', // 物料类别  送货-待创建
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.catalogName').d('商品目录'),
      name: 'catalogName', // 商品目录  送货-待创建
      type: 'string',
    },
    {
      name: 'projectTaskId',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.projectTaskId').d('项目任务名称'),
    },
    {
      name: 'planAsnTitle',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.planAsnTitle').d('送货计划'),
    },
  ],
  transport: {
    read: ({ data, params: _p }) => {
      const { params, ...other } = data;
      const { nodeTemplateCode, nodeConfigId } = params || {};
      const queryData = filterNullValueObject({ ...params, ...other });
      let param;
      if (data.customizeUnitCode) {
        const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } =
          data.tplInfo || {};
        param = {
          ..._p,
          customizeUnitCode: data.customizeUnitCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/wait-create/line/page`,
        method: 'GET',
        param,
        data: queryData,
      };
    },
  },
});
export { createDS };
