import { SRM_SLOD, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';
import { SLOD_DIRECTORY } from '@/utils/constant';
import { isNil } from 'lodash';

const organizationId = getCurrentOrganizationId();

const statusValidate = (record) => {
  return ['CONFIRMED', 'CHANGE_SUPPLIER_REJECTED', 'CHANGE_PURCHASER_REJECTED']?.includes(
    record.get('lineStatus')
  );
};

const lineListDataSet = ({ id, change, unitLineCode, nodeTemplateType, doubleUnitEnabled }) => ({
  dataToJSON: 'all',
  primaryKey: id,
  pageSize: 20,
  autoQuery: false,
  selection: 'multiple',
  modifiedCheck: false,
  forceValidate: true,
  fields: [
    {
      name: 'lineExportStatusMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.exportStatus').d('导出记录'),
    },
    {
      name: 'lineStatusMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.lineStatus').d('状态'),
    },
    {
      name: 'action', // 操作
      type: 'string',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    {
      name: 'displayLabelLineNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayPlanLineNum').d('行号'),
    },
    {
      name: 'displayPlanLineNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayPlanLineNum').d('行号'),
    },
    {
      name: 'displayAsnLineNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.displayPlanLineNum').d('行号'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
    },
    {
      name: 'secondaryDisplayUom',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryDisplayUom').d('单位'),
    },
    {
      name: 'displayUom',
      type: 'string',
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.displayUom').d('基本单位')
        : intl.get('slod.deliveryWorkbench.model.common.uomName').d('单位'),
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondarySourceQuantity')
        .d('来源单据数量'),
      name: 'secondarySourceQuantity', // 来源单据数量
      type: 'number',
    },
    {
      name: 'sourceQuantity',
      type: 'number',
      // min: 0.000001,
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.BaseSourceQuantity').d('来源单据基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
    },
    {
      label: intl
        .get('slod.deliveryWorkbench.model.common.secondaryCanCreateQuantity')
        .d('可创建数量'),
      name: 'secondaryCanCreateQuantity', // 可创建数量
      type: 'number',
    },
    {
      name: 'canCreateQuantity',
      type: 'number',
      // min: 0.000001,
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseCanCreateQuantity').d('可创建基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
    },
    {
      name: 'secondaryQuantity', // 本次计划数量  计划  行
      type: 'number',
      label:
        nodeTemplateType === 'PLAN'
          ? intl
              .get('slod.deliveryWorkbench.model.common.secondaryPresentQuantity')
              .d('本次计划数量')
          : intl
              .get('slod.deliveryWorkbench.model.common.secondaryThisTimeuantity')
              .d('本次创建数量'),
    },
    {
      name: 'actualQuantity', // 本次创建数量  本次计划数量
      type: 'number',
      label:
        nodeTemplateType === 'PLAN'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                .d('本次计划基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
          : doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
      dynamicProps: {
        min: ({ record }) => {
          if (
            change &&
            !['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateType) &&
            statusValidate(record)
          ) {
            if ([0, '0'].includes(record.get('uomPrecision'))) {
              return 1;
            }
            const uomPrecision = !isNil(record.get('uomPrecision'))
              ? record.get('uomPrecision')
              : 10;
            const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
            return textNum;
          }
        },
        required: ({ record }) =>
          change && ['PLAN', 'ASN'].includes(nodeTemplateType) && statusValidate(record),
      },
    },
    {
      name: 'fillSecondaryQuantity', // 本次确认数量
      type: 'number',
      required: true,
      label:
        nodeTemplateType === 'UNIQUE_LABEL'
          ? intl
              .get('slod.deliveryWorkbench.model.common.secondaryThisTimeuantitys')
              .d('本单已生成标签数量')
          : nodeTemplateType === 'LABEL'
          ? intl
              .get('slod.deliveryWorkbench.model.common.secondaryThisTimeuantity')
              .d('本次创建数量')
          : intl.get('slod.deliveryWorkbench.model.common.secondaryAffirmNumber').d('确认数量'),
    },
    {
      name: 'quantity', // 本次确认数量
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      required: true,
      label:
        nodeTemplateType === 'UNIQUE_LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantitys')
                .d('本单已生成标签基本数量')
            : intl
                .get('slod.deliveryWorkbench.model.common.thisTimeuantitys')
                .d('本单已生成标签数量')
          : nodeTemplateType === 'LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
                .d('本次创建基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量')
          : doubleUnitEnabled
          ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmNumber').d('确认基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
      dynamicProps: {
        min: ({ record }) => {
          if (
            change &&
            !['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateType) &&
            statusValidate(record)
          ) {
            if ([0, '0'].includes(record.get('uomPrecision'))) {
              return 1;
            }
            const uomPrecision = !isNil(record.get('uomPrecision'))
              ? record.get('uomPrecision')
              : 10;
            const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
            return textNum;
          }
        },
        required: ({ record }) =>
          change && ['PLAN', 'ASN'].includes(nodeTemplateType) && statusValidate(record),
      },
    },
    {
      name: 'unitPackageQuantity',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
      dynamicProps: {
        min: () => {
          if (['ASN'].includes(nodeTemplateType)) {
            return 0;
          }
        },
      },
    },
    {
      name: 'packageQuantity',
      type: 'number',
      // min: 0.000001,
      label: intl.get('slod.deliveryWorkbench.model.common.packageQuantity').d('比例份数'),
    },
    {
      name: 'remainderQuantity',
      type: 'number',
      // min: 0.000001,
      label: intl.get('slod.deliveryWorkbench.model.common.remainderQuantity').d('尾数'),
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
      name: 'purchaseLineRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseLineRemark').d('采购方行备注'),
    },
    {
      name: 'supplierLineRemark',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierLineRemark').d('供应商行备注'),
    },
    {
      name: 'fromDisplayPoNum',
      type: 'string', // fromDisplayPoLineNum
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoNum').d('来源订单号-行号'),
    },
    {
      name: 'sourceDisplayNum',
      type: 'string', // sourceDisplayLineNum
      label: intl
        .get('slod.deliveryWorkbench.model.common.sourceDisplayNum')
        .d('来源单据编号-行号'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierCompanyName').d('供应商'),
    },
    {
      name: 'occupiedQuantity',
      type: 'number',
      max: MAX_BIGNUMBER_NUMBER,
      // min: 0.000001,
      label: intl.get('slod.deliveryWorkbench.model.common.occupiedQuantity').d('占用数量'),
    },
    {
      name: 'fromDisplayPoLocationNum', // 发运号
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoLocationNum').d('发运号'),
    },
    {
      name: 'plannedArrivalDate', // 本次计划到货日期
      type: 'date',
      required: ['PLAN'].includes(nodeTemplateType),
      label: intl
        .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
        .d('本次计划到货日期'),
    },
    {
      name: 'confirmArrivalDate', // 确认到货日期  头-行
      type: 'date',
      required: ['PLAN'].includes(nodeTemplateType),
      label: intl.get('slod.deliveryWorkbench.model.common.confirmArrivalDate').d('确认到货日期'),
    },
    {
      name: 'sourceNodeConfigName', // 来源单据类型
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.sourceType').d('来源单据类型'),
    },
    {
      name: 'neededDate', // 需求日期
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
      name: 'deliveryAddress', // 发货地址   行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
    },
    {
      name: 'receiveAddress', // 收货地址   行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.takeReceiveAddres').d('收货地址'),
    },
    {
      name: 'categoryName', // 品类  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.categoryName').d('品类'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.invOrganizationName').d('收货组织'),
    },
    {
      name: 'weightUomId', // 重量单位  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.weightUomName').d('重量单位'),
    },
    {
      name: 'shipToLocContName', // 联系人  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocContName').d('联系人'),
    },
    {
      name: 'shipToLocTelNum', // 联系电话  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.shipToLocTelNum').d('联系电话'),
    },
    {
      name: 'productNum', // 商品编码  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.productNum').d('商品编码'),
    },
    {
      name: 'productName', // 商品名称  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.productName').d('商品名称'),
    },
    {
      name: 'catalogName', // 商品目录 送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.catalogName').d('商品目录'),
    },
    {
      name: 'creationDate', // 创建时间 头
      type: 'date',
      label: intl.get('slod.deliveryWorkbench.model.common.creationDate').d('创建时间'),
    },
    {
      name: 'createdName', // 创建人  头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
    },
    {
      name: 'labelDetail', // 标签明细 -- 跳转字段  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细'),
    },
    {
      name: 'splitFlag', // 拆分标记  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.splitFlag').d('拆分标记'),
    },
    {
      name: 'changingFlag',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.changingFlag').d('变更标识'),
    },
    {
      name: 'purchaseLineAttachmentUuid', // 采购方附件
      type: 'attachment',
      label: intl.get('slod.deliveryWorkbench.model.common.purchaseLineUuid').d('采购方行附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: SLOD_DIRECTORY,
    },
    {
      name: 'supplierLineAttachmentUuid', // 供应商附件
      type: 'attachment',
      label: intl.get('slod.deliveryWorkbench.model.common.supplierLineUuid').d('供应商行附件'),
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: SLOD_DIRECTORY,
    },
    {
      name: 'linkFirst',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.linkFirst').d('链接字段1'),
    },
    {
      name: 'linkSecond',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.linkSecond').d('链接字段2'),
    },
    {
      name: 'splitDisplayLineNum',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.splitDisplayLineNum').d('拆分行号'),
    },
    {
      name: 'projectTaskId',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.projectTaskId').d('项目任务名称'),
    },
    {
      name: 'inventoryId',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
    },
    {
      name: 'locationId',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
    },
  ],
  transport: {
    read: ({ data, params: _p }) => {
      const { params, tplInfo, ...other } = data;
      const { nodeTemplateCode, nodeConfigId, headerId, ...others } = params || {};
      const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } = tplInfo || {};
      let param;
      if (unitLineCode) {
        param = {
          ..._p,
          pageSourceKey: 'all',
          customizeUnitCode: unitLineCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
          operationType: 'allTabDetail',
        };
      }
      const queryData = filterNullValueObject({ ...other, ...others, ...param });
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/detail/line/${headerId}`,
        method: 'GET',
        data: queryData,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      const changes = dataSet?.getState('change');
      dataSet.forEach((record) => {
        record.set('currentTabs', 'all');
        if (
          changes &&
          (!isNil(record?.get('asnLineId')) ||
            !record?.get('planLineId') ||
            !record?.get('labelLineId'))
        ) {
          Object.assign(record, { selectable: false });
        }
      });
    },
  },
});

export { lineListDataSet };
