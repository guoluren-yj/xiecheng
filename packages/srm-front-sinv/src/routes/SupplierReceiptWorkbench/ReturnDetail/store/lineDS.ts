/*
 * @Description:
 * @Date: 2021-07-06 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import intl from 'srm-front-boot/lib/utils/intl/index.js';
import { SRM_SPUC, PRIVATE_BUCKET } from 'srm-front-boot/lib/utils/config.js';
import { getCurrentOrganizationId } from 'hzero-front/lib/utils/utils/user';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { isEmpty, isNil } from 'lodash';
import { DataSetProps } from 'choerodon-ui/pro/lib/data-set/DataSet';
import { FieldType } from 'choerodon-ui/pro/lib/data-set/enum';
import { math } from 'choerodon-ui/dataset';
import { isSupplier } from '../../util.js';
import { conversionUpdate } from '@/routes/components/utils';
import { SINV_DIRECTORY } from '@/utils/constant';


const organizationId = getCurrentOrganizationId();

const formDS = (): DataSetProps => ({
  selection: false,
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'displayTrxNum',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.displayTrxNum').d('单据编号'),
    },
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customer').d('客户'),
    },
    {
      name: 'supplierCompanyName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'nodeConfigName',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.rcvTypeName.nodeConfigName')
        .d('收货节点'),
    },
    {
      name: 'returnedFlag',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货'),
    },
    {
      name: 'rcvTypeAll',
      type: FieldType.object,
      label: intl.get('sinv.receiptWorkbench.model.receipt.rcvTypeReName').d('收货类型'),
      lovCode: 'SPUC.SINV_MOVE_TYPE',
      dynamicProps: {
        lovPara({ record }) {
          return {
            tenantId: organizationId,
            nodeConfigId: record.get('nodeConfigId'),
          };
        },
      },
      required: true,
    },
    {
      name: 'rcvTypeName',
      type: FieldType.string,
      bind: 'rcvTypeAll.rcvTypeName',
    },
    {
      name: 'rcvTrxTypeId',
      type: FieldType.string,
      bind: 'rcvTypeAll.rcvTrxTypeId',
    },
    {
      name: 'creationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.creationName').d('单据创建人'),
    },
    {
      name: 'creationDate',
      type: FieldType.date,
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
    },
    // !isSupplier && {
    //   name: 'unitAll',
    //   type: FieldType.object,
    //   label: intl.get('sinv.receiptExecution.model.receipt.unitAll').d('创建人部门'),
    //   lovCode: 'SPFM.USER_AUTHORITY_UNIT',
    //   lovPara: {
    //     tenantId: organizationId,
    //   },
    //   multiple: true,
    // },
    {
      name: 'unitAll',
      type: FieldType.object,
      label: intl.get('sinv.receiptExecution.model.receipt.unitAll').d('创建人部门'),
      lovCode: 'SPFM.USER_AUTHORITY_UNIT',
      lovPara: {
        tenantId: organizationId,
      },
      multiple: true,
    },
    {
      name: 'unitNames',
      type: FieldType.string,
      bind: 'unitAll.unitName',
      multiple: ',',
    },
    {
      name: 'unitIds',
      type: FieldType.string,
      bind: 'unitAll.unitId',
      multiple: ',',
    },
    {
      name: 'rcvStatusCode',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.aogRcvStatusCode').d('收货单状态'),
    },
    {
      name: 'totalQuantity',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.invoicesQuantity').d('单据总数'),
    },
    {
      name: 'totalTaxIncludedAmount',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.totalTaxIncludedAmount').d('汇总金额'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.remark').d('备注'),
      maxLength: 480,
    },
    {
      name: 'receivedBy',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.returnBy').d('实际退货人'),
      maxLength: 120,
    },
    {
      name: 'supplierReceiptFlag',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.supplierReceiptFlag').d('是否供应商收货'),
    },
    {
      name: 'linkFirst',
      type: FieldType.string,
      label: intl.get('sinv.common.model.common.linkFirst').d('链接字段1'),
    },
    {
      name: 'linkSecond',
      type: FieldType.string,
      label: intl.get('sinv.common.model.common.linkSecond').d('链接字段2'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { rcvTrxHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/header/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        data: other,
      };
    },
  },
});

const tableDS = (formDs, renderValidateField) => ({
  dataToJSON: 'all',
  primaryKey: 'rcvTrxLineId',
  selection: 'multiple',
  modifiedCheck: true,
  forceValidate: true,
  pageSize: 20,
  fields: [
    {
      name: 'importStatusMeaning',
      type: FieldType.string,
      label: intl.get(`sinv.common.model.common.erpSyncStatus`).d('导出状态'),
    },
    {
      name: 'action',
      type: FieldType.string,
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    {
      name: 'itemCode',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.itemName').d('物料名称'),
    },
    {
      name: 'secondaryUomId',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
    },
    {
      name: 'uomName',
      type: FieldType.string,
    },
    {
      name: 'secondaryQuantity',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.return.quantitys').d('退货数量'),
      dynamicProps: {
        required: ({ record }) => record.get('doubleUnitEnabled'), // && record.get('subjectType') === 'QUANTITY' 可编辑必填
        max: ({ record }) => {
          if (record.get('subjectType') === 'QUANTITY') {
            return record.get('secondaryLeftQuantity');
          }
        },
        min: () => {
          return 0;
        },
        // min: ({ record }) => {
        //   if ([0, '0'].includes(record.get('secondaryUomPrecision'))) {
        //     return 1;
        //   }
        //   const uomPrecision = !isNil(record.get('secondaryUomPrecision'))
        //     ? record.get('secondaryUomPrecision')
        //     : 10;
        //   const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
        //   return textNum;
        // },
      },
    },
    {
      name: 'secondaryLeftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.canLeftQuantitys').d('可退货数量'),
    },
    {
      name: 'quantity',
      type: FieldType.number,
      // min: 0,
      dynamicProps: {
        required: ({ record }) => record.get('subjectType') === 'QUANTITY',
        max: ({ record }) => {
          if (record.get('subjectType') === 'QUANTITY') {
            return record.get('leftQuantity');
          }
        },
        min: ({ record }) => {
          if ([0, '0'].includes(record.get('uomPrecision'))) {
            return 1;
          }
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
          return textNum;
        },
      },
    },
    {
      name: 'leftQuantity',
      type: 'number',
    },
    {
      name: 'moveReason',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.moveReasons').d('退货原因'),
      lookupCode: 'SPUC.SINV.MOVE.REASON',
    },
    {
      name: 'taxIncludedAmount',
      type: FieldType.number,
      // min: 0,
      label: intl.get('sinv.receiptExecution.model.receipt.returnTaxIncludedAmounts').d('退货金额'),
      dynamicProps: {
        required: ({ record }) => record.get('subjectType') === 'AMOUNT',
        max: ({ record }) => {
          if (record.get('subjectType') === 'AMOUNT') {
            return record.get('leftTaxAmount');
          }
        },
        step: ({ record }) => {
          const financialPrecision = !isNil(record.get('financialPrecision')) ? record.get('financialPrecision') : 10;
          const num = 1 / 10 ** financialPrecision;
          if (record.get('subjectType') === 'AMOUNT') {
            return num;
          }
        },
        min: ({ record }) => {
          if (['1', 1].includes(record.get('freeFlag')) || math.isZero(record.get('netPrice'))) {
            return;
          }
          if ([0, '0'].includes(record.get('financialPrecision'))) {
            return 1;
          }
          // 恒立液压埋点
          if (typeof renderValidateField === 'function' && renderValidateField(record.get('fromPcStageId'), record.get('payRatio'))) {
            return 0;
          }
          const financialPrecision = !isNil(record.get('financialPrecision')) ? record.get('financialPrecision') : 10;
          const textNum = `0.${Array(Number(financialPrecision)).join('0')}1`;
          return textNum;
        },
      },
    },
    {
      name: 'leftTaxAmount',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.canLeftTaxAmounts').d('可退货金额'),
    },
    {
      name: 'trxDate',
      type: FieldType.date,
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'invOrganizationName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.invOrganizationName').d('收货组织'),
    },
    {
      name: 'inventoryId',
      type: FieldType.object,
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
        disabled: () => isSupplier,
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
      type: FieldType.string,
      bind: 'inventoryId.inventoryName',
    },
    {
      name: '_inventoryId',
      type: FieldType.string,
      bind: 'inventoryId.inventoryId',
    },
    {
      name: 'locatorId',
      type: FieldType.object,
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
        disabled: ({ record }) =>
          !record.get('inventoryId')?.inventoryId || isSupplier,
      },
      transformResponse: (value, object) =>
        object?.locatorId
          ? {
            ...object,
            locatorId: object?.locatorId,
          }
          : null,
    },
    {
      name: '_locatorId',
      type: FieldType.string,
      bind: 'locatorId.locationId',
      transformResponse: (value, object) => {
        return object?.locatorId;
      },
    },
    {
      name: 'locationName',
      type: FieldType.string,
      bind: 'locatorId.locationName',
    },
    {
      name: 'fromDisplayPoNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromDisplayPoLineNum')
        .d('来源订单编号-行号'),
    },
    {
      name: 'fromPcNum',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.theFromPcNum').d('来源协议编号｜行号'),
    },
    {
      name: 'fromDisplayAsnNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromPcSubjectNum')
        .d('来源送货单编号-行号'),
    },
    {
      name: 'fromOrderTypeName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.thiOrderTypeName').d('来源单据类型'),
    },
    {
      name: 'fromDisplayTrxNum',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.theDisplayTrxNum')
        .d('参考凭证编号-行号'),
    },
    {
      name: 'productNum',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.productName').d('商品名称'),
    },
    {
      name: 'supplierCompanyName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'companyName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customer').d('客户'),
    },
    {
      name: 'agentName',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
    },
    {
      name: 'remark',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.lineRemark').d('行备注'),
      maxLength: 480,
    },
    {
      name: 'sinvLineAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      bucketDirectory: SINV_DIRECTORY,
      label: intl.get('sinv.receiptExecution.model.receipt.lineUuid').d('行附件'),
    },
    {
      name: 'customSpecsJson',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'orderReturnedFlag',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.orderReturnedFlag').d('退货订单行'),
    },
    {
      label: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
      name: 'attachmentUrlList',
    },
    {
      name: 'linkFirst',
      type: FieldType.string,
      label: intl.get('sinv.common.model.common.linkFirst').d('链接字段1'),
    },
    {
      name: 'linkSecond',
      type: FieldType.string,
      label: intl.get('sinv.common.model.common.linkSecond').d('链接字段2'),
    },
    {
      name: 'projectTaskId',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.projectTaskId').d('项目任务名称'),
    },
  ],
  events: {
    update: ({ record, name, value, dataSet }) => {
      if (name === 'inventoryId' || !record.get('inventoryId')?.inventoryId) {
        record.set('locatorId', '');
        record.set('locationName', '');
      }
      // const { orderTypeCode } = formDs.toData()[0] || {};
      const financialPrecision = !isNil(record.get('financialPrecision')) ? record.get('financialPrecision') : 10;
      const defaultPrecision = !isNil(record.get('defaultPrecision')) ? record.get('defaultPrecision') : 10;
      const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
      if (record.get('subjectType') === 'QUANTITY' && name === 'quantity' && value) {
        if (record.get('orderTypeCode') === 'PC' && record.get('payRatio')) {
          record
            .getField('quantity')
            .checkValidity()
            .then((res) => {
              if (res) {
                const taxIncludedAmount =
                  math.div(
                    math.multipliedBy(math.multipliedBy(math.multipliedBy(value, record.get('taxIncludedPrice')), record.get('payRatio')), 1000000),
                    math.multipliedBy(math.multipliedBy(record.get('unitPriceBatch'), 1000000), 100)
                  );
                record.set(
                  'taxIncludedAmount',
                  math.toFixed(taxIncludedAmount, financialPrecision)
                );
              }
            });
        } else {
          const {
            benchmarkPriceType,
            taxRate,
            quantity,
            unitPriceBatch,
            taxIncludedPrice,
            netPrice,
            taxRateType,
          } = record.get([
            'benchmarkPriceType',
            'taxRate',
            'quantity',
            'unitPriceBatch',
            'taxIncludedPrice',
            'netPrice',
            'taxRateType',
          ]);
          const entryParams = {
            hasTax: benchmarkPriceType === 'TAX_INCLUDED_PRICE',
            hasMount: true,
            each: unitPriceBatch,
            taxRate,
            quantity: +quantity,
            financialPrecision,
            defaultPrecision,
            taxUnitPrice: +taxIncludedPrice, // 含税
            netUnitPrice: +netPrice, // 不含税
            caclRule: dataSet.get('amountCalcRule') || 'Amount',
            taxRateType,
          };
          const { calcTaxAmount }: any = amountCalculation(entryParams);
          record.set('taxIncludedAmount', calcTaxAmount);
        }
      } else if (record.get('subjectType') === 'AMOUNT' && name === 'taxIncludedAmount' && value) {
        // 按金额
        if (record.get('orderTypeCode') === 'PC' && record.get('payRatio')) {
          record
            .getField('taxIncludedAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const quantity =
                  math.div(
                    math.multipliedBy(math.multipliedBy(math.multipliedBy(value, record.get('unitPriceBatch')), 1000000), 100),
                    math.multipliedBy(math.multipliedBy(record.get('taxIncludedPrice'), record.get('payRatio')), 1000000)
                  );
                record.set('quantity', math.toFixed(quantity, uomPrecision));
                record.set('quantity', quantity.toFixed(uomPrecision));
                // 按金额接收 (先根据明细页金额=>基本数量换算逻辑算出基本数量=>再调公共方法)
                conversionUpdate({ dataSet, record, value, field: 'secondaryQuantity', type: 'amount' });
              }
            });
        } else {
          record
            .getField('taxIncludedAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const quantity =
                  math.div(
                    math.multipliedBy(math.multipliedBy(value, record.get('unitPriceBatch')), 1000000),
                    math.multipliedBy(record.get('taxIncludedPrice'), 1000000)
                  );
                record.set('quantity', math.toFixed(quantity, uomPrecision));
                // 按金额接收 (先根据明细页金额=>基本数量换算逻辑算出基本数量=>再调公共方法)
                conversionUpdate({ dataSet, record, value, field: 'secondaryQuantity', type: 'amount' });
              }
            });
        }
      }
      if (name === 'secondaryQuantity' && record.get('subjectType') === 'QUANTITY' && value) {
        // 按退货数量接收
        conversionUpdate({ dataSet, record, value, field: 'quantity', type: 'return' });
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const { rcvTrxHeaderId, ...others } = params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/line/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        data: {...other, ...others},
      };
    },
  },
});

const batchMaintenanceDS = (tableDs) => ({
  dataToJSON: 'normal',
  autoCreate: true,
  fields: [
    {
      name: 'trxDate',
      type: FieldType.date,
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'inventoryId',
      type: FieldType.object,
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
      ignore: 'always',
      lovCode: 'SODR.INVENTORY',
      dynamicProps: {
        lovPara: () => {
          const invOrganizationId = isEmpty(tableDs?.selected)
            ? tableDs?.toData()[0]?.invOrganizationId
            : tableDs?.selected[0]?.get('invOrganizationId');
          return {
            invOrganizationId,
            tenantId: organizationId,
          };
        },
      },
      transformRequest: (value) => value?.inventoryId ?? null,
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
      type: FieldType.string,
      bind: 'inventoryId.inventoryName',
    },
    {
      name: 'locatorId',
      type: FieldType.object,
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
      ignore: 'always',
      lovCode: 'HPFM.LOCATION_URL',
      dynamicProps: {
        lovPara: ({ record }) => {
          const inventoryId = isEmpty(tableDs?.selected)
            ? tableDs?.toData()[0]?.inventoryId
            : tableDs?.selected[0]?.get('inventoryId');
          return {
            tenantId: organizationId,
            inventoryId: record.get('inventoryId')?.inventoryId || inventoryId,
          };
        },
      },
      transformRequest: (value, record) =>
        (value?.locationId || record.get('inventoryId')?.locatorId) ?? null,
      transformResponse: (value, object) =>
        object?.locationId
          ? {
            ...object,
            locatorId: object?.locationId,
          }
          : null,
    },
    {
      name: 'locationName',
      type: FieldType.string,
      bind: 'locatorId.locationName',
    },
  ],
  events: {
    update: ({ record, name }) => {
      if (name === 'inventoryId') {
        record.set('locatorId', '');
        record.set('locationName', '');
      }
    },
  },
});

const formRateDS = () => ({
  paging: false,
  autoCreate: true, // 解决初次加载页面个性化必输不生效
  fields: [
    {
      name: 'overallScore',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.overallScore').d('总体评分'),
    },
    {
      name: 'deliveryScore',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.relevant').d('响应'),
    },
    {
      name: 'qualityScore',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.quality').d('质量'),
    },
    {
      name: 'serviceScore',
      type: FieldType.number,
      label: intl.get('sinv.receiptExecution.model.receipt.rcvTypeName.service').d('服务'),
    },
    {
      name: 'overallEvaluate',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.overallEvaluate').d('总体评价'),
    },
    {
      name: 'deliveryEvaluate',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.relevantEvaluate').d('响应评价'),
    },
    {
      name: 'qualityEvaluate',
      type: FieldType.string,
      label: intl.get('sinv.receiptExecution.model.receipt.qualityEvaluate').d('质量评价'),
    },
    {
      name: 'serviceEvaluate',
      type: FieldType.string,
      label: intl
        .get('sinv.receiptExecution.model.receipt.rcvTypeName.serviceEvaluate')
        .d('服务评价'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { rcvTrxHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/score/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        data: other,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        Object.assign(record, { status: 'update' });
      });
    },
  },
});

const attachmentDS = () => ({
  dataToJSON: 'dirty-field',
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'sinvHeaderAttachmentUuid',
      type: 'attachment',
      bucketDirectory: SINV_DIRECTORY,
      label: intl.get('sinv.receiptExecution.model.receipt.headerAttachmentUuid').d('附件上传'),
    },
  ],
});

export { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS };
