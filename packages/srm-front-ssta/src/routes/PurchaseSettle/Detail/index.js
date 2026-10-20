/* eslint-disable no-shadow */
/* eslint-disable react/jsx-closing-tag-location */
/* eslint-disable react/jsx-indent */
/* eslint-disable array-callback-return */
import React, { Fragment } from 'react';
import { Form, DataSet, Button, Modal, Attachment } from 'choerodon-ui/pro';
import { Tabs, Popover, Card, Icon, Spin } from 'choerodon-ui';
import queryString from 'querystring';
import { useObserver } from 'mobx-react';
import { compose, isArray, isNumber, debounce, isNil, isEmpty, remove } from 'lodash';
import remote from 'hzero-front/lib/utils/remote';
import intl from 'utils/intl';
import { math } from 'choerodon-ui/dataset';
import { decimalPointAccuracy } from '@/routes/utils';
// import { DEFAULT_DATETIME_FORMAT } from 'utils/constants';
import { DETAIL_CARD_CLASSNAME } from 'utils/constants';
import CommonImport from 'components/Import';
import { Header, Content } from 'components/Page';
import {
  filterNullValueObject,
  getCurrentOrganizationId,
  getResponse,
  getCurrentUser,
} from 'utils/utils';
import DocFlow from '_components/DocFlow';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import DynamicButtons from '_components/DynamicButtons';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import ExcelExport from 'components/ExcelExport';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { amountLocalRender, btnsFormat, getValidationResponse, recordsCommit } from '@/utils/utils';
import ExcelExportPro from 'hzero-front/lib/components/ExcelExportPro';
import {
  headerDS as headerDs,
  lineDS as lineDs,
  currencyDS as currencyDs,
  paymentInfoDS as paymentInfoDs,
} from '../../../stores/PurchaseSettleDS';
import { confirmModal } from '@/routes/Components/ConfirmModal';
import AddModal from './AddModal';
import {
  updatePurchaseSettle,
  updateWorkFlow,
  submitPurchaseSettle,
  cancelPurchaseSettle,
  confirmPurchaseSettle,
  returnPurchaseSettle,
  syncPurchaseSettle,
  getSettleHeaderDetail,
  invoiceAuto,
  paymentAuto,
  cancelPurchaseSettleLine,
  addPurchaseSettleLine,
  print,
  submitValidate,
  savePaymentInfo,
  toleranceAdjust,
  confirmValidate,
  workflowValidate,
  invoiceCheck,
  // taxSureValidate,
  syncPrintData,
  returnWorkflowValidate,
  confirmPurchaserDelete,
  confirmPurchaserCancel,
  getSettlelinesByIds,
  debounceSubmitValidate,
} from '@/services/settlePoolServices';
import {
  settleLineConfig,
  settleActionFlagger,
  taxInvoiceCheckFlagger,
} from '@/utils/amountConfig';
import TaxModal from './TaxModal';
import MultiDimensionModal from './MultiDimensionModal';
import PrepaymentModal from './PrepaymentModal';
import PaymentInfo from './PaymentInfo';
import FilledInfoModal from './FilledInfoModal';
import { FixedAnchor, FormItem, SettlementSheet, getPermissions } from '@/routes/Components';

import Styles from '@/routes/common.less';
import LineDetailDrawer from '@/routes/NewPurchaseSettle/components/LineDetailDrawer';

const organizationId = getCurrentOrganizationId();
const unitCodes = {
  PAYMENT: [
    'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_BASIC',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRADINGPARTY',
    'SSTA.PURCHASE_SETTLE_DETAIL.SUMMARY_INFORMATION',
    'SSTA.PURCHASE_SETTLE_DETAIL.BILL_INFO',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_INVOICE_MATCHING',
    'SSTA.PURCHASE_SETTLE_DETAIL.PRE_PAYMENT_REMOVE',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFORMATION',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_INFO',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL',
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_TOP',
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_BOTTOM',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CONFIRM',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_RETURN',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CANCEL',
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_ENCLOSURE',
    'SSTA.PURCHASE_SETTLE_DETAIL.OTHER_WORKFLOW',
  ].join(),
  INVOICE: [
    'SSTA.PURCHASE_SETTLE_DETAIL.BASIC',
    'SSTA.PURCHASE_SETTLE_DETAIL.TRADINGPARTY',
    'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL',
    'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_SUMMARY_INFORMATION',
    'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_BILL_INFO',
    'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_MATCHING',
    'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PRE_PAYMENT_REMOVE',
    'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PAYMENT_INFORMATION',
    'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_OTHER_INFO',
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.TOP',
    'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.BOTTOM',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_CONFIRM',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_RETURN',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_CANCEL',
    'SSTA.PURCHASE_SETTLE_DETAIL.INV_SYNC',
    'SSTA.PURCHASE_SETTLE_DETAIL.OTHER_WORKFLOW',
    'SSTA.PURCHASE_SETTLE_DETAIL.ENCLOSURE',
  ].join(),
};

const payInfoCodes = {
  PAYMENT: 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFO_BOX',
  INVOICE: 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_INFO_BOX',
};

const lineCodes = {
  PAYMENT:
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH',
  INVOICE:
    'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH',
};

const prefix = 'ssta.purchaseSettle';
const permPrefix = `srm.settle-account.jsd.purchase.ps.radio.button`;

const Detail = props => {
  const {
    location: { search, pathname, state },
    history,
    customizeForm,
    customizeTable,
    onLoad,
    custLoading,
    custConfig,
    customizeBtnGroup,
  } = props;
  // 开票结算单可编辑工作流路由
  const { id: approverId } = getCurrentUser();

  const isEditPub = pathname === '/pub/ssta/purchase-settle/detail-date';
  const isEditPubDetail = pathname === '/pub/ssta/purchase-settle/detail';
  const isExport = pathname === '/pub/ssta/purchase-settle/export-erp';
  const notPub = pathname.split('/')[1] !== 'pub';

  const editAbleRender = (record, name) => {
    const { preEditor } = settleLineConfig[name];
    const { documentType, updateFlag } = record.dataSet;
    return preEditor(record, documentType, updateFlag) && record.get('amountAdjustFlag') !== 1;
  };

  const {
    type = 'ALL',
    source = 'create',
    settleHeaderId,
    documentType,
    documentId,
    list: searchList = '[]',
    activityField = 'settleId',
    erpRead = 0,
    isReadOnly = 0,
  } = React.useMemo(() => {
    const {
      location: { search: copySearch },
    } = props;
    return queryString.parse(copySearch.substring(1));
  }, [search]);

  let numberFlag = true;

  const { TabPane } = Tabs;

  const [list, setList] = React.useState(JSON.parse(searchList));
  const [activeKey, setActiveKey] = React.useState(
    JSON.parse(searchList) && JSON.parse(searchList)[0] && JSON.parse(searchList)[0][activityField]
  );

  const [settleStatus, setSettleStatus] = React.useState('');

  const [permsMap, setPermsMap] = React.useState(new Map());

  const [paymentColor, setPaymentColor] = React.useState({});

  /**
   * 按钮loading
   */
  const [allBaseOnPriceLoading, setAllBaseOnPriceLoading] = React.useState(true);
  const headerDS = React.useMemo(
    () =>
      new DataSet({
        ...headerDs(),
        events: {
          update: ({ value, name }) => {
            if (name === 'paymentAmount') {
              paymentInfoDS.current.set('paymentAmount', value);
            }
          },
        },
      }),
    []
  );

  const currencyDS = React.useMemo(() => new DataSet(currencyDs()), []);

  const lineDS = React.useMemo(
    () =>
      new DataSet({
        ...lineDs(),
        events: {
          update: ({ record, name }) => handleUpdateLine(record, name),
        },
      }),
    []
  );

  const paymentInfoDS = React.useMemo(() => new DataSet(paymentInfoDs()), []);

  const paymentInfoCustConfig =
    documentType === 'PAYMENT'
      ? 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFO_BOX'
      : 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_INFO_BOX';

  // 修复必须打开弹窗才能拿到ds信息
  paymentInfoDS.custConfig = custConfig[paymentInfoCustConfig];

  const {
    enableCheckFlag,
    checkPointCode,
    invoiceMatchRuleCode,
    optPermissionList,
    amountAdjustFlag,
    // directInvoicingType,
  } = React.useMemo(() => {
    return (
      headerDS.current?.get([
        'enableCheckFlag',
        'checkPointCode',
        'invoiceMatchRuleCode',
        'optPermissionList',
        'amountAdjustFlag',
        // 'directInvoicingType',
      ]) || {}
    );
  }, [headerDS.current]);

  const optPermissionListObj = {};

  (optPermissionList || []).forEach(item => {
    const { permissionType, operationType } = item;
    (operationType || '').split(',').forEach(i => {
      optPermissionListObj[i] = permissionType;
    });
  });

  const {
    // 头-多维度付款
    HEAD_MULDIMENSION_PAYMENT: headMuldimensionPayment,
    // 头-预付款核销
    HEAD_PREPAYMENT_VERIFICATION: headPrePayment,
    // 头-付款
    HEAD_PAYMENT: headPayment,
    // 行-预付款核销
    LINE_PREPAYMENT_VERIFICATION: linePrePaymentVer,
    // 行-付款
    LINE_PAYMENT: linePayment,
  } = optPermissionListObj;

  const invoicePerm = (optPermissionList || []).find(item => item.documentType === 'INVOICE');

  const payAreaShow = !(
    documentType === 'INVOICE' &&
    invoicePerm?.permissionType === 'HIDE' &&
    invoicePerm?.operationType.split(',').length === 5
  );

  const [updateFlag, approveFlag, cancelFlag, syncFlag, readOnlyFlag] = [
    type === 'UPDATE',
    type === 'APPROVE',
    type === 'CANCEL',
    type === 'SYNC',
    ['ALL', 'NUM'].includes(type),
  ];

  const [updateBtn, approveBtn, cancelBtn, syncBtn] =
    type === 'NUM'
      ? settleActionFlagger(headerDS.current, 'purchaser', ['UPDATE', 'APPROVE', 'CANCEL', 'SYNC'])
      : [];

  const customizeUnitCode = unitCodes[documentType];

  const paymentInfoCode = payInfoCodes[documentType];

  // 修复必须打开弹窗才能拿到ds信息
  paymentInfoDS.custConfig = custConfig[paymentInfoCode];

  React.useEffect(() => {
    paymentInfoDS.reset();
    paymentInfoDS.create();
  }, [custLoading]);

  React.useEffect(() => {
    // 使用 onLoad 函.数注册 submit 回调函数
    if (onLoad && Number(isReadOnly) !== 1) {
      onLoad({
        submit: workFlowSubmit,
      });
    }
    fetchPermissions();
    setList(JSON.parse(searchList));
    const newActiveKey =
      JSON.parse(searchList) &&
      JSON.parse(searchList)[0] &&
      JSON.parse(searchList)[0][activityField];
    setActiveKey(newActiveKey);
    lineDS.updateFlag = updateFlag;
    lineDS.documentType = documentType;
    // 头查询需带上付款信息弹窗个性化，保存提交时不需要
    headerDS.setQueryParameter('customizeUnitCode', `${customizeUnitCode},${paymentInfoCode}`);
    if (source === 'detail') {
      headerDS.setQueryParameter('settleHeaderId', settleHeaderId);
      headerDS.documentType = documentType;
      headerDS
        .query()
        .then(res => {
          if (res) {
            if (
              // 功能审批和工作流审批自动查验
              taxInvoiceCheckFlagger({
                notPub,
                approveFlag,
                autoFlag: true,
                headerInfo: res,
              })
            ) {
              invoiceCheck(settleHeaderId, 'AUTO').then(res1 => {
                if (getResponse(res1)) {
                  newHandleLoadHeader(res1);
                  setAllBaseOnPriceLoading(false);
                }
              });
            }
            setSettleStatus(res.settleStatus);
            currencyDS.setQueryParameter('currencyCode', res.currencyCode);
            currencyDS.query();
            lineDS.companyId = res.companyId;
            lineDS.camp = res.camp;
            lineDS.companyId = res.companyId;
            lineDS.supplierCompanyId = res.supplierCompanyId;
            paymentInfoDS.loadData([res]);
          }
          setAllBaseOnPriceLoading(false);
        })
        .catch(() => {
          setAllBaseOnPriceLoading(false);
        });
    } else if (source === 'runDetail') {
      headerDS.setQueryParameter('settleHeaderId', documentId);
      lineDS.setQueryParameter('settleHeaderId', documentId);

      // eslint-disable-next-line
      headerDS
        .query()
        .then(res => {
          if (res) {
            setSettleStatus(res.settleStatus);
            currencyDS.setQueryParameter('currencyCode', res.currencyCode);
            currencyDS.query();
            lineDS.companyId = res.companyId;
            lineDS.supplierCompanyId = res.supplierCompanyId;
            paymentInfoDS.loadData([res]);
          }
          setAllBaseOnPriceLoading(false);
        })
        .catch(() => {
          setAllBaseOnPriceLoading(false);
        });
    } else {
      headerDS.documentType = documentType;
      headerDS.setQueryParameter('settleHeaderId', newActiveKey);
      headerDS
        .query()
        .then(res => {
          if (res) {
            setSettleStatus(res.settleStatus);
            currencyDS.setQueryParameter('currencyCode', res.currencyCode);
            currencyDS.query();
            lineDS.companyId = res.companyId;
            lineDS.supplierCompanyId = res.supplierCompanyId;
            paymentInfoDS.loadData([res]);
          }
          setAllBaseOnPriceLoading(false);
        })
        .catch(() => {
          setAllBaseOnPriceLoading(false);
        });
      lineDS.setQueryParameter('settleHeaderId', newActiveKey);
      lineDS.query();
    }
  }, [search]);

  /**
   * 手动查询权限集
   */
  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${permPrefix}.update`,
        `${permPrefix}.audit`,
        `${permPrefix}.cancel`,
        `${permPrefix}.sync`,
        `srm.settle-account.jsd.purchase.ps.lineimport`,
        `srm.settle-account.jsd.purchase.ps.lineexport`,
        `srm.settle-account.jsd.purchase.ps.newlineimport`,
        `srm.settle-account.jsd.purchase.ps.newlineexport`,
      ])
    );
    if (res) {
      setPermsMap(res);
    }
  };

  // 价格字段高亮显示
  const priceShiledRenderAndHighLight = (record, value, name) => {
    // 判断应用页面
    const fieldName =
      record.get('settleBasePrice') === 'NET_PRICE' ? 'netPrice' : 'taxIncludedPrice';
    if (
      !updateFlag &&
      settleStatus !== 'NEW' &&
      settleStatus !== 'RETURN' &&
      settleStatus !== 'INVOICE_EXCEPTION' &&
      settleStatus !== 'INVOICE_FAILED' &&
      name === fieldName &&
      record.get('priceLightFlag') === 1
    ) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${record.get(
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
    // 判断应用页面
    if (
      !updateFlag &&
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
            {record.get('taxRate') ? record.get('taxRate') : '0'}
          </span>
        </Popover>
      );
    } else {
      return record.get('taxRate') ? record.get('taxRate') : '0';
    }
  };

  // 税额高亮显示
  const rateAmountShiledRenderAndHighLight = (record, value) => {
    // 判断应用页面
    if (
      !updateFlag &&
      settleStatus !== 'NEW' &&
      settleStatus !== 'RETURN' &&
      settleStatus !== 'INVOICE_EXCEPTION' &&
      settleStatus !== 'INVOICE_FAILED' &&
      record.get('taxAmountLightFlag') === 1
    ) {
      return (
        <Popover
          content={`${intl.get('ssta.common.view.message.beforeUpdate').d('更改前')}:${record.get(
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

  const columns = React.useMemo(() => {
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
        width: 180,
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
      {
        name: 'quantity',
        width: 150,
        editor: settleStatus === 'INVOICE_EXCEPTION' ? false : editAbleRender,
        // renderer: ({ value, record }) => {
        //   if (['UPDATE'].includes(type)) {
        //     return decimalPointAccuracy(value, record.get('uomPrecision'));
        //   }
        //   return value;
        // },
      },
      {
        width: 150,
        name: 'netPrice',
        editor: editAbleRender,
        renderer: ({ record, value, name }) => {
          return priceShiledRenderAndHighLight(record, value, name);
        },
      },
      {
        width: 100,
        name: 'unitPriceBatch',
        renderer: amountLocalRender,
      },
      {
        width: 150,
        name: 'netAmount',
        editor: editAbleRender,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
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
        renderer: ({ record, value, name }) => {
          return rateAmountShiledRenderAndHighLight(record, value, name);
        },
      },
      {
        width: 150,
        name: 'taxIncludedPrice',
        editor: editAbleRender,
        renderer: ({ record, value, name }) => {
          return priceShiledRenderAndHighLight(record, value, name);
        },
      },
      {
        width: 150,
        name: 'taxIncludedAmount',
        editor: editAbleRender,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
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
        renderer: amountLocalRender,
      },
      {
        width: 150,
        name: 'enableAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        width: 150,
        name: 'invOrganizationName',
      },
      linePayment !== 'HIDE' && {
        width: 150,
        name: 'paymentAmount',
        editor: record => {
          // 开票的时候均可编辑
          if (documentType === 'INVOICE' && updateFlag && linePayment === 'EDIT') {
            return true;
          }
          // 付款的时候，当部分匹配-付款为Y时，可以修改
          if (
            documentType === 'PAYMENT' &&
            record.get('paymentPartMatch') === 1 &&
            updateFlag &&
            linePayment === 'EDIT'
          ) {
            return true;
          }
        },
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      linePrePaymentVer !== 'HIDE' && {
        width: 150,
        name: 'applyAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      (linePayment !== 'HIDE' || linePrePaymentVer !== 'HIDE') && {
        width: 150,
        name: 'invoicedAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      (linePayment !== 'HIDE' || linePrePaymentVer !== 'HIDE') && {
        width: 150,
        name: 'paidAmount',
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      (linePayment !== 'HIDE' || linePrePaymentVer !== 'HIDE') && {
        name: 'remainingPaymentAmount',
        width: 150,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'adjustNetAmount',
        width: 150,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'adjustTaxAmount',
        width: 150,
        renderer: ({ value, record }) => {
          return decimalPointAccuracy(value, record?.get('amountPrecision'), {
            repair: true,
            check: true,
          });
        },
      },
      {
        name: 'prePaymentWriteOff',
        header: intl.get(`${prefix}.button.prePaymentWriteOff`).d('预付款核销'),
        width: 150,
        renderer: ({ record }) =>
          (documentType === 'INVOICE' &&
            record.get('taxIncludedAmount') > 0 &&
            linePrePaymentVer !== 'HIDE') ||
          (documentType === 'PAYMENT' &&
            record.get('invoicedAmount') > 0 &&
            linePrePaymentVer !== 'HIDE') ? (
            <a onClick={() => handleLinePrepayment(record)}>
              {updateFlag && linePrePaymentVer === 'EDIT'
                ? intl.get(`${prefix}.button.prePaymentWriteOff`).d('预付款核销')
                : intl.get(`${prefix}.button.prePayWriteOffRecord`).d('预付款核销记录')}
            </a>
          ) : null,
      },
      {
        name: 'operation',
        header: intl.get('hzero.common.button.action').d('操作'),
        width: 120,
        renderer: ({ record }) => (
          <a onClick={() => handleViewDetail(record)}>
            {intl.get('hzero.common.button.viewDetail').d('查看详情')}
          </a>
        ),
      },
      {
        header: intl.get('hzero.common.button.docFlow').d('单据流'),
        name: 'docFlow',
        width: 100,
        renderer: ({ record }) => (
          <DocFlow tableName="ssta_settle_line" tablePk={record.get('settleLineId')} />
        ),
      },
    ];
    if (documentType === 'PAYMENT') {
      defaultCloumns.splice(5, 14, {
        width: 180,
        name: 'sourceSettleHeaderNum',
      });
      remove(defaultCloumns, item => ['adjustNetAmount', 'adjustTaxAmount'].includes(item.name));
    }
    return defaultCloumns;
  }, [search, headerDS.current]);

  // 工作流的提交方法
  const workFlowSubmit = param => {
    return new Promise(async (resolve, reject) => {
      if (param === 'Approved') {
        const { workProcessInfo: { processCode } = {} } = props;
        const headerFlag = await headerDS.validate();
        if (!headerFlag) return reject();
        if (!headerDS.current) return reject();
        const headerData = headerDS.current.toData();
        const lineData = lineDS.toJSONData();
        // const { enableAfterInvoiceCheckFlag } = headerData;
        const validateOk = async () => {
          const res =
            pathname === '/pub/ssta/purchase-settle/export-erp'
              ? await updateWorkFlow({
                  ...headerData,
                  workflowFlag: 1,
                  approverId,
                  settleLineList: lineData,
                  customizeUnitCode,
                })
              : await updatePurchaseSettle({
                  ...headerData,
                  workflowFlag: 1,
                  settleLineList: lineData,
                  customizeUnitCode,
                });
          return getResponse(res) ? resolve() : reject();
        };
        const validateAmount = async () => {
          const valiRes = getResponse(
            await workflowValidate({ ...headerData, settleLineList: lineData })
          );
          if (!valiRes) return reject();
          const { validatedCode, msg } = valiRes || {};
          if (validatedCode === 'WARNING') {
            Modal.confirm({
              children: msg,
              autoCenter: true,
              onOk: validateOk,
              onCancel: () => reject(),
            });
          } else if (validatedCode === 'ERROR') {
            notification.error({
              message: intl.get('hzero.common.notification.error').d('操作失败'),
              description: msg,
            });
            return reject();
          } else {
            return validateOk();
          }
        };
        if (processCode !== 'SSTA.SETTLE_HEADER_CANCEL') {
          return validateAmount();
          // taxSureValidate(settleHeaderId).then((res) => {
          //   if (getResponse(res)) {
          //     validateAmount();
          //   } else {
          //     reject();
          //   }
          // });
        } else {
          return validateOk();
        }
      } else {
        if (!headerDS.current) return reject();
        const headerData = headerDS.current.toData();
        const lineData = lineDS.toJSONData();
        const res = await returnWorkflowValidate({ ...headerData, ...lineData });
        if (!res) return;
        if (res.validatedCode === 'WARNING') {
          Modal.confirm({
            children: res.msg,
            autoCenter: true,
            onOk: () => resolve(),
            onCancel: () => reject(),
          });
        } else if (res.validatedCode === 'ERROR') {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: res.msg,
          });
          return reject();
        } else {
          return resolve();
        }
      }
    });
  };

  const handleLinePrepayment = record => {
    handlePrepayment(true, record);
  };

  const handleViewDetail = record => {
    const lineType = documentType === 'INVOICE' ? 'C' : 'D';
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      title: intl.get('hzero.common.button.viewDetails').d('查看详情'),
      className: Styles['ssta-detailDrawer-modal'],
      children: <LineDetailDrawer record={record} notUx type={lineType} history={history} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  };

  const toLastDetailPage = React.useCallback(key => {
    updateTab({
      key: getActiveTabKey(),
      search: queryString.stringify({
        source: 'detail',
        settleHeaderId,
        documentType,
        type: key,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
    history.push({
      pathname: '/ssta/purchase-settle/detail',
      search: queryString.stringify({
        source: 'detail',
        settleHeaderId,
        documentType,
        type: key,
      }),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  });

  /**
   * 头行一起保存
   */

  const handleSave = async () => {
    const headerFlag = await headerDS.validate();
    const lineFlag = await lineDS.validate();
    if (!headerFlag || !lineFlag) {
      return;
    }
    setAllBaseOnPriceLoading(true);
    const headerData = headerDS.toData();
    const lineData = lineDS.toJSONData();

    const res = getResponse(
      await updatePurchaseSettle({
        ...headerData[0],
        settleLineList: lineData,
        customizeUnitCode,
      })
    );
    setAllBaseOnPriceLoading(false);
    if (res) {
      notification.success();
      headerDS.query().then(resData => {
        paymentInfoDS.loadData([resData]);
        setAllBaseOnPriceLoading(false);
      });
      if (!isEmpty(lineData)) {
        const refreshedLines = getResponse(
          await getSettlelinesByIds({
            settleLineIdList: lineData.map(item => item.settleLineId),
            customizeUnitCode: lineCodes[documentType],
          })
        );
        if (refreshedLines) {
          recordsCommit(refreshedLines, lineDS, 'settleLineId');
        }
      }
    }
  };

  // 拆单后操作不跳回列表页
  const afterSplitAction = () => {
    notification.success();
    if (isArray(list) && list.length > 1) {
      setAllBaseOnPriceLoading(true);
      const filterList = list.filter(item => item[activityField] !== activeKey);
      updateTab({
        key: getActiveTabKey(),
        search: queryString.stringify({
          source,
          type,
          documentType,
          list: JSON.stringify(filterList),
          activityField,
        }),
      });
      history.replace({
        pathname: '/ssta/purchase-settle/detail',
        search: queryString.stringify({
          source,
          type,
          documentType,
          list: JSON.stringify(filterList),
          activityField,
        }),
      });
    } else {
      // history.push('/ssta/purchase-settle');
      history.push({
        pathname: '/ssta/purchase-settle/list',
        state: { _back: 1 },
      });
    }
  };

  const submitValidateFun = async () => {
    const headerData = headerDS.toData();
    const lineData = lineDS.toJSONData();

    const valiRes = getResponse(
      await submitValidate({
        body: { ...headerData[0], settleLineList: lineData },
        role: 'purchaser',
      })
    );
    setAllBaseOnPriceLoading(false);
    const validateOk = async () => {
      setAllBaseOnPriceLoading(true);
      const res = getResponse(
        await submitPurchaseSettle({
          ...headerData[0],
          settleLineList: lineData,
          customizeUnitCode,
        })
      );
      setAllBaseOnPriceLoading(false);
      if (res) {
        afterSplitAction();
      }
    };
    const { validatedCode, msg } = valiRes || {};
    if (validatedCode === 'WARNING') {
      Modal.confirm({
        children: msg,
        autoCenter: true,
        onOk: async () => {
          await validateOk();
          Modal.destroyAll();
        },
      });
      setAllBaseOnPriceLoading(false);
    } else if (validatedCode === 'ERROR') {
      notification.error({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: msg,
      });
      setAllBaseOnPriceLoading(false);
    } else if (valiRes) {
      await validateOk();
      setAllBaseOnPriceLoading(false);
    }
  };

  /**
   * 提交
   */

  const handleSubmit = async () => {
    const headerFlag = await headerDS.validate();
    const lineFlag = await lineDS.validate();
    const paymentInfoFlag = await paymentInfoDS.validate();
    if (!headerFlag || !lineFlag) {
      return;
    }
    if (!paymentInfoFlag) {
      setPaymentColor({ color: 'red' });
      const errElement = document.getElementById('errColor');
      if (errElement) {
        errElement.scrollIntoView(true);
      }
      getResponse({
        failed: true,
        type: 'warn',
        message: intl.get(`ssta.purchaseSettle.validation.notNull.paymentInfo`).d('付款信息未维护'),
      });
      return;
    } else {
      setPaymentColor({});
    }

    const headerData = headerDS?.toData() ? headerDS.toData()[0] : {};
    const lineData = lineDS.toData();
    const { settleType } = headerData;
    setAllBaseOnPriceLoading(true);
    const validateLineRes = getResponse(
      await debounceSubmitValidate({ ...headerData, settleLineList: lineData })
    );
    if (!validateLineRes) return;
    const { settleLines = [] } = validateLineRes;
    if (!isNil(settleLines) && !isEmpty(settleLines)) {
      const newSettleNum = [];
      settleLines.map(item => {
        newSettleNum.push(item.lineNum);
      });
      const deleteLineIds = settleLines.map(item => item.settleLineId);
      const deleteRecords = lineDS.filter(record =>
        deleteLineIds.includes(record.get('settleLineId'))
      );
      Modal.confirm({
        children:
          settleType === 'INVOICE_PAYMENT' ? (
            <div>
              <p>
                {`${intl
                  .get('ssta.purchaseSettle.debounceSubmitValidate.message')
                  .d('结算单存在发票申请金额为0且付款申请金额为0的行【') + newSettleNum.join()}】`}
              </p>
              <p>
                {intl
                  .get('ssta.purchaseSettle.debounceSubmitValidate.paymentMessageLine')
                  .d('是否删除行？')}
              </p>
            </div>
          ) : (
            <div>
              <p>
                {`${intl
                  .get('ssta.purchaseSettle.debounceSubmitValidate.paymentMessage')
                  .d('结算单存在付款申请金额为0的行【') + newSettleNum.join()}】`}
              </p>
              <p>
                {intl
                  .get('ssta.purchaseSettle.debounceSubmitValidate.paymentMessageLine')
                  .d('是否删除行？')}
              </p>
            </div>
          ),
        autoCenter: true,
        okText: intl.get('hzero.common.status.yes').d('是'),
        cancelText: intl.get('hzero.common.status.no').d('否'),
        onOk: async () => {
          const cancelRes = await cancelPurchaseSettleLine(settleLines);
          if (!cancelRes) {
            setAllBaseOnPriceLoading(false);
            return;
          }
          lineDS.remove(deleteRecords, true);
          const param = {
            settleHeaderId:
              source === 'create'
                ? activeKey
                : source === 'runDetail'
                ? documentId
                : settleHeaderId,
            documentType,
          };
          const res = getResponse(await getSettleHeaderDetail(param));
          if (res) {
            headerDS.current.set({
              paymentAmount: res.paymentAmount,
              netAmount: res.netAmount,
              taxAmount: res.taxAmount,
              taxIncludedAmount: res.taxIncludedAmount,
              objectVersionNumber: res.objectVersionNumber,
              invoiceDifferenceAmount: res.invoiceDifferenceAmount,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
            paymentInfoDS.current.set({
              objectVersionNumber: res.objectVersionNumber,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
            submitValidateFun();
          }
        },
        onCancel: () => {
          setAllBaseOnPriceLoading(false);
        },
      });
    } else {
      submitValidateFun();
    }
  };

  // 在做取消回退相关操作之前先弹框确认
  const operateBeforeConfirm = actionType => {
    if (actionType === 'CANCELDETAIL') {
      let bills = [];
      lineDS.selected.forEach(item => {
        bills = [...bills, item.get('settleNum')];
      });
      const info = {
        action: actionType,
        bills: bills.join(','),
        billType: '',
      };
      confirmModal(info, handleCancelLine);
    } else {
      const settleTypeMeaning = `${headerDS.current?.get('settleTypeMeaning')}${intl
        .get('ssta.purchaseSettle.view.message.bill')
        .d('结算单')}`;
      const info = {
        action: actionType,
        bills: `${settleTypeMeaning}${headerDS.current?.get('settleNum')}`,
        billType: settleTypeMeaning,
      };
      if (actionType === 'CANCEL') {
        confirmModal(info, handleCancelLoading);
      }
    }
  };
  /**
   * 取消
   */
  const handleCancelLoading = filledData => {
    setAllBaseOnPriceLoading(true);
    const handleCancel = async () => {
      const headerData = type === 'CANCEL' ? filledData : headerDS.current.toData();
      const validateOk = async () => {
        const res = getResponse(
          await cancelPurchaseSettle({
            body: [headerData],
            customizeUnitCode,
          })
        );
        setAllBaseOnPriceLoading(false);
        if (res) {
          afterSplitAction();
        }
      };
      let result;
      if (type === 'CANCEL') {
        result = getResponse(
          await confirmPurchaserCancel({
            body: [headerData],
          })
        );
      } else {
        result = getResponse(
          await confirmPurchaserDelete({
            body: [headerData],
          })
        );
      }
      if (result) {
        if (result.failed) {
          getResponse(result);
        } else {
          const { validatedCode } = result;
          if (validatedCode === 'WARNING') {
            Modal.confirm({
              children: result.msg,
              autoCenter: true,
              onOk: () => {
                validateOk();
              },
              onCancel: () => {
                setAllBaseOnPriceLoading(false);
              },
            });
          } else if (validatedCode === 'ERROR') {
            notification.error({
              message: intl.get('hzero.common.notification.error').d('操作失败'),
              description: result.msg,
            });
          } else {
            validateOk();
          }
        }
      } else {
        setAllBaseOnPriceLoading(false);
      }
    };
    handleCancel();
  };
  /**
   * 退回
   */
  const handleReturnLoading = headerData => {
    setAllBaseOnPriceLoading(true);
    const handleReturn = async () => {
      const res = getResponse(
        await returnPurchaseSettle({
          body: [headerData],
          customizeUnitCode,
        })
      );
      setAllBaseOnPriceLoading(false);
      if (res) {
        notification.success();
        // history.push('/ssta/purchase-settle');
        history.push({
          pathname: '/ssta/purchase-settle/list',
          state: { _back: 1 },
        });
      }
    };
    handleReturn();
  };
  /**
   * 确认
   */
  const handleConfirm = async headerData => {
    const lineData = lineDS.toJSONData();
    const validateOk = async () => {
      setAllBaseOnPriceLoading(true);
      const res = getResponse(
        await confirmPurchaseSettle({
          body: [headerData],
          customizeUnitCode,
        })
      );
      setAllBaseOnPriceLoading(false);
      if (res) {
        notification.success();
        // history.push('/ssta/purchase-settle');
        history.push({
          pathname: '/ssta/purchase-settle/list',
          state: { _back: 1 },
        });
      }
    };
    if (!['SUBMITED', 'WAIT_SUPPLIER_CONFIRM'].includes(headerDS.current.get('settleStatus'))) {
      return validateOk();
    }
    setAllBaseOnPriceLoading(true);
    const valiRes = getResponse(
      await confirmValidate({
        body: { ...headerData, settleLineList: lineData },
        role: 'purchaser',
      })
    );
    setAllBaseOnPriceLoading(false);
    const { validatedCode, msg } = valiRes || {};
    if (validatedCode === 'WARNING') {
      Modal.confirm({
        children: msg,
        autoCenter: true,
        onOk: validateOk,
      });
    } else if (validatedCode === 'ERROR') {
      notification.error({
        message: intl.get('hzero.common.notification.error').d('操作失败'),
        description: msg,
      });
    } else if (valiRes) {
      return validateOk();
    }
  };
  // 发票查验
  const handleTaxCheck = async () => {
    // setPubLoading(true);
    setAllBaseOnPriceLoading(true);
    const res = getResponse(await invoiceCheck(settleHeaderId, 'MANUAL'));
    if (getResponse(!res)) {
      setAllBaseOnPriceLoading(false);
      return;
    }
    if (getResponse(res)) {
      if (JSON.stringify(res.errorMessageMap) === '{}') {
        notification.success();
        // setPubLoading(false);
        setAllBaseOnPriceLoading(false);
        newHandleLoadHeaderInvoiceCheck(res);
      } else {
        const { errorMessageMap } = res || {};
        const errorMsg = [];
        // eslint-disable-next-line
        for (const i in errorMessageMap) {
          errorMsg.push(errorMessageMap[i].desc);
        }
        notification.error({
          message: errorMsg.join(''),
        });
        // setPubLoading(false);
        setAllBaseOnPriceLoading(false);
        newHandleLoadHeaderInvoiceCheck(res);
      }
      setAllBaseOnPriceLoading(false);
    }
  };

  /**
   * 同步
   */
  const handleSyncLoading = filledData => {
    setAllBaseOnPriceLoading(true);
    const handleSync = async () => {
      const headerData = documentType === 'INVOICE' ? filledData : headerDS.current.toData();
      const res = getResponse(await syncPurchaseSettle([headerData], customizeUnitCode));
      setAllBaseOnPriceLoading(false);
      if (!res) return;
      getValidationResponse(res, onlyRefresh => {
        if (onlyRefresh) {
          headerDS.query();
          return;
        }
        notification.success();
        history.push({
          pathname: '/ssta/purchase-settle/list',
          state: { _back: 1 },
        });
      });
    };
    handleSync();
  };
  const handleCancelLine = () => {
    setAllBaseOnPriceLoading(true);
    const selectedData = lineDS.selected.map(item => item.toData());
    cancelPurchaseSettleLine(selectedData)
      .then(async res => {
        setAllBaseOnPriceLoading(false);
        if (res) {
          if (res.failed) {
            notification.error({
              message: res.message,
            });
          } else {
            notification.success();
            await lineDS.query();
            lineDS.clearCachedSelected();
            const param = {
              settleHeaderId:
                source === 'create'
                  ? activeKey
                  : source === 'runDetail'
                  ? documentId
                  : settleHeaderId,
              documentType,
            };
            const res = getResponse(await getSettleHeaderDetail(param));
            if (res) {
              headerDS.current.set({
                paymentAmount: res.paymentAmount,
                netAmount: res.netAmount,
                taxAmount: res.taxAmount,
                taxIncludedAmount: res.taxIncludedAmount,
                objectVersionNumber: res.objectVersionNumber,
                invoiceDifferenceAmount: res.invoiceDifferenceAmount,
                ...Object.fromEntries(
                  (res.customizeRefreshFields || []).map(item => [item, res[item]])
                ),
              });
              paymentInfoDS.current.set({
                objectVersionNumber: res.objectVersionNumber,
                ...Object.fromEntries(
                  (res.customizeRefreshFields || []).map(item => [item, res[item]])
                ),
              });
            }
          }
        }
      })
      .catch(err => {
        notification.error({
          message: err.message,
        });
      });
  };
  /**
   * 行导出接口
   */
  const requestUrl = () => {
    const tempKey = source === 'detail' ? settleHeaderId : activeKey;
    return `/ssta/v1/${organizationId}/settle-lines/purchaser/${documentType.toLowerCase()}/export/${tempKey}?customizeUnitCode=${
      lineCodes[documentType]
    }`;
  };
  /**
   * 行导出接口-新版
   */
  const requestNewUrl = () => {
    const customizeUnitCode =
      'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH';
    const customizeUnitCodePayment =
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH';
    return documentType === 'INVOICE'
      ? `/ssta/v1/${organizationId}/settle-lines/purchaser/invoice/export/new/${
          source === 'detail' ? settleHeaderId : activeKey
        }?customizeUnitCode=${customizeUnitCode}&`
      : `/ssta/v1/${organizationId}/settle-lines/purchaser/payment/export/new/${
          source === 'detail' ? settleHeaderId : activeKey
        }?customizeUnitCode=${customizeUnitCodePayment}`;
  };
  /**
   * 导出参数
   */

  const getExportParams = () => {
    const settleLineIdList = lineDS.selected.map(item => item.get('settleLineId'));
    const queryData = lineDS.queryDataSet.current?.toData() || {};
    if (lineDS.selected.length > 0) {
      return filterNullValueObject({ settleLineIdList });
    } else {
      return filterNullValueObject(queryData);
    }
  };

  /**
   * EXCEL导入
   */
  const handleRoleImport = () => {
    history.push({
      pathname:
        documentType === 'PAYMENT'
          ? `/ssta/purchase-settle/data-import/SSTA.PAYMENT_LINE_BATCH_UPDATE`
          : `/ssta/purchase-settle/data-import/SSTA.INVOICE_LINE_BATCH_UPDATE`,
      search: queryString.stringify({
        backPath: `/ssta/purchase-settle/detail${location.search}`,
        action: intl.get('ssta.common.button.batchUpdate').d('批量编辑'),
        historyButton: false,
        args: JSON.stringify({
          camp: headerDS.current.get('camp'),
          templateCode: 'SSTA.INVOICE_LINE_BATCH_UPDATE',
          settleHeaderId: headerDS.current.get('settleHeaderId'),
        }),
      }),
    });
  };
  const handleAdd = () => {
    const headerData = headerDS.toData();
    Modal.open({
      drawer: true,
      title: intl.get(`${prefix}.view.title.add`).d('新增'),
      key: Modal.key(),
      className: Styles['ssta-large-modal'],
      children: (
        <AddModal addLine={handleAddLine} headerData={headerData[0]} documentType={documentType} />
      ),
      footer: null,
    });
  };

  const handleAddLine = (data, onCancel) => {
    return new Promise(async resolve => {
      const addRes = await addPurchaseSettleLine({
        data,
        settleHeaderId:
          source === 'create' ? activeKey : source === 'runDetail' ? documentId : settleHeaderId,
        documentType,
      });
      resolve();
      if (getResponse(addRes)) {
        onCancel();
        notification.success();
        const param = {
          settleHeaderId:
            source === 'create' ? activeKey : source === 'runDetail' ? documentId : settleHeaderId,
          documentType,
        };
        const res = getResponse(await getSettleHeaderDetail(param));
        if (getResponse(res)) {
          headerDS.current.set({
            paymentAmount: res.paymentAmount,
            settleConfigId: res.settleConfigId,
            settleConfigNum: res.settleConfigNum,
            settleConfigName: res.settleConfigName,
            configVersionNumber: res.configVersionNumber,
            confirmCollaborativeMode: res.confirmCollaborativeMode,
            cancelCollaborativeMode: res.cancelCollaborativeMode,
            confirmApproveMethod: res.confirmApproveMethod,
            cancelApproveMethod: res.cancelApproveMethod,
            invoiceToleranceRange: res.invoiceToleranceRange,
            defaultPaymentDimension: res.defaultPaymentDimension,
            defaultPaymentSpliteRule: res.defaultPaymentSpliteRule,
            defaultPrepaymentSpliteRule: res.defaultPrepaymentSpliteRule,
            enableLineLimitFlag: res.enableLineLimitFlag,
            lineLimitQuantity: res.lineLimitQuantity,
            supplierViewFlag: res.supplierViewFlag,
            netAmount: res.netAmount,
            taxIncludedAmount: res.taxIncludedAmount,
            taxAmount: res.taxAmount,
            amountValidateLevel: res.amountValidateLevel,
            amountValidateAction: res.amountValidateAction,
            taxAmountTol: res.taxAmountTol,
            objectVersionNumber: res.objectVersionNumber,
            ...Object.fromEntries(
              (res.customizeRefreshFields || []).map(item => [item, res[item]])
            ),
            invoiceDifferenceAmount: res.invoiceDifferenceAmount,
          });
          paymentInfoDS.current.set({
            objectVersionNumber: res.objectVersionNumber,
            ...Object.fromEntries(
              (res.customizeRefreshFields || []).map(item => [item, res[item]])
            ),
          });
        }
        lineDS.query();
      }
    });
  };

  const handleUpdateLine = (record, name) => {
    const {
      taxRateLov = {},
      settleMatchDimension,
      settleBasePrice,
      invoicePartMatchFlag,
      priceUpdFlag,
      taxRateUpdFlag,
      taxAmountUpdFlag,
    } = record.toData();

    const get = field => record.get(field);

    const set = (field, value) => record.set(field, value);

    const amountPer = currencyDS.current && Number(currencyDS.current.get('amount'));

    const pricePer = currencyDS.current && Number(currencyDS.current.get('price'));

    if (name === 'taxRateLov') {
      set('taxCode', taxRateLov && taxRateLov.taxCode);
    }

    if (name === 'paymentAmount' && numberFlag) {
      set('paymentAmount', math.toFixed(get('paymentAmount'), amountPer));
    }
    if (name === 'paymentAmount') {
      numberFlag = true;
    }

    if (name === 'quantity') {
      set('quantity', decimalPointAccuracy(get('quantity'), get('uomPrecision')));
    }

    /** m
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
         * FIXME: 数量 && 不含税单价调整联动
         */
        if (name === 'quantity' || name === 'netPrice') {
          if (name === 'netPrice') {
            set('netPrice', math.toFixed(get('netPrice'), pricePer));
          }
          /**
           * 本次开票不含税金额
           */
          if (invoicePartMatchFlag === 1 || priceUpdFlag === 1) {
            set(
              'netAmount',
              math.toFixed(
                math.div(
                  math.multipliedBy(get('netPrice'), get('quantity')),
                  get('unitPriceBatch')
                ),
                amountPer
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
            taxAmountUpdFlag === 0
          ) {
            set(
              'taxAmount',
              math.toFixed(
                math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)),
                amountPer
              )
            );
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
              math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPer)
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
                pricePer
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
        /**
         * FIXME: 税率调整联动
         */
        if (name === 'taxRateLov') {
          /**
           * 税额
           */
          if (priceUpdFlag === 1 || invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
            set(
              'taxAmount',
              math.toFixed(
                math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)),
                amountPer
              )
            );
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
              math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPer)
            );
          }
          /**
           * 含税单价
           */
          if (priceUpdFlag === 1) {
            const num = math.multipliedBy(
              math.div(get('taxIncludedAmount'), get('quantity')),
              get('unitPriceBatch')
            );
            set('taxIncludedPrice', math.toFixed(num, pricePer));
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
          set('taxAmount', math.toFixed(get('taxAmount'), amountPer));
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
              math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPer)
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
                pricePer
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
         * FIXME: 数量 && 不含税单价调整联动
         */
        if (name === 'quantity' || name === 'taxIncludedPrice') {
          if (name === 'taxIncludedPrice') {
            set(
              'taxIncludedPrice',
              math.toFixed(get('taxIncludedPrice'), pricePer) || get('taxIncludedAmount')
            );
          }
          /**
           * 本次开票含税金额
           */
          if (priceUpdFlag === 1 || invoicePartMatchFlag === 1) {
            set(
              'taxIncludedAmount',
              math.toFixed(
                math.div(
                  math.multipliedBy(get('taxIncludedPrice'), get('quantity')),
                  get('unitPriceBatch')
                ),
                amountPer
              )
            );
          }
          /**
           * 税额
           */
          if (priceUpdFlag === 1 || invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
            set(
              'taxAmount',
              math.toFixed(
                math.div(
                  math.multipliedBy(get('taxIncludedAmount'), get('taxRate')),
                  math.plus(100, get('taxRate'))
                ),
                amountPer
              )
            );
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
              math.toFixed(math.minus(get('taxIncludedAmount'), get('taxAmount')), amountPer)
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
                pricePer
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
        /**
         * FIXME: 税率调整联动
         */
        if (name === 'taxRateLov') {
          /**
           * 税额
           */
          if (priceUpdFlag === 1 || invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
            set(
              'taxAmount',
              math.toFixed(
                math.div(
                  math.multipliedBy(get('taxIncludedAmount'), get('taxRate')),
                  math.plus(100, get('taxRate'))
                ),
                amountPer
              )
            );
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
              math.toFixed(math.minus(get('taxIncludedAmount'), get('taxAmount')), amountPer)
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
                amountPer
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
        /**
         * FIXME: 税额调整联动
         */
        if (name === 'taxAmount') {
          set('taxAmount', math.toFixed(get('taxAmount'), amountPer));
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
              math.toFixed(math.minus(get('taxIncludedAmount'), get('taxAmount')), amountPer)
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
                pricePer
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
            set('netAmount', math.toFixed(get('netAmount'), amountPer));
          }
          /**
           * 税额
           */
          if (invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
            set(
              'taxAmount',
              math.toFixed(
                math.multipliedBy(get('netAmount'), math.div(get('taxRate'), 100)),
                amountPer
              )
            );
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
              math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPer)
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
          set('taxAmount', math.toFixed(get('taxAmount'), amountPer));
          /**
           * 含税金额
           */
          if (
            (invoicePartMatchFlag === 0 && (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
            invoicePartMatchFlag === 1
          ) {
            set(
              'taxIncludedAmount',
              math.toFixed(math.plus(get('netAmount'), get('taxAmount')), amountPer)
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
            set('taxIncludedAmount', math.toFixed(get('taxIncludedAmount'), amountPer));
          }
          /**
           * 税额
           */
          if (invoicePartMatchFlag === 1 || taxRateUpdFlag === 1) {
            set(
              'taxAmount',
              math.toFixed(
                math.div(
                  math.multipliedBy(get('taxIncludedAmount'), get('taxRate')),
                  math.plus(100, get('taxRate'))
                ),
                amountPer
              )
            );
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
              math.toFixed(math.minus(get('taxIncludedAmount'), get('taxAmount')), amountPer)
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
          set('taxAmount', math.toFixed(get('taxAmount'), amountPer));

          /**
           * 不含税金额
           */
          if (
            (invoicePartMatchFlag === 0 && (taxRateUpdFlag === 1 || taxAmountUpdFlag === 1)) ||
            invoicePartMatchFlag === 1
          ) {
            set(
              'netAmount',
              math.toFixed(math.minus(get('taxIncludedAmount'), get('taxAmount')), amountPer)
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
  };

  const handleTabChange = activeKey => {
    setActiveKey(activeKey);
    headerDS.setQueryParameter('settleHeaderId', activeKey);
    lineDS.setQueryParameter('settleHeaderId', activeKey);
    headerDS.query().then(res => {
      paymentInfoDS.loadData([res]);
    });
    lineDS.query();
  };

  const handleUpdatePre = (
    topRecord,
    applyAmountTotal,
    paymentAmount,
    settleLineObjectVersionNumber,
    isLine,
    deductionTotalAmount,
    calculatePaymentAmount
  ) => {
    topRecord.set('applyAmount', applyAmountTotal);
    if (deductionTotalAmount && !isLine) {
      const amountPer = topRecord?.get('amountPrecision');
      const totalAmount = topRecord.get('paymentAmount');
      topRecord.set(
        'paymentAmount',
        math.toFixed(math.minus(totalAmount, deductionTotalAmount), Number(amountPer))
      );
    } else if (calculatePaymentAmount !== null && calculatePaymentAmount !== undefined) {
      topRecord.set('paymentAmount', calculatePaymentAmount);
    }
    if (isLine) {
      numberFlag = false;
      if (settleLineObjectVersionNumber) {
        topRecord.set('objectVersionNumber', settleLineObjectVersionNumber);
      }
      if (deductionTotalAmount) {
        const amountPer = topRecord?.get('amountPrecision');
        topRecord.set(
          'paymentAmount',
          math.toFixed(math.minus(paymentAmount, deductionTotalAmount), Number(amountPer))
        );
      } else if (calculatePaymentAmount !== null && calculatePaymentAmount !== undefined) {
        topRecord.set('paymentAmount', calculatePaymentAmount);
      } else if (paymentAmount) {
        topRecord.set('paymentAmount', paymentAmount);
      }
    }
  };

  const handleUpdateMultiDimension = async () => {
    const param = {
      settleHeaderId:
        source === 'create' ? activeKey : source === 'runDetail' ? documentId : settleHeaderId,
      documentType,
    };
    const res = getResponse(await getSettleHeaderDetail(param));
    if (res) {
      headerDS.current.set({
        paymentDimension: res.paymentDimension,
        paymentSpliteRule: res.paymentSpliteRule,
        paymentAmount: res.paymentAmount,
        objectVersionNumber: res.objectVersionNumber,
        applyAmount: res.applyAmount,
        ...Object.fromEntries((res.customizeRefreshFields || []).map(item => [item, res[item]])),
      });
      paymentInfoDS.current.set({
        objectVersionNumber: res.objectVersionNumber,
        ...Object.fromEntries((res.customizeRefreshFields || []).map(item => [item, res[item]])),
      });
      lineDS.query();
    }
  };

  const handleTax = async () => {
    const { history, remote: remoteProps } = props;
    const isOpenFlag = remoteProps
      ? await remoteProps.process('SSTA.PURCHASESETTLE_DETAIL_OLD_CUX.TAXINVOICE_MODAL', true, {
          settleHeaderDs: headerDS,
          settleLineDs: lineDS,
        })
      : true;
    if (!isOpenFlag) return;
    Modal.open({
      // mask: invoiceMatchRuleCode === 'OFFLINE_INVOICE' && updateFlag,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      // closable: true,
      className: Styles['ssta-large-modal'],
      title: intl.get(`${prefix}.view.title.taxInvoice`).d('税务发票'),
      children: (
        <TaxModal
          headerDS={headerDS}
          updateFlag={updateFlag}
          approveFlag={approveFlag}
          readOnlyFlag={readOnlyFlag}
          amountPer={currencyDS.current?.get('amount')}
          history={history}
          isEditPub={isEditPub}
          notPub={notPub}
          settleStatus={settleStatus}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: invoiceMatchRuleCode === 'OFFLINE_INVOICE' && updateFlag ? null : okBtn => okBtn,
    });
  };

  const newHandleLoadHeaderInvoiceCheck = res => {
    headerDS.current.set({
      checkStatus: res.checkStatus,
      checkDate: res.checkDate,
      sumCheckTimes: res.sumCheckTimes,
      checkTimes: res.checkTimes,
      objectVersionNumber: res.objectVersionNumber,
    });
    paymentInfoDS.current.set({
      objectVersionNumber: res.objectVersionNumber,
    });
  };

  const newHandleLoadHeader = res => {
    headerDS.loadData([
      {
        ...headerDS.current.toData(),
        objectVersionNumber: res.objectVersionNumber,
        invoiceNetAmount: res.invoiceNetAmount,
        invoiceTaxAmount: res.invoiceTaxAmount,
        invoiceTaxIncludedAmount: res.invoiceTaxIncludedAmount,
        invoiceDifferenceAmount: res.invoiceDifferenceAmount,
      },
    ]);
    paymentInfoDS.loadData([
      {
        ...paymentInfoDS.current.toData(),
        objectVersionNumber: res.objectVersionNumber,
      },
    ]);
  };

  const handlePrepayment = (isLine, record) => {
    const isModalEdit = updateFlag && (isLine ? linePrePaymentVer : headPrePayment) === 'EDIT';
    Modal.open({
      // mask: isModalEdit,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-modal'],
      title: isModalEdit
        ? intl.get(`${prefix}.view.title.prePaymentWriteOff`).d('预付款核销')
        : intl.get(`${prefix}.view.title.prePayWriteOffRecord`).d('预付款核销记录'),
      children: (
        <PrepaymentModal
          settleHeaderId={
            source === 'detail' ? settleHeaderId : source === 'runDetail' ? documentId : activeKey
          }
          isLine={isLine}
          isModalEdit={isModalEdit}
          headerCurrent={headerDS.current}
          topRecord={isLine ? record : headerDS.current}
          onUpdatePre={handleUpdatePre}
          amountPer={currencyDS.current?.get('amount')}
          headerDS={headerDS}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: isModalEdit ? null : okBtn => okBtn,
    });
  };

  const handleMultiDimension = () => {
    Modal.open({
      // mask: updateFlag,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-large-modal'],
      title: updateFlag
        ? intl.get(`${prefix}.view.title.multiPayment`).d('多维度付款')
        : intl.get(`${prefix}.view.title.multiPaymentInfo`).d('多维度付款信息'),
      children: (
        <MultiDimensionModal
          settleHeaderId={
            source === 'detail' ? settleHeaderId : source === 'runDetail' ? documentId : activeKey
          }
          updateFlag={updateFlag}
          headerDS={headerDS}
          headerCurrent={headerDS.current}
          onUpdateMultiDimension={handleUpdateMultiDimension}
          amountPer={currencyDS.current?.get('amount')}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: updateFlag ? null : okBtn => okBtn,
    });
  };

  const handlePaymentInfo = () => {
    Modal.open({
      // mask: updateFlag,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-small-modal'],
      title: updateFlag
        ? intl.get(`${prefix}.view.title.paymentInfoEdit`).d('付款信息编辑')
        : intl.get(`${prefix}.view.title.paymentInfo`).d('付款信息'),
      children: (
        <PaymentInfo
          loadPaymentInfo={handleLoadPaymentInfo}
          updateFlag={updateFlag}
          paymentInfoDS={paymentInfoDS}
          customizeForm={customizeForm}
          editFlag={editFlag}
        />
      ),
      okText: intl.get('hzero.common.button.close').d('关闭'),
      footer: updateFlag ? null : okBtn => okBtn,
    });
  };

  const handleFilledInfo = (action, onOk) => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-small-modal'],
      title: approveFlag
        ? intl.get(`${prefix}.view.title.approveInfo`).d('审核信息')
        : cancelFlag
        ? intl.get(`${prefix}.view.title.cancelInfo`).d('取消信息')
        : syncFlag && intl.get(`${prefix}.view.title.syncInfo`).d('同步信息'),
      children: (
        <FilledInfoModal
          onOk={onOk}
          action={action}
          headerDS={headerDS}
          custConfig={custConfig}
          documentType={documentType}
          customizeForm={customizeForm}
        />
      ),
    });
  };

  /**
   * 将付款信息字段load到header上
   */
  const handleLoadPaymentInfo = async onCancel => {
    const paymentInfoFlag = await paymentInfoDS.validate();
    if (paymentInfoFlag) {
      setPaymentColor({});
      const res = getResponse(
        await savePaymentInfo(paymentInfoDS.current.toData(), paymentInfoCode)
      );
      if (res) {
        headerDS.current.set({
          bankId: res.bankId,
          bankName: res.bankName,
          bankBranchName: res.bankBranchName,
          bankAccountNum: res.bankAccountNum,
          bankAccountName: res.bankAccountName,
          paymentTypeId: res.paymentTypeId,
          paymentTypeName: res.paymentTypeName,
          paymentTermId: res.paymentTermId,
          paymentTermName: res.paymentTermName,
          paymentDiscountAmount: res.paymentDiscountAmount,
          expectPaymentDate: res.expectPaymentDate,
          objectVersionNumber: res.objectVersionNumber,
        });
        paymentInfoDS.loadData([res]);
        onCancel();
      }
    }
  };

  const buttons = useObserver(() => [
    settleStatus !== 'INVOICE_EXCEPTION' && updateFlag && (
      <Button color="primary" icon="playlist_add" onClick={handleAdd}>
        {intl.get('hzero.common.button.add').d('新增')}
      </Button>
    ),
    updateFlag && (permsMap.get(`srm.settle-account.jsd.purchase.ps.lineimport`) || !notPub) && (
      <Button icon="archive" onClick={handleRoleImport}>
        {intl.get('ssta.common.button.batchUpdate').d('批量编辑')}
      </Button>
    ),
    (permsMap.get(`srm.settle-account.jsd.purchase.ps.lineexport`) || !notPub) && (
      <ExcelExport
        buttonText={
          lineDS.selected.length > 0
            ? intl.get('ssta.common.button.LineTickExport').d('行勾选导出')
            : intl.get('ssta.common.button.LineExport').d('行导出')
        }
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
        requestUrl={requestUrl()}
        queryParams={getExportParams}
        method="POST"
      />
    ),
    updateFlag && (permsMap.get(`srm.settle-account.jsd.purchase.ps.newlineimport`) || !notPub) && (
      <CommonImport
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
        successCallBack={async () => {
          lineDS.query();
          const settleHeaderId = headerDS.current.get('settleHeaderId');
          const res = getResponse(await getSettleHeaderDetail({ settleHeaderId, documentType }));
          if (res) {
            headerDS.current.set({
              paymentAmount: res.paymentAmount,
              settleConfigId: res.settleConfigId,
              settleConfigNum: res.settleConfigNum,
              settleConfigName: res.settleConfigName,
              configVersionNumber: res.configVersionNumber,
              confirmCollaborativeMode: res.confirmCollaborativeMode,
              cancelCollaborativeMode: res.cancelCollaborativeMode,
              confirmApproveMethod: res.confirmApproveMethod,
              cancelApproveMethod: res.cancelApproveMethod,
              invoiceToleranceRange: res.invoiceToleranceRange,
              defaultPaymentDimension: res.defaultPaymentDimension,
              defaultPaymentSpliteRule: res.defaultPaymentSpliteRule,
              defaultPrepaymentSpliteRule: res.defaultPrepaymentSpliteRule,
              enableLineLimitFlag: res.enableLineLimitFlag,
              lineLimitQuantity: res.lineLimitQuantity,
              supplierViewFlag: res.supplierViewFlag,
              netAmount: res.netAmount,
              taxIncludedAmount: res.taxIncludedAmount,
              taxAmount: res.taxAmount,
              amountValidateLevel: res.amountValidateLevel,
              amountValidateAction: res.amountValidateAction,
              taxAmountTol: res.taxAmountTol,
              objectVersionNumber: res.objectVersionNumber,
              invoiceDifferenceAmount: res.invoiceDifferenceAmount,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
            paymentInfoDS.current.set({
              objectVersionNumber: res.objectVersionNumber,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
          }
        }}
        args={{
          camp: headerDS.current?.get('camp'),
          templateCode:
            documentType === 'PAYMENT'
              ? 'SSTA.PAYMENT_LINE_BATCH_UPDATE'
              : 'SSTA.INVOICE_LINE_BATCH_UPDATE',
          settleHeaderId: headerDS.current?.get('settleHeaderId'),
        }}
      />
    ),
    (permsMap.get(`srm.settle-account.jsd.purchase.ps.newlineexport`) || !notPub) && (
      <ExcelExportPro
        templateCode={
          documentType === 'INVOICE'
            ? 'SSTA_SETTLE_HEADER_DETAIL_INVOICE_PURCHASER_EXPORT'
            : 'SSTA_SETTLE_HEADER_DETAIL_PAYMENT_PURCHASER_EXPORT'
        }
        method="POST"
        allBody
        requestUrl={requestNewUrl()}
        queryParams={getExportParams}
        buttonText={
          lineDS.selected.length > 0
            ? intl.get('ssta.common.button.LineTickExport1').d('(新)行勾选导出')
            : intl.get('ssta.common.button.LineExport1').d('(新)行导出')
        }
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
      />
    ),

    settleStatus !== 'INVOICE_EXCEPTION' && updateFlag && (
      <Button
        icon="delete"
        color="primary"
        onClick={() => {
          operateBeforeConfirm('CANCELDETAIL');
        }}
        disabled={lineDS.selected.length === 0}
      >
        {intl.get('hzero.common.button.delete').d('删除')}
      </Button>
    ),
  ]);

  /**
   * 发票自动匹配
   */
  const handleInvoiceAutoLoading = () => {
    setAllBaseOnPriceLoading(true);
    const handleInvoiceAuto = async () => {
      const headerData = headerDS.toData();
      const lineData = lineDS.toJSONData();
      const res = getResponse(
        await invoiceAuto({
          ...headerData[0],
          settleLineList: lineData,
        })
      );
      setAllBaseOnPriceLoading(false);
      if (res) {
        if (res.failed) {
          notification.error({
            message: res.message,
          });
        } else {
          notification.success();
          const param = {
            settleHeaderId:
              source === 'create'
                ? activeKey
                : source === 'runDetail'
                ? documentId
                : settleHeaderId,
            documentType,
          };
          const res = getResponse(await getSettleHeaderDetail(param));
          if (res) {
            headerDS.current.set({
              netAmount: res.netAmount,
              taxAmount: res.taxAmount,
              taxIncludedAmount: res.taxIncludedAmount,
              invoiceSpliteRule: res.invoiceSpliteRule,
              objectVersionNumber: res.objectVersionNumber,
              invoiceDifferenceAmount: res.invoiceDifferenceAmount,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
            paymentInfoDS.current.set({
              objectVersionNumber: res.objectVersionNumber,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
          }
          lineDS.query();
        }
      }
      setAllBaseOnPriceLoading(false);
    };
    handleInvoiceAuto();
  };
  /**
   * 尾差调整
   */
  const handleToleranceAdjustLoading = () => {
    setAllBaseOnPriceLoading(true);
    const handleToleranceAdjust = async () => {
      const headerData = headerDS.current.toData();
      const lineData = lineDS.toJSONData();
      setAllBaseOnPriceLoading(true);
      const res = getResponse(
        await toleranceAdjust({
          ...headerData,
          settleLineList: lineData,
        })
      );
      setAllBaseOnPriceLoading(false);
      if (res) {
        notification.success();
        const param = {
          settleHeaderId:
            source === 'create' ? activeKey : source === 'runDetail' ? documentId : settleHeaderId,
          documentType,
        };
        const res = getResponse(await getSettleHeaderDetail(param));
        if (res) {
          headerDS.current.set({
            netAmount: res.netAmount,
            taxAmount: res.taxAmount,
            taxIncludedAmount: res.taxIncludedAmount,
            objectVersionNumber: res.objectVersionNumber,
            invoiceDifferenceAmount: res.invoiceDifferenceAmount,
            ...Object.fromEntries(
              (res.customizeRefreshFields || []).map(item => [item, res[item]])
            ),
          });
          paymentInfoDS.current.set({
            objectVersionNumber: res.objectVersionNumber,
            ...Object.fromEntries(
              (res.customizeRefreshFields || []).map(item => [item, res[item]])
            ),
          });
        }
        lineDS.query();
      }
    };
    handleToleranceAdjust();
  };
  const handlePaymentAuto = value => {
    if (!['AMOUNT', 'MULTI_AMOUNT'].includes(value)) {
      return;
    }
    setAllBaseOnPriceLoading(true);
    const headerData = headerDS.toData();
    const lineData = lineDS.toJSONData();
    paymentAuto({
      ...headerData[0],
      settleLineList: lineData,
      isMulti: value !== 'AMOUNT',
    })
      .then(async res => {
        setAllBaseOnPriceLoading(false);
        if (res) {
          if (res.failed) {
            notification.error({
              message: res.message,
            });
          } else {
            notification.success();
            const param = {
              settleHeaderId:
                source === 'create'
                  ? activeKey
                  : source === 'runDetail'
                  ? documentId
                  : settleHeaderId,
              documentType,
            };
            const res = getResponse(await getSettleHeaderDetail(param));
            headerDS.current.set({
              applyAmount: res.applyAmount,
              paymentAmount: res.paymentAmount,
              paymentSpliteRule: res.paymentSpliteRule,
              objectVersionNumber: res.objectVersionNumber,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
            paymentInfoDS.current.set({
              objectVersionNumber: res.objectVersionNumber,
              ...Object.fromEntries(
                (res.customizeRefreshFields || []).map(item => [item, res[item]])
              ),
            });
            lineDS.query();
          }
        }
      })
      .catch(err => {
        setAllBaseOnPriceLoading(false);
        notification.error({
          message: err.message,
        });
      });
  };
  /**
   * 操作记录、审批记录
   */
  const handleRecord = () => {
    const recordModal = Modal.open({
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      drawer: true,
      destroyOnClose: true,
      className: Styles['ssta-medium-modal'],
      children: (
        <SettlementSheet
          settleHeaderId={
            source === 'detail' ? settleHeaderId : source === 'runDetail' ? documentId : activeKey
          }
        />
      ),
      footer: () => (
        <div className="footerContainer">
          <div className="close">
            <Button onClick={() => recordModal.close()} color="primary">
              {intl.get('hzero.common.button.close').d('关闭')}
            </Button>
          </div>
          {/* <div className="flowSheet">
            <Icon type="branch" />
            {intl.get('ssta.costSheet.model.costSheet.flowSheet').d('流程图')}
          </div> */}
        </div>
      ),
    });
  };
  const handlePrint = () => {
    const headerData = headerDS.toData();
    const selectData = [headerData[0]];
    print({ settleHeaderId: headerDS.current.get('settleHeaderId') }).then(res => {
      if (res) {
        const reader = new FileReader();
        reader.onload = () => {
          const content = reader.result;
          try {
            const failedInfo = JSON.parse(content);
            notification.error({
              description: failedInfo.message,
            });
          } catch (e) {
            const file = new Blob([res], { type: 'application/pdf' });
            const fileURL = URL.createObjectURL(file);
            window.open(fileURL);
            syncPrintData(selectData).then(res1 => {
              if (getResponse(res1)) {
                headerDS.current.set('objectVersionNumber', res1[0].objectVersionNumber);
              }
            });
          }
        };
        reader.readAsText(res);
      }
    });
  };

  /**
   *
   * 导航栏
   *
   */
  const linkListRender = () => {
    return [
      {
        key: 'PurchaseSettle-header',
        title: intl.get(`${prefix}.message.panel.baseInfos`).d('基本信息'),
      },
      {
        key: 'PurchaseSettle-transactionParty',
        title: intl.get(`${prefix}.message.panel.transactionParty`).d('交易方信息'),
      },
      {
        key: 'PurchaseSettle-transactionAmount',
        title: intl.get(`${prefix}.message.panel.transactionAmount`).d('交易金额信息'),
      },
      {
        key: 'PurchaseSettle-transactionDetails',
        title: intl.get(`${prefix}.message.panel.transactionDetails`).d('交易明细信息'),
      },
      {
        key: 'PurchaseSettle-mainStrategyInfo',
        title: intl.get(`${prefix}.message.panel.mainStrategyInfo`).d('主策略信息'),
      },
      {
        key: 'PurchaseSettle-otherInfo',
        title: intl.get(`${prefix}.message.panel.otherInfo`).d('其他信息'),
      },
      {
        key: 'PurchaseSettle-attachment',
        title: intl.get(`${prefix}.message.panel.attachment`).d('附件'),
      },
    ];
  };

  /**
   *  个性化查看编辑状态
   * @readOnly
   * editFlag
   */
  const editFlag = !updateFlag && source === 'detail';
  const ecEditFlag = updateFlag && headerDS.current?.toData().directInvoicingType === 'EC';

  const titleObj = {
    ALL: intl.get(`${prefix}.view.title.settleView`).d('结算单查看'),
    UPDATE:
      source === 'create'
        ? intl.get(`${prefix}.view.title.createUpdate`).d('新建结算单')
        : intl.get(`${prefix}.view.title.settleUpdate`).d('编辑结算单'),
    APPROVE: intl.get(`${prefix}.view.title.settleApprove`).d('结算单审核'),
    CANCEL: intl.get(`${prefix}.view.title.settleCancel`).d('结算单取消'),
    SYNC: intl.get(`${prefix}.view.title.settleSync`).d('结算单同步'),
    NUM: intl.get(`${prefix}.view.title.settleDetail`).d('结算单详情'),
  };

  const detailTabPaneRender = settleHeaderId => {
    return (
      <Spin spinning={allBaseOnPriceLoading}>
        <Content>
          <h3 className="ssta-form-title" id="PurchaseSettle-header">
            {intl.get(`${prefix}.view.title.basicInfo`).d('基本信息')}
          </h3>
          {customizeForm(
            {
              code:
                documentType === 'INVOICE'
                  ? 'SSTA.PURCHASE_SETTLE_DETAIL.BASIC'
                  : 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_BASIC',
              readOnly: readOnlyFlag,
            },
            <Form
              dataSet={headerDS}
              useColon={false}
              columns={3}
              labelLayout={!editFlag ? 'float' : 'vertical'}
            >
              <FormItem name="settleNum" disabled={!editFlag} />
              <FormItem name="settleTypeMeaning" disabled={!editFlag} />
              <FormItem name="campMeaning" disabled={!editFlag} />
              <FormItem name="settleStatus" disabled={!editFlag} />
              <FormItem name="creationDate" disabled={!editFlag} />
              <FormItem name="createdUserName" disabled={!editFlag} />
            </Form>
          )}
        </Content>
        <Content>
          <h3 className="ssta-form-title" id="PurchaseSettle-transactionParty">
            {intl.get(`${prefix}.view.title.transactionParty`).d('交易方信息')}
          </h3>
          {customizeForm(
            {
              code:
                documentType === 'INVOICE'
                  ? 'SSTA.PURCHASE_SETTLE_DETAIL.TRADINGPARTY'
                  : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRADINGPARTY',
              readOnly: readOnlyFlag,
            },
            <Form
              dataSet={headerDS}
              useColon={false}
              columns={3}
              labelLayout={!editFlag ? 'float' : 'vertical'}
            >
              <FormItem name="companyNum" disabled={!editFlag} />
              <FormItem name="companyName" disabled={!editFlag} />
              <FormItem name="currencyCode" disabled={!editFlag} />
              <FormItem name="supplierCompanyNum" disabled={!editFlag} />
              <FormItem name="supplierCompanyName" disabled={!editFlag} />
              <FormItem name="sourceSupplierCompanyName" disabled={!editFlag} />
              <FormItem name="sourceSupplierCompanyNum" disabled={!editFlag} />
              <FormItem name="ouName" disabled={!editFlag} />
              <FormItem name="supplierSiteCode" disabled={!editFlag} />
              <FormItem name="unitName" disabled={!editFlag} />
            </Form>
          )}
        </Content>

        <Content>
          <h3 className="ssta-form-title" id="PurchaseSettle-transactionAmount">
            {intl.get(`${prefix}.view.title.transactionAmount`).d('交易金额信息')}
          </h3>
          <Card
            id="transactionAmount"
            className={DETAIL_CARD_CLASSNAME}
            bordered={false}
            title={intl.get(`${prefix}.view.title.summaryInfo`).d('汇总信息')}
          >
            {customizeForm(
              {
                code:
                  documentType === 'INVOICE'
                    ? 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_SUMMARY_INFORMATION'
                    : 'SSTA.PURCHASE_SETTLE_DETAIL.SUMMARY_INFORMATION',
                readOnly: readOnlyFlag,
                __force_record_to_update__: true,
              },
              <Form
                dataSet={headerDS}
                columns={3}
                useColon={false}
                labelLayout={!editFlag ? 'float' : 'vertical'}
              >
                <FormItem
                  name="settleNetAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="settleTaxAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="settleTaxIncludedAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="invoicedNetAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="invoicedTaxAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="invoicedTaxIncludedAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="paidAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
                <FormItem
                  name="remainingPaymentAmount"
                  disabled={!editFlag}
                  renderer={({ value, record }) => {
                    return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                      repair: true,
                      check: true,
                    });
                  }}
                />
              </Form>
            )}
          </Card>

          {documentType === 'INVOICE' && (
            <Fragment>
              <Card
                id="systemInvoiceInfo"
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                title={intl.get(`${prefix}.view.title.systemInvoiceInfo`).d('开票信息（系统）')}
              >
                {customizeForm(
                  {
                    code:
                      documentType === 'INVOICE'
                        ? 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_BILL_INFO'
                        : 'SSTA.PURCHASE_SETTLE_DETAIL.BILL_INFO',
                    readOnly: readOnlyFlag,
                  },
                  <Form
                    dataSet={headerDS}
                    columns={3}
                    useColon={false}
                    labelLayout={!editFlag ? 'float' : 'vertical'}
                  >
                    <FormItem
                      name="netAmount"
                      disabled={!editFlag}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                    <FormItem
                      name="taxAmount"
                      disabled={!editFlag}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                    <FormItem
                      name="taxIncludedAmount"
                      disabled={!editFlag}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                  </Form>
                )}
              </Card>
              <Card
                id="invoiceMatchInfo"
                title={intl.get(`${prefix}.view.title.invoiceMatchInfo`).d('发票匹配信息')}
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                extra={
                  <a onClick={handleTax}>
                    {intl.get(`${prefix}.view.title.taxInvoice`).d('税务发票')}
                  </a>
                }
              >
                {customizeForm(
                  {
                    code:
                      documentType === 'INVOICE'
                        ? 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_MATCHING'
                        : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_INVOICE_MATCHING',
                    readOnly: readOnlyFlag,
                  },
                  <Form
                    dataSet={headerDS}
                    columns={3}
                    useColon={false}
                    labelLayout={!editFlag ? 'float' : 'vertical'}
                  >
                    <FormItem
                      name="invoiceNetAmount"
                      disabled={!editFlag}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                    <FormItem
                      name="invoiceTaxAmount"
                      disabled={!editFlag}
                      help={intl
                        .get('ssta.common.view.help.taxInvDeductibleTaxAmountSum')
                        .d('税务发票可抵扣税额汇总')}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                    <FormItem
                      name="invoiceTaxIncludedAmount"
                      disabled={!editFlag}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                    <FormItem
                      name="invoiceDifferenceAmount"
                      disabled={!editFlag}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                    <FormItem name="invoiceSpliteRule" editor="select" editable={updateFlag} />
                  </Form>
                )}
              </Card>
            </Fragment>
          )}

          {payAreaShow && (
            <Fragment>
              <Card
                id="prePaymentWriteOffInfo"
                title={intl.get(`${prefix}.view.title.prePaymentWriteOffInfo`).d('预付款核销信息')}
                extra={
                  headPrePayment !== 'HIDE' && (
                    <a onClick={() => handlePrepayment(false)}>
                      {intl.get(`${prefix}.button.prePaymentWriteOff`).d('预付款核销')}
                    </a>
                  )
                }
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
              >
                {customizeForm(
                  {
                    code:
                      documentType === 'INVOICE'
                        ? 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PRE_PAYMENT_REMOVE'
                        : 'SSTA.PURCHASE_SETTLE_DETAIL.PRE_PAYMENT_REMOVE',
                    readOnly: readOnlyFlag,
                  },
                  <Form
                    dataSet={headerDS}
                    columns={3}
                    useColon={false}
                    labelLayout={!editFlag ? 'float' : 'vertical'}
                  >
                    <FormItem
                      name="applyAmount"
                      disabled={!editFlag}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                    />
                  </Form>
                )}
              </Card>

              <Card
                id="paymentInfo"
                title={intl.get(`${prefix}.view.title.paymentInfo`).d('付款信息')}
                bordered={false}
                className={DETAIL_CARD_CLASSNAME}
                extra={[
                  headMuldimensionPayment !== 'HIDE' && (
                    <a onClick={handleMultiDimension}>
                      {intl.get(`${prefix}.view.title.multiPayment`).d('多维度付款')}
                    </a>
                  ),
                  <a id="errColor" style={{ ...paymentColor }} onClick={handlePaymentInfo}>
                    {intl.get(`${prefix}.view.title.paymentInfoUpdate`).d('付款信息维护')}
                  </a>,
                ]}
              >
                {customizeForm(
                  {
                    code:
                      documentType === 'INVOICE'
                        ? 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PAYMENT_INFORMATION'
                        : 'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFORMATION',
                    __force_record_to_update__: true,
                    readOnly: readOnlyFlag,
                  },
                  <Form
                    dataSet={headerDS}
                    columns={3}
                    useColon={false}
                    labelLayout={!editFlag ? 'float' : 'vertical'}
                  >
                    <FormItem
                      name="paymentAmount"
                      editor="numberfield"
                      editable={updateFlag}
                      disabled={headPayment !== 'EDIT'}
                      renderer={({ value, record }) => {
                        return decimalPointAccuracy(value, record?.get('amountPrecision'), {
                          repair: true,
                          check: true,
                        });
                      }}
                      onChange={value => {
                        if (isNumber(value)) {
                          headerDS.current.set(
                            'paymentAmount',
                            value.toFixed(currencyDS.current.get('amount'))
                          );
                        }
                      }}
                    />
                    {headPayment !== 'HIDE' && (
                      <FormItem
                        name="paymentSpliteRule"
                        editable={updateFlag}
                        disabled={headPayment !== 'EDIT'}
                        editor="select"
                      />
                    )}
                  </Form>
                )}
              </Card>
            </Fragment>
          )}
          <Card
            id="PurchaseSettle-transactionDetails"
            title={intl.get(`${prefix}.view.message.panel.transactionDetails`).d('交易明细信息')}
            bordered={false}
            className={DETAIL_CARD_CLASSNAME}
          >
            {customizeTable(
              {
                code:
                  documentType === 'INVOICE'
                    ? 'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL'
                    : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL',
                readOnly: editFlag && !isEditPub && !isEditPubDetail,
              },
              <SearchBarTable
                virtual
                searchCode={
                  documentType === 'INVOICE'
                    ? 'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH'
                    : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH'
                }
                dataSet={lineDS}
                columns={columns}
                queryBar="none"
                buttons={buttons}
                style={{ maxHeight: 370 }}
                maxPageSize={1000}
                pagination={{ pageSizeOptions: ['10', '50', '100', '500', '1000'] }}
                searchBarConfig={{
                  closeFilterSelector: true,
                  onQuery: ({ params }) => {
                    const headerId = source === 'create' ? activeKey : settleHeaderId;
                    lineDS.queryDataSet.loadData([{ ...params, settleHeaderId: headerId }]);
                    lineDS.query();
                  },
                  fieldProps: {
                    costId: { lovPara: { tenantId: organizationId } },
                  },
                }}
              />
            )}
          </Card>
        </Content>
        <Content>
          <h3 className="ssta-form-title" id="PurchaseSettle-mainStrategyInfo">
            {intl.get(`${prefix}.view.title.mainStrategyInfo`).d('主策略信息')}
          </h3>
          {customizeForm(
            {
              code:
                documentType === 'INVOICE'
                  ? 'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.TOP'
                  : 'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_TOP',
              readOnly: readOnlyFlag,
            },

            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={!editFlag ? 'float' : 'vertical'}
            >
              <FormItem name="settleConfigNum" disabled={!editFlag} />
              <FormItem name="settleConfigName" disabled={!editFlag} />
              <FormItem name="configVersionNumber" disabled={!editFlag} />
              <FormItem name="confirmCollaborativeModeMeaning" disabled={!editFlag} />
              <FormItem name="confirmApproveMethodMeaning" disabled={!editFlag} />
              <FormItem name="invoiceMatchMeaning" disabled={!editFlag} />
              <FormItem name="cancelCollaborativeModeMeaning" disabled={!editFlag} />
              <FormItem name="cancelApproveMethodMeaning" disabled={!editFlag} />
              {documentType === 'INVOICE' && (
                <FormItem
                  name="invoiceToleranceRangeLimit"
                  disabled={!editFlag}
                  renderer={({ value, record }) =>
                    !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                      ? `${value}%`
                      : value
                  }
                />
              )}
              {documentType === 'INVOICE' && (
                <FormItem
                  name="taxAmountTolLimit"
                  disabled={!editFlag}
                  renderer={({ value, record }) =>
                    !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                      ? `${value}%`
                      : value
                  }
                />
              )}
              {documentType === 'INVOICE' && (
                <FormItem name="amountValidateLevelMeaning" disabled={!editFlag} />
              )}
              {documentType === 'INVOICE' && (
                <FormItem name="amountValidateAction" disabled={!editFlag} />
              )}
              {documentType === 'INVOICE' && (
                <FormItem name="amountAdjustFlag" disabled={!editFlag} />
              )}
              {documentType === 'INVOICE' && (
                <FormItem
                  name="amountAdjustTolLimit"
                  disabled={!editFlag}
                  renderer={({ value, record }) =>
                    !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                      ? `${value}%`
                      : value
                  }
                />
              )}
              {documentType === 'INVOICE' && (
                <FormItem
                  name="taxAmountAdjustTolLimit"
                  disabled={!editFlag}
                  renderer={({ value, record }) =>
                    !isNil(value) && record?.get('invoiceAllowanceCtrlType') === 'PROPORTION'
                      ? `${value}%`
                      : value
                  }
                />
              )}
              {documentType === 'INVOICE' && (
                <FormItem name="amountAdjustModeMeaning" disabled={!editFlag} />
              )}
              {documentType === 'INVOICE' && (
                <FormItem name="amountAdjustRuleMeaning" disabled={!editFlag} />
              )}
            </Form>
          )}
          {customizeForm(
            {
              code:
                documentType === 'INVOICE'
                  ? 'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.BOTTOM'
                  : 'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_BOTTOM',
              readOnly: readOnlyFlag,
            },
            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={!editFlag ? 'float' : 'vertical'}
              style={{ marginTop: 16 }}
            >
              <FormItem name="defaultPaymentDimensionMeaning" disabled={!editFlag} />
              <FormItem name="defaultPaymentSpliteRuleMeaning" disabled={!editFlag} />
              <FormItem name="defaultPrepaymentSpliteRuleMeaning" disabled={!editFlag} />
              <FormItem
                name="lineLimitQuantity"
                disabled={!editFlag}
                renderer={({ value, record }) => {
                  return record?.get('enableLineLimitFlag')
                    ? value
                    : intl.get(`${prefix}.model.purchaseSettle.noLimit`).d('无限制');
                }}
              />
              {payAreaShow && <FormItem name="prepaymentDimensionMeaning" disabled={!editFlag} />}
              {payAreaShow && <FormItem name="prepaymentCheckLevel" disabled={!editFlag} />}

              {payAreaShow && <FormItem name="prepaymentCheckPoint" disabled={!editFlag} />}
              <FormItem name="initSettleConfigNum" disabled={!editFlag} />
              <FormItem name="initConfigVersionNumber" disabled={!editFlag} />
            </Form>
          )}
        </Content>
        <Fragment>
          {invoiceMatchRuleCode === 'DIRECT_INVOICING' && (
            <Content>
              <h3 className="ssta-form-title" id="header">
                {intl.get(`${prefix}.view.title.directBillInfo`).d('直连开票信息')}
              </h3>
              <Form
                dataSet={headerDS}
                columns={3}
                useColon={false}
                labelLayout={!editFlag ? 'float' : 'vertical'}
              >
                <FormItem name="directInvoicingTypeMeaning" disabled={!editFlag} />
              </Form>

              {customizeForm(
                {
                  code:
                    documentType === 'INVOICE'
                      ? 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO'
                      : '',
                  readOnly: readOnlyFlag,
                },
                <Form
                  dataSet={headerDS}
                  columns={3}
                  useColon={false}
                  labelLayout={!editFlag ? 'float' : 'vertical'}
                >
                  <FormItem name="invoiceTypeMeaning" disabled={!editFlag} />
                  <FormItem name="invoiceMethodMeaning" disabled={!editFlag} />
                  <FormItem name="contactName" disabled={!editFlag} />

                  <FormItem name="taxRegistrationNumber" disabled={!editFlag} />
                  <FormItem name="supplierTaxRegistrationNumber" disabled={!editFlag} />
                  <FormItem name="mobile" disabled={!editFlag} />

                  <FormItem
                    name="regionLov"
                    editor="lov"
                    editable={ecEditFlag}
                    disabled={!ecEditFlag}
                  />
                  <FormItem name="address" editable={ecEditFlag} disabled={!ecEditFlag} />
                  <FormItem name="invoiceContentDetail" disabled={!editFlag} />
                  <FormItem name="invoiceFailMsg" disabled={!editFlag} />
                </Form>
              )}
            </Content>
          )}
        </Fragment>
        <Content>
          <h3 className="ssta-form-title" id="PurchaseSettle-otherInfo">
            {intl.get(`${prefix}.view.title.otherInfo`).d('其他信息')}
          </h3>
          {customizeForm(
            {
              code:
                documentType === 'INVOICE'
                  ? 'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_OTHER_INFO'
                  : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_INFO',
              readOnly: readOnlyFlag && !isEditPub,
            },
            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={!editFlag ? 'float' : 'vertical'}
            >
              {!(approveFlag && settleStatus === 'SUBMITED') &&
                !syncFlag &&
                documentType === 'INVOICE' && (
                  <FormItem
                    name="accountingDate"
                    editor="datepicker"
                    editable={updateFlag || isEditPub}
                  />
                )}
              <FormItem name="termCode" disabled={!editFlag} />
              <FormItem name="invOrganizationName" disabled={!editFlag} />
              <FormItem name="remark" editor="textarea" newLine colSpan={2} editable={updateFlag} />

              {!cancelFlag && !['NEW', 'SUBMITED'].includes(settleStatus) && (
                <FormItem
                  name="canceledReason"
                  editor="textarea"
                  newLine
                  colSpan={2}
                  disabled={!editFlag}
                />
              )}

              {settleStatus !== 'NEW' &&
                (!['SUBMITED', 'SUBMITED_APPROVING'].includes(settleStatus) || readOnlyFlag) && (
                  <FormItem
                    name="approvedRemark"
                    editor="textarea"
                    newLine
                    colSpan={2}
                    disabled={!editFlag}
                  />
                )}
              {!['NEW', 'SUBMITED', 'SUBMITED_APPROVING'].includes(settleStatus) &&
                (!['CANCELING', 'CANCEL_APPROVING', 'INVOICE_EXCEPTION', 'INVOICE_FAILED'].includes(
                  settleStatus
                ) ||
                  readOnlyFlag) && (
                  <FormItem
                    name="canceledRemark"
                    editor="textarea"
                    newLine
                    colSpan={2}
                    disabled={!editFlag}
                  />
                )}

              <FormItem name="sourceSettleNum" disabled={!editFlag} />
              <FormItem name="purOrganizationName" disabled={!editFlag} />
            </Form>
          )}
          {(documentType === 'INVOICE' || documentType === 'PAYMENT') &&
            (isExport || isEditPub || isEditPubDetail) &&
            customizeForm(
              {
                code: 'SSTA.PURCHASE_SETTLE_DETAIL.OTHER_WORKFLOW',
                readOnly: erpRead === '1' || isEditPubDetail,
              },
              <Form
                dataSet={headerDS}
                columns={3}
                useColon={false}
                labelLayout={erpRead !== '1' && !isEditPubDetail ? 'float' : 'vertical'}
              />
            )}
        </Content>
        <Content wrapperClassName="ssta-last-page-content-wrapper">
          <h3 className="ssta-form-title" id="PurchaseSettle-attachment">
            {intl.get(`${prefix}.message.panel.attachment`).d('附件')}
          </h3>
          {customizeForm(
            {
              code:
                documentType === 'INVOICE'
                  ? 'SSTA.PURCHASE_SETTLE_DETAIL.ENCLOSURE'
                  : 'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_ENCLOSURE',
            },
            <Form
              dataSet={headerDS}
              columns={3}
              useColon={false}
              labelLayout={!editFlag ? 'float' : 'vertical'}
              className="ssta-form-form"
            >
              <Attachment
                name="attachmentUuid"
                showHistory={!updateFlag}
                labelLayout="float"
                readOnly={!updateFlag}
                bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                bucketDirectory="ssta-settle-header"
              />
            </Form>
          )}
        </Content>
      </Spin>
    );
  };

  const headerBtns = React.useMemo(() => {
    const { remote: remoteProps } = props;
    const allBtns = [
      updateFlag && {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          loading: allBaseOnPriceLoading,
          onClick: debounce(handleSubmit, 300),
        },
      },
      updateFlag && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          loading: allBaseOnPriceLoading,
          onClick: handleSave,
          wait: 2000,
          waitType: 'throttle',
        },
      },
      // 当为直连开票异常且直连开票类型为电商的时候不显示取消
      updateFlag &&
        !(
          settleStatus === 'INVOICE_EXCEPTION' &&
          headerDS.current?.get('directInvoicingType') === 'EC'
        ) && {
          name: 'update-cancel',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: {
            icon: 'cancel',
            loading: allBaseOnPriceLoading,
            onClick: debounce(() => {
              operateBeforeConfirm('CANCEL');
            }, 300),
          },
        },
      updateFlag &&
        (![headPrePayment, headPayment].includes('HIDE') || headMuldimensionPayment !== 'HIDE') && {
          name: 'paymentAutoMatch',
          group: true,
          children: [
            ![headPrePayment, headPayment].includes('HIDE') && {
              name: 'amountMatch',
              btnType: 'c7n-pro',
              loading: allBaseOnPriceLoading,
              child: intl.get(`${prefix}.button.amountMatch`).d('基于总金额匹配'),
              btnProps: {
                onClick: () => handlePaymentAuto('AMOUNT'),
              },
            },
            headMuldimensionPayment !== 'HIDE' && {
              name: 'multiAmountMatch',
              btnType: 'c7n-pro',
              loading: allBaseOnPriceLoading,
              child: intl.get(`${prefix}.button.multiAmountMatch`).d('基于多维度金额匹配'),
              btnProps: {
                onClick: () => handlePaymentAuto('MULTI_AMOUNT'),
              },
            },
          ].filter(item => item),
          child: (
            <Button funcType="flat" loading={allBaseOnPriceLoading} icon="monetization_on">
              {intl.get(`${prefix}.button.paymentAutoMatch`).d('付款自动匹配')}
              <Icon type="expand_more" />
            </Button>
          ),
        },
      updateFlag &&
        documentType === 'INVOICE' && {
          name: 'invoiceAutoMatch',
          child: intl.get(`${prefix}.button.invoiceAutoMatch`).d('发票自动匹配'),
          btnProps: {
            icon: 'baseline-file_copy',
            loading: allBaseOnPriceLoading,
            onClick: debounce(handleInvoiceAutoLoading, 300),
          },
        },
      updateFlag &&
        documentType === 'INVOICE' &&
        amountAdjustFlag === '1' && {
          name: 'toleranceAdjust',
          child: intl.get(`${prefix}.button.toleranceAdjust`).d('尾差调整'),
          btnProps: {
            icon: 'adjust',
            loading: allBaseOnPriceLoading,
            onClick: debounce(handleToleranceAdjustLoading, 300),
          },
        },
      approveFlag && {
        name: 'confirm',
        child: intl.get('hzero.common.button.confirm').d('确认'),
        btnProps: {
          icon: 'check',
          loading: allBaseOnPriceLoading,
          onClick: () => handleFilledInfo('CONFIRM', handleConfirm),
        },
      },
      approveFlag && {
        name: 'return',
        child: intl.get('hzero.common.button.return').d('退回'),
        btnProps: {
          icon: 'reply',
          loading: allBaseOnPriceLoading,
          onClick: () => handleFilledInfo('RETURN', handleReturnLoading),
        },
      },
      syncFlag && {
        name: 'sync',
        child: intl.get('hzero.common.button.sync').d('同步'),
        btnProps: {
          icon: 'sync',
          loading: allBaseOnPriceLoading,
          onClick: () =>
            documentType === 'INVOICE'
              ? handleFilledInfo('SYNC', handleSyncLoading)
              : handleSyncLoading(),
        },
      },
      cancelFlag && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          loading: allBaseOnPriceLoading,
          onClick: () => handleFilledInfo('CANCEL', handleCancelLoading),
        },
      },
      taxInvoiceCheckFlagger({
        notPub,
        updateFlag,
        approveFlag,
        headerInfo: {
          documentType,
          settleStatus,
          checkPointCode,
          enableCheckFlag,
        },
      }) && {
        name: 'invoiceCheck',
        child: intl.get('hzero.common.button.invoiceToCheck').d('发票查验'),
        btnProps: {
          icon: 'test',
          loading: allBaseOnPriceLoading,
          onClick: debounce(handleTaxCheck, 200),
        },
      },
      updateBtn &&
        permsMap.get(`${permPrefix}.update`) && {
          name: 'updateBtn',
          child: intl.get('hzero.common.button.edit').d('编辑'),
          btnProps: {
            icon: 'mode_edit',
            funcType: 'raised',
            color: 'primary',
            loading: allBaseOnPriceLoading,
            onClick: () => toLastDetailPage('UPDATE'),
          },
        },
      approveBtn &&
        permsMap.get(`${permPrefix}.audit`) && {
          name: 'approveBtn',
          child: intl.get('ssta.common.button.approve').d('审核'),
          btnProps: {
            icon: 'authorize',
            funcType: 'raised',
            color: 'primary',
            loading: allBaseOnPriceLoading,
            onClick: () => toLastDetailPage('APPROVE'),
          },
        },
      cancelBtn &&
        permsMap.get(`${permPrefix}.cancel`) && {
          name: 'cancelBtn',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: {
            icon: 'cancel',
            funcType: 'raised',
            color: 'primary',
            loading: allBaseOnPriceLoading,
            onClick: () => toLastDetailPage('CANCEL'),
          },
        },
      syncBtn &&
        permsMap.get(`${permPrefix}.sync`) && {
          name: 'syncBtn',
          child: intl.get('hzero.common.button.sync').d('同步'),
          btnProps: {
            icon: 'sync',
            funcType: 'raised',
            color: 'primary',
            loading: allBaseOnPriceLoading,
            onClick: () => toLastDetailPage('SYNC'),
          },
        },
      {
        name: 'operation',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          color: 'default',
          onClick: handleRecord,
          loading: allBaseOnPriceLoading,
        },
      },
      {
        name: 'print',
        child: intl.get('hzero.common.button.print').d('打印'),
        btnProps: {
          icon: 'print',
          funcType: 'flat',
          color: 'default',
          loading: allBaseOnPriceLoading,
          onClick: handlePrint,
        },
      },
    ];

    const btns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_OLD_BTNS', allBtns, {
          notPub,
          lineDS,
          headerDS,
        })
      : allBtns;

    return btnsFormat(btns);
  }, [allBaseOnPriceLoading, type, activeKey]);

  if (settleHeaderId && !headerDS.current) return <Spin />;

  return (
    <>
      <Header
        title={notPub ? titleObj[type] : ''}
        backPath={notPub ? state?.backPath || '/ssta/purchase-settle/list' : null}
        onBack={() => {
          if (notPub && state?.backPath) {
            updateTab({
              key: getActiveTabKey(),
              search: state?.backPath.split('?')[1],
              state: null,
            });
          }
        }}
      >
        {customizeBtnGroup(
          { code: 'SSTA.PURCHASE_SETTLE_DETAIL.HEADER_BTNS', pro: true },
          <DynamicButtons buttons={headerBtns} />
        )}
      </Header>
      <div className={Styles['ssta-detail-content']} id="ssta-detail-content-PurchaseSettle">
        {list && list.length > 1 ? (
          <Tabs defaultActiveKey={settleHeaderId} tabPosition="left" onChange={handleTabChange}>
            {list.map(item => (
              <TabPane tab={item.settleNum} key={item.settleId}>
                {detailTabPaneRender(item.settleHeaderId)}
              </TabPane>
            ))}
          </Tabs>
        ) : (
          detailTabPaneRender(settleHeaderId)
        )}
        <FixedAnchor linkList={linkListRender()} className="ssta-detail-content-PurchaseSettle" />
      </div>
    </>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.common',
      'hzero.common',
      'hwfp.common',
      'ssta.purchaseSettle',
      'entity.attachment',
      'ssta.purchaseSettlePool',
      'ssta.invoiceSheet',
      'ssta.costSheet',
      'entity.attachment',
      'ssta.purchaseInvoicePool',
      'ssta.supplyInvoicePool',
      'ssta.directPoolSupply',
    ],
  }),
  remote({
    code: 'SSTA.PURCHASESETTLE_DETAIL_OLD_CUX',
    name: 'remote',
  }),
  withCustomize({
    unitCode: [
      'SSTA.PURCHASE_SETTLE_DETAIL.BASIC',
      'SSTA.PURCHASE_SETTLE_DETAIL.TRADINGPARTY',
      'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_BASIC',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRADINGPARTY',
      'SSTA.PURCHASE_SETTLE_DETAIL.SUMMARY_INFORMATION',
      'SSTA.PURCHASE_SETTLE_DETAIL.BILL_INFO',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_INVOICE_MATCHING',
      'SSTA.PURCHASE_SETTLE_DETAIL.PRE_PAYMENT_REMOVE',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFORMATION',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_DIR_BILL_INFO',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_INFO',
      'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_SUMMARY_INFORMATION',
      'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_BILL_INFO',
      'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_MATCHING',
      'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PRE_PAYMENT_REMOVE',
      'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_PAYMENT_INFORMATION',
      'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_OTHER_INFO',
      'SSTA.PURCHASE_SETTLE_DETAIL.INVOICE_INFO_BOX',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAYMENT_INFO_BOX',
      'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_TOP',
      'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.PAY_BOTTOM',
      'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.TOP',
      'SSTA.PURCHASE_SETTLE_DETAIL_MAIN_INFO.BOTTOM',
      'SSTA.PURCHASE_SETTLE_DETAIL.ENCLOSURE',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_OTHER_ENCLOSURE',
      'SSTA.PURCHASE_SETTLE_DETAIL.INV_CONFIRM',
      'SSTA.PURCHASE_SETTLE_DETAIL.INV_RETURN',
      'SSTA.PURCHASE_SETTLE_DETAIL.INV_CANCEL',
      'SSTA.PURCHASE_SETTLE_DETAIL.INV_SYNC',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CONFIRM',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_RETURN',
      'SSTA.PURCHASE_SETTLE_DETAIL.PAY_CANCEL',
      'SSTA.PURCHASE_SETTLE_DETAIL.HEADER_BTNS',
      'SSTA.PURCHASE_SETTLE_DETAIL.OTHER_WORKFLOW',
    ],
  })
)(Detail);
