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
import { isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';

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
    {
      name: 'attachmentTemplateUuid',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.attachmentTemplateUuid').d('附件模板'),
    },
    {
      name: 'sinvHeaderAttachmentUuid',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.headerAttachmentUuid').d('附件上传'),
    },
    {
      name: 'totalTaxIncludedAmount',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.totalTaxIncludedAmount').d('汇总金额'),
    },
    {
      name: 'totalQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.totalQuantity').d('汇总数量'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.header.remark').d('备注'),
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
      label: intl.get('sinv.receiptExecution.model.receipt.exec.quantity').d('执行数量'),
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
        //   const textNum = `0.${Array(Number(uomPrecision)).join('0')}1`;
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
        required: ({ record }) => record.get('subjectType') === 'AMOUNT',
        // max: ({ record }) => {
        //   if (record.get('subjectType') === 'AMOUNT') return record.get('leftTaxAmount');
        // },
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
        //   const textNum = `0.${Array(Number(financialPrecision)).join('0')}1`;
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
      name: 'poQuantity',
      type: 'number',
      label: intl.get('sinv.receiptExecution.model.receipt.sourceQuantity').d('单据数量'),
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
      name: 'deliverTime',
      type: 'date',
      label: intl.get('sinv.receiptExecution.model.receipt.deliverTime').d('妥投时间'),
    },
    {
      name: 'remark',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.lineRemark').d('行备注'),
    },
    {
      name: 'sinvLineAttachmentUuid',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.lineUuid').d('行附件'),
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
      name: 'executeReverseQuantity',
      type: 'number',
      min: 0,
      label: intl.get('sinv.receiptExecution.model.receipt.reverseQuantity').d('执行退回数量'),
      dynamicProps: {
        step: ({ record }) => {
          const uomPrecision = !isNil(record.get('uomPrecision')) ? record.get('uomPrecision') : 10;
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
        //   const textNum = `0.${Array(Number(uomPrecision)).join(0)}1`;
        //   return textNum;
        // },
      },
    },
    {
      name: 'reverseNodeLov',
      type: 'object',
      label: intl.get('sinv.receiptExecution.model.receipt.reverseNode').d('执行退回节点'),
      lovCode: 'SPUC.SINV_REVERSE_NODE_URL',
      textField: 'rcvTypeName',
      ignore: 'always',
      noCache: true,
      dynamicProps: {
        lovPara: ({ record }) => {
          const { strategyLineId } = formDs.toData()[0] || {};
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
      name: 'customSpecsJson',
      type: 'string',
      label: intl.get('sinv.receiptExecution.model.receipt.customSpecsJson').d('定制品属性'),
    },
  ],
  events: {
    update: ({ record, name, value, dataSet }) => {
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
            quantity,
            financialPrecision,
            defaultPrecision,
            taxUnitPrice: taxIncludedPrice, // 含税
            netUnitPrice: netPrice, // 不含税
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
    load: ({ dataSet }) => {
      dataSet.forEach((record) => {
        // eslint-disable-next-line no-param-reassign
        record.status = 'update';
      });
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
