/*
 * @Description:
 * @Date: 2020-09-06 10:38:14
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';

const organizationId = getCurrentOrganizationId();

// 待执行
const exTableDS = () => ({
  primaryKey: 'rcvTrxLineId',
  fields: [
    {
      name: 'orderTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.orderTypeName.source').d('来源单据类型'),
    },
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    {
      name: 'trxLineNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxLineNum').d('单据行号'),
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
      name: 'quantity',
      type: 'number',
      min: 0,
      label: intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
      dynamicProps: {
        max: ({ record }) => {
          if (record.get('subjectType') === 'QUANTITY') {
            return record.get('leftQuantity');
          }
        },
        // min: ({ record }) => {
        //   if ([0, '0'].includes(record.get('uomPrecision'))) {
        //     return 1;
        //   }
        //   const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
        //   const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
        //   return textNum;
        // },
      },
    },
    {
      name: 'leftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.leftQuantity').d('可执行数量'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      min: 0,
      label: intl.get('sinv.receiptExecution.model.receipt.taxIncludedAmount').d('执行金额(含税)'),
      dynamicProps: {
        // max: ({ record }) => {
        //   if (record.get('subjectType') === 'AMOUNT') return record.get('leftTaxAmount');
        // },
        // min: ({ record }) => {
        //   if (['1', 1].includes(record.get('freeFlag')) || math.isZero(record.get('netPrice'))) {
        //     return;
        //   }
        //   if ([0, '0'].includes(record.get('financialPrecision'))) {
        //     return 1;
        //   }
        //   const financialPrecision = !isNil(record.get('financialPrecision'))
        //     ? record.get('financialPrecision')
        //     : 10;
        //   const textNum = `0.${Array(Number(financialPrecision)).join(0)}1`;
        //   return textNum;
        // },
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
      name: 'taxRateLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.taxId').d('税率'),
      ignore: 'always',
      lovCode: 'SMDM.TAX',
    },
    {
      name: 'taxId',
      bind: 'taxRateLov.taxId',
      type: 'string',
    },
    {
      name: 'taxRate',
      bind: 'taxRateLov.taxRate',
      type: 'string',
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.not.netPrice').d('未税单价'),
    },
    {
      name: 'taxIncludedPrice',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.tax.includedPrice').d('含税单价'),
    },
    {
      name: 'trxDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'inventoryNameLov',
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
    },
    {
      name: 'inventoryName',
      type: 'string',
      bind: 'inventoryNameLov.inventoryName',
    },
    {
      name: 'inventoryId',
      type: 'string',
      bind: 'inventoryNameLov.inventoryId',
    },
    {
      name: 'locationNameLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
      ignore: 'always',
      lovCode: 'SRPM.LOCATION_BY_ORG_INV',
      dynamicProps: {
        lovPara: ({ record }) => {
          return {
            tenantId: organizationId,
            inventoryId: record.get('inventoryId'),
          };
        },
        disabled: ({ record }) => !record.get('inventoryId'),
      },
    },
    {
      name: 'locatorId',
      type: 'string',
      bind: 'locationNameLov.locationId',
    },
    {
      name: 'locationName',
      type: 'string',
      bind: 'locationNameLov.locationName',
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.organizationName').d('收货组织'),
    },
    {
      name: 'orgQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.quantity').d('单据数量'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.productNum').d('商品编码'),
    },
    {
      name: 'dueDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.dueDate').d('妥投时间'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'sourceHeaderNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.sourceHeaderNum').d('来源单号'),
    },
    {
      name: 'sourceLineNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.sourceLineNum').d('来源行号'),
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.strategyCode').d('策略编号'),
    },
    {
      name: 'checkType',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.checkType').d('验收类型'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.stageName').d('阶段'),
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
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
  ],
  queryFields: [
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    {
      name: 'supplierAll',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
      lovPara: {
        tenantId: organizationId,
      },
      lovCode: 'SPRM.SUPPLIER',
      transformRequest: (value) => value && value.supplierCompanyId,
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierAll.supplierCompanyId',
    },
    {
      name: 'supplierId',
      bind: 'supplierAll.supplierId',
    },
    {
      name: 'itemId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.item').d('物料'),
      lovCode: 'SMDM.ITEM',
      textField: 'itemName',
      valueField: 'itemId',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.itemId,
    },
    {
      name: 'inventoryId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
      lovCode: 'SODR.INVENTORY',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.inventoryId,
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
      maxLength: 100,
    },
    {
      name: 'compAll',
      type: 'object',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovPara: {
        tenantId: organizationId,
      },
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      ignore: 'always',
    },
    {
      name: 'companyId',
      bind: 'compAll.companyId',
    },
    {
      name: 'companyName',
      bind: 'compAll.companyName',
    },
    {
      name: 'purchaseOrgIdsLov',
      type: 'object',
      label: intl.get(`sinv.receiptExecution.model.receipt.invOrganizationId`).d('收货组织'),
      lovPara: {
        tenantId: organizationId,
      },
      // multiple: true,
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.INVORG',
    },
    {
      name: 'receiptOrganizationId',
      bind: 'purchaseOrgIdsLov.organizationId',
      // multiple: ',',
    },
    {
      name: 'categoryId',
      type: 'object',
      label: intl.get(`sinv.receiptExecution.model.receipt.categoryName`).d('品类'),
      lovPara: {
        tenantId: organizationId,
      },
      valueField: 'categoryId',
      textField: 'categoryName',
      lovCode: 'SMDM.PAGE_ITEM_CATEGORY',
      transformRequest: (value) => value && value.categoryId,
    },
  ],
  events: {
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.reset();
    },
    update: ({ record, name, value }) => {
      if (name === 'inventoryNameLov' || !record.get('inventoryId')) {
        record.set('locatorId', '');
        record.set('locationName', '');
      }
      const financialPrecision = !isNil(record.get('financialPrecision'))
        ? record.get('financialPrecision')
        : 10;
      const defaultPrecision = !isNil(record.get('defaultPrecision'))
        ? record.get('defaultPrecision')
        : 10;
      const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
      if (
        record.get('subjectType') === 'QUANTITY' &&
        name === 'quantity' &&
        value &&
        record.get('payRatio')
      ) {
        if (record.get('orderTypeCode') === 'PC' && record.get('checkTypeCode') === 'stage') {
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
          record
            .getField('quantity')
            .checkValidity()
            .then((res) => {
              if (res) {
                const taxIncludedAmount = math.div(
                  math.multipliedBy(
                    math.multipliedBy(value, record.get('taxIncludedPrice')),
                    1000000
                  ),
                  math.multipliedBy(record.get('unitPriceBatch'), 1000000)
                );
                record.set(
                  'taxIncludedAmount',
                  math.toFixed(taxIncludedAmount, financialPrecision)
                );
              }
            });
        }
      } else if (
        record.get('subjectType') === 'AMOUNT' &&
        name === 'taxIncludedAmount' &&
        value &&
        record.get('payRatio')
      ) {
        if (record.get('orderTypeCode') === 'PC' && record.get('checkTypeCode') === 'stage') {
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
        if (record.get('orderTypeCode') === 'PC' && !isNil(record.get('payRatio'))) {
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
    },
  },
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/waiting`,
        method: 'GET',
        data: queryData,
      };
    },
    submit: ({ data, dataSet }) => {
      const {
        queryParameter: { params = {} },
      } = dataSet;
      const { customizeUnitCode } = params;
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/waiting-save`,
        method: 'PUT',
        params: { customizeUnitCode },
        data,
      };
    },
  },
});

// 执行中
const peTableDS = () => ({
  primaryKey: 'rcvTrxHeaderId',
  fields: [
    {
      name: 'sugRcvStatusCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.sugRcvStatusCode').d('建议处理策略'),
      lookupCode: 'SPUC.SINV_SUGGEST_STRATEGY',
      required: true,
    },
    {
      name: 'remark',
      type: 'text',
      label: intl.get('sinv.receiptExecution.model.receipt.remark').d('备注'),
    },
    {
      name: 'rcvStatusCodeMeaning',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.rcvStatusCodeMeaning').d('单据状态'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.rcvTypeName').d('事务类型'),
    },
    {
      name: 'returnedFlag',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.returnedFlag').d('是否退回'),
    },
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.strategyCode').d('策略编号'),
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
  ],
  queryFields: [
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    {
      name: 'supplierAll',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
      lovCode: 'SPRM.SUPPLIER',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.supplierCompanyId,
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierAll.supplierCompanyId',
    },
    {
      name: 'supplierId',
      bind: 'supplierAll.supplierId',
    },
    {
      name: 'itemId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.item').d('物料'),
      lovCode: 'SMDM.ITEM',
      textField: 'itemName',
      valueField: 'itemId',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.itemId,
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
      maxLength: 100,
    },
    {
      name: 'compAll',
      type: 'object',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovPara: {
        tenantId: organizationId,
      },
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      ignore: 'always',
    },
    {
      name: 'companyId',
      bind: 'compAll.companyId',
    },
    {
      name: 'companyName',
      bind: 'compAll.companyName',
    },
  ],
  events: {
    unSelect: ({ record }) => {
      record.reset();
    },
    unSelectAll: ({ dataSet }) => {
      dataSet.reset();
    },
    // load: ({ dataSet }) => {
    //   dataSet.forEach(record => {
    //     if (
    //       record.get('rcvStatusCode') !== '10_NEW' &&
    //       record.get('rcvStatusCode') !== '30_REJECTED'
    //     ) {
    //       Object.assign(record, { selectable: false });
    //     }
    //   });
    // },
  },
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/doing`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

// 已完成明细列表
const deTableDS = (handleEditChange = (e) => e) => ({
  primaryKey: 'rcvTrxLineId',
  fields: [
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.rcvTypeName.current').d('事务类型'),
    },
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    {
      name: 'trxLineNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxLineNum').d('单据行号'),
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
      name: 'quantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.quantity').d('单据数量'),
    },
    {
      name: 'leftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.returnQuantity').d('可退回数量'),
    },
    {
      name: 'updateQuantity',
      type: 'number',
      min: 0,
      label: intl.get('sinv.receiptExecution.model.receipt.return.quantity').d('退回数量'),
      dynamicProps: {
        required: ({ record }) => record.get('subjectType') === 'QUANTITY',
        max: ({ record }) => {
          if (record.get('subjectType') === 'QUANTITY') return record.get('leftQuantity');
        },
        // min: ({ record }) => {
        //   if ([0, '0'].includes(record.get('uomPrecision'))) {
        //     return 1;
        //   }
        //   const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
        //   const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
        //   return textNum;
        // },
      },
    },
    {
      name: 'moveReason',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.moveReason').d('退回原因'),
      lookupCode: 'SPUC.SINV.MOVE.REASON',
    },
    {
      name: 'reversedQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.quantity.returned').d('已退回数量'),
    },
    {
      name: 'leftTaxAmount',
      type: 'number',
      label: intl
        .get('sinv.receiptExecution.model.receipt.can.return.leftTaxAmount')
        .d('可退回金额(含税)'),
    },
    {
      name: 'updateTaxAmount',
      type: 'number',
      min: 0,
      label: intl
        .get('sinv.receiptExecution.model.receipt.return.updateTaxAmount')
        .d('退回金额(含税)'),
      dynamicProps: {
        required: ({ record }) => record.get('subjectType') === 'AMOUNT',
        max: ({ record }) => {
          if (record.get('subjectType') === 'AMOUNT') return record.get('leftTaxAmount');
        },
        // min: ({ record }) => {
        //   if (['1', 1].includes(record.get('freeFlag')) || math.isZero(record.get('netPrice'))) {
        //     return;
        //   }
        //   if ([0, '0'].includes(record.get('financialPrecision'))) {
        //     return 1;
        //   }
        //   const financialPrecision = !isNil(record.get('financialPrecision'))
        //     ? record.get('financialPrecision')
        //     : 10;
        //   const textNum = `0.${Array(Number(financialPrecision)).join(0)}1`;
        //   return textNum;
        // },
      },
    },
    {
      name: 'reversedTaxAmount',
      type: 'number',
      label: intl
        .get('sinv.receiptExecution.model.receipt.return.reversedTaxAmount')
        .d('已退回金额(含税)'),
    },
    {
      name: 'taxRateLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.taxId').d('税率'),
      ignore: 'always',
      lovCode: 'SMDM.TAX',
    },
    {
      name: 'taxId',
      bind: 'taxRateLov.taxId',
      type: 'string',
    },
    {
      name: 'taxRate',
      bind: 'taxRateLov.taxRate',
      type: 'string',
    },
    {
      name: 'netPrice',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.not.netPrice').d('未税单价'),
    },
    {
      name: 'taxIncludedPrice',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.tax.includedPrice').d('含税单价'),
    },
    {
      name: 'trxDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.trxDate').d('实际操作日期'),
    },
    {
      name: 'inventoryName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
    },
    {
      name: 'locationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
    },
    {
      name: 'organizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.organizationName').d('收货组织'),
    },
    {
      name: 'uomName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.uomName').d('单位'),
    },
    {
      name: 'productNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.productNum').d('商品编码'),
    },
    {
      name: 'dueDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.dueDate').d('妥投时间'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'sourceHeaderNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.sourceHeaderNum').d('来源单号'),
    },
    {
      name: 'sourceLineNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.sourceLineNum').d('来源行号'),
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.strategyCode').d('策略编号'),
    },
    {
      name: 'checkType',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.checkType').d('验收类型'),
    },
    {
      name: 'stageName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.stageName').d('阶段'),
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
    {
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
  ],
  queryFields: [
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    {
      name: 'itemId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.item').d('物料'),
      lovCode: 'SMDM.ITEM',
      textField: 'itemName',
      valueField: 'itemId',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.itemId,
    },
    {
      name: 'inventoryId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.inventoryName').d('库房'),
      lovCode: 'SODR.INVENTORY',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.inventoryId,
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
      maxLength: 100,
    },
    {
      name: 'compAll',
      type: 'object',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovPara: {
        tenantId: organizationId,
      },
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.COMPANY',
    },
    {
      name: 'companyId',
      bind: 'compAll.companyId',
    },
    {
      name: 'companyName',
      bind: 'compAll.companyName',
    },
    {
      name: 'purchaseOrgIdsLov',
      type: 'object',
      label: intl.get(`sinv.receiptExecution.model.receipt.invOrganizationId`).d('收货组织'),
      lovPara: {
        tenantId: organizationId,
      },
      // multiple: true,
      ignore: 'always',
      lovCode: 'SPFM.USER_AUTH.INVORG',
    },
    {
      name: 'receiptOrganizationId',
      bind: 'purchaseOrgIdsLov.organizationId',
      // multiple: ',',
    },
    {
      name: 'categoryId',
      type: 'object',
      label: intl.get(`sinv.receiptExecution.model.receipt.categoryName`).d('品类'),
      lovPara: {
        tenantId: organizationId,
      },
      valueField: 'categoryId',
      textField: 'categoryName',
      lovCode: 'SMDM.PAGE_ITEM_CATEGORY',
      transformRequest: (value) => value && value.categoryId,
    },
  ],
  events: {
    query: () => handleEditChange(),
    update: ({ record, name, value }) => {
      const financialPrecision = !isNil(record.get('financialPrecision'))
        ? record.get('financialPrecision')
        : 10;
      const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
      if (record.get('subjectType') === 'QUANTITY' && name === 'updateQuantity' && value) {
        if (
          record.get('orderTypeCode') === 'PC' &&
          record.get('checkTypeCode') === 'stage' &&
          record.get('payRatio')
        ) {
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
          record
            .getField('updateQuantity')
            .checkValidity()
            .then((res) => {
              if (res) {
                const updateTaxAmount = math.div(
                  math.multipliedBy(
                    math.multipliedBy(value, record.get('taxIncludedPrice')),
                    1000000
                  ),
                  math.multipliedBy(record.get('unitPriceBatch'), 1000000)
                );
                record.set('updateTaxAmount', math.toFixed(updateTaxAmount, financialPrecision));
              }
            });
        }
      } else if (record.get('subjectType') === 'AMOUNT' && name === 'updateTaxAmount' && value) {
        if (
          record.get('orderTypeCode') === 'PC' &&
          record.get('checkTypeCode') === 'stage' &&
          record.get('payRatio')
        ) {
          record
            .getField('updateTaxAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const updateQuantity = math.div(
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
                record.set('updateQuantity', math.toFixed(updateQuantity, uomPrecision));
              }
            });
        } else {
          record
            .getField('updateTaxAmount')
            .checkValidity()
            .then((res) => {
              if (res) {
                const updateQuantity = math.div(
                  math.multipliedBy(
                    math.multipliedBy(value, record.get('unitPriceBatch')),
                    1000000
                  ),
                  math.multipliedBy(record.get('taxIncludedPrice'), 1000000)
                );
                record.set('updateQuantity', math.toFixed(updateQuantity, uomPrecision));
              }
            });
        }
      }
    },
  },
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/finish/line`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

// 已完成整单列表
const allTableDS = () => ({
  primaryKey: 'rcvTrxHeaderId',
  // selection: false,
  fields: [
    {
      name: 'rcvStatusCodeMeaning',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.rcvStatusCodeMeaning').d('单据状态'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.rcvTypeName').d('事务类型'),
    },
    {
      name: 'returnedFlag',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.returnedFlag').d('是否退回'),
    },
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    {
      name: 'supplierName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    },
    {
      name: 'companyName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.companyName').d('公司'),
    },
    {
      name: 'strategyCode',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.strategyCode').d('策略编号'),
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
    },
  ],
  queryFields: [
    {
      name: 'trxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.trxNum').d('单据编号'),
    },
    // {
    //   name: 'supplierCompanyId',
    //   type: 'object',
    //   label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
    //   lovCode: 'SPUC_ASN_SUPPLIER',
    //   lovPara: {
    //     tenantId: organizationId,
    //   },
    //   transformRequest: (value) => value && value.supplierCompanyId,
    // },
    {
      name: 'supplierAll',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.supplierName').d('供应商'),
      lovCode: 'SPRM.SUPPLIER',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.supplierCompanyId,
    },
    {
      name: 'supplierCompanyId',
      bind: 'supplierAll.supplierCompanyId',
    },
    {
      name: 'supplierId',
      bind: 'supplierAll.supplierId',
    },
    {
      name: 'itemId',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.item').d('物料'),
      lovCode: 'SMDM.ITEM',
      textField: 'itemName',
      valueField: 'itemId',
      lovPara: {
        tenantId: organizationId,
      },
      transformRequest: (value) => value && value.itemId,
    },
    {
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.createName').d('创建人'),
      maxLength: 100,
    },
    {
      name: 'compAll',
      type: 'object',
      label: intl.get(`entity.company.tag`).d('公司'),
      lovPara: {
        tenantId: organizationId,
      },
      lovCode: 'SPFM.USER_AUTH.COMPANY',
      transformRequest: (value) => value && value.companyId,
    },
    {
      name: 'companyId',
      bind: 'compAll.companyId',
    },
    {
      name: 'companyName',
      bind: 'compAll.companyName',
    },
  ],
  transport: {
    read: ({ data }) => {
      const { params, ...other } = data;
      const queryData = filterNullValueObject({ ...params, ...other });
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/finish/header`,
        method: 'GET',
        data: queryData,
      };
    },
  },
});

export { exTableDS, peTableDS, deTableDS, allTableDS };
