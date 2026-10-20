import { SRM_SLOD, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import intl from 'utils/intl';
import { isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { conversionUpdate, conversionUpdateOld } from '@/routes/components/utils';
import { MAX_BIGNUMBER_NUMBER } from '@/routes/components/utils/constant';
import { SLOD_DIRECTORY } from '@/utils/constant';

const organizationId = getCurrentOrganizationId();

const lineListDataSet = ({ id, unitLineCode, nodeTemplateType, doubleUnitEnabled }) => ({
  dataToJSON: 'all',
  primaryKey: id,
  pageSize: 20,
  selection: 'multiple',
  modifiedCheck: false,
  forceValidate: true,
  cacheSelection: true,
  cacheModified: true,
  fields: [
    {
      name: 'lineStatusMeaning',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.lineStatus').d('状态'),
    },
    {
      name: 'action',
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
      label: intl.get('slod.deliveryWorkbench.model.common.secondaryDisplayUom').d('单位'),
      name: 'secondaryDisplayUom', // 单位
      type: 'object',
      lovCode: 'SMDM_ITEM_ORG_UOM',
      valueField: 'uomId',
      textField: 'uomName',
      dynamicProps: {
        required: ({ dataSet }) => dataSet.getState('doubleUnitEnabled'),
        lovPara: ({ record }) => ({
          itemId: record.get('itemId'),
          primaryUomId: record.get('uomId'),
        }),
      },
      transformResponse: (value, object) =>
        value && {
          uomId: object?.secondaryUomId,
          uomName: object?.uomName,
          uomCode: object?.uomCode,
        },
      transformRequest: (value) => value?.uomId,
    },
    {
      name: 'secondaryUomId',
      bind: 'secondaryDisplayUom.uomId',
    },
    {
      name: 'secondaryUomName',
      bind: 'secondaryDisplayUom.uomName',
    },
    {
      name: 'secondaryUomCode',
      bind: 'secondaryDisplayUom.uomCode',
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
        .get('slod.deliveryWorkbench.model.common.secondarySourceQuantity')
        .d('来源单据数量'),
      name: 'secondarySourceQuantity', // 来源单据数量
      type: 'number',
    },
    {
      name: 'sourceQuantity',
      type: 'number',
      min: 0.0000000001,
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
      label: doubleUnitEnabled
        ? intl.get('slod.deliveryWorkbench.model.common.baseCanCreateQuantity').d('可创建基本数量')
        : intl.get('slod.deliveryWorkbench.model.common.canCreateQuantity').d('可创建数量'),
      name: 'canCreateQuantity', // 基本可创建数量
      type: 'number',
    },
    // {
    //   name: 'quantity', // 待创建-待提交 只有标签才有这个字段
    //   type: 'number',
    //   min: nodeTemplateType === 'LABEL' && 0.000001,
    //   required: nodeTemplateType === 'LABEL',
    //   label:
    //     nodeTemplateType === 'UNIQUE_LABEL'
    //       ? intl
    //           .get('slod.deliveryWorkbench.model.common.receiptsLabelQuantitys')
    //           .d('本单已生成标签数量')
    //       : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
    // },
    {
      name: 'secondaryQuantity', // 本次创建数量  本次计划数量
      type: 'number',
      // required:
      //   (doubleUnitEnabled && ['LABEL'].includes(nodeTemplateType)) ||
      //   ['PLAN', 'ASN'].includes(nodeTemplateType), // 送货-计划-要求必输
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
      dynamicProps: {
        required: ({ dataSet }) =>
          (dataSet?.getState('doubleUnitEnabled') && ['LABEL'].includes(nodeTemplateType)) ||
          ['PLAN', 'ASN'].includes(dataSet?.getState('doubleUnitEnabled')),
        min: ({ record }) => {
          if (!['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateType)) {
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
      name: 'actualQuantity', // 基本 本次创建数量  本次计划数量
      type: 'number',
      required: !['UNIQUE_LABEL'].includes(nodeTemplateType),
      label:
        nodeTemplateType === 'PLAN'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BasePresentQuantity')
                .d('本次计划基本数量')
            : intl.get('slod.deliveryWorkbench.model.common.presentQuantity').d('本次计划数量')
          : nodeTemplateType === 'UNIQUE_LABEL'
          ? doubleUnitEnabled
            ? intl
                .get('slod.deliveryWorkbench.model.common.BaseReceiptsLabelQuantitys')
                .d('本单已生成标签基本数量')
            : intl
                .get('slod.deliveryWorkbench.model.common.receiptsLabelQuantitys')
                .d('本单已生成标签数量')
          : doubleUnitEnabled
          ? intl
              .get('slod.deliveryWorkbench.model.common.BaseThisTimeuantity')
              .d('本次创建基本数量')
          : intl.get('slod.deliveryWorkbench.model.common.thisTimeuantity').d('本次创建数量'),
      dynamicProps: {
        min: ({ record }) => {
          if (!['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateType)) {
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
      name: 'unitPackageQuantity',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.unitPackageQuantity').d('单包装数'),
      required: ['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateType), // 根据rp图展示 不唯一标签也必输 唯一标签也必输
      dynamicProps: {
        min: ({ record }) => {
          if (['UNIQUE_LABEL', 'LABEL'].includes(nodeTemplateType)) {
            const uomPrecision = doubleUnitEnabled
              ? record.get('secondaryUomPrecision')
              : record.get('uomPrecision');
            if ([0, '0'].includes(uomPrecision)) {
              return 1;
            }
            const Precision = !isNil(uomPrecision) ? uomPrecision : 10;
            const textNum = `0.${Array(Number(Precision)).join(0)}1`;
            return textNum;
          } else {
            return 0;
          }
        },
      },
    },
    {
      name: 'packageQuantity',
      type: 'number',
      label: intl.get('slod.deliveryWorkbench.model.common.packageQuantity').d('比例份数'),
      required: nodeTemplateType === 'UNIQUE_LABEL',
      dynamicProps: {
        min: ({ record }) => {
          const uomPrecision = doubleUnitEnabled
            ? record.get('secondaryUomPrecision')
            : record.get('uomPrecision');
          if (nodeTemplateType === 'UNIQUE_LABEL') {
            if ([0, '0'].includes(uomPrecision)) {
              return 1;
            }
            const Precision = !isNil(uomPrecision) ? uomPrecision : 10;
            const textNum = `0.${Array(Number(Precision)).join(0)}1`;
            return textNum;
          }
        },
      },
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
      label: intl
        .get('slod.deliveryWorkbench.model.common.plannedArrivalDate')
        .d('本次计划到货日期'),
      required: id === 'planLineId', // 计划必输
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
      label: intl.get('slod.deliveryWorkbench.model.common.receiveAddres').d('收货地址'),
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
      name: 'weightUomId',
      type: 'object',
      label: intl.get('slod.deliveryWorkbench.model.common.weightUomName').d('重量单位'),
      lovCode: 'SMDM.ITEM.UOM.ORG',
      valueField: 'uomId',
      textField: 'uomCodeAndName',
      dynamicProps: {
        lovPara: () => {
          return {
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value?.uomId,
      transformResponse: (value, object) =>
        value
          ? {
              uomId: value,
              uomCode: object.weightUomCode,
              uomName: object.weightUomName,
              uomCodeAndName:
                object.unitCodeIsShow === '1'
                  ? `${object.weightUomCode}/${object.weightUomName}`
                  : `${object.weightUomName}`,
            }
          : null,
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
      name: 'splitFlag', // 拆分标记  计划  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.splitFlag').d('拆分标记'),
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
      name: 'changingFlag',
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.changingFlag').d('变更标识'),
    },
    {
      name: 'labelDetail', // 标签明细 -- 跳转字段  行
      type: 'string',
      label: intl.get('slod.deliveryWorkbench.model.common.labelDetail').d('标签明细'),
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
      // 批量维护 页面翻页时候 自动将批量维护的数据覆盖到当前行上
      // batchFlag 判断是否为勾选
      const fieldMapValues = dataSet.getState('fieldMapValues');
      if (fieldMapValues) {
        dataSet.forEach((i) => {
          // Object.assign(i, { status: 'update' });
          if (!i.getState('batchFlag')) {
            fieldMapValues.forEach(([key, value]) => {
              const field = i.getField(key);
              if (!field.disabled && !field.get('bind')) {
                i.set({ [key]: value });
                i.setState({ batchFlag: true });
              }
            });
          }
        });
      }
    },
    update: ({ record, name, value, dataSet }) => {
      // 送货单/不唯一标签
      if (['ASN', 'LABEL'].includes(nodeTemplateType)) {
        if (['secondaryQuantity', 'actualQuantity', 'unitPackageQuantity'].includes(name)) {
          // 开启用辅助数量算 不开基本数量算
          const Quantity = dataSet.getState('doubleUnitEnabled')
            ? record.get('secondaryQuantity')
            : record.get('actualQuantity');
          const UomPrecision = dataSet.getState('doubleUnitEnabled')
            ? record.get('secondaryUomPrecision')
            : record.get('uomPrecision');
          const packageQuantity = math.floor(math.div(Quantity, record.get('unitPackageQuantity')));
          // 比例份数：本次创建数量/单包装数（取整）
          if (record.get('unitPackageQuantity') !== 0) {
            record.set('packageQuantity', packageQuantity);
          } else {
            record.set('packageQuantity', null);
          }
          const remainderQuantity = math.minus(
            Quantity,
            math.toFixed(
              math.multipliedBy(record.get('unitPackageQuantity'), packageQuantity),
              !isNil(UomPrecision) ? UomPrecision : 10
            )
          );
          // 尾数：本次创建数量-单包装*比例份数
          if (record.get('unitPackageQuantity') !== 0) {
            record.set('remainderQuantity', remainderQuantity);
          } else {
            record.set('remainderQuantity', null);
          }
        }
      }

      if (['LABEL'].includes(nodeTemplateType) && name === 'secondaryQuantity' && value) {
        // 按辅助数量接收
        conversionUpdate(
          { dataSet, record, value, nodeTemplateType, field: 'actualQuantity' },
          record.get('secondaryQuantity')
        );
      }

      if (name === 'secondaryQuantity' && value) {
        // 按辅助数量接收
        conversionUpdate(
          { dataSet, record, value, nodeTemplateType, field: 'actualQuantity' },
          record.get('secondaryQuantity')
        );
      }

      // 按辅助单位接收算来源单据数量、本次创建数量
      if (
        name === 'secondaryDisplayUom' &&
        record.get('itemId') &&
        ['UNIQUE_LABEL'].includes(nodeTemplateType)
      ) {
        const itemIdChanged = record.getField('secondaryDisplayUom')?.isDirty(record);
        if (!itemIdChanged) return false;
        // 计划节点的只有本次计划数量换算,其他均有(来源单据数量(基本-》辅),本次创建数量(辅助=>基本))
        if (nodeTemplateType !== 'PLAN') {
          conversionUpdateOld(
            {
              nodeTemplateType,
              record,
              dataSet,
              type: 'displayUom',
              value: record.get('secondaryDisplayUom')?.uomId,
              // field: 'sourceQuantity',
              field: 'secondarySourceQuantity',
            },
            record.get('sourceQuantity')
            // record.get('secondarySourceQuantity')
          );
        }

        conversionUpdateOld(
          {
            nodeTemplateType,
            record,
            dataSet,
            type: 'displayUom',
            value: record.get('secondaryDisplayUom')?.uomId,
            field: 'actualQuantity',
          },
          record.get('secondaryQuantity')
        );
      }

      if (name === 'inventoryId') {
        // record.get('inventoryId')?.inventoryId
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
          customizeUnitCode: unitLineCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
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
