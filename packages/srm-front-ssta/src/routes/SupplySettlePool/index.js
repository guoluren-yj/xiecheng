import React, { useCallback, useMemo, useState, useRef, useEffect } from 'react';
import { Icon } from 'choerodon-ui';
import queryString, { stringify } from 'querystring';
import { compose, isNil, isEmpty, isArray } from 'lodash';
import { observer } from 'mobx-react';
import { DataSet, Tabs, Modal, Button, Tooltip } from 'choerodon-ui/pro';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import withRemote from 'utils/remote';
// import DocFlow from '_components/DocFlow';
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
import { handleViewTaskProgress } from '@/routes/ExecutionProgress/modal';
import RingDiagram from '../Components/RingDiagram';
import StatusTag, { statusTagRender } from '../Components/StatusTag';

import DetailDrawer from './DetailDrawer';
import SuspendedDrawer from './SuspendedDrawer';
import Create from '@/routes/NewSupplySettle/Create';
import { flagRender } from '@/utils/renderer';
import { getPermissions } from '@/routes/Components/Permission';
import { getPaymentCreateSelectConfig } from '@/utils/api';
import {
  tableDS as tableDs,
  errorTableDS as errorTableDs,
  suspendedDS,
} from '../../stores/SupplySettlePoolDS';
import {
  getResponse,
  dateRangeTransform,
  formatDynamicBtns,
  findMenuName,
  transformSupplierData,
  transformQselectDate,
} from '@/utils/utils'; // 添加了单词内换行的自定义 getResponse
import {
  remove,
  undoRemove,
  billRemove,
  billUndoRemove,
  invoiceRemove,
  invoiceUndoRemove,
  paymentRemove,
  paymentUndoRemove,
  createSupplyInvoice,
  createSupplyBill,
  createSupplyPayment,
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

const removeApis = {
  A: remove,
  B: billRemove,
  C: invoiceRemove,
  D: paymentRemove,
};

const undoRemoveApis = {
  A: undoRemove,
  B: billUndoRemove,
  C: invoiceUndoRemove,
  D: paymentUndoRemove,
};

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

const prefix = 'ssta.supplySettlePool';
const permPrefix = 'srm.settle-account.settle-pool.supply.ps';
const billUxFlag = findMenuName('srm.settle-account.reconciliation-workbench.ux-supplier');
const settleUxFlag = findMenuName('srm.settle-account.jsd.ux-supply');
const settleUxParams = settleUxFlag ? { invoiceWithPaymentFlag: 0, stepFlag: 1 } : {};
const buttonPermPrefix = 'srm.settle-account.settle-pool.supply.button';

const { TabPane } = Tabs;
const tenantId = getCurrentOrganizationId();

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
    return remote.process('SSTA.SUPPLY_POOL_LIST_CUX_HIDE_STATUS_TOOLTIP', false, { name });
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
  const { fields = [] } = custConfig?.['SSTA.SUPPLY_POOL_LIST.TAB'] || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};
  const [type, setType] = useState(propsType || fieldCode?.toUpperCase() || 'A');

  const [btnLoading, setBtnLoading] = useState(false);

  // const [itemCount, setItemCount] = useState({});

  const [isRemoveTrue, setRemoveTrue] = useState({}); // 默认租户不更改暂挂默认值

  const tableADS = useMemo(() => new DataSet(tableDs()), []);

  const tableBDS = useMemo(() => new DataSet(tableDs()), []);

  const tableCDS = useMemo(
    () =>
      new DataSet(
        remote
          ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_TABLE_C_DS_CONFIG', tableDs())
          : tableDs()
      ),
    []
  );

  const tableDDS = useMemo(() => new DataSet(tableDs()), []);

  const errorTableDS = useMemo(() => new DataSet(errorTableDs()), []);

  const suspendedDs = useMemo(() => new DataSet(suspendedDS()), []);

  const searchBarRef = useRef({});

  const dsObj = useMemo(() => {
    const sourceDsObj = {
      A: tableADS,
      B: tableBDS,
      C: tableCDS,
      D: tableDDS,
      E: errorTableDS,
    };
    return remote
      ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_DS_OBJ', sourceDsObj, { tableDs })
      : sourceDsObj;
  }, [tableADS, tableBDS, tableCDS, tableDDS, errorTableDS]);

  const tableDS = useMemo(() => dsObj[type], [dsObj, type]);

  const [permsMap, setPermsMap] = useState(new Map());

  const loading = btnLoading || tableDS.status !== 'ready';

  const requestUrl = useMemo(() => {
    switch (type) {
      case 'A':
        return `/ssta/v1/${tenantId}/settles/supplier/page-all/export`;
      case 'B':
        return `/ssta/v1/${tenantId}/settles/supplier/page-bill-able/export`;
      case 'C':
        return `/ssta/v1/${tenantId}/settles/supplier/page-invoice-able/export`;
      case 'D':
        return `/ssta/v1/${tenantId}/settles/supplier/page-payment-able/export`;
      case 'E':
        return `/ssta/v1/${tenantId}/ssta-settle-errors/supplier/page-all/export`;
      default: {
        const defaultUrl = `/ssta/v1/${tenantId}/settles/supplier/page-all/export`;
        return remote
          ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_DEFAULT_REQUEST_URL', defaultUrl, {
              type,
              CUrl: `/ssta/v1/${tenantId}/settles/supplier/page-invoice-able/export`,
            })
          : defaultUrl;
      }
    }
  }, [type, remote]);

  const requestNewUrl = useMemo(() => {
    switch (type) {
      case 'A':
        return `/ssta/v1/${tenantId}/settles/supplier/page-all/export/new`;
      case 'B':
        return `/ssta/v1/${tenantId}/settles/supplier/page-bill-able/export/new`;
      case 'C':
        return `/ssta/v1/${tenantId}/settles/supplier/page-invoice-able/export/new`;
      case 'D':
        return `/ssta/v1/${tenantId}/settles/supplier/page-payment-able/export/new`;
      case 'E':
        return `/ssta/v1/${tenantId}/ssta-settle-errors/supplier/page-all/export/new`;
      default: {
        const defaultUrl = `/ssta/v1/${tenantId}/settles/supplier/page-all/export/new`;
        return remote
          ? remote.process(
              'SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_DEFAULT_NEW_REQUEST_URL',
              defaultUrl,
              {
                type,
                CUrl: `/ssta/v1/${tenantId}/settles/supplier/page-invoice-able/export/new`,
              }
            )
          : defaultUrl;
      }
    }
  }, [type, remote]);

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
        `${buttonPermPrefix}.taskProgress`,
      ])
    );
    if (res) {
      setPermsMap(res);
    }
  }, []);

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
          ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_FETCH_COUNT_PARAMS', sourceParams, {
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
            'supplier',
            getRemoteCuxParams(settleUxParams, currentKey)
          ).then((res) => {
            ds.setState('itemCount', res?.totalElements || 0);
          });
        } else {
          // eslint-disable-next-line no-eval
          countMethodMap[currentKey]('supplier').then((res) => {
            ds.setState('itemCount', res?.totalElements || 0);
          });
        }
      } else {
        Promise.all([
          getAll('supplier'),
          getBill('supplier'),
          getInvoice('supplier', getRemoteCuxParams(settleUxParams, 'C')),
          getPayment('supplier', settleUxParams),
          getTrash('supplier'),
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
        title:
          type === 'B'
            ? intl.get(`${prefix}.model.supplySettlePool.accountClientCompany`).d('对账客户公司')
            : type === 'C' || type === 'D'
            ? intl
                .get(`${prefix}.model.supplySettlePool.settlementCustomerCompany`)
                .d('结算客户公司')
            : intl.get(`${prefix}.model.supplySettlePool.CustomerCompany`).d('客户公司'),
      },
      {
        width: 160,
        name: 'invOrganizationName',
      },
      {
        width: 220,
        name: 'supplierCompanyName',
        title:
          type === 'B'
            ? intl
                .get(`${prefix}.model.supplySettlePool.accountSupplierCompany`)
                .d('对账供应商公司')
            : type === 'C' || type === 'D'
            ? intl
                .get(`${prefix}.model.supplySettlePool.settlementSupplierCompany`)
                .d('结算供应商公司')
            : intl.get(`${prefix}.model.supplySettlePool.supplierCompany`).d('供应商公司'),
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
            ? intl.get(`${prefix}.model.supplySettlePool.settleableQuantity`).d('可结算数量')
            : type === 'B'
            ? intl.get(`${prefix}.model.supplySettlePool.accountQuantity`).d('可对账数量')
            : intl.get(`${prefix}.model.supplySettlePool.invoicedQuantity`).d('可开票数量'),
      },
      type === 'A' && {
        width: 120,
        name: 'taxIncludedAmount',
        title: intl
          .get(`${prefix}.model.supplySettlePool.settleableAmountIncludingTax`)
          .d('可结算金额(含税)'),
      },
      type === 'A' && {
        width: 120,
        name: 'billStatusMeaning',
        align: 'left',
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
      },
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
                .get(`${prefix}.model.supplySettlePool.accountAmountExcludingTax`)
                .d('可对账金额(不含税)')
            : type === 'C'
            ? intl
                .get(`${prefix}.model.supplySettlePool.invoicedAmountExcludingTax`)
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
                .get(`${prefix}.model.supplySettlePool.accountAmountIncludingTax`)
                .d('可对账金额(含税)')
            : intl
                .get(`${prefix}.model.supplySettlePool.invoicedAmountIncludingTax`)
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
      type === 'B' && {
        width: 100,
        name: 'libPriceFlag',
        align: 'left',
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
      type === 'A' && {
        width: 100,
        name: 'asyncCreateStatusMeaning',
      },
      ['A', 'C', 'D'].includes(type) && {
        width: 100,
        name: 'ecBillNum',
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
    [type, handleViewDetail]
  );

  const handleChangeType = (typeKey) => {
    const key = typeKey.toUpperCase();
    const ds = dsObj[key];
    setType(key);
    fetchCount(key);
    ds.loadData([]);
    if (searchBarRef.current[key]) ds.query(ds.currentPage);
  };

  /**
   * 如果标准后续涉及到type为C的逻辑处理，请使用此方法获取
   * ds取值请按照type取值，勿按照remoteType取值！！！
   * 【钱江摩托】
   */
  const getRemoteType = useCallback(
    (sourceType) => {
      return remote
        ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_REMOTE_TYPE', sourceType)
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
      if (res.length > 1) {
        const settleList = res.map((item) => ({
          settleHeaderId: item.settleHeaderId,
          settleNum: item.settleNum,
        }));
        history.push({
          pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${firstHeaderId}`,
          search: stringify({
            source: 'step',
            type: 'update',
            list: JSON.stringify(settleList),
          }),
        });
      } else {
        history.push({
          pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${firstHeaderId}`,
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
      // // 纯发票申请单开启账扣后单据创建即完成提交，无需打开step或者跳转详情页
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
        INVOICE: intl.get(`ssta.supplySettle.view.title.invoiceApplyCreate`).d('发票申请新建'),
        PAYMENT: intl.get(`ssta.supplySettle.view.title.paymentApplyCreate`).d('付款申请新建'),
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
      tableDS.query(undefined, undefined, false);
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
      className: Styles['ssta-small-modal'],
      title: intl.get(`ssta.supplySettle.view.modal.pendingInfo`).d('暂挂信息'),
      children: (
        <SuspendedDrawer
          dataSet={suspendedDs}
          type={remoteType}
          label={intl.get(`ssta.supplySettle.view.modal.pendingReason`).d('暂挂原因')}
          suspended
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
      className: Styles['ssta-small-modal'],
      title: intl.get(`ssta.supplySettle.view.modal.revokePendingInfo`).d('撤销暂挂信息'),
      children: (
        <SuspendedDrawer
          dataSet={suspendedDs}
          type={remoteType}
          label={intl.get(`ssta.supplySettle.view.modal.revokePendingReason`).d('撤销暂挂原因')}
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
      pathname: `/ssta/supply-settle-pool/data-import/${perCode}`,
      search: queryString.stringify({
        backPath: `/ssta/supply-settle-pool/list/${location.search}`,
        action: intl.get('ssta.common.title.batchImport').d('批量导入'),
        historyButton: false,
        args: JSON.stringify({
          camp: 'SUPPLIER',
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
    }
  };

  const getQueryData = () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    const queryDsData = tableDS.queryDataSet.current?.toData() || {};
    const { companyId_range: companyIdRange } = queryDsData || {};
    const customizeUnitCode = [tableUnitCodes[remoteType], filterUnitCodes[remoteType]]
      .filter((item) => item)
      .join();
    const invoiceParams = remoteType === 'C' ? settleUxParams : {};
    const queryData = filterNullValueObject({
      ...queryDsData,
      ...transformQselectDate(queryDsData, { dateRange: 'trxDate' }),
      ...transformSupplierData(queryDsData?.supplierCompanyId),
      customizeUnitCode,
      ...invoiceParams,
      // 公司多选时，再传一个字段
      companyIdsStr: companyIdRange,
    });
    return remote
      ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_QUERY_DATA', queryData, { type })
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

  const handleAllBaseOnPrice = async () => {
    setBtnLoading(true);
    const res = getResponse(
      await getAllPriceFromLib({
        role: 'supplier',
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

  const handleCreatePayment = useCallback(async () => {
    const { selected } = tableDS;
    const flag = math.gte(selected.length, selectedThreshold);
    if (flag) {
      // 勾选的大于阈值 需要走异步创建
      setBtnLoading(true);
      const res = getResponse(
        await paymentCreateSync({
          role: 'supplier',
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
        await createSupplyPayment(selectData.map((item) => Object.assign(item, settleUxParams)))
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
        pathname: '/ssta/supply-settle/detail',
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

  const handleCreate = () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    const selectData = tableDS.toJSONData();
    switch (remoteType) {
      case 'B':
        setBtnLoading(true);
        createSupplyBill(selectData).then(async (res) => {
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
                ? '/ssta/new-reconciliation-workbench-supplier/detail'
                : '/ssta/reconciliation-workbench-supplier/detail',
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
        createSupplyInvoice(
          selectData.map((item) => Object.assign(item, settleUxParams, { camp: 'SUPPLIER' }))
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
              pathname: '/ssta/supply-settle/detail',
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

  const expotModelCode = () => {
    switch (type) {
      case 'A':
        return `SSTA_SETTLE_SUPPLIER_ALL_EXPORT`;
      case 'B':
        return `SSTA_SETTLE_SUPPLIER_BILL_EXPORT`;
      case 'C':
        return `SSTA_SETTLE_SUPPLIER_INVOICE_EXPORT`;
      case 'D':
        return `SSTA_SETTLE_SUPPLIER_PAYMENT_EXPORT`;
      case 'E':
        return `SSTA_SETTLE_ERROR_SUPPLIER_EXPORT`;
      default: {
        const defaultCode = `SSTA_SETTLE_SUPPLIER_ALL_EXPORT`;
        return remote
          ? remote.process(
              'SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_DEFAULT_EXPORT_MODEL_CODE',
              defaultCode,
              {
                type,
                CCode: `SSTA_SETTLE_SUPPLIER_INVOICE_EXPORT`,
              }
            )
          : defaultCode;
      }
    }
  };

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
        role: 'supplier',
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

  const headerBtns = () => {
    // ds取值请按照type取值，勿按照remoteType取值！！！
    const remoteType = getRemoteType(type);
    const { billRemoveFlag, paymentRemoveFlag, invoiceRemoveFlag, allRemoveFlag } =
      tableDS.queryDataSet.current?.toData() || {};
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
                  dsObj[type].query();
                },
                args: {
                  camp: 'SUPPLIER',
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
          child: intl.get(`${prefix}.view.button.canselSuspended`).d('撤销暂挂'),
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
          child: intl.get(`${prefix}.button.baseOnPrice`).d('基于价格库取价'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'operation_service_request',
            disabled: tableDS.selected.length === 0,
            onClick: handleAddBaseOnPrice,
            loading,
            wait: 1000,
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
          requestUrl: requestNewUrl,
          queryParams: tableDS.selected.length === 0 ? getQueryData() : getSelectedKeys(),
          method: 'POST',
          allBody: true,
        },
      },
      permsMap.get(`${permPrefix}.button.batchgetlibprice`) &&
        remoteType === 'B' && {
          name: 'allBaseOnPrice',
          child: intl.get(`${prefix}.button.allBaseOnPrice`).d('全选价格库取价'),
          btnProps: {
            type: 'c7n-pro',
            icon: 'operation_subtask',
            onClick: handleAllBaseOnPrice,
            loading,
            wait: 1000,
          },
        },
      ['B', 'C'].includes(type) &&
        permsMap.get(`${buttonPermPrefix}.taskProgress`) && {
          name: 'task',
          child: intl.get('ssta.common.view.title.taskBtn').d('任务进度'),
          btnProps: {
            icon: 'publish2',
            onClick: () =>
              handleViewTaskProgress({ taskDocType: type === 'B' ? 'BILL' : 'INVOICE' }),
            loading,
          },
        },
    ];
    const otherProps = { type, tableDS, loading, getQueryData };
    const processBtns = remote
      ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX.HEAD_BTNS', allBtns, otherProps)
      : allBtns;
    return formatDynamicBtns(processBtns);
  };

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
        documentNumList: { lovPara: { tenantId, page: 0, size: 10, camp: 'SUPPLIER' } },
        collaborativeModeCode: {
          // defaultValue为假值时个性化配置才会生效
          defaultValue: collaborativeModeCode && (() => collaborativeModeCode),
        },
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
      ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX.SEARCH_BAR_CONFIG', normalConfig, {
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

  const getItemCount = (key) => dsObj[key].getState('itemCount') || 0;

  return (
    <>
      <Header title={intl.get(`${prefix}.view.title.supplySettlePool`).d('销售方结算池')}>
        {customizeBtnGroup(
          { code: 'SSTA.SUPPLY_POOL_LIST.HEADER_BTNS', pro: true },
          <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={headerBtns()} />
        )}
      </Header>
      <Content className={Styles['ssta-list-content']}>
        {customizeTabPane(
          {
            code: 'SSTA.SUPPLY_POOL_LIST.TAB',
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
                tab={intl.get(`${prefix}.view.button.receivable`).d('可收款')}
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
              ? remote.process('SSTA.SUPPLY_POOL_LIST_CUX_PROCESS_OTHER_TAB_PANE', null, {
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
    </>
  );
};

export default compose(
  formatterCollections({
    code: [
      'hzero.common',
      'ssta.supplySettlePool',
      'ssta.purchaseSettlePool',
      'hzero.c7nProU',
      'hzero.c7nProUI',
      'sbud.budgeting',
      'ssta.settlePool',
      'ssta.SettleError',
      'ssta.common',
      'ssta.supplySettle',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_POOL_LIST.GRID',
      'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_ALL',
      'SSTA.SUPPLY_POOL_LIST.BILL_GRID',
      'SSTA.SUPPLY_POOL_LIST.INVOICE_GRID',
      'SSTA.SUPPLY_POOL_LIST.PAYMENT_GRID',
      'SSTA.SUPPLY_POOL_LIST.TRASH_GRID',
      'SSTA.SUPPLY_POOL_RECORD.BILL_GRID',
      'SSTA.SUPPLY_POOL_RECORD.INVOICE_GRID',
      'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_BILL',
      'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_INVOICE',
      'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_PAYMENT',
      'SSTA.SUPPLY_POOL_LIST.SEARCH_BAR_TRASH',
      'SSTA.SUPPLY_POOL_LIST.HEADER_BTNS',
      'SSTA.SUPPLY_POOL_LIST.TAB',
    ],
  }),
  withRemote(
    {
      code: 'SSTA.SUPPLY_POOL_LIST_CUX',
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
