import React from 'react';
import { showBigNumber } from '@/routes/components/utils';
import { yesOrNoRender } from 'utils/renderer';
import PlanAsnCmp from '@/routes/components/PlanAsn';

/**
 * tab页面参数
 * @menuMarkId 是否为数据池数据
 * @summarization 各个tab的页面
 * * */
// 待创建
export const createColumns = (_object) => {
  const { menuMarkId, summarization, doubleUnitEnabled } = _object;
  // 标签待创建
  const labelColumns = [
    {
      width: 120,
      name: 'itemCode', // 物料编码
    },
    {
      name: 'itemName', // 物料编码
      width: 120,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom', // 单位
      width: 80,
    },
    {
      name: 'displayUom', // 基本单位
      width: 80,
    },
    doubleUnitEnabled && {
      name: 'secondarySourceQuantity', // 来源单据数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'sourceQuantity', // 基本来源单据数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    doubleUnitEnabled && {
      name: 'secondaryCanCreateQuantity', // 可创建数量
      width: 100,
      renderer: ({ value, record }) => {
        if (Number(record?.get('unlimitedCreateFlag')) === 1) {
          return '+∞';
        }
        return showBigNumber(value);
      },
    },
    {
      name: 'canCreateQuantity', // 基本可创建数量
      width: 100,
      renderer: ({ value, record }) => {
        if (Number(record?.get('unlimitedCreateFlag')) === 1) {
          return '+∞';
        }
        return showBigNumber(value);
      },
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号-行号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'fromDisplayPoLocationNum', // 发运号
      width: 120,
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号-行号
      width: 180,
      renderer: ({ value, record }) => {
        // if (record.get('sourceType') !== 'PO') {
        //   if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
        // }
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
      // renderer: ({ value, record }) => {
      //   if (record.get('sourceType') !== 'PO') {
      //     return value;
      //   }
      // },
    },
    {
      name: 'lotNum', // 批次号
      width: 120,
    },
    {
      name: 'productionDate', // 生产日期
      width: 120,
    },
    {
      name: 'lotExpirationDate', // 批次有效期
      width: 120,
    },
    {
      name: 'serialNum', // 序列号
      width: 120,
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 170,
    },
    {
      name: 'agentName', // 采购员
      width: 120,
    },
    {
      name: 'purchaseOrgName', // 采购组织
      width: 150,
    },
    {
      name: 'invOrganizationName', // 收货组织
      width: 150,
    },
    {
      name: 'inventoryName', // 库房
      width: 130,
    },
    {
      name: 'locationName', // 库位
      width: 130,
    },
    {
      name: 'productNum', // 商品编码
      width: 130,
    },
    {
      name: 'productName', // 商品名称
      width: 120,
    },
    {
      name: 'poSourcePlatformMeaning', // 订单来源
      width: 100,
    },
    {
      name: 'poTypeName', // 订单类型
      width: 120,
    },
    {
      name: 'immedShippedFlag', // 是否直发
      width: 100,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'neededDate', // 需求日期
      width: 120,
    },
    {
      name: 'promisedDate', // 承诺交货日期
      width: 120,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  // 计划待创建
  const planColumns = [
    {
      name: 'itemCode', // 物料编码
      width: 120,
    },
    {
      // title: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
      name: 'itemName',
      width: 120,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom', // 单位
      width: 80,
    },
    {
      name: 'displayUom', // 基本单位
      width: 80,
    },
    doubleUnitEnabled && {
      name: 'secondarySourceQuantity', // 来源单据数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'sourceQuantity', // 基本来源单据数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    doubleUnitEnabled && {
      name: 'secondaryCanCreateQuantity', // 可创建数量
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'canCreateQuantity', // 基本可创建数量
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号-行号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'fromDisplayPoLocationNum', // 发运号
      width: 90,
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号-行号
      width: 180,
      renderer: ({ value, record }) => {
        // if (record.get('sourceType') !== 'PO') {
        //   if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
        // }
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
      // renderer: ({ value, record }) => {
      //   if (record.get('sourceType') !== 'PO') {
      //     return value;
      //   }
      // },
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 170,
    },
    {
      name: 'agentName', // 采购员
      width: 120,
    },
    {
      name: 'purchaseOrgName', // 采购组织
      width: 150,
    },
    {
      name: 'invOrganizationName', // 收货组织
      width: 140,
    },
    {
      name: 'inventoryName', // 库房
      width: 130,
    },
    {
      name: 'locationName', // 库位
      width: 130,
    },
    {
      name: 'productNum', // 商品编码
      width: 130,
    },
    {
      name: 'productName', // 商品名称
      width: 120,
    },
    {
      name: 'poSourcePlatformMeaning', // 订单来源
      width: 120,
    },
    {
      name: 'poTypeName', // 订单类型
      width: 100,
    },
    {
      name: 'immedShippedFlag', // 是否直发
      width: 100,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'neededDate', // 需求日期
      width: 120,
    },
    {
      name: 'promisedDate', // 承诺交货日期
      width: 120,
    },
    {
      name: 'strategyName', // 发货策略
      width: 180,
    },
    {
      name: 'deliveryAddress', // 发货地址
      width: 150,
    },
    {
      name: 'receiveAddress', // 收货地址
      width: 150,
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
  ];

  // 送货待创建
  const asnColumns = [
    {
      name: 'itemCode', // 物料编码
      width: 120,
    },
    {
      name: 'itemName', // 物料名称
      width: 120,
    },
    doubleUnitEnabled && {
      name: 'secondaryDisplayUom', // 单位
      width: 80,
    },
    {
      name: 'displayUom', // 基本单位
      width: 80,
    },
    doubleUnitEnabled && {
      name: 'secondarySourceQuantity', // 来源单据数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'sourceQuantity', // 基本来源单据数量
      width: 120,
      renderer: ({ value }) => showBigNumber(value),
    },
    doubleUnitEnabled && {
      name: 'secondaryCanCreateQuantity', // 可创建数量
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'canCreateQuantity', // 基本可创建数量
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'receiveQuantity', // 净接收
      width: 100,
      renderer: ({ value }) => showBigNumber(value),
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号-行号
      width: 180,
      renderer: ({ value, record }) => {
        if (value) return `${value}-${record.get('fromDisplayPoLineNum')}`;
      },
    },
    {
      name: 'fromDisplayPoLocationNum', // 发运号
      width: 120,
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号-行号
      width: 180,
      renderer: ({ value, record }) => {
        // if (record.get('sourceType') !== 'PO') {
        //   if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
        // }
        if (value) return `${value}-${record.get('sourceDisplayLineNum')}`;
      },
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      width: 120,
      // renderer: ({ value, record }) => {
      //   if (record.get('sourceType') !== 'PO') {
      //     return value;
      //   }
      // },
    },
    {
      name: 'poTypeName', // 订单类型
      width: 120,
    },
    {
      name: 'fromDisplayPoReleaseNum', // 发放号
      width: 120,
    },
    {
      name: 'supplierCompanyName', // 供应商
      width: 170,
    },
    {
      name: 'companyName', // 公司
      width: 150,
    },
    {
      name: 'poSourcePlatformMeaning', // 订单来源系统
      width: 130,
    },
    {
      name: 'neededDate', // 需求日期
      width: 120,
    },
    {
      name: 'promisedDate', // 承诺交货日期
      width: 120,
    },
    {
      name: 'immedShippedFlag', // 是否直发
      width: 100,
      renderer: ({ value }) => yesOrNoRender(+value),
    },
    {
      name: 'purchaseOrgName', // 采购组织
      width: 140,
    },
    {
      name: 'invOrganizationName', // 收货组织
      width: 140,
    },
    {
      name: 'deliveryAddress', // 发货地址
      width: 150,
    },
    {
      name: 'receiveAddress', // 收货地址
      width: 150,
    },
    {
      name: 'inventoryName', // 库房
      width: 130,
    },
    {
      name: 'locationName', // 库位
      width: 120,
    },
    {
      name: 'shipToLocContName', // 联系人
      width: 120,
    },
    {
      name: 'shipToLocTelNum', // 联系电话
      width: 120,
    },
    {
      name: 'agentName', // 采购员
      width: 120,
    },
    {
      name: 'categoryName', // 物料类别
      width: 120,
    },
    {
      name: 'productNum', // 商品编码
      width: 130,
    },
    {
      name: 'productName', // 商品名称
      width: 120,
    },
    {
      name: 'catalogName', // 商品目录
      width: 120,
    },
    {
      name: 'projectTaskId',
      width: 110,
      hidden: true,
    },
    {
      name: 'planAsnTitle', // 送货计划
      width: 80,
      renderer: ({ record }) => (
        <PlanAsnCmp
          campKey="s"
          hidden={record?.get('consultPlanCreateFlag') !== 1}
          fromPoLineLocationId={record?.get('fromPoLineLocationId')}
          consultPlanNodeId={record?.get('consultPlanNodeId')}
        />
      ),
    },
  ];
  if (menuMarkId === 'all') {
    let columns;
    switch (summarization) {
      case 'PLAN':
        columns = planColumns;
        break;
      case 'ASN':
        columns = asnColumns;
        break;
      case 'LABEL':
        columns = labelColumns;
        break;
      case 'UNIQUE_LABEL':
        columns = labelColumns;
        break;
      default:
        // columns=labelColumns;
        break;
    }
    return columns;
  } else {
    if (summarization === 'PLAN') return planColumns; // 计划
    if (summarization === 'ASN') return asnColumns; // 送货
    if (summarization === 'LABEL') return labelColumns; // 标签
    if (summarization === 'UNIQUE_LABEL') return labelColumns; // 唯一标签
  }
};
