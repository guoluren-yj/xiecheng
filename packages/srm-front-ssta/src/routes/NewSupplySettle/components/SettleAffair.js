/*
 * @Description: 采购方结算单-引用发票事务
 * @Date: 2022-02-04 00:41:36
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import React, { useMemo, useCallback, useContext, useEffect, useRef } from 'react';
import { useDataSet, Tooltip, Modal } from 'choerodon-ui/pro';
import { isNil } from 'lodash';
import { observer } from 'mobx-react';

import intl from 'utils/intl';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';

import commonStyles from '@/routes/common.less';
import SearchBarTable from '_components/SearchBarTable';
import RingDiagram from '@/routes/Components/RingDiagram';
import { flagRender, statusRender } from '@/utils/renderer';
import { dateRangeTransform, recordPickValues } from '@/utils/utils';
import { tableDS as settleAffairDS } from '@/stores/SupplySettlePoolDS';
import { getSettleHeaderDataSup } from '@/services/settlePoolServices';
import DetailDrawer from '@/routes/SupplySettlePool/DetailDrawer';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import { Store } from '../Detail/StoreProvider';
import { statusTagRender } from '@/routes/Components/StatusTag';
import { getCustomValidationResponse } from '@/components/CustomValidation';

const tenantId = getCurrentOrganizationId();
const tableUnitCodes = {
  A: 'SSTA.SUPPLY_POOL_LIST.GRID',
  B: 'SSTA.SUPPLY_POOL_LIST.BILL_GRID',
  C: 'SSTA.SUPPLY_POOL_LIST.INVOICE_GRID',
  D: 'SSTA.SUPPLY_POOL_LIST.PAYMENT_GRID',
  E: 'SSTA.SUPPLY_POOL_LIST.TRASH_GRID',
};

const filterUnitCodes = {
  A: 'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_ALL',
  B: 'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_BILL',
  C: 'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_INVOICE',
  D: 'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_PAYMENT',
  E: 'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_TRASH',
};

const addSettleLineTableCodes = {
  C: 'SSTA.SUPPLY_SETTLE_DETAIL.ADD.INVOICE',
  D: 'SSTA.SUPPLY_SETTLE_DETAIL.PAYMENT.ADD.LIST',
};

const addSettleLineSearchCode = {
  C: 'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_INV',
  D: 'SSTA.SUPPLY_SETTLE_DETAIL.SEARCH_ADD_PAY',
};

export default observer((props) => {
  const { modal, source } = props;
  const {
    remoteProps,
    history,
    settleType,
    settleLineDs,
    settleHeader,
    documentType,
    settleHeaderId,
    customizeTable,
    settleHeaderDs,
    settleAffairDs,
    settleLineAddDs,
    advanceInvFlag,
    taxInvoiceDs,
    paymentStageDs,
  } = useContext(Store);
  const searchBarRef = useRef({});
  const type = documentType === 'INVOICE' ? 'C' : 'D';
  const defaultDs = useDataSet(() => settleAffairDS(documentType), [documentType]);
  const tableDs = modal
    ? defaultDs
    : settleHeaderId || advanceInvFlag
    ? settleLineAddDs
    : settleAffairDs;
  const tableCode =
    settleHeaderId || advanceInvFlag ? addSettleLineTableCodes[type] : tableUnitCodes[type];
  const searchCode =
    settleHeaderId || advanceInvFlag ? addSettleLineSearchCode[type] : filterUnitCodes[type];

  useEffect(() => {
    tableDs.setQueryParameter('invoiceWithPaymentFlag', settleType === 'INVOICE_PAYMENT' ? 1 : 0);
    tableDs.setQueryParameter('stepFlag', 1);
    if (settleHeader) {
      tableDs.setQueryParameter('settleHeaderId', settleHeaderId);
      tableDs.setQueryParameter('companyId', settleHeaderDs.current?.get('companyId'));
      tableDs.setQueryParameter(
        'supplierCompanyId',
        settleHeaderDs.current?.get('supplierCompanyId')
      );
      tableDs.setQueryParameter('currencyCode', settleHeaderDs.current?.get('currencyCode'));
      if (advanceInvFlag) {
        tableDs.setQueryParameter('advanceInvFlag', '1');
        tableDs.setQueryParameter('settleHeaderId', settleHeaderDs.current?.get('settleHeaderId'));
        tableDs.setQueryParameter('supplierId', settleHeaderDs.current?.get('supplierId'));
        tableDs.setQueryParameter(
          'supplierTenantId',
          settleHeaderDs.current?.get('supplierTenantId')
        );
      }
      if (remoteProps) {
        remoteProps.event.fireEvent('onAddSettleLineEffect', {
          tableDs,
          settleHeaderDs,
        });
      }
      if (modal) {
        modal.handleOk(handleSettleLineAddOk);
      }
    }
  }, [
    type,
    modal,
    settleHeaderId,
    tableDs,
    settleHeaderDs,
    settleType,
    remoteProps,
    settleHeader,
    advanceInvFlag,
    handleSettleLineAddOk,
  ]);

  const handleSettleLineAddOk = useCallback(async () => {
    const addSettleLine = async () => {
      const res = await tableDs.setState('submitType', 'addSettleLine').submit();
      if (!res || advanceInvFlag) return false;
      const newHeaderData = getResponse(
        await getSettleHeaderDataSup({ documentType, settleHeaderId })
      );
      if (!newHeaderData) return false;
      recordPickValues(settleHeaderDs.current, newHeaderData, [
        'paymentAmount',
        'settleConfigId',
        'settleConfigNum',
        'settleConfigName',
        'confirmCollaborativeMode',
        'cancelCollaborativeMode',
        'confirmApproveMethod',
        'cancelApproveMethod',
        'invoiceToleranceRange',
        'defaultPaymentDimension',
        'defaultPaymentSpliteRule',
        'defaultPrepaymentSpliteRule',
        'enableLineLimitFlag',
        'lineLimitQuantity',
        'supplierViewFlag',
        'netAmount',
        'taxIncludedAmount',
        'taxAmount',
        'amountValidateLevel',
        'amountValidateAction',
        'taxAmountTol',
        'configVersionNumber',
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
      settleLineDs.query(undefined, undefined, true);
      if (taxInvoiceDs) taxInvoiceDs.query();
      if (paymentStageDs) paymentStageDs.query();
      const cuszLineDs = settleHeaderDs.children?.attributeList;
      if (cuszLineDs) cuszLineDs.query();
    };
    if (settleType === 'PAYMENT') {
      const res = await tableDs.setState('submitType', 'addSettleLineValidate').submit();
      if (!res) return;
      return getCustomValidationResponse(res.content[0], addSettleLine);
    } else {
      return addSettleLine();
    }
  }, [
    settleType,
    settleHeaderDs,
    tableDs,
    settleLineDs,
    documentType,
    settleHeaderId,
    taxInvoiceDs,
    advanceInvFlag,
    paymentStageDs,
  ]);

  const handleViewLineDetail = useCallback(
    (record) => {
      Modal.open({
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        title: intl.get('hzero.common.button.viewDetails').d('查看详情'),
        className: commonStyles['ssta-detailDrawer-modal'],
        children: <DetailDrawer record={record} type={type} history={history} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [type, history]
  );

  const handleFieldChange = useCallback(({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    }
  }, []);

  const columns = useMemo(
    () => [
      type !== 'E' && {
        name: 'settleNum',
        width: 160,
        renderer: ({ record, value }) => {
          return (
            <a
              onClick={() => {
                handleViewLineDetail(record);
              }}
            >
              {value}
            </a>
          );
        },
      },
      type === 'E' && {
        name: 'errorSettleNum',
        width: 160,
        renderer: ({ record, value }) => {
          return (
            <a
              onClick={() => {
                handleViewLineDetail(record);
              }}
            >
              {value}
            </a>
          );
        },
      },
      {
        name: 'souceSettleAndLineNum',
        width: 180,
      },
      type === 'E' && {
        name: 'settleNum',
        width: 200,
        title: intl.get('ssta.SettleError.model.supplierSettleError.settleNum').d('原结算事务编号'),
      },
      {
        width: 250,
        name: 'companyName',
        title:
          type === 'B'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.accountClientCompany`)
                .d('对账客户公司')
            : type === 'C' || type === 'D'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.settlementCustomerCompany`)
                .d('结算客户公司')
            : intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.CustomerCompany`)
                .d('客户公司'),
      },
      {
        width: 220,
        name: 'invOrganizationName',
      },
      {
        width: 250,
        name: 'supplierCompanyName',
        title:
          type === 'B'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.accountSupplierCompany`)
                .d('对账供应商公司')
            : type === 'C' || type === 'D'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.settlementSupplierCompany`)
                .d('结算供应商公司')
            : intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.supplierCompany`)
                .d('供应商公司'),
      },
      {
        width: 80,
        name: 'currencyCode',
      },
      {
        width: 120,
        name: 'itemName',
      },
      type !== 'D' && {
        width: 120,
        name: 'quantity',
        title:
          type === 'A' || type === 'E'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.settleableQuantity`)
                .d('可结算数量')
            : type === 'B'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.accountQuantity`)
                .d('可对账数量')
            : intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.invoicedQuantity`)
                .d('可开票数量'),
      },
      type === 'A' && {
        width: 120,
        name: 'taxIncludedAmount',
        title: intl
          .get(`ssta.supplySettlePool.model.supplySettlePool.settleableAmountIncludingTax`)
          .d('可结算金额(含税)'),
      },
      type === 'A' && {
        width: 120,
        name: 'billStatusMeaning',
        renderer: ({ value, record }) => {
          const { noBillQuantity, noInvoiceQuantity, unpaidQuantity } = record.toData();
          return (
            <Tooltip
              placement="bottom"
              title={
                <RingDiagram
                  data={[
                    {
                      value: noBillQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.alreadyBill`)
                        .d('已对账')} ${noBillQuantity || 0}`,
                      itemStyle: { color: '#47B881' },
                    },
                    {
                      value: noInvoiceQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.billIn`)
                        .d('对账中')} ${noInvoiceQuantity || 0}`,
                      itemStyle: { color: '#F88D10' },
                    },
                    {
                      value: unpaidQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.Unreconciled`)
                        .d('未对账')} ${unpaidQuantity || 0}`,
                      itemStyle: { color: 'rgba(0, 0, 0, 0.25)' },
                    },
                  ]}
                />
              }
              theme="light"
            >
              {statusRender(
                value,
                record.get('billStatus') === 'NO_BILL'
                  ? 'info'
                  : record.get('billStatus') === 'BILLING'
                  ? 'success'
                  : 'warn'
              )}
            </Tooltip>
          );
        },
      },
      type === 'A' && {
        width: 120,
        name: 'invoiceStatusMeaning',
        renderer: ({ value, record }) => {
          const { billingQuantity, invoicingQuantity, payingQuantity } = record.toData();
          return (
            <Tooltip
              placement="bottom"
              title={
                <RingDiagram
                  data={[
                    {
                      value: billingQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.alreadyBill`)
                        .d('已对账')} ${billingQuantity || 0}`,
                      itemStyle: { color: '#47B881' },
                    },
                    {
                      value: invoicingQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.billIn`)
                        .d('对账中')} ${invoicingQuantity || 0}`,
                      itemStyle: { color: '#F88D10' },
                    },
                    {
                      value: payingQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.Unreconciled`)
                        .d('未对账')} ${payingQuantity || 0}`,
                      itemStyle: { color: 'rgba(0, 0, 0, 0.25)' },
                    },
                  ]}
                />
              }
              theme="light"
            >
              {statusRender(
                value,
                record.get('invoiceStatus') === 'NO_INVOICE'
                  ? 'info'
                  : record.get('invoiceStatus') === 'INVOICING'
                  ? 'success'
                  : 'warn'
              )}
            </Tooltip>
          );
        },
      },
      type === 'A' && {
        width: 120,
        name: 'paymentStatusMeaning',
        renderer: ({ value, record }) => {
          const { billedQuantity, invoicedQuantity, paidQuantity } = record.toData();
          return (
            <Tooltip
              placement="bottom"
              title={
                <RingDiagram
                  data={[
                    {
                      value: billedQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.alreadyBill`)
                        .d('已对账')} ${billedQuantity || 0}`,
                      itemStyle: { color: '#47B881' },
                    },
                    {
                      value: invoicedQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.billIn`)
                        .d('对账中')} ${invoicedQuantity || 0}`,
                      itemStyle: { color: '#F88D10' },
                    },
                    {
                      value: paidQuantity || 0,
                      name: `${intl
                        .get(`ssta.supplySettlePool.model.purchaseSettlePool.Unreconciled`)
                        .d('未对账')} ${paidQuantity || 0}`,
                      itemStyle: { color: 'rgba(0, 0, 0, 0.25)' },
                    },
                  ]}
                />
              }
              theme="light"
            >
              {statusRender(
                value,
                record.get('paymentStatus') === 'UNPAID'
                  ? 'info'
                  : record.get('paymentStatus') === 'PAYING'
                  ? 'success'
                  : 'warn'
              )}
            </Tooltip>
          );
        },
      },
      (type === 'B' || type === 'C') && {
        width: 150,
        name: 'netPrice',
      },
      (type === 'B' || type === 'C') && {
        name: 'unitPriceBatch',
        width: 150,
      },
      (type === 'B' || type === 'C') && {
        name: 'netAmount',
        width: 150,
        title:
          type === 'B'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.accountAmountExcludingTax`)
                .d('可对账金额(不含税)')
            : intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.invoicedAmountExcludingTax`)
                .d('可开票金额(不含税)'),
      },
      (type === 'B' || type === 'C') && {
        width: 150,
        name: 'taxCode',
      },
      (type === 'B' || type === 'C') && {
        width: 150,
        name: 'taxRate',
      },
      (type === 'B' || type === 'C') && {
        width: 150,
        name: 'taxAmount',
      },
      (type === 'B' || type === 'C') && {
        width: 150,
        name: 'taxIncludedPrice',
      },
      (type === 'B' || type === 'C') && {
        width: 150,
        name: 'taxIncludedAmount',
        title:
          type === 'B'
            ? intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.accountAmountIncludingTax`)
                .d('可对账金额(含税)')
            : intl
                .get(`ssta.supplySettlePool.model.supplySettlePool.invoicedAmountIncludingTax`)
                .d('可开票金额(含税)'),
      },
      type === 'D' && {
        width: 150,
        name: 'invoiceCompletedAmount',
      },
      type === 'D' && {
        width: 150,
        name: 'paymentOccupiedAmount',
      },
      type === 'D' && {
        width: 150,
        name: 'ablePayAmount',
      },
      type === 'E' && {
        width: 150,
        name: 'errorTypeMeaning',
      },
      type === 'E' && {
        width: 150,
        name: 'errorMsg',
      },
      type === 'B' && {
        width: 100,
        name: 'priceSourceMeaning',
      },
      type === 'B' && {
        width: 100,
        name: 'sourceUnitPriceBatch',
      },
      type === 'B' && {
        width: 100,
        name: 'libPrice',
      },
      type === 'B' && {
        width: 100,
        name: 'priceActionMeaning',
      },
      type === 'B' && {
        width: 100,
        name: 'priceTime',
      },
      type === 'B' && {
        width: 100,
        name: 'sourceNetPrice',
      },
      type === 'B' && {
        width: 100,
        name: 'sourceTaxIncludedPrice',
      },
      type === 'B' && {
        width: 100,
        name: 'libUnitPriceBatch',
      },
      type === 'B' && {
        width: 100,
        name: 'takePriceStatusMeaning',
      },
      type === 'B' && {
        width: 100,
        name: 'libPriceFlag',
        renderer: ({ record }) => flagRender(record.get('libPriceFlag')),
      },
      type !== 'A' &&
        type !== 'E' && {
          width: 100,
          name: 'collaborativeModeCode',
          renderer: (records) => {
            const { record } = records;
            return record.get('collaborativeModeCodeMeaning')
              ? record.get('collaborativeModeCodeMeaning')
              : '-';
          },
        },
      (type === 'A' || type === 'E') && {
        width: 100,
        name: 'sourceSupplierSiteCode',
      },

      type !== 'A' &&
        type !== 'E' && {
          width: 100,
          name: 'supplierSiteCode',
        },
      type !== 'E' && {
        width: 100,
        name: 'ouName',
      },
      type === 'E' && {
        width: 100,
        name: 'pushedFlag',
        renderer: ({ value }) => {
          if (!value) {
            return '-';
          }
          if (value === '0') {
            return intl.get('hzero.common.no').d('否');
          }
          if (value === '1') {
            return intl.get('hzero.common.yes').d('是');
          }
          return value;
        },
      },
      {
        width: 100,
        name: 'multiDealTrxNum',
      },
      {
        width: 100,
        name: 'multiDealPoNum',
      },
      {
        width: 100,
        name: 'multiDealTrxLineNum',
      },
      {
        width: 100,
        name: 'multiDealPoLineNum',
      },
      type === 'A' && {
        width: 100,
        name: 'asyncCreateStatusMeaning',
      },
      ...(type === 'D'
        ? [
            {
              name: 'predictExpectPaymentDate',
              width: 150,
            },
            {
              name: 'predictExpectPaymentDateCalculateStatus',
              width: 180,
              renderer: statusTagRender,
            },
            {
              name: 'predictExpectPaymentDateTriggerAction',
              width: 180,
            },
            {
              name: 'predictExpectPaymentDateCalculateTime',
              width: 180,
            },
            {
              name: 'predictExpectPaymentDateCalculateErrorMsg',
              width: 200,
            },
          ]
        : []),
    ],
    [type, handleViewLineDetail]
  );

  const tableStyle = useMemo(() => {
    const style = { maxHeight: 430 };
    // step为 新建 STEP 中的引用结算事务
    if (source === 'step') {
      style.maxHeight = 'calc(100vh - 220px)';
    }
    // detail 为详情页的行新增
    if (source === 'detail') {
      style.maxHeight = 'calc(100vh - 170px)';
    }
    return style;
  }, [source]);

  const searchBarConfig = useMemo(() => {
    const normalConfig = {
      expandable: source !== 'detail',
      closeFilterSelector: source === 'detail',
      onFieldChange: handleFieldChange,
      fieldProps: {
        supplierCompanyId: { lovPara: { tenantId } },
        currencyCode: { lovPara: { organizationId: tenantId } },
        settleConfigNum: { lovPara: { tenantId } },
        documentNumList: { lovPara: { tenantId, page: 0, size: 10, camp: 'SUPPLIER' } },
        trxDate: {
          defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
          dynamicProps: {
            disabled: ({ record }) =>
              record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
          },
        },
        supplierSiteId: {
          dynamicProps: {
            disabled: ({ record }) => isNil(record.get('supplierCompanyId')?.supplierId),
            lovPara: ({ record }) => ({
              supplierId: record.get('supplierCompanyId')?.supplierId,
              tenantId,
            }),
          },
        },
        sourceSupplierSiteId: {
          dynamicProps: {
            disabled: ({ record }) => isNil(record.get('supplierCompanyId')?.supplierId),
            lovPara: ({ record }) => ({
              supplierId: record.get('supplierCompanyId')?.supplierId,
              tenantId,
            }),
          },
        },
      },
      editorProps: {
        allRemoveFlag: { clearButton: false },
        billRemoveFlag: { clearButton: false },
        invoiceRemoveFlag: { clearButton: false },
        paymentRemoveFlag: { clearButton: false },
        displayReverseFlag: { clearButton: false },
        documentNumList: {
          noCache: true,
          searchable: true,
          searchMatcher: 'meaning',
        },
      },
      left: {
        render: (_, customizeDs) => (
          <MultiTextFilter
            name={type === 'E' ? 'errorSettleNums' : 'settleNums'}
            dataSet={customizeDs}
            placeholder={intl.get('ssta.supplySettlePool.modal.settleNum').d('请输入结算事务编号')}
          />
        ),
      },
    };
    return remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.AFFAIR_SEARCH_BAR_CONFIG', normalConfig, {
          source,
          documentType,
          dateRangeTransform,
        })
      : normalConfig;
  }, [remoteProps, type, source, documentType, handleFieldChange]);

  return customizeTable(
    {
      code: tableCode,
    },
    <SearchBarTable
      virtual
      virtualCell
      searchCode={searchCode}
      columns={columns}
      dataSet={tableDs}
      style={tableStyle}
      maxPageSize={1000}
      pagination={{ pageSizeOptions: ['20', '50', '100', '500', '1000'] }}
      searchBarRef={(ref) => {
        searchBarRef.current = ref;
      }}
      searchBarConfig={searchBarConfig}
    />
  );
});
