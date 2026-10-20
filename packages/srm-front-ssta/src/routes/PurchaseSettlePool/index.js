import React, { useCallback, useRef, Fragment, useMemo, useState, useEffect } from 'react';
import { Spin } from 'choerodon-ui/pro';
import { Icon } from 'choerodon-ui';
import queryString, { stringify } from 'querystring';
import { compose, isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react-lite';
import { DataSet, Tabs, Modal, Button, Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import withRemote from 'utils/remote';
import DocFlow from '_components/DocFlow';
import notification from 'utils/notification';
import ExcelExport from 'components/ExcelExport';
import { Content, Header } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import MultiTextFilter from '@/routes/Components/MultiTextFilter';
import CommonImport from 'components/Import';
import RingDiagram from '../Components/RingDiagram';

import { usePrevious } from '@/hooks';
import DetailDrawer from './DetailDrawer';
import SuspendedDrawer from './SuspendedDrawer';
import Create from '@/routes/NewPurchaseSettle/Create';
import { flagRender } from '@/utils/renderer';
import { getPermissions } from '@/routes/Components';
import { getPaymentCreateSelectConfig } from '@/utils/api';
import StatusTag, { statusTagRender } from '../Components/StatusTag';
import {
  getResponse,
  dateRangeTransform,
  formatDynamicBtns,
  findMenuName,
  transformSupplierData,
  confirmDocNegAction,
  transformQselectDate,
} from '@/utils/utils'; // 添加了单词内换行的自定义 getResponse
import {
  tableDS as tableDs,
  errorTableDS as errorTableDs,
  suspendedDS,
} from '../../stores/PurchaseSettlePoolDS';
import {
  remove,
  undoRemove,
  billRemove,
  billUndoRemove,
  invoiceRemove,
  invoiceUndoRemove,
  paymentRemove,
  paymentUndoRemove,
  createPurchaseInvoice,
  createPurchaseBill,
  createPurchasePayment,
  returnSettlePool,
  allCreate,
  getPriceFromLib,
  getAllPriceFromLib,
  getAll,
  getBill,
  getInvoice,
  getPayment,
  getTrash,
  paymentCreateSync,
} from '../../services/settlePoolServices';
import Styles from '@/routes/common.less';
import './index.less';
import { getCustomValidationResponse } from '@/components/CustomValidation';
import { handleViewTaskProgress } from '@/routes/ExecutionProgress/modal';

const tableUnitCodes = {
  A: 'SSTA.PURCHASE_POOL_LIST.GRID',
  B: 'SSTA.PURCHASE_POOL_LIST.BILL_GRID',
  C: 'SSTA.PURCHASE_POOL_LIST.INVOICE_GRID',
  D: 'SSTA.PURCHASE_POOL_LIST.PAYMENT_GRID',
  E: 'SSTA.PURCHASE_POOL_LIST.TRASH_GRID',
};

const filterUnitCodes = {
  A: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_ALL',
  B: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_BILL',
  C: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_INVOICE',
  D: 'SSTA.PURCHASE_POOL_LIST.SAERCH_BAR_PAYMENT',
  E: 'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_TRASH',
};
const prefix = 'ssta.purchaseSettlePool';
const permPrefix = 'srm.settle-account.settle-pool.purchase.ps';
const buttonPermPrefix = 'srm.settle-account.settle-pool.purchase.button';

const undoRemoveApis = {
  A: undoRemove,
  B: billUndoRemove,
  C: invoiceUndoRemove,
  D: paymentUndoRemove,
};

const removeApis = {
  A: remove,
  B: billRemove,
  C: invoiceRemove,
  D: paymentRemove,
};

const { TabPane } = Tabs;
const settleUxFlag = findMenuName('srm.settle-account.jsd.ux-purchase');
const billUxFlag = findMenuName('srm.settle-account.reconciliation-workbench.ux-purchaser');
const settleUxParams = settleUxFlag ? { invoiceWithPaymentFlag: 0, stepFlag: 1 } : {};
const tenantId = getCurrentOrganizationId();

const BillColorMap = {
  NO_BILL: 'info',
  BILLING: 'warn',
  BILLED: 'success',
  NO_NEED_HANDLE: 'info',
};
const InvoiceColorMap = {
  NO_INVOICE: 'info',
  INVOICING: 'warn',
  INVOICED: 'success',
  NO_NEED_HANDLE: 'info',
};

const PayColorMap = {
  UNPAID: 'info',
  PAYING: 'warn',
  PAID: 'success',
  NO_NEED_HANDLE: 'info',
};

const LockIcon = ({ lockQuantity = 0 }) =>
  lockQuantity !== 0 && (
    <Tooltip
      title={intl
        .get('ssta.common.view.message.lockedAffairDocument')
        .d('存在草稿状态的单据，具体请查询结算事务的结算执行信息')}
    >
      <Icon type="lock" className={Styles['ssta-table-cell-error-icon']} />
    </Tooltip>
  );

function getStatusTooltipHide(remote, name) {
  if (remote && remote.process) {
    return remote.process('SSTA.PURCHASE_POOL_LIST_CUX_HIDE_STATUS_TOOLTIP', false, { name });
  }
  return false;
}

const SettlePool = (props) => {
  const {
    location: { search },
    history,
    customizeTable,
    customizeBtnGroup,
    customizeTabPane,
    custConfig,
    remote,
  } = props;
  const { type: unknownPropsType, collaborativeModeCode } = queryString.parse(search.substring(1));
  const propsType = ['A', 'B', 'C', 'D', 'E'].includes(unknownPropsType)
    ? unknownPropsType
    : undefined;
  const searchBarRef = useRef({});

  const { fields = [] } = custConfig?.['SSTA.PURCHASE_POOL_LIST.TAB'] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const [type, setType] = useState(propsType || fieldCode?.toUpperCase() || 'A');
  const prevCollaborativeModeCode = usePrevious(collaborativeModeCode);
  const [btnLoading, setBtnLoading] = useState(false);

  // const [itemCount, setItemCount] = useState({});

  const [isRemoveTrue, setRemoveTrue] = useState({}); // 默认租户不更改暂挂默认值

  const [permsMap, setPermsMap] = useState(new Map());

  const tableADS = useMemo(() => new DataSet(tableDs()), []);

  const tableBDS = useMemo(() => new DataSet(tableDs()), []);

  const tableCDS = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_TABLE_C_DS_CONFIG', tableDs())
          : tableDs()
      ),
    []
  );

  const tableDDS = useMemo(() => new DataSet(tableDs()), []);

  const errorTableDS = useMemo(() => new DataSet(errorTableDs()), []);

  const suspendedDs = useMemo(() => new DataSet(suspendedDS()), []);

  const dsObj = useMemo(() => {
    const sourceDsObj = {
      A: tableADS,
      B: tableBDS,
      C: tableCDS,
      D: tableDDS,
      E: errorTableDS,
    };
    return remote
      ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_DS_OBJ', sourceDsObj, { tableDs })
      : sourceDsObj;
  }, [tableADS, tableBDS, tableCDS, tableDDS, errorTableDS]);

  const tableDS = useMemo(() => dsObj[type], [dsObj, type]);

  const loading = btnLoading || tableDS.status !== 'ready';

  const [selectedThreshold, setSelectedThreshold] = useState(5000);
  useEffect(() => {
    getPaymentCreateSelectConfigSearch();
  }, [getPaymentCreateSelectConfigSearch]);

  const getPaymentCreateSelectConfigSearch = useCallback(async () => {
    const res = getResponse(await getPaymentCreateSelectConfig());
    if (res && isArray(res)) {
      const num = res[0]?.limitNum;
      if (num && !math.isNaN(num)) setSelectedThreshold(Number(num));
    }
  }, [setSelectedThreshold]);

  useEffect(() => {
    tableDS.type = type;
    tableDS.currentType = type;
  }, [tableDS, type]);

  useEffect(() => {
    Object.entries(dsObj).forEach(([key, value]) => {
      value.setQueryParameter('type', key);
    });
    fetchCount();
    fetchPermissions();
  }, [dsObj, fetchCount, fetchPermissions]);

  useEffect(() => {
    const { setFields, handleQuery } = searchBarRef.current[type] || {};
    // 仅路由参数更改的时候更新查询默认值
    if (setFields && prevCollaborativeModeCode !== collaborativeModeCode) {
      setFields({ collaborativeModeCode }, 'init');
      if (handleQuery) handleQuery();
    }
  }, [collaborativeModeCode, prevCollaborativeModeCode, type]);

  useEffect(() => {
    if (propsType) {
      setType(propsType);
    }
  }, [propsType]);

  /**
   * 手动查询权限集
   */
  const fetchPermissions = useCallback(async () => {
    const res = getResponse(
      await getPermissions([
        `${permPrefix}.batch.import`,
        `${permPrefix}.button.suspended`,
        `${permPrefix}.button.baseonprice`,
        `${permPrefix}.button.canselsuspended`,
        `${permPrefix}.button.batchgetlibprice`,
        `${permPrefix}.radio.button.bill`,
        `${permPrefix}.radio.button.invoice`,
        `${permPrefix}.radio.button.payment`,
        `${permPrefix}.radio.button.trash`,
        `${permPrefix}.button.allcreate`,
        `${permPrefix}.newexport`,
        `${permPrefix}.export`,
        `${permPrefix}.newimport`,
        `${buttonPermPrefix}.update-expected-paydate`,
        `${buttonPermPrefix}.taskProgress`,
      ])
    );
    if (res) {
      setPermsMap(res);
    }
  }, []);

  const getLabel = useCallback((type) => {
    return type === 'A' || type === 'E'
      ? intl.get(`${prefix}.model.purchaseSettlePool.company`).d('公司')
      : type === 'B'
      ? intl.get(`${prefix}.model.purchaseSettlePool.reconciliationCompany`).d('对账公司')
      : intl.get(`${prefix}.model.purchaseSettlePool.settlementCompany`).d('结算公司');
  }, []);

  /**
   * 头columns
   */
  const columns = useMemo(
    () => [
      type !== 'E' && {
        name: 'settleNum',
        width: 200,
        renderer: ({ record, value }) => {
          return (
            <a
              onClick={() => {
                handleViewDetail(record);
              }}
            >
              {value}
            </a>
          );
        },
      },
      type === 'E' && {
        name: 'errorSettleNum',
        width: 200,
        renderer: ({ record, value }) => {
          return (
            <a
              onClick={() => {
                handleViewDetail(record);
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
        width: 160,
        name: 'companyName',
        label: getLabel(type),
      },
      {
        width: 160,
        name: 'invOrganizationName',
      },
      {
        width: 220,
        name: 'supplierCompanyName',
        title:
          type === 'A' || type === 'E'
            ? intl.get(`${prefix}.model.purchaseSettlePool.supplier`).d('供应商')
            : type === 'B'
            ? intl.get(`${prefix}.model.purchaseSettlePool.accountSupplier`).d('对账供应商')
            : intl.get(`${prefix}.model.purchaseSettlePool.settlementSupplier`).d('结算供应商'),
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
            ? intl.get(`${prefix}.model.purchaseSettlePool.settleableQuantity`).d('可结算数量')
            : type === 'B'
            ? intl.get(`${prefix}.model.purchaseSettlePool.reconcilableQuantity`).d('可对账数量')
            : intl.get(`${prefix}.model.purchaseSettlePool.invoicedQuantity`).d('可开票数量'),
      },
      type === 'A' && {
        width: 120,
        name: 'taxIncludedAmount',
        title: intl
          .get(`${prefix}.model.purchaseSettlePool.settleableAmountIncludingTax`)
          .d('可结算金额(含税)'),
      },
      type === 'A' && {
        width: 200,
        name: 'billStatusMeaning',
        align: 'left',
        tooltip: 'overflow',
        renderer: ({ value, record, name }) => {
          const { billedQuantity, billingQuantity, noBillQuantity, billLockQuantity } = record.get([
            'billedQuantity',
            'billingQuantity',
            'noBillQuantity',
            'billLockQuantity',
          ]);
          const hideTooltip = getStatusTooltipHide(remote, name);
          return [
            <Tooltip
              placement="bottom"
              title={
                hideTooltip ? null : (
                  <RingDiagram
                    data={[
                      {
                        value: billedQuantity ? Math.abs(billedQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.alreadyBill`)
                          .d('已对账')} ${billedQuantity || 0}`,
                        itemStyle: { color: '#47B881' },
                      },
                      {
                        value: billingQuantity ? Math.abs(billingQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.billIn`)
                          .d('对账中')} ${billingQuantity || 0}`,
                        itemStyle: { color: '#F88D10' },
                      },
                      {
                        value: noBillQuantity ? Math.abs(noBillQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.Unreconciled`)
                          .d('未对账')} ${noBillQuantity || 0}`,
                        itemStyle: { color: 'rgba(0, 0, 0, 0.25)' },
                      },
                    ]}
                  />
                )
              }
              theme="light"
            >
              <StatusTag
                text={value}
                color={BillColorMap[record.get('billStatus')]}
                icon={record.get('billStatus') !== 'NO_NEED_HANDLE' ? 'alt_route-o' : ''}
              />
            </Tooltip>,
            <LockIcon lockQuantity={billLockQuantity} />,
          ];
        },
      }, // poNumAndLine
      type === 'A' && {
        width: 120,
        name: 'invoiceStatusMeaning',
        align: 'left',
        renderer: ({ value, record, name }) => {
          const {
            invoicedQuantity,
            invoicingQuantity,
            noInvoiceQuantity,
            invoiceLockQuantity,
          } = record.get([
            'invoicedQuantity',
            'invoicingQuantity',
            'noInvoiceQuantity',
            'invoiceLockQuantity',
          ]);
          const hideTooltip = getStatusTooltipHide(remote, name);
          return [
            <Tooltip
              placement="bottom"
              title={
                hideTooltip ? null : (
                  <RingDiagram
                    data={[
                      {
                        value: invoicedQuantity ? Math.abs(invoicedQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.Invoiced`)
                          .d('已开票')} ${invoicedQuantity || 0}`,
                        itemStyle: { color: '#47B881' },
                      },
                      {
                        value: invoicingQuantity ? Math.abs(invoicingQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.Invoicing`)
                          .d('开票中')} ${invoicingQuantity || 0}`,
                        itemStyle: { color: '#F88D10' },
                      },
                      {
                        value: noInvoiceQuantity ? Math.abs(noInvoiceQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.notInvoiced`)
                          .d('未开票')} ${noInvoiceQuantity || 0}`,
                        itemStyle: { color: 'rgba(0, 0, 0, 0.25)' },
                      },
                    ]}
                  />
                )
              }
              theme="light"
            >
              <StatusTag
                text={value}
                color={InvoiceColorMap[record.get('invoiceStatus')]}
                icon={record.get('invoiceStatus') !== 'NO_NEED_HANDLE' ? 'alt_route-o' : ''}
              />
            </Tooltip>,
            <LockIcon lockQuantity={invoiceLockQuantity} />,
          ];
        },
      },
      type === 'A' && {
        width: 120,
        name: 'paymentStatusMeaning',
        align: 'left',
        renderer: ({ value, record, name }) => {
          const { paidQuantity, payingQuantity, unpaidQuantity, paymentLockQuantity } = record.get([
            'paidQuantity',
            'payingQuantity',
            'unpaidQuantity',
            'paymentLockQuantity',
          ]);
          const hideTooltip = getStatusTooltipHide(remote, name);
          return [
            <Tooltip
              placement="bottom"
              title={
                hideTooltip ? null : (
                  <RingDiagram
                    data={[
                      {
                        value: paidQuantity ? Math.abs(paidQuantity) : 0,
                        name: `${intl.get(`${prefix}.model.purchaseSettlePool.Paid`).d('已付款')} ${
                          paidQuantity || 0
                        }`,
                        itemStyle: { color: '#47B881' },
                      },
                      {
                        value: payingQuantity ? Math.abs(payingQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.InPayment`)
                          .d('付款中')} ${payingQuantity || 0}`,
                        itemStyle: { color: '#F88D10' },
                      },
                      {
                        value: unpaidQuantity ? Math.abs(unpaidQuantity) : 0,
                        name: `${intl
                          .get(`${prefix}.model.purchaseSettlePool.Unpaid`)
                          .d('未付款')} ${unpaidQuantity || 0}`,
                        itemStyle: { color: 'rgba(0, 0, 0, 0.25)' },
                      },
                    ]}
                  />
                )
              }
              theme="light"
            >
              <StatusTag
                text={value}
                color={PayColorMap[record.get('paymentStatus')]}
                icon={record.get('paymentStatus') !== 'NO_NEED_HANDLE' ? 'alt_route-o' : ''}
              />
            </Tooltip>,
            <LockIcon lockQuantity={paymentLockQuantity} />,
          ];
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
      ['A', 'B', 'C'].includes(type) && {
        name: 'netAmount',
        width: 150,
        title:
          type === 'B'
            ? intl
                .get(`${prefix}.model.purchaseSettlePool.accountAmountExcludingTax`)
                .d('可对账金额(不含税)')
            : type === 'C'
            ? intl
                .get(`${prefix}.model.purchaseSettlePool.invoicedAmountExcludingTax`)
                .d('可开票金额(不含税)')
            : intl
                .get(`ssta.purchaseSettlePool.model.purchaseSettlePool.amountExcludingTax`)
                .d('可结算金额(不含税)'),
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
                .get(`${prefix}.model.purchaseSettlePool.accountAmountIncludingTax`)
                .d('可对账含税金额')
            : intl
                .get(`${prefix}.model.purchaseSettlePool.invoicedAmountIncludingTax`)
                .d('可开票含税金额'),
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
        width: 100,
        name: 'errorMsg',
        tooltip: 'overflow',
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
      (type === 'A' || type === 'E') && {
        width: 100,
        name: 'sourceSupplierSiteCode',
      },

      type !== 'A' &&
        type !== 'E' && {
          width: 100,
          name: 'supplierSiteCode',
        },

      type === 'B' && {
        width: 100,
        name: 'libPriceFlag',
        align: 'left',
        renderer: ({ record }) => flagRender(record.get('libPriceFlag')),
      },
      type !== 'E' &&
        type !== 'A' && {
          width: 100,
          name: 'collaborativeModeCode',
          renderer: (records) => {
            const { record } = records;
            return record.get('collaborativeModeCodeMeaning')
              ? record.get('collaborativeModeCodeMeaning')
              : '-';
          },
        },
      type !== 'E' && {
        width: 100,
        name: 'ouName',
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
      {
        width: 100,
        name: 'trxYear',
      },
      type === 'E' && {
        width: 150,
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
      type === 'A' && {
        width: 100,
        name: 'asyncCreateStatusMeaning',
      },
      ['A', 'C', 'D'].includes(type) && {
        width: 100,
        name: 'ecBillNum',
      },
      type === 'A' && {
        title: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_settle" tablePk={record.get('settleId')} />
        ),
      },
      type === 'B' && {
        width: 120,
        name: 'trxDate',
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
    [type, handleViewDetail, getLabel]
  );

  const fetchCount = useCallback(
    (currentKey) => {
      const countMethodMap = {
        B: getBill,
        C: getInvoice,
        D: getPayment,
        E: getTrash,
        A: getAll,
      };
      if (remote && remote.event) {
        remote.event.fireEvent('remoteFetchCount', {
          currentKey,
          countMethodMap,
          dsObj,
          settleUxParams,
        });
      }
      // 埋点获取二开数据查询参数
      const getRemoteCuxParams = (sourceParams, key) =>
        remote
          ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_FETCH_COUNT_PARAMS', sourceParams, {
              key,
            })
          : {};
      if (currentKey) {
        if (!countMethodMap[currentKey]) return;
        const ds = dsObj[currentKey];
        // eslint-disable-next-line prefer-destructuring
        if (['C', 'D'].includes(currentKey)) {
          // eslint-disable-next-line no-eval
          countMethodMap[currentKey](
            'purchaser',
            getRemoteCuxParams(settleUxParams, currentKey)
          ).then((res) => {
            ds.setState('itemCount', res?.totalElements || 0);
          });
        } else {
          // eslint-disable-next-line no-eval
          countMethodMap[currentKey]('purchaser').then((res) => {
            ds.setState('itemCount', res?.totalElements || 0);
          });
        }
      } else {
        Promise.all([
          getAll('purchaser'),
          getBill('purchaser'),
          getInvoice('purchaser', getRemoteCuxParams(settleUxParams, 'C')),
          getPayment('purchaser', settleUxParams),
          getTrash('purchaser'),
        ]).then((res) => {
          const itemCountDate = {
            A: res[0] ? res[0].totalElements : 0,
            B: res[1] ? res[1].totalElements : 0,
            C: res[2] ? res[2].totalElements : 0,
            D: res[3] ? res[3].totalElements : 0,
            E: res[4] ? res[4].totalElements : 0,
          };
          Object.keys(countMethodMap).forEach((key) => {
            dsObj[key].setState('itemCount', itemCountDate[key]);
          });
        });
      }
    },
    [dsObj]
  );

  const handleChangeType = (typeKey) => {
    const key = typeKey.toUpperCase();
    const ds = dsObj[key];
    Object.values(dsObj).forEach((value) => {
      // eslint-disable-next-line no-param-reassign
      value.currentType = key;
    });
    setType(key);
    fetchCount(key);
    ds.loadData([]);
    if (searchBarRef.current[key]) ds.query(ds.currentPage);
  };

  const requestUrl = useMemo(() => {
    switch (type) {
      case 'A':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-all/export`;
      case 'B':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-bill-able/export`;
      case 'C':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-invoice-able/export`;
      case 'D':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-payment-able/export`;
      case 'E':
        return `/ssta/v1/${tenantId}/ssta-settle-errors/purchaser/page-all/export`;
      default: {
        const defaultUrl = `/ssta/v1/${tenantId}/settles/purchaser/page-all/export`;
        return remote
          ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_DEFAULT_REQUEST_URL', defaultUrl, {
              type,
              CUrl: `/ssta/v1/${tenantId}/settles/purchaser/page-invoice-able/export`,
            })
          : defaultUrl;
      }
    }
  }, [type, remote]);

  const requestNewUrl = useMemo(() => {
    switch (type) {
      case 'A':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-all/export/new`;
      case 'B':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-bill-able/export/new`;
      case 'C':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-invoice-able/export/new`;
      case 'D':
        return `/ssta/v1/${tenantId}/settles/purchaser/page-payment-able/export/new`;
      case 'E':
        return `/ssta/v1/${tenantId}/ssta-settle-errors/purchaser/page-all/export/new`;
      default: {
        const defaultUrl = `/ssta/v1/${tenantId}/settles/purchaser/page-all/export/new`;
        return remote
          ? remote.process(
              'SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_DEFAULT_NEW_REQUEST_URL',
              defaultUrl,
              {
                type,
                CUrl: `/ssta/v1/${tenantId}/settles/purchaser/page-invoice-able/export/new`,
              }
            )
          : defaultUrl;
      }
    }
  }, [type, remote]);

  /**
   * 如果标准后续涉及到type为C的逻辑处理，请使用此方法获取
   * ds取值请按照type取值，勿按照remoteType取值！！！
   * 【钱江摩托】
   */
  const getRemoteType = useCallback(
    (sourceType) => {
      return remote
        ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_REMOTE_TYPE', sourceType)
        : sourceType;
    },
    [remote]
  );

  const handleViewDetail = useCallback(
    (record) => {
      // ds取值请按照type取值，勿按照remoteType取值！！！
      const remoteType = getRemoteType(type);
      const title = intl.get('hzero.common.button.viewDetails').d('查看详情');
      Modal.open({
        // mask: false,
        drawer: true,
        key: Modal.key(),
        destroyOnClose: true,
        closable: true,
        title,
        className: Styles['ssta-detailDrawer-modal'],
        children: <DetailDrawer record={record} type={remoteType} {...props} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [type, props, getRemoteType]
  );

  const handleToSettleDetail = useCallback(
    (res) => {
      const { documentType, settleHeaderId: firstHeaderId } = res[0];
      if (!documentType) return;
      if (res.length > 1) {
        const settleList = res.map((item) => ({
          settleHeaderId: item.settleHeaderId,
          settleNum: item.settleNum,
        }));
        history.push({
          pathname: `/ssta/new-purchase-settle/${documentType.toLowerCase()}/${firstHeaderId}`,
          search: stringify({
            source: 'step',
            type: 'update',
            list: JSON.stringify(settleList),
          }),
        });
      } else {
        history.push({
          pathname: `/ssta/new-purchase-settle/${documentType.toLowerCase()}/${firstHeaderId}`,
          search: stringify({ source: 'step', type: 'update' }),
        });
      }
    },
    [history]
  );

  const handleContinueCreate = useCallback(
    async (res) => {
      if (isEmpty(res)) return;
      const {
        step,
        settleType,
        branchStep,
        documentType,
        settleNum = '',
        currencyCode = '',
        taxIncludedAmount = '',
        // enableChargeDebitFlag,
      } = res[0] || {};
      // 纯发票申请单开启账扣后单据创建即完成提交，无需打开step或者跳转详情页
      // if (settleType === 'INVOICE' && enableChargeDebitFlag === 1) {
      //   fetchCount();
      //   tableDS.query(undefined, undefined, false);
      //   return;
      // }
      // 结算策略配置跳过step，直接跳转结算单详情页
      if (step === 'END') {
        fetchCount();
        tableDS.query(undefined, undefined, false);
        handleToSettleDetail(res);
        return;
      }
      const createTitleMap = {
        INVOICE: intl.get(`ssta.purchaseSettle.view.title.invoiceApplyCreate`).d('发票申请新建'),
        PAYMENT: intl.get(`ssta.purchaseSettle.view.title.paymentApplyCreate`).d('付款申请新建'),
      };
      const headerPropName = res.length > 1 ? 'settleHeaderIds' : 'settleHeaderId';
      const baseTitle = `${createTitleMap[documentType]}-${settleNum} `;
      const filledTitle = `${taxIncludedAmount} ${currencyCode}`;
      const createProps = {
        step,
        history,
        settleType,
        branchStep,
        [headerPropName]: res.map((item) => item.settleHeaderId).join(),
        onQueryList: () => tableDS.query(),
      };
      Modal.open({
        drawer: true,
        closable: true,
        title: documentType === 'PAYMENT' ? baseTitle : baseTitle + filledTitle,
        className: Styles['ssta-large-modal'],
        bodyStyle: { paddingTop: 0, paddingBottom: 0 },
        children: <Create {...createProps} />,
        footer: null,
      });
      fetchCount();
      await tableDS.query();
      tableDS.clearCachedSelected();
    },
    [history, tableDS, fetchCount, handleToSettleDetail]
  );

  /**
   * 移除
   */
  const handleRemove = async () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    suspendedDs.reset();
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: false,
      title: intl.get(`ssta.purchaseSettle.view.modal.pendingInfo`).d('暂挂信息'),
      style: {
        width: '380px',
      },
      children: (
        <SuspendedDrawer
          dataSet={suspendedDs}
          type={remoteType}
          label={intl.get(`ssta.purchaseSettle.view.modal.pendingReason`).d('暂挂原因')}
          suspended
        />
      ),
      onOk: async () => {
        const suspendedValidate = await suspendedDs.current?.validate();
        if (!suspendedValidate) return false;
        const info = suspendedDs?.current?.toData() || {};
        const selectData = tableDS.toJSONData().map((item) => {
          // 把弹框内容加到每个item里面
          return { ...item, ...info };
        });
        setBtnLoading(true);
        const res = getResponse(await (removeApis[remoteType] || remove)(selectData));
        setBtnLoading(false);
        if (res) {
          notification.success();
          fetchCount();
          await tableDS.query();
          tableDS.clearCachedSelected();
          if (tableDS.selected?.length > 0) tableDS.batchUnSelect(tableDS.selected);
        } else {
          return false;
        }
      },
    });
  };

  /**
   * 撤销移除
   */
  const handleUndoRemove = async () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    suspendedDs.reset();
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: false,
      style: {
        width: '380px',
      },
      title: intl.get(`ssta.purchaseSettle.view.modal.revokePendingInfo`).d('撤销暂挂信息'),
      children: (
        <SuspendedDrawer
          dataSet={suspendedDs}
          type={remoteType}
          label={intl.get(`ssta.purchaseSettle.view.modal.revokePendingReason`).d('撤销暂挂原因')}
          suspended={false}
        />
      ),
      onOk: async () => {
        const suspendedValidate = await suspendedDs.current?.validate();
        if (!suspendedValidate) return false;
        setBtnLoading(true);
        const info = suspendedDs?.current?.toData() || {};
        const selectData = tableDS.toJSONData().map((item) => {
          // 把弹框内容加到每个item里面
          return { ...item, ...info };
        });
        const res = getResponse(await (undoRemoveApis[remoteType] || undoRemove)(selectData));
        setBtnLoading(false);
        if (res) {
          notification.success();
          fetchCount();
          await tableDS.query();
          tableDS.clearCachedSelected();
        } else {
          return false;
        }
      },
    });
  };

  const handleCreatePayment = useCallback(async () => {
    const { selected } = tableDS;
    const flag = math.gte(selected.length, selectedThreshold);
    if (flag) {
      // 勾选的大于阈值 需要走异步创建
      setBtnLoading(true);
      const res = getResponse(
        await paymentCreateSync({
          role: 'purchaser',
          body: Object.assign(getQueryData(), settleUxParams, {
            settleList: selected.map((item) => item?.toData()),
          }),
        })
      );
      setBtnLoading(false);
      if (res) {
        notification.success({
          message: intl
            .get('ssta.common.create.all.success')
            .d(
              '单据后台处理中，操作失败的单据，将通过系统消息展示失败原因，并重新展示在维护列表中'
            ),
        });
        tableDS.query();
        fetchCount();
      }
      return;
    }
    const selectData = tableDS.toJSONData();
    const createPayment = async () => {
      setBtnLoading(true);
      const res = getResponse(
        await createPurchasePayment(selectData.map((item) => Object.assign(item, settleUxParams)))
      );
      setBtnLoading(false);
      if (!res) return;
      notification.success();
      if (settleUxFlag) return handleContinueCreate(res);
      const list = res.map((item) => {
        return {
          settleId: item.settleHeaderId,
          settleNum: item.settleNum,
        };
      });
      history.push({
        pathname: '/ssta/purchase-settle/detail',
        search: queryString.stringify({
          source: 'create',
          type: 'UPDATE',
          documentType: 'PAYMENT',
          list: JSON.stringify(list),
        }),
      });
      fetchCount();
      await tableDS.query();
      tableDS.clearCachedSelected();
    };
    try {
      setBtnLoading(true);
      const res = await tableDS.setState('submitType', 'createSelectedValidate').submit();
      setBtnLoading(false);
      if (!res) return;
      return getCustomValidationResponse(res.content[0], createPayment);
    } catch (e) {
      setBtnLoading(false);
    }
  }, [tableDS, history, fetchCount, handleContinueCreate, selectedThreshold]);

  const handleCreate = async () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    switch (remoteType) {
      case 'B':
        if (remote?.event) {
          const beforeCreateBillRes = await remote.event.fireEvent('beforeCreateBill', {
            tableDS,
            setBtnLoading,
          });
          if (beforeCreateBillRes === false) return false;
        }
        setBtnLoading(true);
        // 前置埋点会被勾选数据做处理
        createPurchaseBill(tableDS.toJSONData()).then(async (res) => {
          setBtnLoading(false);
          if (getResponse(res)) {
            notification.success();
            const billList = res.map((item) => {
              return {
                billHeaderId: item.billHeaderId,
                billNum: item.billNum,
              };
            });
            history.push({
              pathname: billUxFlag
                ? '/ssta/new-reconciliation-workbench/detail'
                : '/ssta/reconciliation-workbench/detail',
              search: queryString.stringify({
                editFlag: 1,
                billList: JSON.stringify(billList),
                action: 'UPDATE',
                source: 'create',
                // from: 'pool',
              }),
            });
            fetchCount();
            await tableDS.query();
            tableDS.clearCachedSelected();
          }
        });
        break;
      case 'C':
        setBtnLoading(true);
        createPurchaseInvoice(
          tableDS
            .toJSONData()
            .map((item) => Object.assign(item, settleUxParams, { camp: 'PURCHASER' }))
        ).then(async (res) => {
          setBtnLoading(false);
          if (getResponse(res)) {
            notification.success();
            if (settleUxFlag) {
              handleContinueCreate(res);
              return;
            }
            const list = res.map((item) => {
              return {
                settleId: item.settleHeaderId,
                settleNum: item.settleNum,
              };
            });
            history.push({
              pathname: '/ssta/purchase-settle/detail',
              search: queryString.stringify({
                source: 'create',
                type: 'UPDATE',
                documentType: 'INVOICE',
                list: JSON.stringify(list),
              }),
            });
            fetchCount();
            await tableDS.query();
            tableDS.clearCachedSelected();
          }
        });
        break;
      default:
        handleCreatePayment();
        break;
    }
  };

  const handleReturn = async () => {
    const confirmFlag = await confirmDocNegAction({ action: 'return' });
    if (!confirmFlag) return;
    setBtnLoading(true);
    const res = getResponse(await returnSettlePool(tableDS.toJSONData()));
    setBtnLoading(false);
    if (res) {
      notification.success();
      fetchCount();
      await tableDS.query();
      tableDS.clearCachedSelected();
    }
  };

  const expotModelCode = () => {
    switch (type) {
      case 'A':
        return `SSTA_SETTLE_PURCHASE_ALL_EXPORT`;
      case 'B':
        return `SSTA_SETTLE_PURCHASE_BILL_EXPORT`;
      case 'C':
        return `SSTA_SETTLE_PURCHASE_INVOICE_EXPORT`;
      case 'D':
        return `SSTA_SETTLE_PURCHASE_PAYMENT_EXPORT`;
      case 'E':
        return `SSTA_SETTLE_ERROR_PURCHASE_EXPORT`;
      default: {
        const defaultCode = `SSTA_SETTLE_PURCHASE_ALL_EXPORT`;
        return remote
          ? remote.process(
              'SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_DEFAULT_EXPORT_MODEL_CODE',
              defaultCode,
              {
                type,
                CCode: `SSTA_SETTLE_PURCHASE_INVOICE_EXPORT`,
              }
            )
          : defaultCode;
      }
    }
  };

  const getQueryData = () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    const queryDsData = tableDS.queryDataSet.current?.toData() || {};
    const customizeUnitCode = [tableUnitCodes[remoteType], filterUnitCodes[remoteType]]
      .filter((item) => item)
      .join();
    const invoiceParams = remoteType === 'C' ? settleUxParams : {};
    const { companyId_range: companyIdRange } = queryDsData || {};
    const queryData = filterNullValueObject({
      ...queryDsData,
      ...transformQselectDate(queryDsData, { dateRange: 'trxDate' }),
      ...transformSupplierData(queryDsData?.supplierCompanyId),
      customizeUnitCode,
      ...invoiceParams,
      companyIdsStr: companyIdRange,
    });
    return remote
      ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_QUERY_DATA', queryData, { type })
      : queryData;
  };

  const getSelectedKeys = () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    const rowKey = remoteType === 'E' ? 'settleErrorId' : 'settleId';
    const ids = tableDS.selected.map((item) => item.get(rowKey));
    const idsObj = remoteType === 'E' ? { settleErrorIds: ids } : { settleIdList: ids };
    const customizeUnitCode = [tableUnitCodes[remoteType], filterUnitCodes[remoteType]]
      .filter((item) => item)
      .join();
    return {
      ...idsObj,
      customizeUnitCode,
    };
  };

  /**
   * 批量导入
   * @params
   */
  const handleRoleImport = () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    const perCode =
      remoteType === 'B'
        ? 'SSTA.SETTLE_POOL_BILL_CREATE'
        : remoteType === 'C'
        ? 'SSTA.SETTLE_POOL_INV_CREATE'
        : 'SSTA.SETTLE_POOL_PAY_CREATE';

    history.push({
      pathname: `/ssta/purchase-settle-pool/data-import/${perCode}`,
      search: queryString.stringify({
        backPath: `/ssta/purchase-settle-pool/list/${location.search}`,
        action: intl.get('ssta.common.title.batchImport').d('批量导入'),
        historyButton: false,
        args: JSON.stringify({
          camp: 'PURCHASER',
          templateCode: perCode,
          tenantId,
        }),
      }),
    });
  };
  const handleAddBaseOnPrice = async () => {
    setBtnLoading(true);
    const data = tableDS.selected.map((item) => item.get(['settleId', 'objectVersionNumber']));
    const res = getResponse(await getPriceFromLib(data));
    setBtnLoading(false);
    if (res) {
      notification.success();
      await tableDS.query();
      tableDS.clearCachedSelected();
      fetchCount();
    } else {
      // 如果报错也需要刷新，后端会把取价报错信息写入字段里
      await tableDS.query();
    }
  };

  const handleAllBaseOnPrice = async () => {
    setBtnLoading(true);
    const res = getResponse(
      await getAllPriceFromLib({
        role: 'purchaser',
        ...getQueryData(),
      })
    );
    setBtnLoading(false);
    if (res) {
      notification.success();
      await tableDS.query();
      fetchCount();
    }
  };

  // 响应更新预计期望付款日期按钮
  const handleUpdateExpectedPayDate = useCallback(async () => {
    if (isEmpty(tableDS.selected)) {
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.title.tip').d('提示'),
        children: intl
          .get(`ssta.common.view.confirm.totalCountSettleAffairToUpdateExpectedPayDate`, {
            count: tableDS.totalCount > 1000 ? '1000+' : tableDS.totalCount,
          })
          .d('您已选择全部结算事务，共 {count} 条，请确认是否更新预计期望付款日期'),
      });
      if (confirmRes !== 'ok') return;
      setBtnLoading(true);
      tableDS.dataToJSON = 'all';
      const res = await tableDS
        .setState('submitType', 'updateExpectedPayDateBatch')
        .forceSubmit()
        .finally(() => {
          tableDS.dataToJSON = 'selected';
          setBtnLoading(false);
        });
      if (!res) return;
      notification.success({
        message: intl
          .get('ssta.common.updateExpectedPayDate.all.success')
          .d('正在更新结算事务的期望付款日期，执行情况可在结算池“可付款”页签的“任务进度”中查看'),
      });
    } else {
      setBtnLoading(true);
      // tableDS.dataToJSON = 'all';
      const res = await tableDS
        .setState('submitType', 'updateExpectedPayDate')
        .forceSubmit()
        .finally(() => {
          setBtnLoading(false);
        });
      // tableDS.dataToJSON = 'selected';
      if (!res) return;
    }
    tableDS.query(undefined, undefined, false);
  }, [tableDS, getQueryData]);

  const handleAllCreate = async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl
        .get(`ssta.common.view.confirm.selectTotalCountSettleAffairToCreate`, {
          count: tableDS.totalCount > 1000 ? '1000+' : tableDS.totalCount,
        })
        .d('您已选择全部结算事务，共 {count} 条，请确认是否新建'),
    });
    if (confirmRes !== 'ok') return;
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    setBtnLoading(true);
    const res = getResponse(
      await allCreate({
        type: remoteType,
        role: 'purchaser',
        query: Object.assign(getQueryData(), settleUxParams),
      })
    );
    setBtnLoading(false);
    if (res) {
      notification.success({
        message: intl
          .get('ssta.common.create.all.success')
          .d('单据后台处理中，操作失败的单据，将通过系统消息展示失败原因，并重新展示在维护列表中'),
      });
      tableDS.query();
      fetchCount();
    }
  };

  // const itemCountFun = count => (count >= 99 ? '99+' : count);

  const handleReset = () => {
    setRemoveTrue({});
  };

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('trxDate', dateRangeTransform(value, true));
    } else if (name === 'allRemoveFlag') {
      setRemoveTrue({
        ...isRemoveTrue,
        A: Number(value) === 1,
      });
    } else if (name === 'billRemoveFlag') {
      setRemoveTrue({
        ...isRemoveTrue,
        B: Number(value) === 1,
      });
    } else if (name === 'invoiceRemoveFlag') {
      setRemoveTrue({
        ...isRemoveTrue,
        C: Number(value) === 1,
      });
    } else if (name === 'paymentRemoveFlag') {
      setRemoveTrue({
        ...isRemoveTrue,
        D: Number(value) === 1,
      });
    }
  };

  const trxTableRender = (key) => {
    const normalConfig = {
      onReset: handleReset,
      onFieldChange: handleFieldChange,
      onClear: handleReset,
      fieldProps: {
        supplierCompanyId: { lovPara: { tenantId } },
        currencyCode: { lovPara: { organizationId: tenantId } },
        settleConfigNum: { lovPara: { tenantId } },
        documentNumList: { lovPara: { tenantId, page: 0, size: 10 } },
        trxDate: {
          defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
          dynamicProps: {
            disabled: ({ record }) =>
              record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
          },
        },
        collaborativeModeCode: {
          // defaultValue为假值时个性化配置才会生效
          defaultValue: collaborativeModeCode && (() => collaborativeModeCode),
        },
        supplierSiteId: {
          dynamicProps: {
            // 适配多选和供应商值集编码 SSLM.SUPPLIER_CHOOSE
            disabled: ({ record }) => {
              const supplierLovData = record.get('supplierCompanyId');
              if (supplierLovData?.length) {
                return supplierLovData.length > 1 ? true : !supplierLovData[0]?.extSupplierIds;
              }
              return !supplierLovData?.extSupplierIds;
            },
            lovPara: ({ record }) => {
              const supplierLovData = record.get('supplierCompanyId');
              const { extSupplierIds: supplierId } =
                (supplierLovData?.length ? supplierLovData[0] : supplierLovData) || {};
              return {
                supplierId,
                tenantId,
              };
            },
          },
        },
        sourceSupplierSiteId: {
          dynamicProps: {
            // 适配多选和供应商值集编码 SSLM.SUPPLIER_CHOOSE
            disabled: ({ record }) => {
              const supplierLovData = record.get('supplierCompanyId');
              if (supplierLovData?.length) {
                return supplierLovData.length > 1 ? true : !supplierLovData[0]?.extSupplierIds;
              }
              return !supplierLovData?.extSupplierIds;
            },
            lovPara: ({ record }) => {
              const supplierLovData = record.get('supplierCompanyId');
              const { extSupplierIds: supplierId } =
                (supplierLovData?.length ? supplierLovData[0] : supplierLovData) || {};
              return {
                supplierId,
                tenantId,
              };
            },
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
            name={key === 'E' ? 'errorSettleNums' : 'settleNums'}
            dataSet={customizeDs}
            placeholder={intl
              .get('ssta.purchaseSettlePool.modal.settleNum')
              .d('请输入结算事务编号')}
          />
        ),
      },
    };
    const searchBarConfig = remote
      ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX.SEARCH_BAR_CONFIG', normalConfig, {
          key,
          dateRangeTransform,
        })
      : normalConfig;
    return (
      <div style={{ height: 'calc(100vh - 242px)' }}>
        {customizeTable(
          {
            code: tableUnitCodes[key],
          },
          <SearchBarTable
            virtual
            virtualCell
            searchBarRef={(ref) => {
              searchBarRef.current[key] = ref;
            }}
            searchCode={filterUnitCodes[key]}
            columns={columns}
            dataSet={dsObj[key]}
            style={{ maxHeight: 'calc(100% - 22px)' }}
            maxPageSize={1000}
            pagination={{ pageSizeOptions: ['10', '20', '50', '100', '500', '1000'] }}
            spin={btnLoading ? { spinning: btnLoading } : {}}
            searchBarConfig={searchBarConfig}
          />
        )}
      </div>
    );
  };

  const headerBtns = () => {
    const {
      billRemoveFlag,
      paymentRemoveFlag,
      invoiceRemoveFlag,
      allRemoveFlag,
    } = tableDS.queryDataSet.current?.toData() ? tableDS.queryDataSet.current?.toData() : {};
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    const allBtns = [
      ((remoteType === 'B' && ![1, 2].includes(Number(billRemoveFlag))) ||
        (remoteType === 'C' && ![1, 2].includes(Number(invoiceRemoveFlag))) ||
        (remoteType === 'D' && ![1, 2].includes(Number(paymentRemoveFlag)))) && {
        name: 'newAggregate',
        group: true,
        children: [
          {
            name: 'selectedCreate',
            child: intl.get(`ssta.common.button.selectedCreate`).d('勾选新建'),
            btnProps: {
              disabled: tableDS.selected.length === 0 || loading,
              onClick: () => handleCreate(),
              loading,
              wait: 1000,
            },
          },
          remoteType !== 'D' &&
            permsMap.get(`${permPrefix}.button.allcreate`) && {
              name: 'allCreate',
              child: intl.get(`ssta.common.button.allCreate`).d('全选新建'),
              btnProps: {
                onClick: () => handleAllCreate(),
                loading,
                disabled: loading,
                wait: 1000,
              },
            },
          permsMap.get(`${permPrefix}.batch.import`) && {
            name: 'batchCreate',
            child: intl.get(`ssta.common.button.importCreate`).d('导入新建'),
            btnProps: {
              type: 'c7n-pro',
              icon: '',
              onClick: handleRoleImport,
              loading,
              disabled: loading,
              wait: 1000,
            },
          },
          permsMap.get(`${permPrefix}.newimport`) &&
            ['B', 'C', 'D'].includes(remoteType) && {
              name: 'newBatchCreate',
              btnComp: CommonImport,
              childFor: 'buttonText',
              child: intl.get(`ssta.common.button.newimportCreate`).d('(新)导入新建'),
              btnProps: {
                businessObjectTemplateCode:
                  remoteType === 'B'
                    ? 'SSTA.SETTLE_POOL_BILL_CREATE'
                    : remoteType === 'C'
                    ? 'SSTA.SETTLE_POOL_INV_CREATE'
                    : 'SSTA.SETTLE_POOL_PAY_CREATE',
                prefixPatch: '/ssta',
                successCallBack: () => {
                  // 此处取ds请按照type取值，勿按照remoteType取值！！！
                  dsObj[type].query();
                },
                args: {
                  camp: 'PURCHASER',
                  templateCode:
                    remoteType === 'B'
                      ? 'SSTA.SETTLE_POOL_BILL_CREATE'
                      : remoteType === 'C'
                      ? 'SSTA.SETTLE_POOL_INV_CREATE'
                      : 'SSTA.SETTLE_POOL_PAY_CREATE',
                  tenantId,
                },
                buttonProps: {
                  type: 'c7n-pro',
                  icon: '',
                  funcType: 'link',
                  loading,
                  className: Styles['meun-item-btn'],
                },
              },
            },
        ],
        child: (
          <Button icon="add" loading={loading} color="primary">
            {intl.get(`hzero.common.button.create`).d('新建')}
            <Icon type="expand_more" />
          </Button>
        ),
      },
      permsMap.get(`${permPrefix}.export`) && {
        name: 'export',
        btnComp: ExcelExport,
        childFor: 'buttonText',
        child:
          tableDS.selected.length === 0
            ? intl.get(`ssta.common.button.export`).d('导出')
            : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          requestUrl,
          queryParams: tableDS.selected.length === 0 ? getQueryData() : getSelectedKeys(),
          method: 'POST',
        },
      },
      permsMap.get(`${permPrefix}.newexport`) && {
        name: 'newExport',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child:
          tableDS.selected.length === 0
            ? intl.get('ssta.common.button.newExport').d('(新)导出')
            : intl.get('ssta.common.button.newSelectedExport').d('(新)勾选导出'),
        btnProps: {
          otherButtonProps: {
            type: 'c7n-pro',
            funcType: 'flat',
            icon: 'unarchive',
            loading,
          },
          templateCode: expotModelCode(),
          exportAsync: false,
          requestUrl: requestNewUrl,
          queryParams: tableDS.selected.length === 0 ? getQueryData() : getSelectedKeys(),
          method: 'POST',
          allBody: true,
        },
      },
      // c7n-pro-btn-flat:not(.c7n-pro-btn-disabled):hover
      remoteType !== 'E' && {
        name: 'back',
        child: (
          <Tooltip
            placement="bottomLeft"
            title={intl
              .get(`${prefix}.view.tooltip.back`)
              .d('将未发生任何结算业务的事务退回至上游系统，以便数据重推')}
          >
            {intl.get(`${prefix}.view.button.back`).d('退回')}
          </Tooltip>
        ),
        btnProps: {
          icon: 'reply',
          funcType: 'flat',
          color: 'default',
          disabled: tableDS.selected.length === 0,
          onClick: handleReturn,
          loading,
          wait: 1000,
        },
      },
      permsMap.get(`${permPrefix}.button.suspended`) &&
        remoteType !== 'E' &&
        !isRemoveTrue[remoteType] &&
        !(
          Number(billRemoveFlag) === 2 ||
          Number(paymentRemoveFlag) === 2 ||
          Number(invoiceRemoveFlag) === 2 ||
          Number(allRemoveFlag) === 2
        ) && {
          name: 'suspended',
          child: intl.get(`${prefix}.view.button.suspended`).d('暂挂'),
          btnProps: {
            icon: 'enhanced_encryption-o',
            disabled: tableDS.selected.length === 0,
            onClick: handleRemove,
            loading,
            wait: 1000,
          },
        },
      permsMap.get(`${permPrefix}.button.canselsuspended`) &&
        remoteType !== 'E' &&
        isRemoveTrue[remoteType] &&
        !(
          Number(billRemoveFlag) === 2 ||
          Number(paymentRemoveFlag) === 2 ||
          Number(invoiceRemoveFlag) === 2 ||
          Number(allRemoveFlag) === 2
        ) && {
          name: 'canselSuspended',
          child: intl.get(`${prefix}.view.button.canselSuspended`).d('取消暂挂'),
          btnProps: {
            icon: 'no_encryption-o',
            disabled:
              tableDS.selected.length === 0 ||
              Number(tableDS.queryDataSet.current.get('billRemoveFlag')) === 0,
            onClick: handleUndoRemove,
            loading,
            wait: 1000,
          },
        },
      permsMap.get(`${permPrefix}.button.baseonprice`) &&
        remoteType === 'B' && {
          name: 'baseOnPrice',
          child: intl.get('ssta.purchaseSettlePool.button.baseOnPrice').d('基于价格库取价'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'operation_service_request',
            disabled: tableDS.selected.length === 0,
            onClick: handleAddBaseOnPrice,
            loading,
            wait: 1000,
          },
        },
      permsMap.get(`${permPrefix}.button.batchgetlibprice`) &&
        remoteType === 'B' && {
          name: 'allBaseOnPrice',
          child: intl.get('ssta.purchaseSettlePool.button.allBaseOnPrice').d('全选价格库取价'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'operation_subtask',
            onClick: handleAllBaseOnPrice,
            loading,
            wait: 1000,
          },
        },
      remoteType === 'D' &&
        permsMap.get(`${buttonPermPrefix}.update-expected-paydate`) && {
          name: 'updateExpectedPayDate',
          child: (
            <Spin spinning={loading}>
              {intl.get('ssta.common.button.updateExpectedPayDate').d('更新预计期望付款日期')}
            </Spin>
          ),
          btnProps: {
            icon: 'sync',
            // disabled: tableDS.selected.length === 0,
            onClick: handleUpdateExpectedPayDate,
            loading,
            wait: 1000,
          },
        },
      ['B', 'C', 'D'].includes(type) &&
        permsMap.get(`${buttonPermPrefix}.taskProgress`) && {
          name: 'task',
          child: intl.get('ssta.common.view.title.taskBtn').d('任务进度'),
          btnProps: {
            icon: 'publish2',
            onClick: () =>
              handleViewTaskProgress({
                taskDocType:
                  type === 'B' ? 'BILL' : type === 'C' ? 'INVOICE' : 'SETTLE_PAYMENT_DATE',
              }),
            loading,
          },
        },
    ];
    const otherProps = { type, tableDS, loading, getQueryData };
    const processBtns = remote
      ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX.HEAD_BTNS', allBtns, otherProps)
      : allBtns;
    return formatDynamicBtns(processBtns);
  };

  const getItemCount = (key) => dsObj[key].getState('itemCount') || 0;

  return (
    <Fragment>
      <Header title={intl.get(`${prefix}.view.message.title.purchaseSettlePool`).d('采购方结算池')}>
        {customizeBtnGroup(
          { code: 'SSTA.PURCHASE_POOL_LIST.HEADER_BTNS', pro: true },
          <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={headerBtns()} />
        )}
      </Header>
      <Content className={Styles['ssta-list-content']}>
        {customizeTabPane(
          {
            code: 'SSTA.PURCHASE_POOL_LIST.TAB',
          },
          <Tabs animated={false} activeKey={type.toLowerCase()} onChange={handleChangeType}>
            {permsMap.get(`${permPrefix}.radio.button.bill`) && (
              <TabPane
                key="b"
                tab={intl.get(`${prefix}.view.button.reconcilable`).d('可对账')}
                count={getItemCount('B')}
              >
                {trxTableRender('B')}
              </TabPane>
            )}
            {permsMap.get(`${permPrefix}.radio.button.invoice`) && (
              <TabPane
                key="c"
                tab={intl.get(`${prefix}.view.button.billable`).d('可开票')}
                count={getItemCount('C')}
              >
                {trxTableRender('C')}
              </TabPane>
            )}
            {permsMap.get(`${permPrefix}.radio.button.payment`) && (
              <TabPane
                key="d"
                tab={intl.get(`${prefix}.view.button.payment`).d('可付款')}
                count={getItemCount('D')}
              >
                {trxTableRender('D')}
              </TabPane>
            )}
            {permsMap.get(`${permPrefix}.radio.button.trash`) && (
              <TabPane
                key="e"
                tab={
                  <Tooltip
                    placement="top"
                    title={intl
                      .get(`${prefix}.view.tooltip.dustbin`)
                      .d(
                        '该数据表示为导入失败、退回上游、上游删除等等错误类型的数据记录，只记录不能进行业务处理。'
                      )}
                  >
                    {intl.get(`${prefix}.view.button.dustbin`).d('错误记录池')}
                  </Tooltip>
                }
                count={getItemCount('E')}
              >
                {trxTableRender('E')}
              </TabPane>
            )}
            <TabPane
              key="a"
              tab={intl.get(`${prefix}.view.button.total`).d('全部')}
              count={getItemCount('A')}
            >
              {trxTableRender('A')}
            </TabPane>
            {remote
              ? remote.process('SSTA.PURCHASE_POOL_LIST_CUX_PROCESS_OTHER_TAB_PANE', null, {
                  permsMap,
                  permPrefix,
                  TabPane,
                  dsObj,
                  getItemCount,
                  searchBarRef,
                  btnLoading,
                  collaborativeModeCode,
                  dateRangeTransform,
                  MultiTextFilter,
                  customizeTable,
                  handleFieldChange,
                  handleReset,
                  handleViewDetail,
                })
              : null}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.purchaseSettlePool',
      'hzero.c7nProU',
      'hzero.c7nProUI',
      'sbud.budgeting',
      'ssta.settlePool',
      'ssta.SettleError',
      'ssta.supplySettlePool',
      'ssta.common',
      'ssta.purchaseSettle',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSTA.PURCHASE_POOL_LIST.GRID',
      'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_ALL',
      'SSTA.PURCHASE_POOL_LIST.BILL_GRID',
      'SSTA.PURCHASE_POOL_LIST.INVOICE_GRID',
      'SSTA.PURCHASE_POOL_LIST.PAYMENT_GRID',
      'SSTA.PURCHASE_POOL_LIST.TRASH_GRID',
      'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_BILL',
      'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_INVOICE',
      'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_PAYMENT',
      'SSTA.PURCHASE_POOL_LIST.SEARCH_BAR_TRASH',
      'SSTA.PURCHASE_POOL_LIST.HEADER_BTNS',
      'SSTA.PURCHASE_POOL_LIST.TAB',
    ],
  }),
  withRemote(
    {
      code: 'SSTA.PURCHASE_POOL_LIST_CUX',
      name: 'remote',
    },
    {
      events: {
        remoteFetchCount: () => {},
      },
    }
  ),
  observer
)(SettlePool);
