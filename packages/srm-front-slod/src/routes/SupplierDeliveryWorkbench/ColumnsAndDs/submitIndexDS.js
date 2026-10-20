import { SRM_SLOD } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';

import intl from 'utils/intl';

const organizationId = getCurrentOrganizationId();

const submitDS = (id, _, hdkey, doubleUnitEnabled) => ({
  primaryKey: id,
  cacheSelection: true, // 跨页勾选
  pageSize: 20,
  fields: [
    {
      label: intl.get('slod.deliveryWorkbench.model.common.statusCodeMeaning').d('状态'),
      name: 'statusCodeMeaning', // 状态
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.statusCodeMeaning').d('状态'),
      name: 'lineStatusMeaning', // 行状态
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.displayPlanNum').d('单据编号'),
      name: 'displayAsnNum', // 单据编号 头-行 -送货
      type: 'string',
    },
    {
      label: ['right'].includes(hdkey)
        ? intl.get('slod.deliveryWorkbench.model.common.displayAsnNums').d('单据编号-行号')
        : intl.get('slod.deliveryWorkbench.model.common.displayPlanNum').d('单据编号'),
      name: 'displayPlanNum', // 单据编号 头-行- 标签
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.displayPlanNum').d('单据编号'),
      name: 'displayLabelNum', // 单据编号 头-行- 计划
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
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
      name: 'createdName', // 创建人
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.creationDate').d('创建时间'),
      name: 'creationDate', // 创建时间
      type: 'dateTime',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.strategyName').d('发货策略'),
      name: 'strategyName', // 发货策略
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.operating').d('操作记录'),
      name: 'operating', // 操作记录
      type: 'string',
    },
    {
      label: ['left'].includes(hdkey)
        ? intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织')
        : intl.get('slod.deliveryWorkbench.model.common.repertoryName').d('库存组织'),
      name: 'invOrganizationName', // 收货组织 计划- 待提交
      type: 'string',
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.sourceCodeMeaning').d('来源系统'),
      name: 'sourceCodeMeaning', // 来源系统 计划- 待提交- 独立值集
      type: 'string',
    },
    {
      name: 'itemCode', // 物料编码 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName', // 物料名称 行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
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
      name: 'secondaryQuantity', // 本次计划数量  计划  行
      type: 'number',
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondaryPresentQuantity')
        .d('本次计划数量'),
    },
    {
      name: 'actualQuantity', // 基本 本次计划数量  计划  行
      type: 'number',
      label:
        doubleUnitEnabled && ['right'].includes(hdkey)
          ? intl
              .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
              .d('本次计划基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量'),
    },
    {
      name: 'plannedArrivalDate', // 本次计划到货日期 计划  行
      type: 'date',
      label: intl
        .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
        .d('本次计划到货日期'),
    },
    {
      name: 'fromDisplayPoNum', // 来源订单号-行号 fromDisplayPoLineNum 行号  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
    },
    {
      name: 'sourceDisplayNum', // 来源单据编号-行号   sourceDisplayLineNum 行号  行
      type: 'string',
      label: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.sourceType').d('来源单据类型'),
    },
    {
      name: 'neededDate', // 需求日期  行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.neededDate').d('需求日期'),
    },
    {
      name: 'promisedDate', // 承诺交货日期  计划  行
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.promisedDate').d('承诺交货日期'),
    },
    {
      name: 'agentName', // 采购员  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.agentName').d('采购员'),
    },
    {
      name: 'categoryName', // 品类  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.categoryName').d('品类'),
    },
  ],
  transport: {
    read: ({ data, params: _p }) => {
      const { params, ...other } = data;
      const { nodeTemplateCode, nodeConfigId, hdKey } = params || {};
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
      const url = hdKey === 'left' ? `wait-submit/header/page` : `wait-submit/line/page`;
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/${url}`,
        method: 'GET',
        param,
        data: queryData,
      };
    },
  },
});

export { submitDS };
