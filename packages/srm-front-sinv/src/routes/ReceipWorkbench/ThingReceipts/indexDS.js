/*
 * @Description:
 * @Date: 2021-05-01 09:20:13
 * @author: zuoxiangyu <xiangyu.zuo@going-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';
import { conversionUpdate } from '@/routes/components/utils';

const organizationId = getCurrentOrganizationId();

// 事务
const waitTableDS = () => ({
  autoQuery: false,
  primaryKey: 'rcvTrxLineId',
  cacheSelection: true, // 跨页勾选
  cacheModified: true,
  pageSize: 20,
  fields: [
    {
      name: 'nodeConfigName',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.orderTypeName.receiveNode')
        .d('收货节点'),
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
      required: true,
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
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'secondaryQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
      min: 0,
      dynamicProps: {
        max: ({ record, dataSet }) => {
          if (
            record.get('limitlessReceiptFlag') === 1 &&
            record.get('subjectType') === 'QUANTITY'
          ) {
            return false;
          }
          if (record.get('firstNodeFlag') === 1) {
            return false;
          }
          if (record.get('subjectType') === 'QUANTITY' || record.get('orderTypeCode') === 'PC') {
            if (dataSet.getState('doubleUnitEnabled')) {
              return record.get('secondaryLeftQuantity');
            }
            return record.get('leftQuantity');
          }
        },
      },
    },
    {
      name: 'secondaryLeftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量'),
    },
    {
      name: 'quantity',
      type: 'number',

      dynamicProps: {
        label: ({ dataSet }) =>
          dataSet.getState('doubleUnitEnabled')
            ? intl.get('sinv.receiptExecution.model.receipt.exec.baseQuantity').d('执行基本数量')
            : intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
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
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      // min: 0,
      label: intl.get('sinv.receiptExecution.model.receipt.taxIncludedAmount').d('执行金额(含税)'),
      dynamicProps: {
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
      label: intl
        .get('sinv.receiptExecution.model.receipt.leftTaxAmount.tax')
        .d('可执行金额(含税)'),
    },
    {
      name: 'trxDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.organizationName').d('收货组织'),
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
      // transformRequest: (value) => value?.inventoryId ?? null,
      transformResponse: (value, object) => {
        return object?.inventoryId
          ? {
              ...object,
              inventoryId: object?.inventoryId,
            }
          : null;
      },
    },
    {
      name: 'inventoryName',
      type: 'string',
      bind: 'inventoryId.inventoryName',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
    },
    {
      name: '_inventoryId',
      type: 'string',
      bind: 'inventoryId.inventoryId',
      transformResponse: (value, object) => {
        return object?.inventoryId;
      },
    },
    // {
    //   name: 'inventoryId',
    //   type: 'string',
    //   bind: 'inventoryNameLov.inventoryId',
    // },
    {
      name: 'locatorId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
      ignore: 'always',
      lovCode: 'HPFM.LOCATION_URL', // SRPM.LOCATION_BY_ORG_INV
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            inventoryId: record.get('inventoryId')?.inventoryId,
          };
        },
        disabled: ({ record }) => !record.get('inventoryId')?.inventoryId,
      },
      // transformRequest: (value, record) =>
      //   (value?.locationId || record.get('inventoryId')?.locatorId) ?? null,
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
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
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
      name: 'fromDisplayPoNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theFromDisplayPoLineNum')
        .d('来源订单编号-行号'),
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
      name: 'sourceStatusCode',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.sourceReceiveStatusCode')
        .d('来源单据收货状态'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'purchaseAgentName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.purchaseAgentName').d('采购员'),
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'dueDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.dueDate').d('妥投时间'),
    },
    {
      name: 'fromDisplayTrxNum',
      type: 'string',
      label: intl
        .get('sinv.receiptExecution.model.receipt.theDisplayTrxNum')
        .d('参考凭证编号-行号'),
    },
    {
      name: 'fromPcNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.theFromPcNum').d('来源协议编号-行号'),
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.receiptStrategy').d('收货策略'),
    },
    {
      name: 'processDocuments',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.processDocuments').d('单据流'),
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
      type: 'string',
      name: 'attachmentUrlList',
    },
    {
      name: 'authReceiveUserIdMeaning',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.authorityConsignee').d('权限收货人'),
    },
    {
      name: 'projectTaskId',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.projectTaskId').d('项目任务名称'),
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/workbench/trx/waiting`,
        method: 'GET',
        data: queryData,
      };
    },
  },
  events: {
    update: ({ record, name, value, dataSet }) => {
      if (name === 'inventoryId' || !record.get('inventoryId')?.inventoryId) {
        record.set('locatorId', '');
        record.set('locationName', '');
      }
      if (name === 'secondaryQuantity' && record.get('subjectType') === 'QUANTITY' && value) {
        // 按数量接收
        conversionUpdate({ dataSet, record, value });
      }
      if (record.get('subjectType') === 'AMOUNT' && name === 'taxIncludedAmount' && value) {
        // const uomPrecision = record.get('uomPrecision') || 6;
        const uomPrecision = !isNil(record.get('uomPrecision'))
          ? record.get('uomPrecision') === 0
            ? 0
            : record.get('uomPrecision')
          : 6;
        if (record.get('orderTypeCode') === 'PC' && record.get('payRatio')) {
          record
            .getField('taxIncludedAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const quantity =
                  (value * record.get('unitPriceBatch') * 1000000 * 100) /
                  (record.get('taxIncludedPrice') * record.get('payRatio') * 1000000);
                record.set('quantity', quantity.toFixed(uomPrecision));
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
        } else {
          record
            .getField('taxIncludedAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const quantity =
                  (value * record.get('unitPriceBatch') * 1000000) /
                  (record.get('taxIncludedPrice') * 1000000);
                record.set('quantity', quantity.toFixed(uomPrecision));
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

      // // 辅助单位
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
});

export { waitTableDS };
