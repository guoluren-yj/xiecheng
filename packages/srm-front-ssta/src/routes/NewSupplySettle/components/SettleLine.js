/* eslint-disable react/jsx-indent */
/*
 * @Description: 采购方结算单-结算单行
 * @Date: 2022-02-05 12:53:29
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useContext, useMemo, useCallback, useEffect, isValidElement } from 'react';
import { Button, useModal } from 'choerodon-ui/pro';
import { Popover } from 'choerodon-ui';
import { observer } from 'mobx-react';
import { isEmpty, isFunction, isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import notification from 'utils/notification';
import NewCommonImport from 'components/Import';
import ExcelExport from 'components/ExcelExport';
import ExcelExportPro from 'components/ExcelExportPro';
import SearchBarTable from '_components/SearchBarTable';
import CommonImport from 'hzero-front-himp/lib/components/CommonImport';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import styles from '@/routes/common.less';
import {
  formatNumber,
  recordPickValues,
  getSelectedNegActConfirmMsg,
  viewSettleModal,
  getIncTaxAmountByNetPrice,
  getNetPriceByTaxIncPrice,
} from '@/utils/utils';
import { settleLineConfig } from '@/utils/amountConfig';
import { getSettleHeaderDataSup } from '@/services/settlePoolServices';

import { useModalOpen } from '../hooks';
import { Store } from '../Detail/StoreProvider';
import SettleAffair from './SettleAffair';
import LineDetailDrawer from './LineDetailDrawer';
import PrePayWriteOffModal from './PrePayWriteOffModal';
import BatchModifyModal from './BatchModifyModal';

const tenantId = getCurrentOrganizationId();
const noHightLightStatus = ['NEW', 'RETURN', 'INVOICE_EXCEPTION', 'INVOICE_FAILED'];
const prefix = `${SRM_SSTA}/v1/${tenantId}`;

const lineCodes = {
  PAYMENT:
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH',
  INVOICE:
    'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH',
};

export default observer((props) => {
  const { onSetStepsCurrent, onUpdateModalTitle, source } = props;
  const {
    settleType,
    updateFlag: ctxUpdateFlag,
    approveFlag,
    linePayment,
    settleLineDs = {},
    settleHeader,
    documentType,
    settleStatus,
    permissionMap,
    settleHeaderId,
    linePrePaymentVer,
    customizeTable,
    settleHeaderDs,
    history,
    readOnlyFlag,
    directInvoicingType,
    invoiceMatchRuleCode,
    taxInvoiceDs,
    remoteProps,
    paymentStageDs,
  } = useContext(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const updateFlag = source === 'view' ? false : ctxUpdateFlag;
  const { selected = [] } = settleLineDs;
  const { camp, paymentControlRuleSource, taxOfficeIssueFlag } =
    settleHeader?.get(['camp', 'paymentControlRuleSource', 'taxOfficeIssueFlag']) || {};
  // 电商开票异常单子，【新增】【删除】【批量编辑】按钮显示逻辑
  const invoiceExceptionBtnShowFlag =
    settleStatus === 'INVOICE_EXCEPTION' &&
    directInvoicingType === 'EC' &&
    invoiceMatchRuleCode === 'DIRECT_INVOICING';

  const requestUrl = useMemo(() => {
    return `${prefix}/settle-lines/supplier/${documentType.toLowerCase()}/export/${settleHeaderId}?customizeUnitCode=${lineCodes[documentType]
      }`;
  }, [documentType, settleHeaderId]);

  const newRequestUrl = useMemo(() => {
    return `${prefix}/settle-lines/supplier/${documentType.toLowerCase()}/export/new/${settleHeaderId}?customizeUnitCode=${lineCodes[documentType]
      }`;
  }, [documentType, settleHeaderId]);

  const exportParams = useMemo(() => {
    const settleLineIdList = selected.map((item) => item.get('settleLineId'));
    const queryData = settleLineDs.queryDataSet?.current?.toData() || {};
    if (selected.length > 0) {
      return filterNullValueObject({ settleLineIdList });
    } else {
      return filterNullValueObject(queryData);
    }
  }, [settleLineDs, selected]);

  const priceCalPrecisionFlag = useMemo(
    () => settleHeaderDs?.getState('priceCalPrecisionFlag'),
    [settleHeaderDs]
  );

  useEffect(() => {
    settleLineDs.addEventListener('update', handleUpdateLine);
    return () => {
      settleLineDs.removeEventListener('update', handleUpdateLine);
    };
  }, [settleLineDs, handleUpdateLine]);

  useEffect(() => {
    settleLineDs.setState('updateFlag', updateFlag);
  }, [settleLineDs, updateFlag]);

  const handleUpdateLine = useCallback(
    ({ record, name }) => {
      const {
        taxRateLov = {},
        settleMatchDimension,
        settleBasePrice,
        invoicePartMatchFlag,
        priceUpdFlag,
        taxRateUpdFlag,
        taxAmountUpdFlag,
        unitPriceBatchUpdFlag,
        taxRateType,
      } = record.get([
        'taxRateLov',
        'settleMatchDimension',
        'settleBasePrice',
        'invoicePartMatchFlag',
        'priceUpdFlag',
        'taxRateUpdFlag',
        'taxAmountUpdFlag',
        'unitPriceBatchUpdFlag',
        'taxRateType',
      ]);

      const amountPrecision = Number(record.get('amountPrecision'));

      const pricePrecision = Number(record.get('pricePrecision'));
      const inPriceTaxFlag = taxRateType === 'IN_PRICE_TAX';

      const get = (field) => record.get(field);

      const set = (field, value) => record.set(field, value);

      if (name === 'taxRateLov') {
        set('taxCode', taxRateLov && taxRateLov.taxCode);
      }

      if (name === 'paymentAmount') {
        set('paymentAmount', math.toFixed(get('paymentAmount'), amountPrecision));
      }

      /**
       * 第一层判断
       * 结算匹配维度为数量
       */
      if (settleMatchDimension === 'QUANTITY') {
        /**
         * 第二层判断
         * 结算基准价为不含税
         */
        if (settleBasePrice === 'NET_PRICE') {
          /**
           * FIXME: 数量 && 不含税单价 && 每 调整联动
           */
          if (name === 'quantity' || name === 'netPrice' || name === 'unitPriceBatch') {
            if (name === 'netPrice') {
              set('netPrice', math.toFixed(get('netPrice'), pricePrecision));
            }
            if (name === 'unitPriceBatch') {
              set('unitPriceBatch', math.toFixed(get('unitPriceBatch'), 10));
            }
            /**
             * 本次开票不含税金额
             */
            if (invoicePartMatchFlag === 1 || priceUpdFlag === 1 || unitPriceBatchUpdFlag === 1) {
              set(
                'netAmount',
                math.toFixed(
                  math.div(
                    math.multipliedBy(get('netPrice'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  amountPrecision
                )
              );
            }
            /**
             * 税额
             */
            if (
              priceUpdFlag === 1 ||
              invoicePartMatchFlag === 1 ||
              taxRateUpdFlag === 1 ||
              taxAmountUpdFlag === 0 ||
              unitPriceBatchUpdFlag === 1
            ) {
              const taxAmount = inPriceTaxFlag ? math.toFixed(math.div(math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)), math.minus(1, math.div(get('taxRate'), 100))), amountPrecision) : math.toFixed(
                math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)),
                amountPrecision
              );
              set('taxAmount', taxAmount);
            }
            /**
             * 含税金额
             */
            if (
              (priceUpdFlag === 0 &&
                invoicePartMatchFlag === 0 &&
                (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              priceUpdFlag === 1 ||
              invoicePartMatchFlag === 1 ||
              unitPriceBatchUpdFlag === 1
            ) {
              set(
                'taxIncludedAmount',
                math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPrecision)
              );
            }
            /**
             * 含税单价
             */
            if (priceUpdFlag === 1 || unitPriceBatchUpdFlag === 1) {
              const taxIncludedPrice = priceCalPrecisionFlag
                ? math.toFixed(
                  math.multipliedBy(
                    math.div(get('taxIncludedAmount'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  pricePrecision
                )
                : getIncTaxAmountByNetPrice(
                  get('netPrice'),
                  get('quantity'),
                  get('taxRate'),
                  get('pricePrecision'),
                  get('unitPriceBatch'),
                  inPriceTaxFlag,
                );
              set('taxIncludedPrice', taxIncludedPrice);
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }
            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
          /**
           * FIXME: 税率调整联动
           */
          if (name === 'taxRateLov') {
            /**
             * 税额
             */
            if (priceUpdFlag === 1 || invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
              const taxAmount = inPriceTaxFlag ? math.toFixed(math.div(math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)), math.minus(1, math.div(get('taxRate'), 100))), amountPrecision) : math.toFixed(
                math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)),
                amountPrecision
              );
              set('taxAmount', taxAmount);
            }
            /**
             * 含税金额
             */
            if (
              (priceUpdFlag === 0 &&
                invoicePartMatchFlag === 0 &&
                (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              priceUpdFlag === 1 ||
              invoicePartMatchFlag === 1
            ) {
              set(
                'taxIncludedAmount',
                math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPrecision)
              );
            }
            /**
             * 含税单价
             */
            if (priceUpdFlag === 1) {
              const taxIncludedPrice = priceCalPrecisionFlag
                ? math.toFixed(
                  math.multipliedBy(
                    math.div(get('taxIncludedAmount'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  pricePrecision
                )
                : getIncTaxAmountByNetPrice(
                  get('netPrice'),
                  get('quantity'),
                  get('taxRate'),
                  get('pricePrecision'),
                  get('unitPriceBatch'),
                  inPriceTaxFlag,
                );
              set('taxIncludedPrice', taxIncludedPrice);
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }
            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
          /**
           * FIXME: 税额调整联动
           */
          if (name === 'taxAmount') {
            set('taxAmount', math.toFixed(get('taxAmount'), amountPrecision));
            /**
             * 含税金额
             */
            if (
              (priceUpdFlag === 0 &&
                invoicePartMatchFlag === 0 &&
                (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              priceUpdFlag === 1 ||
              invoicePartMatchFlag === 1
            ) {
              set(
                'taxIncludedAmount',
                math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPrecision)
              );
            }
            /**
             * 含税单价
             */
            if (priceUpdFlag === 1) {
              set(
                'taxIncludedPrice',
                math.toFixed(
                  math.multipliedBy(
                    math.div(get('taxIncludedAmount'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  pricePrecision
                )
              );
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }
            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
        }

        /**
         * 第二层判断
         * 结算基准价为含税
         */
        if (settleBasePrice === 'TAX_INCLUDED_PRICE') {
          /**
           * FIXME: 数量 && 含税单价 && 每 调整联动
           */
          if (name === 'quantity' || name === 'taxIncludedPrice' || name === 'unitPriceBatch') {
            if (name === 'taxIncludedPrice') {
              set(
                'taxIncludedPrice',
                math.toFixed(get('taxIncludedPrice'), pricePrecision) || get('taxIncludedAmount')
              );
            }
            if (name === 'unitPriceBatch') {
              set('unitPriceBatch', math.toFixed(get('unitPriceBatch'), 10));
            }
            /**
             * 本次开票含税金额
             */
            if (priceUpdFlag === 1 || invoicePartMatchFlag === 1 || unitPriceBatchUpdFlag === 1) {
              set(
                'taxIncludedAmount',
                math.toFixed(
                  math.div(
                    math.multipliedBy(get('taxIncludedPrice'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  amountPrecision
                )
              );
            }
            /**
             * 税额
             */
            if (
              priceUpdFlag === 1 ||
              invoicePartMatchFlag === 1 ||
              taxRateUpdFlag === 1 ||
              unitPriceBatchUpdFlag === 1
            ) {
              const taxAmount = inPriceTaxFlag ? math.toFixed(math.multipliedBy(get('taxIncludedAmount'), math.div(get('taxRate'), 100)), amountPrecision) : math.toFixed(
                math.div(
                  math.multipliedBy(get('taxIncludedAmount'), get('taxRate')),
                  math.plus(100, get('taxRate'))
                ),
                amountPrecision
              );
              set('taxAmount', taxAmount);
            }
            /**
             * 不含税金额
             */
            if (
              invoicePartMatchFlag === 1 ||
              priceUpdFlag === 1 ||
              (priceUpdFlag === 0 &&
                invoicePartMatchFlag === 0 &&
                (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              unitPriceBatchUpdFlag === 1
            ) {
              set(
                'netAmount',
                math.toFixed(
                  math.minus(get('taxIncludedAmount'), get('taxAmount')),
                  amountPrecision
                )
              );
            }
            /**
             * 不含税单价
             */
            if (priceUpdFlag === 1 || unitPriceBatchUpdFlag === 1) {
              const netPrice = priceCalPrecisionFlag
                ? math.toFixed(
                  math.multipliedBy(
                    math.div(get('netAmount'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  pricePrecision
                )
                : getNetPriceByTaxIncPrice(
                  get('taxIncludedPrice'),
                  get('quantity'),
                  get('taxRate'),
                  get('pricePrecision'),
                  get('unitPriceBatch'),
                  inPriceTaxFlag,
                );
              set('netPrice', netPrice);
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }

            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
          /**
           * FIXME: 税率调整联动
           */
          if (name === 'taxRateLov') {
            /**
             * 税额
             */
            if (priceUpdFlag === 1 || invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
              const taxAmount = inPriceTaxFlag ? math.toFixed(math.multipliedBy(get('taxIncludedAmount'), math.div(get('taxRate'), 100)), amountPrecision) : math.toFixed(
                math.div(
                  math.multipliedBy(get('taxIncludedAmount'), get('taxRate')),
                  math.plus(100, get('taxRate'))
                ),
                amountPrecision
              );
              set('taxAmount', taxAmount);
            }
            /**
             * 不含税金额
             */
            if (
              invoicePartMatchFlag === 1 ||
              priceUpdFlag === 1 ||
              (priceUpdFlag === 0 &&
                invoicePartMatchFlag === 0 &&
                (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1))
            ) {
              set(
                'netAmount',
                math.toFixed(
                  math.minus(get('taxIncludedAmount'), get('taxAmount')),
                  amountPrecision
                )
              );
            }
            /**
             * 不含税单价
             */
            if (priceUpdFlag === 1) {
              const netPrice = priceCalPrecisionFlag
                ? math.toFixed(
                  math.multipliedBy(
                    math.div(get('netAmount'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  amountPrecision
                )
                : getNetPriceByTaxIncPrice(
                  get('taxIncludedPrice'),
                  get('quantity'),
                  get('taxRate'),
                  get('pricePrecision'),
                  get('unitPriceBatch'),
                  inPriceTaxFlag,
                );
              set('netPrice', netPrice);
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }

            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
          /**
           * FIXME: 税额调整联动
           */
          if (name === 'taxAmount') {
            set('taxAmount', math.toFixed(get('taxAmount'), amountPrecision));
            /**
             * 不含税金额
             */
            if (
              invoicePartMatchFlag === 1 ||
              priceUpdFlag === 1 ||
              (priceUpdFlag === 0 &&
                invoicePartMatchFlag === 0 &&
                (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1))
            ) {
              set(
                'netAmount',
                math.toFixed(
                  math.minus(get('taxIncludedAmount'), get('taxAmount')),
                  amountPrecision
                )
              );
            }
            /**
             * 不含税单价
             */
            if (priceUpdFlag === 1) {
              set(
                'netPrice',
                math.toFixed(
                  math.multipliedBy(
                    math.div(get('netAmount'), get('quantity')),
                    get('unitPriceBatch')
                  ),
                  pricePrecision
                )
              );
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }

            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
        }
      }

      /**
       * 第一层判断
       * 结算匹配维度为金额
       */
      if (settleMatchDimension === 'AMOUNT') {
        /**
         * 第二层判断
         * 结算基准价为不含税
         */
        if (settleBasePrice === 'NET_PRICE') {
          if (name === 'netAmount' || name === 'taxRateLov') {
            if (name === 'netAmount') {
              set('netAmount', math.toFixed(get('netAmount'), amountPrecision));
            }
            /**
             * 税额
             */
            if (invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
              const taxAmount = inPriceTaxFlag ? math.toFixed(math.div(math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)), math.minus(1, math.div(get('taxRate'), 100))), amountPrecision) : math.toFixed(
                math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)),
                amountPrecision
              );
              set('taxAmount', taxAmount);
            }
            /**
             * 含税金额
             */
            if (
              (invoicePartMatchFlag === 0 && (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              invoicePartMatchFlag === 1
            ) {
              set(
                'taxIncludedAmount',
                math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPrecision)
              );
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }

            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
          if (name === 'taxAmount') {
            set('taxAmount', math.toFixed(get('taxAmount'), amountPrecision));
            /**
             * 含税金额
             */
            if (
              (invoicePartMatchFlag === 0 && (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              invoicePartMatchFlag === 1
            ) {
              set(
                'taxIncludedAmount',
                math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPrecision)
              );
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }

            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
        }
        /**
         * 第二层判断
         * 结算基准价为含税
         */
        if (settleBasePrice === 'TAX_INCLUDED_PRICE') {
          if (name === 'taxIncludedAmount' || name === 'taxRateLov') {
            if (name === 'taxIncludedAmount') {
              set('taxIncludedAmount', math.toFixed(get('taxIncludedAmount'), amountPrecision));
            }
            /**
             * 税额
             */
            if (invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
              const taxAmount = inPriceTaxFlag ? math.toFixed(math.multipliedBy(get('taxIncludedAmount'), math.div(get('taxRate'), 100)), amountPrecision) : math.toFixed(
                math.div(
                  math.multipliedBy(get('taxIncludedAmount'), get('taxRate')),
                  math.plus(100, get('taxRate'))
                ),
                amountPrecision
              );
              set('taxAmount', taxAmount);
            }
            /**
             * 不含税金额
             */
            if (
              (invoicePartMatchFlag === 0 && (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              invoicePartMatchFlag === 1
            ) {
              set(
                'netAmount',
                math.toFixed(
                  math.minus(get('taxIncludedAmount'), get('taxAmount')),
                  amountPrecision
                )
              );
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }

            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }

          if (name === 'taxAmount') {
            set('taxAmount', math.toFixed(get('taxAmount'), amountPrecision));

            /**
             * 不含税金额
             */
            if (
              (invoicePartMatchFlag === 0 && (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
              invoicePartMatchFlag === 1
            ) {
              set(
                'netAmount',
                math.toFixed(
                  math.minus(get('taxIncludedAmount'), get('taxAmount')),
                  amountPrecision
                )
              );
            }
            /**
             * 已开票含税金额invoicedAmount
             */
            if (documentType === 'INVOICE') {
              set('invoicedAmount', get('taxIncludedAmount'));
            }

            /**
             * 已付款金额paidAmount
             */
            if (documentType === 'INVOICE') {
              set('paidAmount', 0);
            }

            /**
             * 剩余付款金额remainingPaymentAmount
             */
            if (documentType === 'INVOICE') {
              set('remainingPaymentAmount', get('taxIncludedAmount'));
            }
          }
        }
      }

      if (remoteProps?.event) {
        // 增加埋点 更新税务发票后 可能需要更新结算明细信息里面的字段
        remoteProps.event.fireEvent('handleSettleLineCux', {
          settleLineDs,
          settleHeaderDs,
          record,
          name,
          documentType,
        });
      }
    },
    [documentType, remoteProps, settleHeaderDs, settleLineDs]
  );

  const handleCancelLine = useCallback(async () => {
    const res = await settleLineDs.delete(selected, getSelectedNegActConfirmMsg('delete'));
    if (!res) return;
    await settleLineDs.query(undefined, undefined, true);
    if (taxInvoiceDs) taxInvoiceDs.query();
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
    if (paymentStageDs) paymentStageDs.query();
    settleLineDs.clearCachedSelected();
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({
        settleHeaderId,
        documentType,
      })
    );
    if (taxInvoiceDs) taxInvoiceDs.query();
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'paymentAmount',
      'netAmount',
      'taxIncludedAmount',
      'taxAmount',
      'sourceNetAmount',
      'sourceTaxIncludedAmount',
      'sourceTaxAmount',
      'diffNetAmount',
      'diffTaxAmount',
      'invoiceDifferenceAmount',
      'remainingPaymentAmount',
      'applyAmount',
      'invoiceNetAmount',
      'invoiceTaxAmount',
      'invoiceTaxIncludedAmount',
    ]);
    if (onUpdateModalTitle && settleType === 'INVOICE') onUpdateModalTitle();
  }, [
    selected,
    settleType,
    settleLineDs,
    documentType,
    settleHeaderId,
    settleHeaderDs,
    onUpdateModalTitle,
    taxInvoiceDs,
    paymentStageDs,
  ]);

  const editAbleRender = useCallback(
    (record, name) => {
      const { preEditor } = settleLineConfig[name];
      return preEditor(record, documentType, updateFlag) && record.get('amountAdjustFlag') !== 1 && Number(taxOfficeIssueFlag) !== 1;
    },
    [documentType, updateFlag, taxOfficeIssueFlag]
  );

  // 税额高亮显示
  const rateAmountShiledRenderAndHighLight = useCallback(
    ({ record, text }) => {
      const { taxAmountLightFlag, originalTaxAmount, amountPrecision } = record.get([
        'taxAmountLightFlag',
        'originalTaxAmount',
        'amountPrecision',
      ]);

      if (!noHightLightStatus.includes(settleStatus) && taxAmountLightFlag) {
        return (
          <Popover
            content={`${intl
              .get('ssta.common.view.message.beforeUpdate')
              .d('更改前')}:${formatNumber(originalTaxAmount, amountPrecision)}`}
          >
            <span style={{ color: 'red' }}>{text}</span>
          </Popover>
        );
      } else {
        return text;
      }
    },
    [settleStatus]
  );

  // 价格字段高亮显示
  const priceShiledRenderAndHighLight = useCallback(
    ({ record, text, name }) => {
      const { orignPrice, priceLightFlag, settleBasePrice } = record.get([
        'orignPrice',
        'priceLightFlag',
        'settleBasePrice',
      ]);
      const fieldName = settleBasePrice === 'NET_PRICE' ? 'netPrice' : 'taxIncludedPrice';

      if (!noHightLightStatus.includes(settleStatus) && name === fieldName && priceLightFlag) {
        return (
          <Popover
            content={`${intl
              .get('ssta.common.view.message.beforeUpdate')
              .d('更改前')}:${formatNumber(orignPrice)}`}
          >
            <span style={{ color: 'red' }}>{text}</span>
          </Popover>
        );
      } else {
        return remoteProps
          ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_SETTLELINE_LINE_PRICE_RENDER', text, {
            record,
            text,
            name,
          })
          : text;
      }
    },
    [settleStatus, remoteProps]
  );

  // 税率高亮显示
  const rateShiledRenderAndHighLight = useCallback(
    ({ record }) => {
      const {
        rateLightFlag,
        settleTaxRate,
        taxRate = 0,
      } = record.get(['rateLightFlag', 'settleTaxRate', 'taxRate']);
      if (!noHightLightStatus.includes(settleStatus) && rateLightFlag) {
        return (
          <Popover
            content={`${intl
              .get('ssta.common.view.message.beforeUpdate')
              .d('更改前')}:${settleTaxRate}`}
          >
            <span style={{ color: 'red' }}>{taxRate}</span>
          </Popover>
        );
      } else {
        return taxRate;
      }
    },
    [settleStatus]
  );

  // 每 高亮显示
  const unitPriceBatchShiledRenderAndHighLight = useCallback(({ record, text }) => {
    const { unitPriceBatch, originUnitPriceBatch } = record.get([
      'unitPriceBatch',
      'originUnitPriceBatch',
    ]);

    if (!isNil(originUnitPriceBatch) && unitPriceBatch !== originUnitPriceBatch) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${formatNumber(
            originUnitPriceBatch
          )}`}
        >
          <span style={{ color: 'red' }}>{text}</span>
        </Popover>
      );
    } else {
      return text;
    }
  }, []);

  const handleAdd = useCallback(() => {
    if (onSetStepsCurrent && settleHeaderId) {
      return onSetStepsCurrent('prev');
    } else {
      modalOpen({
        size: 'large',
        editFlag: true,
        title: intl.get(`ssta.supplySettle.view.title.add`).d('新增'),
        children: <SettleAffair source="detail" docType={documentType.toLowerCase()} />,
      });
    }
  }, [documentType, modalOpen, settleHeaderId, onSetStepsCurrent]);

  const handlePrePayWriteOff = useCallback(
    (record) => {
      const isModalEdit = updateFlag && linePrePaymentVer === 'EDIT';
      modalOpen({
        size: 'large',
        editFlag: isModalEdit,
        title: isModalEdit
          ? intl.get(`ssta.supplySettle.button.preColWriteOffLine`).d('预收款核销')
          : intl.get(`ssta.supplySettle.button.preColWriteOffRecordLine`).d('预收款核销记录'),
        children: <PrePayWriteOffModal topRecord={record} isModalEdit={isModalEdit} />,
      });
    },
    [modalOpen, updateFlag, linePrePaymentVer]
  );

  const handleViewLineDetail = useCallback(
    (record) => {
      const lineType = documentType === 'INVOICE' ? 'C' : 'D';
      c7nModal.open({
        drawer: true,
        destroyOnClose: true,
        closable: true,
        title: intl.get('hzero.common.button.viewDetails').d('查看详情'),
        className: styles['ssta-detailDrawer-modal'],
        children: <LineDetailDrawer record={record} type={lineType} history={history} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [c7nModal, history, documentType]
  );

  const handleViewSettleDetail = useCallback(
    async (settleNum) => {
      const newHeaderData = getResponse(await getSettleHeaderDataSup({ settleNum }));
      const { settleHeaderId } = newHeaderData;
      viewSettleModal({ history, settleHeaderId });
    },
    [history]
  );

  const handleAfterCloseExcel = useCallback(async () => {
    settleLineDs.query();
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({
        documentType,
        settleHeaderId,
      })
    );
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'paymentAmount',
      'netAmount',
      'taxIncludedAmount',
      'taxAmount',
      'sourceNetAmount',
      'sourceTaxIncludedAmount',
      'sourceTaxAmount',
      'diffNetAmount',
      'diffTaxAmount',
      'invoiceDifferenceAmount',
      'remainingPaymentAmount',
      'applyAmount',
      'invoiceNetAmount',
      'invoiceTaxAmount',
      'invoiceTaxIncludedAmount',
    ]);
  }, [settleHeaderDs, settleLineDs, documentType, settleHeaderId]);

  const handleBatchImport = useCallback(() => {
    const templateCode =
      documentType === 'PAYMENT'
        ? 'SSTA.PAYMENT_LINE_BATCH_UPDATE'
        : 'SSTA.INVOICE_LINE_BATCH_UPDATE';
    const importProps = {
      code: templateCode,
      action: intl.get('ssta.common.button.batchUpdate').d('批量编辑'),
      historyButton: false,
      args: JSON.stringify({
        camp,
        templateCode,
        settleHeaderId,
      }),
    };
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get('ssta.common.title.batchImport').d('批量导入'),
      children: <CommonImport {...importProps} />,
      afterClose: handleAfterCloseExcel,
    });
  }, [camp, documentType, modalOpen, settleHeaderId, handleAfterCloseExcel]);

  // 获取批量编辑可编辑字段
  const getEditField = useCallback((firstSelectedRecord, column, lineDs) => {
    // 所有渲染成编辑字段的标准列字段名
    const editorColumnNameList = column.reduce((total, col) => {
      if (!col) return total;
      const { name, editor } = col;
      if (editor === true || isValidElement(editor)) {
        return [...total, name];
      } else if (isFunction(editor)) {
        const funcEditor = editor(firstSelectedRecord, name);
        if (funcEditor === true || isValidElement(funcEditor)) {
          return [...total, name];
        }
      }
      return total;
    }, []);
    const editFieldNameList = editorColumnNameList.reduce((total, name) => {
      //  去除ds禁用的字段名，editor中禁用的暂时不在考虑范围内
      const field = lineDs.getField(name, firstSelectedRecord);
      return field.get('disabled') ? total : [...total, name];
    }, []);
    return editFieldNameList;
  }, []);

  const handleBatchModify = useCallback(() => {
    let editFieldNameList = [];
    let emptyLineEditFlag = true;
    if (selected.length) {
      const firstSelectedRecord = selected[0];
      const firstStrategyNum = firstSelectedRecord.get('settleConfigNum');
      const hasDiffStrategy = selected.some(
        (item) => item.get('settleConfigNum') !== firstStrategyNum
      );
      if (hasDiffStrategy) {
        notification.warning({
          message: intl
            .get('ssta.common.view.notification.inconsistentEditableFields')
            .d('操作失败，失败原因是已勾选行可修改字段不一致，请勾选行结算策略一致的结算单行'),
        });
        return;
      }
      // 审批页面不能修改编辑字段
      if (updateFlag) {
        editFieldNameList = getEditField(firstSelectedRecord, columns, settleLineDs);
      }
    } else {
      // 如果没有勾选，判断列表数据是否结算策略一致，如果不一致按原有逻辑处理，如果一致判断行字段是否可编辑，如果不可编辑则侧弹框不显示该字段
      const firstRecord = settleLineDs.get(0);
      const firstStrategyNum = firstRecord.get('settleConfigNum');
      const hasDiffStrategy = settleLineDs.some(
        (item) => item.get('settleConfigNum') !== firstStrategyNum
      );
      if (!hasDiffStrategy) {
        editFieldNameList = getEditField(firstRecord, columns, settleLineDs);
        emptyLineEditFlag = false;
      }
    }
    modalOpen({
      size: 'small',
      editFlag: true,
      title: intl.get('ssta.common.button.bathModify').d('批量修改'),
      children: (
        <BatchModifyModal
          editFieldNameList={editFieldNameList}
          closeCallback={handleAfterCloseExcel}
          settleType={settleType}
          emptyLineEditFlag={emptyLineEditFlag}
        />
      ),
    });
  }, [
    settleLineDs,
    columns,
    getEditField,
    selected,
    settleType,
    handleAfterCloseExcel,
    modalOpen,
    updateFlag,
  ]);

  const columns = useMemo(() => {
    const defaultCloumns = [
      {
        width: 150,
        name: 'lineNum',
      },
      {
        width: 180,
        name: 'settleNum',
      },
      {
        width: 230,
        name: 'sourceSettleNumAndLineNum',
      },
      {
        width: 150,
        name: 'itemCode',
      },
      {
        width: 150,
        name: 'itemName',
      },
      ...(settleType !== 'PAYMENT'
        ? [
          {
            name: 'quantity',
            width: 150,
            editor: settleStatus === 'INVOICE_EXCEPTION' ? false : editAbleRender,
          },
          {
            width: 150,
            name: 'netPrice',
            editor: editAbleRender,
            renderer: ({ record, text, name }) => {
              return priceShiledRenderAndHighLight({ record, text, name });
            },
          },
          {
            width: 100,
            name: 'unitPriceBatch',
            editor: editAbleRender,
            renderer: ({ record, text }) =>
              unitPriceBatchShiledRenderAndHighLight({ record, text }),
          },
          {
            width: 150,
            name: 'netAmount',
            editor: editAbleRender,
          },
          {
            width: 150,
            name: 'taxCode',
          },
          {
            width: 150,
            name: 'taxRateLov',
            editor: editAbleRender,
            renderer: rateShiledRenderAndHighLight,
          },
          {
            width: 150,
            name: 'taxAmount',
            editor: editAbleRender,
            renderer: ({ record, text }) => {
              return rateAmountShiledRenderAndHighLight({ record, text });
            },
          },
          {
            width: 150,
            name: 'taxIncludedPrice',
            editor: editAbleRender,
            renderer: ({ record, text, name }) => {
              return priceShiledRenderAndHighLight({ record, text, name });
            },
          },
          {
            width: 150,
            name: 'taxIncludedAmount',
            editor: editAbleRender,
          },
          {
            width: 150,
            name: 'settleMatchDimensionMeaning',
          },
          {
            width: 150,
            name: 'settleBasePriceMeaning',
          },
          {
            width: 150,
            name: 'enableQuantity',
          },
          {
            width: 150,
            name: 'orignPrice',
          },
          {
            width: 150,
            name: 'enableAmount',
            help: intl
              .get('ssta.common.view.help.judgeTaxFlagBaseBenchPrice')
              .d('根据基准价判断含税/不含税'),
          },
        ]
        : [
          {
            width: 180,
            name: 'sourceSettleHeaderNum',
          },
          {
            width: 180,
            name: 'sourceSettleHeaderNumLink',
            header: intl
              .get(`ssta.supplySettle.model.supplySettle.invoiceApplySettleNum`)
              .d('发票申请结算单'),
            renderer: ({ record }) => {
              const sourceSettleHeaderNum = record.get('sourceSettleHeaderNum');
              return (
                <Button
                  funcType="link"
                  style={{ userSelect: 'text' }}
                  onClick={() => handleViewSettleDetail(sourceSettleHeaderNum)}
                >
                  {sourceSettleHeaderNum}
                </Button>
              );
            },
          },
          {
            width: 160,
            name: 'orderOverAmountValidateRuleEnableFlagMeaning',
          },
          {
            width: 120,
            name: 'orderOverAmountValidateRuleCheckLevelMeaning',
          },
          {
            width: 180,
            name: 'orderOverAmountValidateRuleTolControlTypeMeaning',
          },
          {
            width: 140,
            name: 'orderOverAmountValidateRuleTolTolRange',
          },
          {
            width: 160,
            name: 'contractOverAmountValidateRuleEnableFlagMeaning',
          },
          {
            width: 120,
            name: 'contractOverAmountValidateRuleCheckLevelMeaning',
          },
          {
            width: 180,
            name: 'contractOverAmountValidateRuleTolControlTypeMeaning',
          },
          {
            width: 140,
            name: 'contractOverAmountValidateRuleTolTolRange',
          },
        ]),

      {
        width: 150,
        name: 'invOrganizationName',
      },
      settleType !== 'INVOICE' &&
      linePayment !== 'HIDE' && {
        width: 150,
        name: 'paymentAmount',
        editor: (record) => {
          // 开票的时候均可编辑
          if (documentType === 'INVOICE' && updateFlag && linePayment === 'EDIT') {
            return true;
          }
          // 付款的时候，当部分匹配-付款为Y时，可以修改
          if (
            documentType === 'PAYMENT' &&
            record?.get('paymentPartMatch') === 1 &&
            updateFlag &&
            linePayment === 'EDIT'
          ) {
            return true;
          }
        },
      },
      settleType !== 'INVOICE' &&
      linePrePaymentVer !== 'HIDE' && {
        width: 150,
        name: 'applyAmount',
      },
      settleType !== 'INVOICE' && {
        name: 'preColWriteOff',
        title: intl.get(`ssta.supplySettle.button.preColWriteOffLine`).d('预收款核销'),
        width: 150,
        renderer: ({ record }) =>
          (documentType === 'INVOICE' &&
            record.get('taxIncludedAmount') > 0 &&
            linePrePaymentVer !== 'HIDE') ||
            (documentType === 'PAYMENT' &&
              record.get('invoicedAmount') > 0 &&
              linePrePaymentVer !== 'HIDE') ? (
            <a onClick={() => handlePrePayWriteOff(record)}>
              {updateFlag && linePrePaymentVer === 'EDIT'
                ? intl.get(`ssta.supplySettle.button.preColWriteOffLine`).d('预收款核销')
                : intl.get(`ssta.supplySettle.button.preColWriteOffRecordLine`).d('预收款核销记录')}
            </a>
          ) : null,
      },
      settleType !== 'INVOICE' &&
      (linePayment !== 'HIDE' || linePrePaymentVer !== 'HIDE') && {
        width: 150,
        name: 'invoicedAmount',
      },
      settleType !== 'INVOICE' &&
      (linePayment !== 'HIDE' || linePrePaymentVer !== 'HIDE') && {
        width: 150,
        name: 'paidAmount',
      },
      settleType !== 'INVOICE' &&
      (linePayment !== 'HIDE' || linePrePaymentVer !== 'HIDE') && {
        name: 'remainingPaymentAmount',
        width: 150,
      },
      settleType !== 'PAYMENT' && {
        name: 'adjustNetAmount',
        width: 150,
      },
      settleType !== 'PAYMENT' && {
        name: 'adjustTaxAmount',
        width: 150,
      },
      settleType === 'INVOICE' && {
        name: 'thirdSkuCode',
        width: 200,
      },
      settleType === 'INVOICE' && {
        name: 'thirdSkuName',
        width: 200,
      },
      settleType === 'INVOICE' && {
        name: 'orderTypeName',
        width: 200,
      },
      settleType === 'INVOICE' && {
        name: 'poCreateName',
        width: 200,
      },
      settleType === 'INVOICE' && {
        name: 'unitName',
        width: 200,
      },
      ...(settleType === 'PAYMENT' && paymentControlRuleSource
        ? [
          {
            name: 'poNum',
            width: 150,
          },
          {
            name: 'settleHeaderNum',
            width: 230,
          },
          {
            name: 'planNum',
            width: 150,
          },
          {
            name: 'versionNumber',
            width: 120,
          },
          {
            name: 'planStageNum',
            width: 150,
          },
          {
            name: 'planStageDesc',
            width: 150,
          },
          {
            name: 'planStageAmount',
            width: 150,
          },
          {
            name: 'planStageBalance',
            width: 150,
          },
          {
            name: 'planStagePercent',
            width: 120,
          },
          {
            name: 'planStageStartDate',
            width: 120,
          },
          {
            name: 'planStageEndDate',
            width: 120,
          },
        ]
        : []),
      {
        name: 'lineRemark',
        width: 200,
        editor: updateFlag,
      },
      {
        name: 'operation',
        title: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewLineDetail(record)}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
    ];
    return remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_SETTLELINE_COLUMNS', defaultCloumns, {
        settleType,
        history,
      })
      : defaultCloumns;
  }, [
    remoteProps,
    documentType,
    linePayment,
    linePrePaymentVer,
    editAbleRender,
    priceShiledRenderAndHighLight,
    rateAmountShiledRenderAndHighLight,
    rateShiledRenderAndHighLight,
    settleStatus,
    updateFlag,
    handlePrePayWriteOff,
    handleViewLineDetail,
    handleViewSettleDetail,
    settleType,
    paymentControlRuleSource,
    unitPriceBatchShiledRenderAndHighLight,
    history,
  ]);

  const buttons = useMemo(() => {
    const normarlBtns = [
      updateFlag && Number(taxOfficeIssueFlag) !== 1 &&
      ((settleStatus !== 'INVOICE_EXCEPTION' &&
        ((permissionMap.get(`invLineAdd`) && documentType === 'INVOICE') ||
          (permissionMap.get(`payLineAdd`) && documentType === 'PAYMENT'))) ||
        (permissionMap.get(`invLineAdd`) && invoiceExceptionBtnShowFlag)) && [
        'add',
        { name: 'add', onClick: handleAdd },
      ],
      updateFlag && Number(taxOfficeIssueFlag) !== 1 &&
      ((settleType === 'INVOICE' && permissionMap.get(`lineBatchModify`)) ||
        (settleType === 'INVOICE_PAYMENT' && permissionMap.get(`paymentInvLineBatchModify`)) ||
        (settleType === 'PAYMENT' && permissionMap.get(`paymentLineBatchModify`))) && (
        <Button
          name="lineBatchModify"
          icon="mode_edit"
          onClick={handleBatchModify}
          disabled={!settleLineDs.length}
        >
          {isEmpty(selected)
            ? intl.get('ssta.common.button.batchModify').d('批量修改')
            : intl.get('ssta.common.button.selectedBatchModify').d('勾选批量修改')}
        </Button>
      ),
      updateFlag && Number(taxOfficeIssueFlag) !== 1 && permissionMap.get(`lineImport`) && !invoiceExceptionBtnShowFlag && (
        <Button name="lineImport" icon="archive" onClick={handleBatchImport}>
          {intl.get('ssta.common.button.batchUpdate').d('批量编辑')}
        </Button>
      ),
      permissionMap.get(`lineExport`) && (
        <ExcelExport
          name="lineExport"
          buttonText={
            isEmpty(selected)
              ? intl.get('ssta.common.button.LineExport').d('行导出')
              : intl.get('ssta.common.button.LineTickExport').d('行勾选导出')
          }
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'primary',
            icon: 'unarchive',
          }}
          requestUrl={requestUrl}
          queryParams={exportParams}
          method="POST"
        />
      ),
      ((updateFlag && permissionMap.get(`newLineImport`) && !invoiceExceptionBtnShowFlag) ||
        (approveFlag && permissionMap.get(`newLineImportApprove`))) && Number(taxOfficeIssueFlag) !== 1 && (
        <NewCommonImport
          name="newLineImport"
          buttonProps={{
            funcType: 'flat',
            color: 'primary',
            icon: 'archive',
          }}
          businessObjectTemplateCode={
            documentType === 'PAYMENT'
              ? 'SSTA.PAYMENT_LINE_BATCH_UPDATE'
              : 'SSTA.INVOICE_LINE_BATCH_UPDATE'
          }
          prefixPatch="/ssta"
          buttonText={intl.get('ssta.common.button.batchUpdate1').d('(新)批量编辑')}
          successCallBack={handleAfterCloseExcel}
          args={{
            camp,
            templateCode:
              documentType === 'PAYMENT'
                ? 'SSTA.PAYMENT_LINE_BATCH_UPDATE'
                : 'SSTA.INVOICE_LINE_BATCH_UPDATE',
            settleHeaderId,
          }}
        />
      ),
      permissionMap.get(`newLineExport`) && (
        <ExcelExportPro
          name="newLineExport"
          templateCode={
            documentType === 'INVOICE'
              ? 'SSTA_SETTLE_HEADER_DETAIL_INVOICE_SUPPLIER_EXPORT'
              : 'SSTA_SETTLE_HEADER_DETAIL_PAYMENT_SUPPLIER_EXPORT'
          }
          method="POST"
          allBody
          requestUrl={newRequestUrl}
          queryParams={exportParams}
          buttonText={
            isEmpty(selected)
              ? intl.get('ssta.common.button.LineExport1').d('(新)行导出')
              : intl.get('ssta.common.button.LineTickExport1').d('(新)行勾选导出')
          }
          otherButtonProps={{
            type: 'c7n-pro',
            funcType: 'flat',
            color: 'primary',
            icon: 'unarchive',
          }}
        />
      ),
      updateFlag && Number(taxOfficeIssueFlag) !== 1 &&
      ((settleStatus !== 'INVOICE_EXCEPTION' &&
        ((permissionMap.get(`invLineDelete`) && documentType === 'INVOICE') ||
          (permissionMap.get(`payLineDelete`) && documentType === 'PAYMENT'))) ||
        (permissionMap.get('invLineDelete') && invoiceExceptionBtnShowFlag)) && [
        'delete',
        {
          icon: 'delete_sweep',
          children: intl.get('hzero.common.button.batchDelete').d('批量删除'),
          disabled: isEmpty(selected),
          onClick: handleCancelLine,
          name: 'delete',
        },
      ],
    ];
    const processBtns = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.LINE_BTNS', normarlBtns, {
        settleType,
        settleLineDs,
        settleHeaderDs,
        updateFlag,
      })
      : normarlBtns;
    return processBtns;
  }, [
    camp,
    handleAfterCloseExcel,
    selected,
    documentType,
    requestUrl,
    exportParams,
    newRequestUrl,
    settleHeaderId,
    permissionMap,
    settleStatus,
    updateFlag,
    handleAdd,
    handleCancelLine,
    handleBatchImport,
    handleBatchModify,
    approveFlag,
    settleLineDs,
    settleType,
    invoiceExceptionBtnShowFlag,
    taxOfficeIssueFlag,
  ]);

  const tableStyle = useMemo(() => {
    const style = { maxHeight: 620 };
    if (source === 'step') {
      style.maxHeight = 'calc(100vh - 220px)';
    }
    if (source === 'view') {
      style.maxHeight = 'calc(100vh - 200px)';
    }
    return style;
  }, [source]);

  return customizeTable(
    {
      code:
        documentType === 'INVOICE'
          ? 'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTIONDETAIL'
          : 'SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL',
      buttonCode: 'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTIONDETAIL_BTNS', // 按钮个性化
      readOnly: readOnlyFlag || source === 'view',
    },
    <SearchBarTable
      virtual
      searchCode={
        documentType === 'INVOICE'
          ? 'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH'
          : 'SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH'
      }
      dataSet={settleLineDs}
      columns={columns}
      buttons={buttons}
      style={tableStyle}
      maxPageSize={1000}
      pagination={{
        pageSizeOptions: ['10', '20', '50', '100', '500', '1000'],
      }}
      searchBarConfig={{
        autoQuery: false,
        closeFilterSelector: true,
        fieldProps: {
          costId: { lovPara: { tenantId } },
        },
      }}
    />
  );
});
