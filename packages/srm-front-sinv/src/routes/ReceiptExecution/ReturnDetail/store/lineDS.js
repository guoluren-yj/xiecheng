/*
 * @Description:
 * @Date: 2020-09-06 10:38:14
 * @author: fujie <jie.fu@hand-china.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2020, Hand
 */

import intl from 'utils/intl';
import { SRM_SPUC } from '_utils/config';
import { amountCalculation } from 'srm-front-boot/lib/utils/utils';
import { getCurrentOrganizationId, getDateFormat } from 'utils/utils';
import { math } from 'choerodon-ui/dataset';
import { isNil } from 'lodash';

const organizationId = getCurrentOrganizationId();

const formDS = () => ({
  selection: false,
  paging: false,
  fields: [
    {
      name: 'displayTrxNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.displayTrxNum').d('单据编号'),
    },
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.rcvTypeName.current').d('事务类型'),
    },
    {
      name: 'returnedFlag',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.returnedFlag').d('是否退回'),
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
      name: 'creationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.creationName').d('单据创建人'),
    },
    {
      name: 'creationDate',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.creationDate').d('创建日期'),
      format: getDateFormat(),
    },
    // {
    //   name: 'attachmentTemplateUuid',
    //   type: 'string',
    //   label: intl.get('sinv.receiptExecution.model.receipt.attachmentTemplateUuid').d('附件模板'),
    // },
    {
      name: 'sinvHeaderAttachmentUuid',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.headerAttachmentUuid').d('附件上传'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.remark.header').d('头备注'),
      maxLength: 1000,
    },
  ],
  transport: {
    read: ({ data }) => {
      const { rcvTrxHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        data: other,
      };
    },
  },
});

const tableDS = (formDs) => ({
  primaryKey: 'rcvTrxLineId',
  selection: false,
  modifiedCheck: false,
  fields: [
    {
      name: 'lineNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.lineNum').d('行号'),
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
      label: intl.get('sinv.receiptExecution.model.receipt.return.quantity').d('退回数量'),
      dynamicProps: {
        required: ({ record }) => record.get('subjectType') === 'QUANTITY',
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
      name: 'moveReason',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.moveReason').d('退回原因'),
      lookupCode: 'SPUC.SINV.MOVE.REASON',
    },
    {
      name: 'leftQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.canLeftQuantity').d('可退回数量'),
    },
    {
      name: 'taxIncludedAmount',
      type: 'number',
      min: 0,
      label: intl.get('sinv.receiptExecution.model.receipt.returnTaxIncludedAmount').d('退回金额'),
      dynamicProps: {
        required: ({ record }) => record.get('subjectType') === 'AMOUNT',
        max: ({ record }) => {
          if (record.get('subjectType') === 'AMOUNT') {
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
      label: intl.get('sinv.receiptExecution.model.receipt.canLeftTaxAmount').d('可退回金额'),
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
    // 个性化默认隐藏
    {
      name: 'rcvTypeName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.change').d('移动类型'),
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
    },
    {
      name: 'inventoryId',
      type: 'string',
      bind: 'inventoryNameLov.inventoryId',
    },
    {
      name: 'inventoryName',
      type: 'string',
      bind: 'inventoryNameLov.inventoryName',
    },
    {
      name: 'locationNameLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.locationName').d('库位'),
      ignore: 'always',
      lovCode: 'SRPM.LOCATION_BY_ORG_INV',
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
      name: 'poTypeCodeMeaning',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.poTypeCodeMeaning').d('来源单据类型'),
    },
    {
      name: 'sourceHeaderNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.source.poTypeCode').d('来源单据编号'),
    },
    {
      name: 'sourceLineNum',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.source.lineNum').d('来源单据行号'),
    },
    {
      name: 'invOrganizationName',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.invOrganizationName').d('收货组织'),
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
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.lineRemark').d('行备注'),
      maxLength: 300,
    },
    {
      name: 'sinvLineAttachmentUuid',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.lineUuid').d('行附件'),
    },
    {
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
  ],
  events: {
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        // eslint-disable-next-line no-param-reassign
        record.status = 'update';
      });
    },
    update: ({ record, name, value, dataSet }) => {
      if (name === 'inventoryNameLov' || !record.get('inventoryId')) {
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
        if (orderTypeCode === 'PC' && record.get('payRatio')) {
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
        if (orderTypeCode === 'PC' && record.get('payRatio')) {
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
    },
  },
  transport: {
    read: ({ data }) => {
      const { rcvTrxHeaderId, ...other } = data.params || {};
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/line/${rcvTrxHeaderId}/detail`,
        method: 'GET',
        data: other,
      };
    },
    destroy: ({ data }) => {
      const headerData = { ...formDs.toData()[0], sinvRcvTrxLineDTOS: data };
      return {
        url: `${SRM_SPUC}/v1/${organizationId}/sinv/rcv/trx/header/delete`,
        data: headerData,
        method: 'DELETE',
      };
    },
  },
});

export { formDS, tableDS };
