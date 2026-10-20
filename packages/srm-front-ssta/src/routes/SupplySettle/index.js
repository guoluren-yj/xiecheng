import React, { useRef } from 'react';
import queryString from 'querystring';
import { compose, isNil } from 'lodash';
import { useObserver } from 'mobx-react';
import { Popover, Icon, Tabs } from 'choerodon-ui';
import { DataSet, Table, Button, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { queryIdpValue } from 'services/api';
import notification from 'utils/notification';
// import DoubleTabs from '_components/DoubleTabs';
import ExcelExport from 'components/ExcelExport';
import { Content, Header } from 'components/Page';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import { filterNullValueObject, getCurrentOrganizationId, getResponse } from 'utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import DocFlow from '_components/DocFlow';

import Show from './Show';
import { hxDS } from '@/routes/pubDS/hxDS';
import DetailDrawer from './Detail/DetailDrawer';
import PrepaymentModal from './Detail/PrepaymentModal';
import { confirmModal } from '@/routes/Components/ConfirmModal';
import MultiPrepaymentModal from './Detail/MultiPrepaymentModal';
import { statusTagRender } from '@/utils/renderer';
import {
  amountLocalRender,
  dateRangeTransform,
  btnsFormat,
  transformSupplierData,
} from '@/utils/utils';
import { getPermissions, PermissionDropdown } from '@/routes/Components';
import {
  headerDS as headerDs,
  tableDS as tableDs,
  invoiceDetailDS as invoiceDetailDs,
  preDetailDS as preDetailDs,
  demensionDetailDS as demensionDetailDs,
  payDetailDS as payDetailDs,
} from '../../stores/SupplySettleDS';
import {
  confirmSupplySettle,
  cancelSupplySettle,
  returnSupplySettle,
  confirmValidate,
  printList,
  syncPrintData,
  getStatement,
  featchWithdraw,
  getLineStatement,
  confirmSupplierDelete,
  confirmSupplierCancel,
  // getDirectInvoiceApplysettleNum,
} from '@/services/settlePoolServices';
import { decimalPointAccuracy } from '@/routes/utils';
import Styles from '@/routes/common.less';
import MultiTextFilter from '../Components/MultiTextFilter';
import { settleActionFlagger } from '../../utils/amountConfig';

const tabUnitCodes = {
  ALL: 'SSTA.SUPPLY_SETTLE_LIST.GRID',
  UPDATE: 'SSTA.SUPPLY_SETTLE_LIST.MAINTAIN_GRID',
  APPROVE: 'SSTA.SUPPLY_SETTLE_LIST.CHECK_GRID',
  CANCEL: 'SSTA.SUPPLY_SETTLE_LIST.CANCEL_GRID',
  SYNC: 'SSTA.SUPPLY_SETTLE_LIST.SYNC_GRID',
};

const filterDetailUnitBar = {
  INVOICE: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_INVOICE',
  PAYMENT: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_PAYMENT',
  PREPAYMENT: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_PREPAYMENT',
  DEMENSION: 'SSTA.SUPPLY_SETTLE_LIST.LINE_BAR_DEMENSION',
};

const filterUnitBar = {
  ALL: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_ALL',
  UPDATE: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_UPDATE',
  APPROVE: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_APPROVE',
  CANCEL: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_CANCEL',
  SYNC: 'SSTA.SUPPLY_SETTLE_LIST.SEARCH_BAR_SYNC',
};

const detailUnitCodes = {
  INVOICE: 'SSTA.SUPPLY_SETTLE_LIST.INVOICE_LINE_GRID',
  PAYMENT: 'SSTA.SUPPLY_SETTLE_LIST.PAYMENT_GRID',
  PREPAYMENT: 'SSTA.SUPPLY_SETTLE_LIST.PREPAYMENT_GRID',
  DEMENSION: 'SSTA.SUPPLY_SETTLE_LIST.DEMENSION_GRID',
};

const expotModelCode = {
  ALL: 'SSTA_SETTLE_HEADER_SUPPLIER_ALL_EXPORT',
  UPDATE: 'SSTA_SETTLE_HEADER_SUPPLIER_UPDATE_EXPORT',
  APPROVE: 'SSTA_SETTLE_HEADER_SUPPLIER_APPROVE_EXPORT',
  CANCEL: 'SSTA_SETTLE_HEADER_SUPPLIER_CANCEL_EXPORT',
};

const wholeUrlSuffix = {
  ALL: 'all',
  UPDATE: 'update',
  APPROVE: 'approve',
  CANCEL: 'cancel',
  SYNC: 'sync',
};

const detailUrlSuffix = {
  INVOICE: 'settle-lines/invoice',
  PAYMENT: 'settle-lines/payment',
  PREPAYMENT: 'pre-payment-lines',
  DEMENSION: 'settle-lines/mutil-payment',
};

const objType = {
  ALL: 'all',
  UPDATE: 'update',
  APPROVE: 'approve',
  CANCEL: 'cancel',
  INVOICE: 'invoice',
  PAYMENT: 'payment',
  PREPAYMENT: 'prepayment',
  DEMENSION: 'demension',
  all: 'ALL',
  update: 'UPDATE',
  approve: 'APPROVE',
  cancel: 'CANCEL',
  invoice: 'INVOICE',
  payment: 'PAYMENT',
  prepayment: 'PREPAYMENT',
  demension: 'DEMENSION',
};

const { TabPane, TabGroup } = Tabs;

const prefix = `ssta.supplySettle`;

const createPrefix = 'srm.settle-account.jsd.supply.ps.button.create';

const permPrefix = `srm.settle-account.jsd.supply.ps.radio.button`;

const btnPermPrefix = `srm.settle-account.jsd.supply.ps.list`;

const SettlePool = (props) => {
  const tenantId = getCurrentOrganizationId();

  const {
    history,
    customizeTable,
    customizeBtnGroup,
    customizeTabPane,
    location: { search },
    cacheState,
    wholeDsObj,
    detailDsObj,
  } = props;
  const searchBarRef = useRef({});
  const { type: urlWholeType } = queryString.parse(search.substring(1));

  const { fields = [] } = (props && props.custConfig['SSTA.PURCHASE_SETTLE_LIST.TAB']) || {};
  const { fieldCode } = fields.find((item) => item?.defaultActive === 1) || {};

  const [initFlag, setInitFlag] = React.useState(true); // 用来过滤页面渲染时筛选器初次查询

  const [isDetailTab, setIsDetailTab] = React.useState(cacheState?.get('isDetailTab') || 0);

  const [detailType, setDetailType] = React.useState(cacheState?.get('detailType') || 'INVOICE');

  // 默认激活Tab页的顺序为：1、url指定；2、详情页返回缓存；3、个性化配置；4、代码原有逻辑
  const [wholeType, setWholeType] = React.useState(
    urlWholeType || cacheState?.get('wholeType') || (fieldCode && fieldCode.toUpperCase()) || 'ALL'
  );

  const [createPermsMap, setCreatePermsMap] = React.useState(props.createPermsMap || new Map());

  const [loading, setLoading] = React.useState(false);

  const [itemCount, setItemCount] = React.useState({});

  const [statusData, setStatusData] = React.useState(props.statusData || {});

  const [isOpenClearCashed, setIsOpenClearCashed] = React.useState(true); // 记录是否开启清理缓存记录标识

  const headerDS = React.useMemo(() => new DataSet(headerDs()), []);

  const hxDs = React.useMemo(
    () =>
      new DataSet(
        hxDS({
          url: `/ssta/v1/${getCurrentOrganizationId()}/pre-payment-lines/write/off/record/`,
          pk: 'prepaymentLineId',
          urlPramas: true,
        })
      ),
    []
  );

  const detailExportModelCode = {
    INVOICE: 'SSTA_SETTLE_LINE_SUPPLIER_EXPORT',
    PAYMENT: 'SSTA_SETTLE_LINE_SUPPLIER_PAYMENT_EXPORT',
    PREPAYMENT: 'SSTA_SETTLE_LINE_SUPPLIER_PREPAYMENT_EXPORT',
    DEMENSION: 'SSTA_SETTLE_LINE_SUPPLIER_DEMENSION_EXPORT',
  };

  React.useEffect(() => {
    Object.entries(wholeDsObj).forEach(([key, value]) => {
      const customizeUnitCode = [tabUnitCodes[key], filterUnitBar[key]].join();
      value.setQueryParameter('customizeUnitCode', customizeUnitCode);
      value.setQueryParameter('action', key);
      /* eslint-disable */
      value.action = key;
    });
    fetchLov();
    fetchCount();
    fetchPermissions();
  }, []);

  // React.useEffect(() => {
  //   if (urlWholeType) {
  //     setWholeType(urlWholeType);
  //   } else {
  //     const { fields = [] } = props?.custConfig['SSTA.SUPPLY_SETTLE_LIST.TAB'] || {};
  //     fields.sort((a, b) => {
  //       return a.seq - b.seq;
  //     });
  //     for (let i = 0; i < fields.length; i++) {
  //       const ele = fields[i];
  //       const activeObj = subList.find(v => {
  //         return v.key === ele.fieldCode.toUpperCase();
  //       });
  //       if (ele.defaultActive === 1 && !activeObj?.hidden) {
  //         handleTabChange(ele.fieldCode);
  //         return;
  //       }
  //     }
  //   }
  // }, [urlWholeType, createPermsMap]);

  const fetchCount = (value) => {
    if (isNil(value) ? isDetailTab : value) {
      Promise.all([
        getLineStatement({ action: 'INVOICE', type: 'supplier' }),
        getLineStatement({ action: 'PAYMENT', type: 'supplier' }),
        getLineStatement({ action: 'PREPAYMENT', type: 'supplier' }),
        getLineStatement({ action: 'DEMENSION', type: 'supplier' }),
      ]).then((res) => {
        setItemCount({
          ...itemCount,
          invoice: res[0]?.totalElements || 0,
          payment: res[1]?.totalElements || 0,
          prePayment: res[2]?.totalElements || 0,
          dimension: res[3]?.totalElements || 0,
        });
      });
    } else {
      Promise.all([
        getStatement({ action: 'ALL', type: 'supplier' }),
        getStatement({ action: 'UPDATE', type: 'supplier' }),
        getStatement({ action: 'APPROVE', type: 'supplier' }),
        getStatement({ action: 'CANCEL', type: 'supplier' }),
        getStatement({ action: 'SYNC', type: 'supplier' }),
      ]).then((res) => {
        setItemCount({
          ...itemCount,
          all: res[0] ? res[0].totalElements : 0,
          update: res[1] ? res[1].totalElements : 0,
          approve: res[2] ? res[2].totalElements : 0,
          cancel: res[3] ? res[3].totalElements : 0,
          sync: res[4] ? res[4].totalElements : 0,
        });
      });
    }
  };

  const fetchLov = async () => {
    const data = await queryIdpValue('SSTA.SETTLE_STATUS');
    if (data) {
      const statusData1 = {};
      data.forEach(({ value, tag }) => {
        statusData1[value] = tag;
      });
      await setStatusData(statusData1);
    }
  };

  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${createPrefix}.invoice`,
        `${createPrefix}.payment`,
        `${createPrefix}.paymentinvoice`,
        `${createPrefix}.prepayment`,
        `${permPrefix}.update`,
        `${permPrefix}.audit`,
        `${permPrefix}.cancel`,
        `${permPrefix}.recall`,
        `${btnPermPrefix}.button.confirm`,
        `${btnPermPrefix}.button.return`,
        `srm.settle-account.settle-pool.supply.ps.radio.button.invoice`,
        `srm.settle-account.settle-pool.supply.ps.radio.button.payment`,
        'srm.settle-account.jsd.supply.ps.export',
        'srm.settle-account.jsd.supply.ps.newexport',
      ])
    );
    if (res) {
      setCreatePermsMap(res);
    }
  };

  // 价格字段高亮显示
  const priceShiledRenderAndHighLight = (record, value, name) => {
    const settleStatus = record?.get('settleStatus');

    // 判断应用页面
    const fieldName =
      record?.get('settleBasePrice') === 'NET_PRICE' ? 'netPrice' : 'taxIncludedPrice';
    if (
      settleStatus !== 'NEW' &&
      settleStatus !== 'RETURN' &&
      settleStatus !== 'INVOICE_EXCEPTION' &&
      settleStatus !== 'INVOICE_FAILED' &&
      name === fieldName &&
      record?.get('priceLightFlag') === 1
    ) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${record?.get(
            'orignPrice'
          )}`}
        >
          <span style={{ color: 'red' }}>{amountLocalRender({ value })}</span>
        </Popover>
      );
    } else {
      return amountLocalRender({ value });
    }
  };

  // 税率高亮显示
  const rateShiledRenderAndHighLight = ({ record }) => {
    const settleStatus = record.get('settleStatus');

    // 判断应用页面
    if (
      settleStatus !== 'NEW' &&
      settleStatus !== 'RETURN' &&
      settleStatus !== 'INVOICE_EXCEPTION' &&
      settleStatus !== 'INVOICE_FAILED' &&
      record.get('rateLightFlag') === 1
    ) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${record.get(
            'settleTaxRate'
          )}`}
        >
          <span style={{ color: 'red' }}>
            {record.toData().taxRate ? record.toData().taxRate : '0'}
          </span>
        </Popover>
      );
    } else {
      return record.toData().taxRate ? record.toData().taxRate : '0';
    }
  };

  // 税额高亮显示
  const rateAmountShiledRenderAndHighLight = (record, value) => {
    const settleStatus = record?.get('settleStatus');
    // 判断应用页面
    if (
      settleStatus !== 'NEW' &&
      settleStatus !== 'RETURN' &&
      settleStatus !== 'INVOICE_EXCEPTION' &&
      settleStatus !== 'INVOICE_FAILED' &&
      record?.get('taxAmountLightFlag') === 1
    ) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${record?.get(
            'originalTaxAmount'
          )}`}
        >
          <span style={{ color: 'red' }}>
            {decimalPointAccuracy(value, record?.get('amountPrecision'), {
              repair: true,
              check: true,
            })}
          </span>
        </Popover>
      );
    } else {
      return decimalPointAccuracy(value, record?.get('amountPrecision'), {
        repair: true,
        check: true,
      });
    }
  };

  /**
   * 头columns
   */
  const columns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          return statusTagRender(value, statusData[record.get('settleStatus')]);
        },
      },
      {
        name: 'settleNum',
        width: 200,
        tooltip: 'overflow',
        renderer: ({ record, value }) => {
          return <a onClick={() => handleViewDetail(record.toData())}>{value}</a>;
        },
      },
      wholeType === 'ALL' && {
        name: 'operation',
        header: intl.get('hzero.common.button.operator').d('操作'),
        width: 150,
        renderer: ({ record, dataSet }) => {
          const {
            camp,
            settleStatus,
            confirmApproveMethod,
            confirmCollaborativeMode,
            showFlag = false,
          } = record.get([
            'camp',
            'settleStatus',
            'confirmApproveMethod',
            'confirmCollaborativeMode',
            'showFlag',
          ]);
          const { action } = dataSet;
          const [updateBtn, approveBtn, cancelBtn] = settleActionFlagger(record, 'supplier', [
            'UPDATE',
            'APPROVE',
            'CANCEL',
          ]);
          return (
            <PermissionDropdown
              permsMap={createPermsMap}
              dataSource={[
                {
                  type: 'update',
                  title: intl.get('hzero.common.button.edit').d('编辑'),
                  onClick: () => handleUpdate(record.toData(), 'UPDATE'),
                  main: action === 'UPDATE',
                  show: updateBtn,
                  permissionCodeList: ['srm.settle-account.jsd.supply.ps.radio.button.update'],
                },
                {
                  type: 'approve',
                  title: intl.get('ssta.common.button.approve').d('审核'),
                  onClick: () => handleUpdate(record.toData(), 'APPROVE'),
                  main: action === 'APPROVE',
                  show: approveBtn,
                  permissionCodeList: ['srm.settle-account.jsd.supply.ps.radio.button.audit'],
                },
                {
                  type: 'cancel',
                  title: intl.get('hzero.common.button.cancel').d('取消'),
                  onClick: () => handleUpdate(record.toData(), 'CANCEL'),
                  main: action === 'CANCEL',
                  show: cancelBtn,
                  permissionCodeList: ['srm.settle-account.jsd.supply.ps.radio.button.cancel'],
                },
                {
                  type: 'show',
                  title: intl.get('hzero.common.button.viewCollectionDetail').d('查看收款记录'),
                  onClick: () => handleShow(record),
                  show: wholeType === 'ALL' && showFlag,
                },
                {
                  type: 'withdraw',
                  title: intl.get('ssta.costSheet.model.costSheet.withdraw').d('撤回'),
                  onClick: () => handleWithdraw(record),
                  show:
                    wholeType === 'ALL' &&
                    ['SUBMITED', 'SUBMITED_APPROVING'].includes(settleStatus) &&
                    camp === 'SUPPLIER' &&
                    !(confirmApproveMethod === 'WORKFLOW' && confirmCollaborativeMode === 'DOUBLE'),
                  permissionCodeList: ['srm.settle-account.jsd.supply.ps.radio.button.recall'],
                },
                // {
                //   type: 'confirm',
                //   title: intl
                //     .get('ssta.directPoolSupply.model.directPoolSupply.taxInvoiceConfirm')
                //     .d('税务开票申请确认'),
                //   onClick: () => taxInvoiceConfirm(record),
                //   show:
                //     wholeType === 'ALL' &&
                //     settleStatus === 'WAIT_SUPPLIER_CONFIRM' &&
                //     previewFlag === 1 &&
                //     directInvoicePoint === 'APPROVED',
                // },
              ]}
            />
          );
        },
      },
      {
        width: 150,
        tooltip: 'overflow',
        name: 'settleTypeMeaning',
      },
      {
        width: 150,
        tooltip: 'overflow',
        name: 'invOrganizationName',
      },
      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'netAmount',
        width: 120,
        tooltip: 'overflow',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxAmount',
        width: 120,
        tooltip: 'overflow',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'taxIncludedAmount',
        width: 120,
        tooltip: 'overflow',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'paymentAmount',
        width: 120,
        tooltip: 'overflow',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'applyAmount',
        width: 120,
        tooltip: 'overflow',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'prepaymentAmount',
        width: 120,
        tooltip: 'overflow',
        align: 'right',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'syncStatusMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'creationDate',
        type: 'date',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'createdUserName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'campMeaning',
        tooltip: 'overflow',
      },
      {
        width: 120,
        name: 'isPrint',
        renderer: ({ record }) =>
          record.toData().isPrint === '1'
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否'),
      },
      {
        name: 'sourceSupplierCompanyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'sourceSupplierCompanyNum',
        width: 150,
        tooltip: 'overflow',
      },
      wholeType !== 'CANCEL' && {
        name: 'confirmCollaborativeMode',
        width: 150,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
        tooltip: 'overflow',
      },
    ];
  }, [createPermsMap, statusData, wholeType]);
  const invoiceColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          return statusTagRender(value, statusData[record.get('settleStatus')]);
        },
      },
      {
        header: intl.get('ssta.common.model.common.settleNumAndLineNum').d('结算单编号-行号'),
        name: 'settleHeaderNum',
        width: 200,
        tooltip: 'overflow',
        renderer: ({ record, value }) => {
          return (
            <a onClick={() => handleViewDetail(record.toData())}>
              {value}-{record.get('lineNum')}
            </a>
          );
        },
      },
      {
        width: 150,
        tooltip: 'overflow',
        name: 'settleTypeMeaning',
      },
      {
        width: 200,
        tooltip: 'overflow',
        name: 'settleNum',
      },
      {
        width: 150,
        tooltip: 'overflow',
        name: 'sourceSettleNumAndLineNum',
      },
      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'itemCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'itemName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'uom',
        tooltip: 'overflow',
      },
      {
        name: 'quantity',
        width: 120,
        renderer: amountLocalRender,
        tooltip: 'overflow',
        align: 'right',
      },

      {
        width: 120,
        name: 'netPrice',
        renderer: ({ record, value, name }) => {
          return priceShiledRenderAndHighLight(record, value, name);
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        name: 'unitPriceBatch',
        width: 120,
        renderer: amountLocalRender,
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'netAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },

      {
        width: 120,
        name: 'taxRate',
        renderer: rateShiledRenderAndHighLight,
        tooltip: 'overflow',
        align: 'right',
      },

      {
        width: 120,
        name: 'taxAmount',
        renderer: ({ record, value, name }) => {
          return rateAmountShiledRenderAndHighLight(record, value, name);
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'taxIncludedPrice',
        renderer: ({ record, value, name }) => {
          return priceShiledRenderAndHighLight(record, value, name);
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 150,
        name: 'taxIncludedAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
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
        name: 'settleModeMeaning',
        // lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        width: 120,
        name: 'enableQuantity',
        renderer: amountLocalRender,
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'orignPrice',
        renderer: amountLocalRender,
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'enableAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        name: 'invoicePayEnableFlag',
        renderer: ({ record }) =>
          record.toData().invoicePayEnableFlag === '1'
            ? intl.get('hzero.common.button.yes').d('是')
            : intl.get('hzero.common.button.no').d('否'),
        width: 150,
      },
      {
        width: 120,
        name: 'paymentAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'applyAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'invoicedAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'paidAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 200,
        name: 'trxDate',
      },
      {
        width: 200,
        name: 'poAndLineNum',
      },
      {
        width: 150,
        name: 'ecPoSubNum',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        width: 150,
      },
      {
        width: 150,
        name: 'asnAndLineNum',
      },
      {
        name: 'orderType',
        width: 150,
      },
      {
        name: 'purOrganizationName',
        width: 150,
      },
      {
        name: 'invOrganizationName',
        width: 150,
      },
      {
        name: 'purchaseAgentName',
        width: 150,
      },
      {
        name: 'trxTypeCodeMeaning',
        width: 150,
      },
      {
        name: 'dataSourceMeaning',
        width: 150,
      },
      {
        name: 'sourcePlatformCodeMeaning',
        width: 150,
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
      },
      {
        name: 'createdUserName',
        width: 150,
      },
      {
        name: 'campMeaning',
        width: 150,
      },
      {
        name: 'supplierSiteCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'multiDealTrxNum',
        width: 200,
      },
      {
        name: 'multiDealTrxLineNum',
        width: 200,
      },
      {
        name: 'multiDealPoNum',
        width: 200,
      },
      {
        name: 'multiDealPoLineNum',
        width: 200,
      },
      {
        name: 'preColWriteOff',
        header: intl.get(`${prefix}.button.preColWriteOff`).d('预收款核销'),
        width: 150,
        renderer: ({ record }) =>
          record.get('taxIncludedAmount') > 0 && record.get('invoicePayEnableFlag') === '1' ? (
            <a onClick={() => handleLinePrepayment(record)}>
              {intl.get('ssta.supplySettle.button.preColWriteOffRecord').d('预收款核销记录')}
            </a>
          ) : null,
      },
      {
        header: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_settle_line" tablePk={record.get('settleLineId')} />
        ),
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewInvoiceDetail(record)}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
    ];
  }, [statusData]);
  const payColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 120,
        renderer: ({ value, record }) => {
          return statusTagRender(value, statusData[record.get('settleStatus')]);
        },
      },

      {
        header: intl.get('ssta.common.model.common.settleNumAndLineNum').d('结算单编号-行号'),
        name: 'settleHeaderNum',
        width: 200,
        tooltip: 'overflow',
        renderer: ({ record, value }) => {
          return (
            <a onClick={() => handleViewDetail(record.toData())}>
              {value}-{record.get('lineNum')}
            </a>
          );
        },
      },
      {
        width: 150,
        name: 'settleTypeMeaning',
        tooltip: 'overflow',
      },
      {
        name: 'settleNum',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'sourceSettleNumAndLineNum',
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'itemCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'itemName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'uom',
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'sourceSettleHeaderNum',
        tooltip: 'overflow',
      },

      {
        width: 120,
        name: 'paymentAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'applyAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'invoicedAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'paidAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 150,
        name: 'settleMatchDimensionMeaning',
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'settleBasePriceMeaning',
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'settleModeMeaning',
        tooltip: 'overflow',
        // lookupCode: 'SSTA.SETTLE_MODE',
      },
      {
        width: 150,
        name: 'trxDate',
        tooltip: 'overflow',
      },
      {
        width: 200,
        name: 'poAndLineNum',
        tooltip: 'overflow',
      },
      {
        width: 200,
        name: 'ecPoSubNum',
        tooltip: 'overflow',
      },

      {
        name: 'sourceParentSettleNumAndLineNum',
        width: 150,
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'asnAndLineNum',
        tooltip: 'overflow',
      },
      {
        name: 'orderType',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'purOrganizationName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'invOrganizationName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'purchaseAgentName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'trxTypeCodeMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'dataSourceMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'sourcePlatformCodeMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'createdUserName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'campMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'supplierSiteCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'multiDealTrxNum',
        width: 200,
      },
      {
        name: 'multiDealTrxLineNum',
        width: 200,
      },
      {
        name: 'multiDealPoNum',
        width: 200,
      },
      {
        name: 'multiDealPoLineNum',
        width: 200,
        name: 'preColWriteOff',
        header: intl.get(`${prefix}.button.preColWriteOff`).d('预收款核销'),
        width: 150,
        renderer: ({ record }) =>
          record.get('invoicedAmount') > 0 ? (
            <a onClick={() => handleLinePrepayment(record)}>
              {intl.get('ssta.supplySettle.button.preColWriteOffRecord').d('预收款核销记录')}
            </a>
          ) : null,
      },
      {
        header: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_settle_line" tablePk={record.get('settleLineId')} />
        ),
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewInvoiceDetail(record)}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
    ];
  }, [statusData]);
  const preColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 120,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          return statusTagRender(value, statusData[record.get('settleStatus')]);
        },
      },

      {
        header: intl.get('ssta.common.model.common.settleNumAndLineNum').d('结算单编号-行号'),
        name: 'settleHeaderNum',
        width: 200,
        tooltip: 'overflow',
        renderer: ({ record, value }) => {
          return (
            <a onClick={() => handleViewDetail(record.toData())}>
              {value}-{record.get('lineNum')}
            </a>
          );
        },
      },
      {
        width: 150,
        tooltip: 'overflow',
        name: 'settleTypeMeaning',
      },

      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 150,
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'prepaymentTypeMeaning',
        tooltip: 'overflow',
      },
      {
        width: 150,
        name: 'paymentTypeName',
        tooltip: 'overflow',
      },

      {
        width: 150,
        tooltip: 'overflow',
        name: 'paymentTermName',
      },
      {
        width: 150,
        name: 'expectPaymentDate',
        tooltip: 'overflow',
      },
      {
        name: 'associateNum',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ record }) => {
          if (record.get('associateLineNum')) {
            return `${record.get('associateNum')}-${record.get('associateLineNum')}`;
          } else if (record.get('associateNum')) {
            return `${record.get('associateNum')}`;
          }
        },
      },
      {
        width: 120,
        name: 'associateAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'prepaymentAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'prepaymentApplyAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'createdUserName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'campMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'operation',
        width: 150,
        header: intl.get('hzero.common.button.action').d('操作'),
        renderer: ({ record }) =>
          record.get('lineNum') ? (
            <a onClick={() => handleDetailHistory(record)}>
              {intl.get('ssta.common.view.title.writeOffRecord').d('核销记录')}
            </a>
          ) : null,
      },
    ];
  }, [statusData]);
  const demensionColumns = React.useMemo(() => {
    return [
      {
        name: 'settleStatusMeaning',
        width: 150,
        tooltip: 'overflow',
        renderer: ({ value, record }) => {
          return statusTagRender(value, statusData[record.get('settleStatus')]);
        },
      },
      {
        name: 'settleHeaderNum',
        width: 200,
        tooltip: 'overflow',
        renderer: ({ record, value }) => {
          return <a onClick={() => handleViewDetail(record.toData())}>{value}</a>;
        },
      },

      {
        width: 150,
        name: 'settleTypeMeaning',
        tooltip: 'overflow',
      },

      {
        name: 'companyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'supplierCompanyName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'currencyCode',
        width: 150,
        tooltip: 'overflow',
      },

      {
        name: 'paymentDimensionMeaning',
        width: 150,
        tooltip: 'overflow',
      },

      {
        width: 150,
        name: 'documentNum',
        tooltip: 'overflow',
      },

      {
        width: 120,
        name: 'invoicedTaxIncludedAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        name: 'remainingPaymentAmount',
        width: 120,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },

      {
        width: 120,
        name: 'paymentAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        width: 120,
        name: 'applyAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
        tooltip: 'overflow',
        align: 'right',
      },
      {
        name: 'paymentSpliteRuleMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'settleHeaderCreationDate',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'createdUserName',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'campMeaning',
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'preColWriteOff',
        header: intl.get(`${prefix}.button.preColWriteOff`).d('预收款核销'),
        width: 150,
        renderer: ({ record }) => (
          <a onClick={() => handleMultiPrepayment(record)}>
            {intl.get('ssta.supplySettle.button.preColWriteOffRecord').d('预收款核销记录')}
          </a>
        ),
      },
    ];
  }, [statusData]);
  const handleLinePrepayment = (record) => {
    handlePrepayment(true, record);
  };
  // eslint-disable-next-line
  const handlePrepayment = (isLine, record) => {
    preModal = Modal.open({
      // mask: false,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-modal'],
      title: intl.get('ssta.supplySettle.button.preColWriteOffRecord').d('预收款核销记录'),
      children: (
        <PrepaymentModal
          settleHeaderId={record.get('settleHeaderId')}
          topRecord={record}
          isLine={isLine}
          isModalEdit={false}
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };
  // 核销记录
  const handleDetailHistory = (record) => {
    const { prepaymentLineId } = record.data;
    hxDs.setQueryParameter('prepaymentLineId', prepaymentLineId);

    hxDs.query();

    const hxColumns = [
      {
        name: 'settleTransactionNum', // 结算事务编号
        width: 150,
      },
      {
        name: 'settleNum', // 关联结算单号
        width: 200,
        tooltip: 'overflow',
      },
      {
        name: 'settleStatusMeaning', // 关联结算单号
        width: 150,
        tooltip: 'overflow',
      },
      {
        name: 'lineNum', // 关联结算行号
        width: 100,
      },
      {
        name: 'applyAmount', //  核销金额
        width: 120,
        tooltip: 'overflow',
        renderer: amountLocalRender,
      },
    ];
    Modal.open({
      // mask: false,
      drawer: true,
      key: Modal.key(),
      closable: true,
      title: intl.get('ssta.common.view.title.writeOffRecord').d('核销记录'),
      className: Styles['ssta-medium-modal'],
      children: <Table dataSet={hxDs} columns={hxColumns} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleMultiPrepayment = (record) => {
    modal = Modal.open({
      // mask: false,
      drawer: true,
      key: 'multiPrepayment',
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-modal'],
      title: intl
        .get('ssta.supplySettle.button.multPreColWriteOffRecord')
        .d('多维度预收款核销记录'),
      children: (
        <MultiPrepaymentModal
          topRecord={record}
          settleApplyLineList={record.toData().settleApplyLineList}
          headerDS={headerDS}
          isList={true}
        />
      ),
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 维护
   * @param {} record
   */
  const handleUpdate = (record, types, closeModal) => {
    if (closeModal) {
      closeModal.close();
      history.push({
        pathname:
          record.documentType === 'PREPAYMENT'
            ? '/ssta/supply-settle/pre-payment'
            : '/ssta/supply-settle/detail',
        search: queryString.stringify({
          source: 'detail',
          settleHeaderId: record.settleHeaderId,
          documentType: record.documentType,
          type: types,
        }),
      });
    } else {
      history.push({
        pathname:
          record.documentType === 'PREPAYMENT'
            ? '/ssta/supply-settle/pre-payment'
            : '/ssta/supply-settle/detail',
        search: queryString.stringify({
          source: 'detail',
          settleHeaderId: record.settleHeaderId,
          documentType: record.documentType,
          type: types,
        }),
      });
    }
  };
  /**
   * 展示
   */
  const handleShow = (record) => {
    Modal.open({
      // mask: false,
      drawer: true,
      title: intl.get('hzero.common.button.viewCollectionDetail').d('查看收款记录'),
      closable: true,
      key: Modal.key(),
      className: Styles['ssta-medium-modal'],
      children: <Show settleHeaderId={record.get('settleHeaderId')} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  /**
   * 撤回
   * @param {*} record
   */
  const handleWithdraw = (record) => {
    Modal.confirm({
      children: intl.get(`ssta.costSheet.model.costSheet.withdrawning`).d('是否撤回？'),
      onOk: async () => {
        getResponse(
          await featchWithdraw({ ...record.toData() }).then((res) => {
            if (res) {
              if (res.failed) {
                notification.error({
                  message: res.message,
                });
                wholeDsObj[wholeType].query();
                fetchCount();
              } else {
                notification.success();
                wholeDsObj[wholeType].query();
                fetchCount();
              }
            }
          })
        );
      },
    });
  };

  const handleFieldChange = ({ value, name, record }) => {
    if (name === 'dateRange') {
      record.set('creationDate', dateRangeTransform(value, true));
    }
  };

  /**
   * 筛选器查询回调
   */
  const handleQuery = (params, ds, key) => {
    ds.queryDataSet.loadData([params]);
    const historyState = props.location.state;
    if (historyState?._back && isOpenClearCashed) {
      cancelAllSelected(ds);
      setIsOpenClearCashed(false);
    }
    if (initFlag) {
      ds.query(ds.currentPage);
      setInitFlag(false);
    } else {
      ds.query();
    }
  };
  const cancelAllSelected = (ds) => {
    const { selected } = ds;
    if (selected?.length > 0) {
      selected.forEach((record) => {
        ds.unSelect(record);
      });
    }
  };

  /**
   * 打印
   */
  const printHeader = () => {
    setLoading(true);
    const selectData = wholeDsObj[wholeType].selected.map((item) => item.toData());
    const invoiceHeaders = [];
    selectData.forEach((item) => {
      invoiceHeaders.push(item.settleHeaderId);
    });
    printList({ list: invoiceHeaders }).then((res) => {
      if (res) {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result;
          try {
            const failedInfo = JSON.parse(content);
            notification.error({
              description: failedInfo.message,
            });
            setLoading(false);
          } catch (e) {
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
            syncPrintData(selectData).then((res1) => {
              setLoading(false);
              if (getResponse(res1)) {
                notification.success();
                wholeTableDs[wholeType].query();
                fetchCount();
              }
            });
          }
        };
        reader.readAsText(res);
      }
    });
  };

  const getQueryParams = () => {
    const ds = isDetailTab ? detailDsObj[detailType] : wholeDsObj[wholeType];
    const queryData = ds.queryDataSet.current?.toData() || {};
    return filterNullValueObject({
      ...queryData,
      ...transformSupplierData(queryData.supplierCompanyId),
      action: isDetailTab ? undefined : wholeType,
      customizeUnitCode: isDetailTab
        ? [detailUnitCodes[detailType], filterDetailUnitBar[detailType]].join()
        : [tabUnitCodes[wholeType], filterUnitBar[wholeType]].join(),
    });
  };

  const getSelectedKeys = () => {
    const ds = isDetailTab ? detailDsObj[detailType] : wholeDsObj[wholeType];
    const idsObj = {};
    if (isDetailTab) {
      if (detailType === 'PREPAYMENT') {
        idsObj.prepaymentLineIdList = ds.selected.map((item) => item.get('prepaymentLineId'));
      } else if (detailType === 'DEMENSION') {
        idsObj.dimensionKeyList = ds.selected.map((item) => item.get('dimensionKey'));
      } else {
        idsObj.settleLineIdList = ds.selected.map((item) => item.get('settleLineId'));
      }
    } else {
      idsObj.settleHeaderIds = ds.selected.map((item) => item.get('settleHeaderId'));
    }
    return {
      ...idsObj,
      action: isDetailTab ? undefined : wholeType,
      customizeUnitCode: isDetailTab
        ? [detailUnitCodes[detailType], filterDetailUnitBar[detailType]].join()
        : [tabUnitCodes[wholeType], filterUnitBar[wholeType]].join(),
    };
  };

  const handleViewInvoiceDetail = (record) => {
    const title = intl.get('hzero.common.button.viewDetail').d('查看详情');
    Modal.open({
      // mask: false,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      title,
      className: Styles['ssta-large-modal'],
      children: <DetailDrawer record={record} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const handleViewDetail = (record) => {
    history.push({
      pathname:
        record.documentType === 'PREPAYMENT'
          ? '/ssta/supply-settle/pre-payment'
          : '/ssta/supply-settle/detail',
      search: queryString.stringify({
        source: 'detail',
        settleHeaderId: record.settleHeaderId,
        documentType: record.documentType,
        type: isDetailTab ? 'ALL' : wholeType === 'ALL' ? 'NUM' : wholeType,
      }),
    });
  };

  const handleTabChange = (tabKey) => {
    const value =
      tabKey === 'invoice' ||
      tabKey === 'payment' ||
      tabKey === 'prepayment' ||
      tabKey === 'demension';
    const val = objType[tabKey];
    if (value) {
      setIsDetailTab(value);
      fetchCount(value);
      setDetailType(val);
      cacheState.set('isDetailTab', value);
      cacheState.set('detailType', val);
      if (searchBarRef.current[val]) detailDsObj[val].query();
    } else {
      setIsDetailTab(false);
      setWholeType(val);
      cacheState.set('isDetailTab', false);
      cacheState.set('wholeType', val);
      if (searchBarRef.current[val]) wholeDsObj[val].query();
    }
  };

  const handleCreateChange = (value) => {
    switch (value) {
      case 'INVOICE':
        // 如果结算池没有配置可开票的权限集，就跳转全部tab
        if (createPermsMap.get(`srm.settle-account.settle-pool.supply.ps.radio.button.invoice`)) {
          history.push('/ssta/supply-settle-pool/list?type=C');
        } else {
          history.push('/ssta/supply-settle-pool');
        }
        break;
      case 'PAYMENT':
        // 如果结算池没有配置可付款的权限集，就跳转全部tab
        if (createPermsMap.get(`srm.settle-account.settle-pool.supply.ps.radio.button.payment`)) {
          history.push('/ssta/supply-settle-pool/list?type=D');
        } else {
          history.push('/ssta/supply-settle-pool');
        }
        break;
      case 'PAYMENT_INVOICE':
        history.push('/ssta/supply-settle/payment-invoice');
        break;
      case 'PRE_PAYMENT':
        history.push({
          pathname: '/ssta/supply-settle/pre-payment-create',
          search: queryString.stringify({
            source: 'create',
            documentType: 'PREPAYMENT',
          }),
        });
        break;
      default:
        history.push('/ssta/supply-settle-pool/list?type=C');
        break;
    }
  };

  /**
   * 确认
   */
  const handleConfirm = async () => {
    setLoading(true);
    const selectData = wholeDsObj[wholeType].selected.map((item) => item.toData());
    const documentTypeArr = [...new Set(selectData.map((item) => item.documentType))];
    // 预收款与其他结算单类型确认接口区分
    if (documentTypeArr.includes('PREPAYMENT') && documentTypeArr.length !== 1) {
      notification.warning({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: intl
          .get(`ssta.supplySettle.view.message.documentTypeDifferent`)
          .d('请勾选同一结算单类型单据进行批量操作'),
      });
      setLoading(false);
      return;
    }
    const validateOk = async () => {
      const res = getResponse(
        await confirmSupplySettle({
          body: selectData,
          isOnlyPre: documentTypeArr[0] === 'PREPAYMENT',
        })
      );
      setLoading(false);
      if (res) {
        notification.success();
        await wholeDsObj[wholeType].query();
        wholeDsObj[wholeType].clearCachedSelected();
        fetchCount();
      }
    };
    const results = await Promise.all(
      selectData
        .filter((item) => ['SUBMITED', 'WAIT_SUPPLIER_CONFIRM'].includes(item.settleStatus))
        .map((item) => confirmValidate({ body: item, role: 'supplier' }))
    );
    const err = results.find((item) => item && item.failed === true);
    const validateErr = results.find((item) => item && item.validatedCode === 'ERROR');
    const checkWarn = () => {
      const validateWarnIndex = results.findIndex(
        (item) => item && item.validatedCode === 'WARNING'
      );
      if (validateWarnIndex > -1) {
        Modal.confirm({
          children: results[validateWarnIndex].msg,
          autoCenter: true,
          onOk: () => {
            results.splice(validateWarnIndex, 1, {});
            checkWarn();
            setLoading(true);
          },
          onCancel: () => {
            results.splice(validateWarnIndex, 1);
            selectData.splice(validateWarnIndex, 1);
            checkWarn();
            setLoading(false);
          },
        });
      } else if (selectData.length > 0) {
        validateOk();
      }
    };
    if (err) {
      getResponse(err);
    } else if (validateErr) {
      notification.error({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: validateErr.msg,
      });
      setLoading(false);
    } else {
      checkWarn();
    }
  };

  // 在做取消回退相关操作之前先弹框确认
  const operateBeforeConfirm = (type) => {
    let bills = [];
    let billsType = [];
    wholeDsObj[wholeType].selected.map((item) => {
      const settleTypeMeaning = `${item.get('settleTypeMeaning')}${intl
        .get('ssta.purchaseSettle.view.message.bill')
        .d('结算单')}`;
      bills = [...bills, `${settleTypeMeaning}${item.get('settleNum')}`];
      billsType = [...billsType, `${settleTypeMeaning}`];
    });
    const info = {
      action: type,
      bills: bills.join(','),
      billType: Array.from(new Set(billsType)).join(','),
    };
    if (type === 'CANCEL') {
      confirmModal(info, handleCancel);
    } else if (type === 'APPROVE') {
      confirmModal(info, handleReturn);
    }
  };

  /**
   * 取消
   */
  const handleCancel = async () => {
    setLoading(true);
    wholeDsObj[wholeType].selected.forEach((item) => {
      // eslint-disable-next-line no-param-reassign
      item.status = 'update';
    });
    const validateSelect = await wholeDsObj[wholeType].validate(true);
    if (!validateSelect) {
      setLoading(false);
      return;
    }
    const selectData = wholeDsObj[wholeType].selected.map((item) => item.toData());
    const validateOk = async () => {
      cancelSupplySettle({ body: selectData }).then((res) => {
        setLoading(false);
        if (res) {
          if (res.failed) {
            notification.error({
              message: res.message,
            });
          } else {
            notification.success();
            wholeDsObj[wholeType].query();
            fetchCount();
            cancelAllSelected(wholeDsObj[wholeType]);
          }
        }
      });
    };
    // 首先检查数据
    let res;
    if (wholeType === 'CANCEL') {
      res = getResponse(
        await confirmSupplierCancel({
          body: selectData,
        })
      );
    } else {
      res = getResponse(
        await confirmSupplierDelete({
          body: selectData,
        })
      );
    }

    if (res) {
      if (res.failed) {
        getResponse(res);
      } else {
        const validatedCode = res.validatedCode;
        if (validatedCode === 'WARNING') {
          Modal.confirm({
            children: res.msg,
            autoCenter: true,
            onOk: () => {
              validateOk();
            },
            onCancel: () => {
              setLoading(false);
            },
          });
        } else if (validatedCode === 'ERROR') {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: res.msg,
          });
        } else {
          validateOk();
        }
      }
    } else {
      setLoading(false);
    }
  };

  /**
   * 退回
   */
  const handleReturn = () => {
    setLoading(true);
    const selectData = wholeDsObj[wholeType].selected.map((item) => item.toData());
    returnSupplySettle({ body: selectData }).then((res) => {
      setLoading(false);
      if (res) {
        if (res.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          notification.success();
          wholeDsObj[wholeType].query().then(() => {
            cancelAllSelected(wholeDsObj[wholeType]);
          });
          fetchCount();
        }
      }
    });
  };

  const headerBtns = () => {
    let allBtns = [];
    if (isDetailTab) {
      allBtns = useObserver(() => [
        createPermsMap.get(`srm.settle-account.jsd.supply.ps.export`) && {
          name: 'export',
          btnComp: ExcelExport,
          childFor: 'buttonText',
          child:
            detailDsObj[detailType].selected.length === 0
              ? intl.get(`ssta.common.button.export`).d('导出')
              : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
          btnProps: {
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
            },
            requestUrl: `/ssta/v1/${tenantId}/${detailUrlSuffix[detailType]}/supplier/export`,
            queryParams:
              detailDsObj[detailType].selected.length === 0 ? getQueryParams() : getSelectedKeys(),
          },
        },
        createPermsMap.get(`srm.settle-account.jsd.supply.ps.newexport`) && {
          name: 'newExport',
          btnComp: ExcelExportPro,
          childFor: 'buttonText',
          child:
            detailDsObj[detailType].selected.length === 0
              ? intl.get('ssta.common.button.newExport').d('(新)导出')
              : intl.get('ssta.common.button.newSelectedExport').d('(新)勾选导出'),
          btnProps: {
            methode: 'GET',
            templateCode: detailExportModelCode[detailType],
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
            },
            requestUrl: `/ssta/v1/${tenantId}/${detailUrlSuffix[detailType]}/supplier/export/new`,
            queryParams:
              detailDsObj[detailType].selected.length === 0 ? getQueryParams() : getSelectedKeys(),
          },
        },
      ]);
    } else {
      allBtns = useObserver(() => [
        wholeType === 'APPROVE' &&
          createPermsMap.get(`${btnPermPrefix}.button.confirm`) && {
            name: 'confirm',
            child: intl.get('hzero.common.button.confirm').d('确认'),
            btnProps: {
              icon: 'check',
              disabled: wholeDsObj[wholeType].selected.length === 0,
              onClick: handleConfirm,
              loading,
              wait: 1000,
            },
          },
        wholeType === 'APPROVE' &&
          createPermsMap.get(`${btnPermPrefix}.button.return`) && {
            name: 'return',
            child: intl.get('hzero.common.button.return').d('退回'),
            btnProps: {
              icon: 'reply',
              disabled: wholeDsObj[wholeType].selected.length === 0,
              onClick: () => operateBeforeConfirm('APPROVE'),
              loading,
              wait: 1000,
            },
          },
        createPermsMap.get(`${permPrefix}.update`) && {
          name: 'create',
          group: true,
          children: [
            createPermsMap.get(`${createPrefix}.invoice`) && {
              name: 'invoiceSettle',
              child: intl.get(`${prefix}.button.invoiceSettle`).d('开票结算单'),
              btnProps: {
                onClick: () => handleCreateChange('INVOICE'),
              },
            },
            createPermsMap.get(`${createPrefix}.payment`) && {
              name: 'payment-pool',
              child: intl
                .get(`${prefix}.button.createColBaseOnSettlePool`)
                .d('收款结算单-基于结算池'),
              btnProps: {
                onClick: () => handleCreateChange('PAYMENT'),
              },
            },
            createPermsMap.get(`${createPrefix}.paymentinvoice`) && {
              name: 'payment-inv',
              child: intl
                .get(`${prefix}.button.createColBaseOnInvoiceSettle`)
                .d('收款结算单-基于开票结算单'),
              btnProps: {
                onClick: () => handleCreateChange('PAYMENT_INVOICE'),
              },
            },
            createPermsMap.get(`${createPrefix}.prepayment`) && {
              name: 'prePayment',
              child: intl.get(`${prefix}.button.preCollectionSettle`).d('预收款结算单'),
              btnProps: {
                onClick: () => handleCreateChange('PRE_PAYMENT'),
              },
            },
          ],
          child: (
            <Button
              icon="add"
              type="c7n-pro"
              funcType={['ALL', 'UPDATE', 'CANCEL'].includes(wholeType) ? 'raised' : 'flat'}
              color={['ALL', 'UPDATE', 'CANCEL'].includes(wholeType) ? 'primary' : 'default'}
              loading={loading}
            >
              {intl.get('hzero.common.button.create').d('新建')}
              <Icon type="expand_more" />
            </Button>
          ),
        },
        createPermsMap.get(`srm.settle-account.jsd.supply.ps.export`) && {
          name: 'export',
          btnComp: ExcelExport,
          childFor: 'buttonText',
          child:
            wholeDsObj[wholeType].selected.length === 0
              ? intl.get(`ssta.common.button.export`).d('导出')
              : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
          btnProps: {
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
              loading,
            },
            requestUrl: `/ssta/v1/${tenantId}/settle-headers/supplier/excel-export/${wholeUrlSuffix[wholeType]}`,
            queryParams:
              wholeDsObj[wholeType].selected.length === 0 ? getQueryParams() : getSelectedKeys(),
          },
        },
        createPermsMap.get(`srm.settle-account.jsd.supply.ps.newexport`) && {
          name: 'newExport',
          btnComp: ExcelExportPro,
          childFor: 'buttonText',
          child:
            wholeDsObj[wholeType].selected.length === 0
              ? intl.get('ssta.common.button.newExport').d('(新)导出')
              : intl.get('ssta.common.button.newSelectedExport').d('(新)勾选导出'),
          btnProps: {
            methode: 'GET',
            templateCode: expotModelCode[wholeType],
            otherButtonProps: {
              type: 'c7n-pro',
              funcType: 'flat',
              icon: 'unarchive',
            },
            requestUrl: `/ssta/v1/${tenantId}/settle-headers/supplier/excel-export/${wholeUrlSuffix[wholeType]}`,
            queryParams:
              wholeDsObj[wholeType].selected.length === 0 ? getQueryParams() : getSelectedKeys(),
          },
        },
        {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnProps: {
            icon: 'print',
            disabled: wholeDsObj[wholeType].selected.length === 0,
            onClick: printHeader,
            loading,
            wait: 1000,
          },
        },
        (wholeType === 'CANCEL' || wholeType === 'UPDATE') && {
          name: 'cancel',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: {
            icon: 'cancel',
            // 当选中的数据有直连开票异常且直连开票类型为电商的时候，取消操作置灰
            disabled:
              wholeDsObj[wholeType].selected.length === 0 ||
              wholeDsObj[wholeType].selected.findIndex(
                (v) =>
                  v.get('settleStatus') === 'INVOICE_EXCEPTION' &&
                  v.get('directInvoicingType') === 'EC'
              ) > -1,
            onClick: () => operateBeforeConfirm('CANCEL'),
            loading,
            wait: 1000,
          },
        },
      ]);
    }
    return btnsFormat(allBtns);
  };

  const detailColumnsObj = {
    INVOICE: invoiceColumns,
    PAYMENT: payColumns,
    PREPAYMENT: preColumns,
    DEMENSION: demensionColumns,
  };

  const detailTableRender = (key) => (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      {customizeTable(
        {
          code: detailUnitCodes[key],
        },
        <SearchBarTable
          cacheState
          columns={detailColumnsObj[key]}
          dataSet={detailDsObj[key]}
          searchCode={filterDetailUnitBar[key]}
          searchBarRef={(ref) => {
            searchBarRef.current[key] = ref;
          }}
          searchBarConfig={{
            onQuery: ({ params }) => handleQuery(params, detailDsObj[key], key),
            onFieldChange: handleFieldChange,
            fieldProps: {
              companyId: { lovPara: { tenantId } },
              supplierCompanyId: { lovPara: { tenantId } },
              settleConfigNum: { lovPara: { tenantId } },
              sourceSupplierCompanyId: { lovPara: { tenantId } },
              currencyCode: { lovPara: { tenantId } },
              supplierSiteId: {
                dynamicProps: {
                  disabled: ({ record }) => !record.get('supplierCompanyId')?.supplierId,
                  lovPara: ({ record }) => ({
                    supplierId: record.get('supplierCompanyId')?.supplierId,
                    tenantId,
                  }),
                },
              },
              creationDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
                },
              },
            },
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="settleNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('ssta.supplySettle.model.supplySettle.settleNums')
                    .d('结算单编号')}
                />
              ),
            },
          }}
          // pagination={{ pageSizeOptions: ['20', '50', '100'] }}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );

  const wholeTableRender = (key) => (
    <div style={{ height: 'calc(100vh - 252px)' }}>
      {customizeTable(
        {
          code: tabUnitCodes[key],
        },
        <SearchBarTable
          cacheState
          searchCode={filterUnitBar[key]}
          columns={columns}
          dataSet={wholeDsObj[key]}
          searchBarRef={(ref) => {
            searchBarRef.current[key] = ref;
          }}
          searchBarConfig={{
            onQuery: ({ params }) => handleQuery(params, wholeDsObj[key], key),
            onFieldChange: handleFieldChange,
            fieldProps: {
              companyId: { lovPara: { tenantId } },
              supplierCompanyId: { lovPara: { tenantId } },
              settleConfigNum: { lovPara: { tenantId } },
              sourceSupplierCompanyId: { lovPara: { tenantId } },
              currencyCode: { lovPara: { tenantId } },
              supplierSiteId: {
                dynamicProps: {
                  disabled: ({ record }) => !record.get('supplierCompanyId')?.supplierId,
                  lovPara: ({ record }) => ({
                    supplierId: record.get('supplierCompanyId')?.supplierId,
                    tenantId,
                  }),
                },
              },
              creationDate: {
                defaultValue: ({ record }) => dateRangeTransform(record.get('dateRange'), true),
                dynamicProps: {
                  disabled: ({ record }) =>
                    record.get('dateRange') && record.get('dateRange') !== 'ALL TIME',
                },
              },
            },
            left: {
              render: (_, customizeDs) => (
                <MultiTextFilter
                  name="settleNums"
                  dataSet={customizeDs}
                  placeholder={intl
                    .get('ssta.supplySettle.modal.settleNum')
                    .d('请输入结算单编号查询')}
                />
              ),
            },
          }}
          // pagination={{ pageSizeOptions: ['20', '50', '100'] }}
          style={{ maxHeight: 'calc(100% - 22px)' }}
        />
      )}
    </div>
  );

  const subList = React.useMemo(() => {
    return [
      {
        key: 'UPDATE',
        parentKey: 'whole',
        hidden: !createPermsMap.get(`${permPrefix}.update`),
      },
      {
        key: 'APPROVE',
        parentKey: 'whole',
        hidden: !createPermsMap.get(`${permPrefix}.audit`),
      },
      {
        key: 'CANCEL',
        parentKey: 'whole',
        hidden: !createPermsMap.get(`${permPrefix}.cancel`),
      },
      {
        key: 'ALL',
        parentKey: 'whole',
      },
      {
        key: 'INVOICE',
        parentKey: 'detail',
        hidden: !createPermsMap.get(`${createPrefix}.invoice`),
      },
      {
        key: 'PAYMENT',
        parentKey: 'detail',
        hidden: !(
          createPermsMap.get(`${createPrefix}.payment`) ||
          createPermsMap.get(`${createPrefix}.paymentinvoice`)
        ),
      },
      {
        key: 'PREPAYMENT',
        parentKey: 'detail',
        hidden: !createPermsMap.get(`${createPrefix}.prepayment`),
      },
      {
        key: 'DEMENSION',
        parentKey: 'detail',
        hidden: !(
          createPermsMap.get(`${createPrefix}.payment`) ||
          createPermsMap.get(`${createPrefix}.paymentinvoice`)
        ),
      },
    ];
  }, [itemCount, wholeType, detailType, isDetailTab, createPermsMap]);

  const activeKeys = React.useMemo(() => {
    if (isDetailTab) {
      const { hidden } = subList.find((item) => item.key === detailType) || {};
      if (hidden) {
        const { key } =
          subList.filter((item) => item.parentKey === 'detail').find((item) => !item.hidden) || {};
        return objType[key];
      } else {
        return objType[detailType];
      }
    } else {
      const { hidden } = subList.find((item) => item.key === wholeType) || {};
      if (hidden) {
        const { key } =
          subList.filter((item) => item.parentKey === 'whole').find((item) => !item.hidden) || {};
        return objType[key];
      } else {
        return objType[wholeType];
      }
    }
  }, [isDetailTab, wholeType, detailType, subList]);

  return (
    <>
      <Header
        title={intl.get('ssta.supplySettle.view.message.title.supplySettle').d('销售方结算单')}
      >
        {customizeBtnGroup(
          {
            code: 'SSTA.SUPPLY_SETTLE_LIST.HEADER_BTNS',
            pro: true,
          },
          <DynamicButtons buttons={headerBtns()} />
        )}
      </Header>

      <Content className={Styles['ssta-list-content']}>
        {customizeTabPane(
          {
            code: 'SSTA.SUPPLY_SETTLE_LIST.TAB',
            cascade: true,
          },
          <Tabs keyboard={false} activeKey={activeKeys} onChange={handleTabChange}>
            <TabGroup tab={intl.get(`ssta.common.view.title.wholeTab`).d('整单')} key="whole">
              {createPermsMap.get(`${permPrefix}.update`) && (
                <TabPane
                  tab={intl.get(`${prefix}.button.maintainable`).d('可维护')}
                  key="update"
                  count={itemCount?.update}
                >
                  {wholeTableRender('UPDATE')}
                </TabPane>
              )}
              {createPermsMap.get(`${permPrefix}.audit`) && (
                <TabPane
                  tab={intl.get(`${prefix}.button.auditable`).d('可审核')}
                  key="approve"
                  count={itemCount?.approve}
                >
                  {wholeTableRender('APPROVE')}
                </TabPane>
              )}
              {createPermsMap.get(`${permPrefix}.cancel`) && (
                <TabPane
                  tab={intl.get(`${prefix}.button.cancelable`).d('可取消')}
                  key="cancel"
                  count={itemCount?.cancel}
                >
                  {wholeTableRender('CANCEL')}
                </TabPane>
              )}
              <TabPane
                tab={intl.get(`${prefix}.button.all`).d('全部')}
                key="all"
                count={itemCount?.all}
              >
                {wholeTableRender('ALL')}
              </TabPane>
            </TabGroup>
            <TabGroup tab={intl.get(`ssta.common.view.title.detailTab`).d('明细')} key="detail">
              {createPermsMap.get(`${createPrefix}.invoice`) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.invoiceSettleLine').d('开票结算单行')}
                  key="invoice"
                  count={itemCount?.invoice}
                >
                  {detailTableRender('INVOICE')}
                </TabPane>
              )}
              {(createPermsMap.get(`${createPrefix}.payment`) ||
                createPermsMap.get(`${createPrefix}.paymentinvoice`)) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.colSettleLine').d('收款结算单行')}
                  key="payment"
                  count={itemCount?.payment}
                >
                  {detailTableRender('PAYMENT')}
                </TabPane>
              )}
              {createPermsMap.get(`${createPrefix}.prepayment`) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.preColSettleLine').d('预收款结算单行')}
                  key="prepayment"
                  count={itemCount?.prePayment}
                >
                  {detailTableRender('PREPAYMENT')}
                </TabPane>
              )}
              {(createPermsMap.get(`${createPrefix}.payment`) ||
                createPermsMap.get(`${createPrefix}.paymentinvoice`)) && (
                <TabPane
                  tab={intl.get('ssta.common.view.title.dimensionColLine').d('多维度收款行')}
                  key="demension"
                  count={itemCount?.dimension}
                >
                  {detailTableRender('DEMENSION')}
                </TabPane>
              )}
            </TabGroup>
          </Tabs>
        )}
        {/* <DoubleTabs
          activeKeys={activeKeys}
          parentList={[
            {
              node: intl.get(`ssta.common.view.title.wholeTab`).d('整单'),
              key: 'whole',
            },
            {
              node: intl.get(`ssta.common.view.title.detailTab`).d('明细'),
              key: 'detail',
            },
          ]}
          subList={subList}
          onTabChange={handleTabChange}
        /> */}
      </Content>
    </>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.supplySettle',
      'ssta.supplySettlePool',
      'ssta.common',
      'hzero.c7nProUI',
      'hzero.c7nProU',
      'entity.attachment',
      'hwfp.common',
      'ssta.costSheet',
      'ssta.purchaseSettle',
      'ssta.directPoolSupply',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSTA.SUPPLY_SETTLE_LIST.GRID',
      'SSTA.SUPPLY_SETTLE_LIST.MAINTAIN_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.CHECK_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.CANCEL_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.SYNC_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.INVOICE_LINE_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.PAYMENT_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.PREPAYMENT_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.DEMENSION_GRID',
      'SSTA.SUPPLY_SETTLE_LIST.HEADER_BTNS',
      'SSTA.SUPPLY_SETTLE_LIST.TAB',
    ],
  }),
  withProps(
    () => {
      const cacheState = new Map();
      const wholeDsObj = {
        ALL: new DataSet(tableDs()),
        UPDATE: new DataSet(tableDs()),
        APPROVE: new DataSet(tableDs()),
        CANCEL: new DataSet(tableDs()),
        SYNC: new DataSet(tableDs()),
      };
      const detailDsObj = {
        INVOICE: new DataSet(invoiceDetailDs()),
        PAYMENT: new DataSet(payDetailDs()),
        PREPAYMENT: new DataSet(preDetailDs()),
        DEMENSION: new DataSet(demensionDetailDs()),
      };
      return {
        cacheState,
        wholeDsObj,
        detailDsObj,
      };
    },
    { cacheState: true }
  )
)(SettlePool);
