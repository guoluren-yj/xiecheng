/*
 * @Description:
 * @Date: 2021-07-06 10:38:14
 * @author: zuoxiangyu <xiangyu.zuo@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { SRM_SPUC, PRIVATE_BUCKET } from '_utils/config';
import { getCurrentOrganizationId } from 'utils/utils';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { conversionUpdate } from '@/routes/components/utils';
import { math } from 'choerodon-ui/dataset';
import { isEmpty, isNil, isArray } from 'lodash';

const organizationId = getCurrentOrganizationId();

const formDS = (doubleUnitEnabled) => ({
  paging: false,
  forceValidate: true,
  fields: [
    {
      name: 'displayTrxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.displayTrxNum').d('单据编号'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNode')
        .d('收货节点'),
    },
    {
      name: 'returnedFlagMeaning',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.ReturnedThings').d('收货/退货'),
    },
    {
      name: 'rcvTypeAll',
      type: 'object',
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
      ignore: 'always',
      required: true,
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      bind: 'rcvTypeAll.rcvTypeName',
    },
    {
      name: 'rcvTrxTypeId',
      type: 'string',
      bind: 'rcvTypeAll.rcvTrxTypeId',
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.creationName').d('单据创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.creationDateTime').d('创建时间'),
    },
    {
      name: 'unitAll',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.unitAll').d('创建人部门'),
      lovCode: 'SPUC.USER_AUTHORITY_UNIT',
      dynamicProps: {
        lovPara({ record }) {
          return {
            tenantId: organizationId,
            unitIds: isArray(record.get('unitIds')) && record.get('unitIds').join(','),
          };
        },
      },
      ignore: 'always',
      multiple: true,
    },
    {
      name: 'unitNames',
      type: 'string',
      bind: 'unitAll.unitName',
      multiple: ',',
    },
    {
      name: 'unitIds',
      type: 'number',
      bind: 'unitAll.unitId',
      multiple: ',',
    },
    {
      name: 'rcvStatusCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.aogRcvStatusCode').d('收货单状态'),
    },
    {
      name: 'secondaryTotalQuantity',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.invoicesQuantity').d('单据总数'),
    },
    {
      name: 'totalQuantity',
      type: 'string',
      label: doubleUnitEnabled
        ? intl.get('sinv.receiptExecution.model.receipt.invoicesQuantity').d('总基本数量')
        : intl.get('sinv.receiptExecution.model.receipt.invoicesQuantity').d('单据总数'),
    },
    {
      name: 'totalTaxIncludedAmount',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.totalTaxIncludedAmount').d('汇总金额'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.remark').d('备注'),
      maxLength: 480,
    },
    {
      name: 'receivedBy',
      type: 'string',
      maxLength: 120,
      dynamicProps: {
        label: ({ record }) => {
          if (record.get('returnedFlag') === 0) {
            return intl.get('sinv.receiptExecution.model.receipt.receivedBy').d('实际收货人');
          } else {
            return intl.get('sinv.receiptExecution.model.receipt.returnBy').d('实际退货人');
          }
        },
      },
    },
    {
      name: 'supplierReceiptFlag',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.supplierReceiptFlag')
        .d('是否供应商收货'),
    },
    {
      name: 'linkFirst',
      type: 'string',
      label: intl.get('sinv.common.model.common.linkFirst').d('链接字段1'),
    },
    {
      name: 'linkSecond',
      type: 'string',
      label: intl.get('sinv.common.model.common.linkSecond').d('链接字段2'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { rcvTrxHeaderId, customizeUnitCode, ...other } = data.params || {};
      const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } =
        data.tplInfo || {};
      let params;
      if (customizeUnitCode) {
        params = {
          customizeUnitCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/header/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        params,
        data: other,
      };
    },
  },
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        Object.assign(record, { status: 'update' });
        // if (record.get('toPackageQuantity') === 0) {
        // } else {
        //   record.set('status', 'update');
        // }
      });
    },
  },
});

const tableDS = (formDs, doubleUnitEnabled) => ({
  dataToJSON: 'all',
  primaryKey: 'rcvTrxLineId',
  selection: false,
  modifiedCheck: true,
  pageSize: 20,
  forceValidate: true,
  // queryParameter: {
  //   customizeUnitCode: 'SINV.RECEIPT_WORKBENCH_NEW_WORKFLO.FILTER',
  // },
  fields: [
    {
      name: 'action',
      type: 'string',
      label: intl.get(`hzero.common.button.action`).d('操作'),
    },
    {
      name: 'itemCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.itemCode').d('物料编码'),
    },
    {
      name: 'itemName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.itemName').d('物料名称'),
    },
    {
      name: 'secondaryUomId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.secondaryUomName').d('单位'),
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
          uomId: value,
          uomName: object?.uomName,
          uomCode: object?.uomCode,
        },
      transformRequest: (value) => value?.uomId,
    },
    {
      name: 'secondaryUomName',
      bind: 'secondaryUomId.uomName',
    },
    {
      name: 'secondaryUomCode',
      bind: 'secondaryUomId.uomCode',
    },
    {
      name: 'uomName',
      type: 'string',
      label: doubleUnitEnabled
        ? intl.get('sinv.receiptExecution.model.receipt.baseUomName').d('基本单位')
        : intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      dynamicProps: {
        label: ({ record }) => {
          if (record.get('returnedFlag') === 0) {
            return intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量');
          } else {
            return intl.get('sinv.receiptExecution.model.receipt.return.quantitys').d('退货数量');
          }
        },
        required: ({ record }) => record.get('subjectType') === 'QUANTITY',
        max: ({ record }) => {
          if (
            record.get('firstNodeFlag') === 1 &&
            (record.get('orderTypeCode') === 'ORDER' ||
              record.get('orderTypeCode') === 'ASN' ||
              record.get('orderTypeCode') === 'SLOD_ASN')
          ) {
            return false;
          }
          if (record.get('subjectType') === 'QUANTITY' || record.get('orderTypeCode') === 'PC') {
            return record.get('secondaryLeftQuantity');
          }
        },
      },
    },
    {
      name: 'secondaryLeftQuantity',
      type: 'number',
      dynamicProps: {
        label: ({ record }) => {
          if (record.get('returnedFlag') === 0) {
            return intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量');
          } else {
            return intl
              .get('sinv.receiptExecution.model.receipt.canLeftSecondaryLeftQuantity')
              .d('可退货数量');
          }
        },
      },
    },
    {
      name: 'quantity',
      type: 'number',
      min: 0,
      dynamicProps: {
        label: ({ record }) => {
          if (record.get('returnedFlag') === 0) {
            if (doubleUnitEnabled) {
              return intl
                .get('sinv.receiptExecution.model.receipt.exec.baseQuantity')
                .d('执行基本数量');
            } else {
              return intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量');
            }
          } else if (record.get('returnedFlag') === 1) {
            if (doubleUnitEnabled) {
              return intl
                .get('sinv.receiptExecution.model.receipt.return.baseQuantity')
                .d('退货基本数量');
            } else {
              return intl.get('sinv.receiptExecution.model.receipt.return.quantitys').d('退货数量');
            }
          }
        },
        required: ({ record }) => record.get('subjectType') === 'QUANTITY',
        max: ({ record }) => {
          if (record.get('firstNodeFlag') === 1) return false;
          if (record.get('subjectType') === 'QUANTITY' || record.get('orderTypeCode') === 'PC') {
            return record.get('leftQuantity');
          }
        },
      },
    },
    {
      name: 'leftQuantity',
      type: 'number',
      dynamicProps: {
        label: ({ record }) => {
          if (record.get('returnedFlag') === 0) {
            if (doubleUnitEnabled) {
              return intl
                .get('sinv.receiptExecution.model.receipt.baseLeftQuantity')
                .d('可执行基本数量');
            } else {
              return intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量');
            }
          } else if (record.get('returnedFlag') === 1) {
            if (doubleUnitEnabled) {
              return intl
                .get('sinv.receiptExecution.model.receipt.canLeftBaseQuantity')
                .d('可退货基本数量');
            } else {
              return intl
                .get('sinv.receiptExecution.model.receipt.canLeftQuantitys')
                .d('可退货数量');
            }
          }
        },
      },
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      dynamicProps: {
        label: ({ record }) => {
          if (record.get('returnedFlag') === 0) {
            return intl
              .get('sinv.receiptExecution.model.receipt.taxIncludedAmount')
              .d('执行金额(含税)');
          } else {
            return intl
              .get('sinv.receiptExecution.model.receipt.returnTaxIncludedAmounts')
              .d('退货金额');
          }
        },
        required: ({ record }) => record.get('subjectType') === 'AMOUNT',
        max: ({ record }) => {
          if (
            record.get('firstNodeFlag') === 1 &&
            (record.get('orderTypeCode') === 'ORDER' ||
              record.get('orderTypeCode') === 'ASN' ||
              record.get('orderTypeCode') === 'SLOD_ASN')
          ) {
            return false;
          }
          if (record.get('subjectType') === 'QUANTITY' && record.get('orderTypeCode') === 'PC') {
            return false;
          }
          if (record.get('subjectType') === 'AMOUNT' || record.get('orderTypeCode') === 'PC') {
            return record.get('leftTaxAmount');
          }
        },
        step: ({ record }) => {
          const financialPrecision = !isNil(record.get('financialPrecision'))
            ? record.get('financialPrecision')
            : 10;
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
          const financialPrecision = !isNil(record.get('financialPrecision'))
            ? record.get('financialPrecision')
            : 10;
          const textNum = `0.${Array(Number(financialPrecision)).join(0)}1`;
          return textNum;
        },
      },
    },
    {
      name: 'leftTaxAmount',
      type: 'number',
      dynamicProps: {
        label: ({ record }) => {
          if (record.get('returnedFlag') === 0) {
            return intl
              .get('sinv.receiptExecution.model.receipt.leftTaxAmount.tax')
              .d('可执行金额(含税)');
          } else {
            return intl
              .get('sinv.receiptExecution.model.receipt.canLeftTaxAmounts')
              .d('可退货金额');
          }
        },
      },
    },
    {
      name: 'trxDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.invOrganizationName').d('收货组织'),
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
      name: 'locatorId',
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
        return object?.locatorId
          ? {
              ...object,
              locatorId: object?.locatorId,
            }
          : null;
      },
    },
    {
      name: '_locatorId',
      type: 'string',
      bind: 'locatorId.locationId',
      transformResponse: (value, object) => {
        return object?.locatorId;
      },
    },
    {
      name: 'locationName',
      type: 'string',
      bind: 'locatorId.locationName',
    },
    {
      name: 'fromDisplayPoNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromDisplayPoLineNum')
        .d('来源订单编号-行号'),
    },
    {
      name: 'fromPcNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.theFromPcNum').d('来源协议编号-行号'),
    },
    {
      name: 'fromDisplayAsnNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromPcSubjectNum')
        .d('来源送货单编号-行号'),
    },
    {
      name: 'fromOrderTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.thiOrderTypeName').d('来源单据类型'),
    },
    {
      name: 'fromDisplayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theDisplayTrxNum')
        .d('参考凭证编号-行号'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.productNum').d('商品编码'),
    },
    {
      name: 'productName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.productName').d('商品名称'),
    },
    {
      name: 'deliverTime',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.deliverTime').d('妥投时间'),
    },
    {
      name: 'supplierCompanyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'agentName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
    },
    {
      name: 'secondaryExecuteReverseQuantity',
      type: 'number',
      // min: 0,
      label: intl
        .get('sinv.receiptExecution.model.receipt.secondaryUomReverseQuantity')
        .d('退货数量'),
      dynamicProps: {
        step: ({ record }) => {
          const uomPrecision = !isNil(record.get('secondaryUomPrecision'))
            ? record.get('secondaryUomPrecision')
            : 10;
          const num = 1 / 10 ** uomPrecision;
          if (record.get('subjectType') === 'QUANTITY') {
            return num;
          }
        },
        // min: ({ record }) => {
        //   if ([0, '0'].includes(record.get('uomPrecision'))) {
        //     return 1;
        //   }
        //   const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
        //   const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
        //   return textNum;
        // },
      },
    },
    {
      name: 'executeReverseQuantity',
      type: 'number',
      // min: 0,
      label: doubleUnitEnabled
        ? intl.get('sinv.receiptExecution.model.receipt.BaseReverseQuantity').d('退货基本数量')
        : intl.get('sinv.receiptExecution.model.receipt.secondaryUomReverseQuantity').d('退货数量'),

      dynamicProps: {
        step: ({ record }) => {
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
          const num = 1 / 10 ** uomPrecision;
          if (record.get('subjectType') === 'QUANTITY') {
            return num;
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
      name: 'reverseNodeLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.reverseNodes').d('退货节点'),
      lovCode: 'SPUC.SINV_WORKKENCH_REVERSE_NODE_URL',
      textField: 'rcvTypeName',
      ignore: 'always',
      noCache: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          const strategyLineId = record.get('strategyLineId');
          return {
            tenantId: organizationId,
            nodeConfigId: record.get('nodeConfigId'),
            strategyLineIds: strategyLineId,
          };
        },
      },
    },
    {
      name: 'executeReverseNodeConfigId',
      type: 'string',
      bind: 'reverseNodeLov.nodeConfigId',
    },
    {
      name: 'executeReverseRcvTrxTypeName',
      type: 'string',
      bind: 'reverseNodeLov.rcvTypeName',
    },
    {
      name: 'executeReverseRcvTrxTypeId',
      bind: 'reverseNodeLov.rcvTrxTypeId',
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.lineRemark').d('行备注'),
    },
    {
      name: 'sinvLineAttachmentUuid',
      type: 'attachment',
      bucketName: PRIVATE_BUCKET,
      label: intl.get('sinv.receiptExecution.model.receipt.lineUuid').d('行附件'),
    },
    {
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
    {
      name: 'orderReturnedFlag',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.orderReturnedFlag').d('退货订单行'),
    },
    {
      label: intl.get(`sinv.common.model.common.attachmentUrlList`).d('图片附件'),
      name: 'attachmentUrlList',
    },
    {
      name: 'linkFirst',
      type: 'string',
      label: intl.get('sinv.common.model.common.linkFirst').d('链接字段1'),
    },
    {
      name: 'linkSecond',
      type: 'string',
      label: intl.get('sinv.common.model.common.linkSecond').d('链接字段2'),
    },
    {
      name: 'processDocuments',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.processDocuments').d('单据流'),
    },
  ],
  events: {
    update: ({ record, name, value, dataSet }) => {
      if (name === 'inventoryId' || !record.get('inventoryId')?.inventoryId) {
        record.set('locatorId', '');
        record.set('locationName', '');
      }
      const { orderTypeCode } = formDs.toData()[0] || {};
      const financialPrecision = !isNil(record.get('financialPrecision'))
        ? record.get('financialPrecision')
        : 10;
      const defaultPrecision = !isNil(record.get('defaultPrecision'))
        ? record.get('defaultPrecision')
        : 10;
      const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
      if (record.get('subjectType') === 'QUANTITY' && name === 'quantity' && value) {
        if (record.get('orderTypeCode') === 'PC' && record.get('payRatio')) {
          record
            .getField('quantity')
            .checkValidity()
            .then((res) => {
              if (res) {
                const taxIncludedAmount = math.div(
                  math.multipliedBy(
                    math.multipliedBy(
                      math.multipliedBy(value, record.get('taxIncludedPrice')),
                      record.get('payRatio')
                    ),
                    1000000
                  ),
                  math.multipliedBy(math.multipliedBy(record.get('unitPriceBatch'), 1000000), 100)
                );
                record.set(
                  'taxIncludedAmount',
                  math.toFixed(taxIncludedAmount, financialPrecision)
                );
              }
            });
        } else {
          // payRatio为null
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
          const { calcTaxAmount } = amountCalculation(entryParams);
          record.set('taxIncludedAmount', calcTaxAmount);
        }
      } else if (record.get('subjectType') === 'AMOUNT' && name === 'taxIncludedAmount' && value) {
        if (record.get('orderTypeCode') === 'PC' && record.get('payRatio')) {
          record
            .getField('taxIncludedAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const quantity = math.div(
                  math.multipliedBy(
                    math.multipliedBy(
                      math.multipliedBy(value, record.get('unitPriceBatch')),
                      1000000
                    ),
                    100
                  ),
                  math.multipliedBy(
                    math.multipliedBy(record.get('taxIncludedPrice'), record.get('payRatio')),
                    1000000
                  )
                );
                record.set('quantity', math.toFixed(quantity, uomPrecision));
                conversionUpdate({ dataSet, record, value, field: 'secondaryQuantity' });
              }
            });
        } else {
          record
            .getField('taxIncludedAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const quantity = math.div(
                  math.multipliedBy(
                    math.multipliedBy(value, record.get('unitPriceBatch')),
                    1000000
                  ),
                  math.multipliedBy(record.get('taxIncludedPrice'), 1000000)
                );
                record.set('quantity', math.toFixed(quantity, uomPrecision));
                // 按金额接收 (先根据明细页金额=>基本数量换算逻辑算出基本数量=>再调公共方法)
                conversionUpdate({
                  dataSet,
                  record,
                  value,
                  field: 'secondaryQuantity',
                  type: 'amount',
                });
              }
            });
        }
      }

      if (record.get('subjectType') === 'QUANTITY' && name === 'taxRateLov' && value) {
        const taxIncludedPrice = math.multipliedBy(
          math.plus(1, math.div(record.get('taxRate'), 100)),
          record.get('netPrice')
        );
        const taxIncludedAmount = math.div(
          math.multipliedBy(math.multipliedBy(taxIncludedPrice, record.get('quantity')), 1000000),
          math.multipliedBy(record.get('unitPriceBatch'), 1000000)
        );
        record.set('taxIncludedPrice', math.toFixed(taxIncludedPrice, defaultPrecision));
        if (orderTypeCode === 'PC' && record.get('payRatio')) {
          record.set(
            'taxIncludedAmount',
            math.toFixed(
              math.multipliedBy(taxIncludedAmount, record.get('payRatio')),
              financialPrecision
            )
          );
        } else {
          record.set('taxIncludedAmount', math.toFixed(taxIncludedAmount, financialPrecision));
        }
      }
      // 按辅助数量接收
      if (name === 'secondaryQuantity' && record.get('subjectType') === 'QUANTITY' && value) {
        conversionUpdate({ dataSet, record, value });
      }

      // 按辅助退货数量接收
      if (
        name === 'secondaryExecuteReverseQuantity' &&
        record.get('subjectType') === 'QUANTITY' &&
        value
      ) {
        conversionUpdate({ dataSet, record, value, field: 'executeReverseQuantity' });
      }

      // // 辅助单位 (没有物料id,没有赋值)
      // if (name === 'secondaryUomId' && record.get('itemId')) {
      //   const itemIdChanged = record.getField('secondaryUomId')?.isDirty(record);
      //   if (!itemIdChanged) return false;
      //   conversionUpdate({
      //     record,
      //     dataSet,
      //     value: record.get('secondaryUomId')?.uomId,
      //   });
      // }
    },
  },
  transport: {
    read: ({ data, params: custParams }) => {
      const { params = {}, tplInfo = {}, ...others } = data;
      const { rcvTrxHeaderId, customizeUnitCode, ...other } = params;
      const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } = tplInfo;
      let param;
      if (customizeUnitCode) {
        param = {
          customizeUnitCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/line/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        params: { ...custParams, ...param },
        data: { ...other, ...others },
      };
    },
  },
});

const batchMaintenanceDS = () => ({
  dataToJSON: 'normal',
  autoCreate: true,
  fields: [
    {
      name: 'trxDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'inventoryId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
      ignore: 'always',
      lovCode: 'SODR.INVENTORY',
      dynamicProps: {
        lovPara: ({ dataSet }) => {
          const invOrganizationId = isEmpty(dataSet?.parent?.selected)
            ? dataSet?.parent?.toData()[0]?.invOrganizationId
            : dataSet?.parent?.selected[0]?.get('invOrganizationId');
          return {
            invOrganizationId,
            tenantId: organizationId,
          };
        },
        help: ({ dataSet }) => {
          const listData = dataSet?.parent?.toJSONData();
          const selectList = dataSet?.parent?.selected.map((item) => item.toJSONData());
          const invData = (isEmpty(dataSet?.parent?.selected) ? listData : selectList).map(
            (item) => item.invOrganizationId
          );
          const invFlag = new Set(invData).size === 0 || new Set(invData).size === 1; // 判断采购组织是否相等 相等true 不等 false
          if (!invFlag) {
            return intl
              .get(`sinv.receiptWorkbench.model.receipt.noInventoryNameLov`)
              .d('收货组织不一致');
          }
        },
        disabled: ({ dataSet }) => {
          const listData = dataSet.parent.toJSONData();
          const selectList = dataSet.parent?.selected.map((item) => item.toJSONData());
          const invData = (isEmpty(dataSet.parent?.selected) ? listData : selectList).map(
            (item) => item.invOrganizationId
          );
          const invFlag = new Set(invData).size === 0 || new Set(invData).size === 1; // 判断采购组织是否相等 相等true 不等 false
          if (!invFlag) return true;
        },
      },
    },
    {
      name: '_inventoryId',
      type: 'string',
      bind: 'inventoryId.inventoryId',
    },
    {
      name: 'inventoryName',
      type: 'string',
      bind: 'inventoryId.inventoryName',
    },
    {
      name: 'locatorId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
      ignore: 'always',
      lovCode: 'HPFM.LOCATION_URL',
      dynamicProps: {
        lovPara: ({ dataSet, record }) => {
          const inventoryId = isEmpty(dataSet?.parent?.selected)
            ? dataSet?.parent?.toData()[0]?._inventoryId
            : dataSet?.parent?.selected[0].get('inventoryId')?.inventoryId;
          return {
            tenantId: organizationId,
            inventoryId: isNil(record.get('inventoryId')?.inventoryId)
              ? inventoryId
              : record.get('inventoryId')?.inventoryId,
          };
        },
        help: ({ dataSet, record }) => {
          const listData = dataSet?.parent?.toJSONData();
          const selectList = dataSet?.parent?.selected.map((item) => item.toJSONData());
          const invData = (isEmpty(dataSet?.parent?.selected) ? listData : selectList).map(
            (item) => item.invOrganizationId
          );
          const invenData = (isEmpty(dataSet?.parent?.selected) ? listData : selectList).map(
            (item) => item._inventoryId
          );
          const invFlag = new Set(invData).size === 0 || new Set(invData).size === 1; // 判断采购组织是否相等 相等true 不等 false
          const invenFlag = new Set(invenData).size === 0 || new Set(invenData).size === 1; // 判断库房是否相等 相等true 不等 false
          const invenIdFlag = isNil(invenData[0]); // 判断inventoryId是否为null 或 undefined
          if (invFlag) {
            if (invenFlag && !invenIdFlag) {
              return false;
            } else if (record && !isNil(record.get('inventoryId')?.inventoryId)) {
              return false;
            } else {
              return intl
                .get(`sinv.receiptWorkbench.model.receipt.noLocationName`)
                .d('收货库房不一致');
            }
          } else {
            return intl
              .get(`sinv.receiptWorkbench.model.receipt.noLocationName`)
              .d('收货库房不一致');
          }
        },
        disabled: ({ dataSet, record }) => {
          const listData = dataSet?.parent?.toJSONData();
          const selectList = dataSet?.parent?.selected.map((item) => item.toJSONData());
          const invData = (isEmpty(dataSet?.parent?.selected) ? listData : selectList).map(
            (item) => item.invOrganizationId
          );
          const invenData = (isEmpty(dataSet?.parent?.selected) ? listData : selectList).map(
            (item) => item._inventoryId
          );
          const invFlag = new Set(invData).size === 0 || new Set(invData).size === 1; // 判断采购组织是否相等 相等true 不等 false
          const invenFlag = new Set(invenData).size === 1; // 判断库房是否相等 相等true 不等 false
          const invenIdFlag = isNil(invenData[0]); // 判断inventoryId是否为null 或 undefined
          if (invFlag) {
            if (invenFlag && !invenIdFlag) {
              return false;
            } else if (record && !isNil(record.get('inventoryId')?.inventoryId)) {
              return false;
            } else {
              return true;
            }
          } else {
            return true;
          }
        },
      },
    },
    {
      name: '_locatorId',
      type: 'string',
      bind: 'locatorId.locatorId',
    },
    {
      name: 'locationName',
      type: 'string',
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
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.overallScore').d('总体评分'),
    },
    {
      name: 'deliveryScore',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.delivery').d('交期'),
    },
    {
      name: 'qualityScore',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.quality').d('质量'),
    },
    {
      name: 'serviceScore',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.rcvTypeName.service').d('服务'),
    },
    {
      name: 'overallEvaluate',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.overallEvaluate').d('总体评价'),
    },
    {
      name: 'deliveryEvaluate',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.deliveryEvaluate').d('交期评价'),
    },
    {
      name: 'qualityEvaluate',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.qualityEvaluate').d('质量评价'),
    },
    {
      name: 'serviceEvaluate',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.rcvTypeName.serviceEvaluate')
        .d('服务评价'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { rcvTrxHeaderId, customizeUnitCode, ...other } = data.params || {};
      const { templateCode, templateVersion, cuszTplStageCode, cuszTplPageCode } =
        data.tplInfo || {};
      let params;
      if (customizeUnitCode) {
        params = {
          customizeUnitCode,
          cuszTplTemplateCode: templateCode,
          cuszTplVersion: templateVersion,
          cuszTplStageCode,
          cuszTplPageCode,
        };
      }
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/score/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        params,
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
  paging: false,
  autoQuery: false,
  autoCreate: true,
  forceValidate: true,
  fields: [
    {
      name: 'attachmentTemplateUuid',
      type: 'attachment',
      label: intl.get('sinv.receiptExecution.model.receipt.attachmentTemplateUuid').d('附件模板'),
    },
    {
      name: 'sinvHeaderAttachmentUuid',
      type: 'attachment',
      label: intl.get(`sinv.common.model.common.attachmentUuid`).d('附件查看'),
    },
  ],
});
export { formDS, tableDS, batchMaintenanceDS, formRateDS, attachmentDS };
