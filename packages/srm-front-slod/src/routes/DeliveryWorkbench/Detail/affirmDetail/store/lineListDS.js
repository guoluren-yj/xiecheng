import { SRM_SLOD, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { conversionUpdate } from '@/routes/components/utils';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';
import { SLOD_DIRECTORY } from '@/utils/constant';
import { isNil } from 'lodash';

const organizationId = getCurrentOrganizationId();

const lineListDataSet = ({
  id,
  unitLineCode,
  nodeTemplateType,
  doubleUnitEnabled,
  sourceFromPub,
}) => ({
  autoQuery: false,
  dataToJSON: 'all',
  primaryKey: id,
  pageSize: 20,
  selection: 'multiple',
  modifiedCheck: false,
  forceValidate: true,
  cacheModified: true,
  fields: [
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
      name: 'itemCode', // 物料编码
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.itemName').d('物料名称'),
    },
    {
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryDisplayUom').d('单位'),
      name: 'secondaryDisplayUom', // 单位
      type: 'string',
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
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.BaseSourceQuantity').d('来源单据基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.sourceQuantity').d('来源单据数量'),
    },
    {
      name: 'secondaryQuantity', // 本次计划数量  计划  行
      type: 'number',
      label:
        nodeTemplateType === 'PLAN'
          ? intl
              .get('slod.deliveryWorkbench.model.common.secondaryPresentQuantity')
              .d('本次计划数量')
          : nodeTemplateType === 'UNIQUE_LABEL'
          ? intl
              .get('slod.deliveryWorkbench.model.common.secondaryReceiptsLabelQuantitys')
              .d('本单已生成标签数量')
          : intl
              .get('slod.deliveryWorkbench.model.common.secondaryThisTimeuantity')
              .d('本次创建数量'),
    },
    {
      name: 'actualQuantity', // 本次创建数量  本次计划数量
      type: 'number',
      label: '111111111',
      // nodeTemplateType === 'PLAN'
      //   ? doubleUnitEnabled
      //     ? intl
      //         .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
      //         .d('本次计划基本数量')
      //     : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
      //   : nodeTemplateType === 'UNIQUE_LABEL'
      //   ? doubleUnitEnabled
      //     ? intl
      //         .get('slod.deliveryWorkbench.model.common.BaseReceiptsLabelQuantitys')
      //         .d('本单已生成标签基本数量')
      //     : intl
      //         .get('slod.deliveryWorkbench.model.common.secondaryReceiptsLabelQuantitys')
      //         .d('本单已生成标签数量')
      //   : doubleUnitEnabled
      //   ? intl
      //       .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
      //       .d('本次创建基本数量')
      //   : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    },
    {
      name: 'fillSecondaryQuantity', // 本次确认数量
      type: 'number',
      required: doubleUnitEnabled,
      max: MAX_BIGNUMBER_NUMBER,
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryAffirmQuality').d('确认数量'),
      dynamicProps: {
        min: ({ record }) => {
          if ([1, '1'].includes(record.get('changingFlag'))) {
            return 0;
          } else {
            if ([0, '0'].includes(record.get('secondaryUomPrecision'))) {
              return 1;
            }
            const uomPrecision = !isNil(record.get('secondaryUomPrecision'))
              ? record.get('secondaryUomPrecision')
              : 10;
            const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
            return textNum;
          }
        },
      },
    },
    {
      name: 'quantity', // 基本 本次确认数量
      type: 'number',
      required: true,
      max: MAX_BIGNUMBER_NUMBER,
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.BaseAffirmQuality').d('确认基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.affirmNumber').d('确认数量'),
      dynamicProps: {
        min: ({ record }) => {
          if ([1, '1'].includes(record.get('changingFlag'))) {
            return 0;
          } else {
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
      },
    },
    {
      name: 'unitPackageQuantity', // 单包装数
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
      min: nodeTemplateType === 'UNIQUE_LABEL' && 0.000001,
    },
    {
      name: 'packageQuantity', // 比例份数
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.packageQuantity').d('比例份数'),
      min: nodeTemplateType === 'UNIQUE_LABEL' && 0.000001,
    },
    {
      name: 'remainderQuantity',
      type: 'number',
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
      name: 'splitFlag', // 拆分标记  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.splitFlag').d('拆分标记'),
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
      label: intl.get('slod.deliveryWorkbench.model.common.occupiedQuantity').d('占用数量'),
    },
    {
      name: 'plannedArrivalDate', // 本次计划到货日期
      type: 'date',
      label: intl
        .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
        .d('本次计划到货日期'),
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
      name: 'weightUomName', // 重量单位  送货  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.weightUomName').d('重量单位'),
    },
    {
      name: 'labelDetail', // 标签明细 -- 跳转字段  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细'),
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
      name: 'createCampCodeMeaning', // 创建方   值集 SLOD.CAMP_CODE  头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createCampCode').d('创建方'),
    },
    {
      name: 'fromDisplayPoLocationNum', // 发运号
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.fromDisplayPoLocationNum').d('发运号'),
    },
    {
      name: 'createdName', // 创建人  头-行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.createdName').d('创建人'),
    },
    {
      name: 'confirmArrivalDate', // 确认到货日期  头-行
      type: 'date',
      required: ['PLAN'].includes(nodeTemplateType),
      label: intl.get('slod.deliveryWorkbench.model.common.confirmArrivalDate').d('确认到货日期'),
    },
    {
      name: 'deliveryAddress', // 发货地址   行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.deliveryAddress').d('发货地址'),
    },
    {
      name: 'receiveAddress', // 收货地址   行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
      disabled: sourceFromPub,
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
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
      ignore: 'always',
      lovCode: 'SODR.INVENTORY',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            invOrganizationId: record.get('invOrganizationId'),
          };
        },
      },
      transformResponse: (value, object) =>
        object?.inventoryId
          ? {
              ...object,
              inventoryId: object?.inventoryId,
            }
          : null,
    },
    {
      name: 'inventoryName',
      type: 'string',
      bind: 'inventoryId.inventoryName',
    },
    {
      name: '_inventoryId',
      type: 'string',
      bind: 'inventoryId.inventoryId',
    },
    {
      name: 'locationId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
      ignore: 'always',
      lovCode: 'HPFM.LOCATION_URL',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            inventoryId: record.get('inventoryId')?.inventoryId,
          };
        },
        disabled: ({ record }) => !record.get('inventoryId')?.inventoryId,
      },
      transformResponse: (value, object) => {
        return object?.locationId
          ? {
              ...object,
              locationId: object?.locationId,
            }
          : null;
      },
    },
    {
      name: '_locationId',
      type: 'string',
      bind: 'locationId.locationId',
      transformResponse: (value, object) => {
        return object?.locationId;
      },
    },
    {
      name: 'locationName',
      type: 'string',
      bind: 'locationId.locationName',
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        record.set('currentTabs', 'confirmed');
        if (record.get('cooperativeLineFlag') === 0 && record.get('splitFlag') === 'SOURCE') {
          Object.assign(record, { selectable: false });
        }
      });
    },
    update: ({ record, name, value, dataSet }) => {
      if (name === 'fillSecondaryQuantity' && value) {
        // 按辅助数量接收
        conversionUpdate(
          { dataSet, record, value, nodeTemplateType, field: 'quantity', type: 'secondaryUomId' },
          record.get('fillSecondaryQuantity')
        );
      }

      if (name === 'inventoryId') {
        record.set('locationId', '');
        record.set('locationName', '');
      }
    },
  },
  transport: {
    read: ({ data, params: _p }) => {
      const { params, tplInfo, ...other } = data;
      const { nodeTemplateCode, nodeConfigId, headerId, ...others } = params || {};
      const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } = tplInfo || {};
      let param;
      if (unitLineCode) {
        param = {
          ..._p,
          pageSourceKey: 'affirm',
          customizeUnitCode: unitLineCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
          operationType: 'waitConfirmDetail',
        };
      }
      const queryData = filterNullValueObject({ ...other, ...others, ...param });
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/detail/line/${headerId}`,
        method: 'GET',
        data: queryData,
      };
    },
    destroy: ({ data, dataSet }) => {
      const { nodeTemplateCode, nodeConfigId, campKey } = dataSet.getState('params') || {};
      return {
        url: `${SRM_SLOD}/v1/${organizationId}/delivery/${nodeTemplateCode}/${nodeConfigId}/line?campKey=${campKey}`,
        method: 'DELETE',
        data,
      };
    },
  },
});

export { lineListDataSet };
