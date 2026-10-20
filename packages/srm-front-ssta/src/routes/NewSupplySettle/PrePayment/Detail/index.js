import React, { useState, useMemo, useEffect, useCallback, isValidElement, Fragment } from 'react';
import { math } from 'choerodon-ui/dataset';
import { Form, DataSet, Button, Table, Modal, Attachment, Tabs, TextArea } from 'choerodon-ui/pro';
import { Spin, Collapse } from 'choerodon-ui';
import queryString from 'querystring';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import SearchBarTable from 'srm-front-boot/lib/components/SearchBarTable';
import { compose, isEmpty, isFunction, isNil } from 'lodash';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import DynamicButtons from '_components/DynamicButtons';
import PrintProButton from '_components/PrintProButton';
import ExcelExportPro from 'components/ExcelExportPro';
import Import from 'components/Import';
import formatterCollections from 'utils/intl/formatterCollections';
import { operatorRender } from 'utils/renderer';
import {
  formatNumber,
  amountRender,
  ObjectBatchGet,
  recordPickValues,
  formatDynamicBtns,
  openExpiredTipsModal,
  getSelectedNegActConfirmMsg,
} from '@/utils/utils';
import DynamicAlert from '@/routes/Components/DynamicAlert';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import { openTab, getActiveTabKey, updateTab } from 'utils/menuTab';
import remote from 'hzero-front/lib/utils/remote';

import { confirmModal } from '@/routes/Components/ConfirmModal';
import { formatErrorInfo } from '@/routes/Components/ErrorInfo';
import { hxDS } from '@/routes/pubDS/hxDS';
import { getBankLovConfig } from '@/utils/api';
import { formItemRender } from '@/utils/renderer';
import { settleActionFlagger } from '@/utils/amountConfig';
import { FormItem, SettlementSheet, getPermissions, NavigationAnchor } from '@/routes/Components';
import {
  cancelPrepaymentSup,
  submitPrepayment,
  returnPrepaymentSup,
  confirmPrepaymentSup,
  savePreSup,
  addLines,
  getPreHeader,
  prepaymentPrint,
  syncPrintData,
  getBankInfo,
  featchWithdraw,
  getDefaultPaymentInfo,
  getPrePaymentDetail,
  cancelPrepaymentLines,
  validatePrepaymentLine,
  validateSubmitPrepayment,
  validateSubmitWarnCancel,
  querySupMasterPaymentInfo,
  addLinesValidate,
  validateStageLineUpdatePrepayment,
  reMatchStageLinePrepaymentSupplier,
  supplierPhysicsDelete,
  // cancelLines,
  // batchSavePrepaymentLine,
} from '@/services/settlePoolServices';
import Summary from '@/routes/Components/Summary';
import AddModal from './AddModal';
import FilledInfoModal from './FilledInfoModal';
import BatchModifyModal from './BatchModifyModal';
import BatchEditHeader from '../../components/BatchEditHeader';
import SplitTabBarExtra from '../../components/SplitTabBarExtra';
import Refund from './components/Refund';
import {
  prePaymentHeaderDS as headerDs,
  prePaymentLineDS as lineDs,
  cuszLineDS,
  refundLineDS,
  PaymentStageDS,
} from './stores/detailDS';
import styles from './index.less';
import commonStyles from '@/routes/common.less';
import CuszLineSlot from './components/CuszLineSlot';
import { statusTagRender } from '@/routes/Components/StatusTag';
import { getCustomValidationResponse } from '@/components/CustomValidation';
import PaymentStage from './components/PaymentStage';

const { Panel } = Collapse;
const prefix = 'ssta.supplySettle';
const permPrefix = `srm.settle-account.jsd.ux-supply.ps`;
const buttonPermPrefix = `srm.settle-account.jsd.ux-supply.button`;
const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${organizationId}`;

export const headUnitCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BASIC_INFO',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_INFO',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_OTHER_INFO',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_ENCLOSURE',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CONFIRM',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_RETURN',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CANCEL',
];
export const lineUnitCodes = [
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH',
];
export const cuszLineUnitCodeMap = {
  LIST: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CUSZ_LINE_LIST',
  SEARCH: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_CUSZ_LINE_SEARCH',
};
const collapseCode = 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_COLLAPSE';
// 按阶段聚合展示
export const paymentStageCode = {
  LIST: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_LIST',
  SEARCH: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_SEARCH',
};
export const paymentStageRefundCode = {
  LIST: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_LIST_REFUND',
  SEARCH: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_SEARCH_REFUND',
};
// 按阶段明细展示
export const paymentStageLineCode = {
  LIST: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_LINE_LIST',
  SEARCH: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_LINE_SEARCH',
};
export const paymentStageLineRefundCode = {
  LIST: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_LINE_LIST_REFUND',
  SEARCH: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_STAGE_LINE_SEARCH_REFUND',
};
const unitCode = [
  ...headUnitCodes,
  ...lineUnitCodes,
  ...Object.values(paymentStageCode),
  ...Object.values(paymentStageLineCode),
  ...Object.values(paymentStageRefundCode),
  ...Object.values(paymentStageLineRefundCode),
  collapseCode,
  Object.values(cuszLineUnitCodeMap).join(),
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_HEAD_BTNS',
  'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BATCH_MODIFY_LINE',
];

const unitCodesHeader = headUnitCodes.join();
const customizeUnitCode = [...headUnitCodes, ...lineUnitCodes].join();

const defaultActiveKey = ['basic', 'line', 'pay', 'other', 'attachment', 'paymentStage'];

const Detail = (props) => {
  const {
    location: { search, pathname, state },
    history,
    customizeForm,
    customizeTable,
    customizeBtnGroup,
    custConfig,
    customizeCollapse,
    modal,
    headerHideFlag,
    remote: remoteProps,
  } = props;

  const modalFlag = Boolean(modal);

  const notPub = pathname.split('/')[1] !== 'pub';

  const { list, source, settleHeaderId: urlSettleHeaderId, type = 'ALL' } = queryString.parse(
    search.substring(1)
  );

  const [settleList, setSettleList] = useState([]);
  const [activeKey, setActiveKey] = useState(urlSettleHeaderId);
  const settleHeaderId = activeKey || urlSettleHeaderId;
  const [supplierSiteId, setSupplierSiteId] = useState(null);
  const [pinFixed, setPinFixed] = useState(true);
  const [createPermsMap, setCreatePermsMap] = useState(props.createPermsMap || new Map());

  const lineDS = useMemo(() => new DataSet(lineDs(settleHeaderId)), [settleHeaderId]);
  const cuszLineDs = useMemo(() => new DataSet(cuszLineDS(settleHeaderId)), [settleHeaderId]);
  const refundLineDs = useMemo(() => new DataSet(refundLineDS()), []);
  // 通过ds重新实例化触发spin，导航栏重新渲染防止错误
  const headerDS = useMemo(() => new DataSet(headerDs(settleHeaderId)), [settleHeaderId]);

  const paymentStageDs = useMemo(() => new DataSet(PaymentStageDS(settleHeaderId)), [
    settleHeaderId,
  ]);
  const [remotePageData, setRemoteData] = useState(null); // 二开初始化数据
  const [updateFlag, approveFlag, cancelFlag, readOnlyFlag] = [
    type === 'UPDATE',
    type === 'APPROVE',
    type === 'CANCEL',
    ['ALL', 'NUM'].includes(type) && source !== 'create',
  ];

  const [updateBtn, approveBtn, cancelBtn] = settleActionFlagger(headerDS.current, 'supplier', [
    'UPDATE',
    'APPROVE',
    'CANCEL',
  ]);

  const {
    camp,
    settleStatus,
    prepaymentType,
    printBtnDisable,
    settleTypeMeaning,
    paymentControlRuleSource,
    refundStatus,
    prepaymentRefundAmount,
    associatedPrepaymentAmount,
    refundCompletedPreAmount,
    origPrepaymentAmount,
    sumRefundCompletedAmount,
    confirmedDate,
  } =
    headerDS.current?.get([
      'camp',
      'settleStatus',
      'prepaymentType',
      'printBtnDisable',
      'settleTypeMeaning',
      'paymentControlRuleSource',
      'refundStatus',
      'prepaymentRefundAmount',
      'associatedPrepaymentAmount',
      'refundCompletedPreAmount',
      'origPrepaymentAmount',
      'sumRefundCompletedAmount',
      'confirmedDate',
    ]) || {};

  useEffect(() => {
    remoteInit(); // 页面加载埋点
  }, []);

  const remoteInit = async () => {
    if (remoteProps) {
      await remoteProps.event.fireEvent('remoteInit', {
        remotePageData,
        setRemoteData,
      });
    }
  };

  useEffect(() => {
    setActiveKey(urlSettleHeaderId);
    if (!isNil(list)) {
      try {
        setSettleList(JSON.parse(list));
      } catch (e) {
        throw e;
      }
    } else {
      setSettleList([]);
    }
  }, [list, urlSettleHeaderId]);

  useEffect(() => {
    if (source === 'detail') {
      headerDS.query().then((res) => {
        if (res) {
          if (res.supplierSiteEnableFlag === 1) {
            headerDS.current.set('supplierSiteId', res.supplierSiteId);
            setSupplierSiteId(res.supplierSiteId);
          }
        }
      });
    }
    if (source === 'create') {
      headerDS.status = 'loading';
      getDefaultPaymentInfo().then((res) => {
        headerDS.status = 'ready';
        if (res && !res.failed && headerDS.current) {
          const values = filterNullValueObject(res) || {};
          headerDS.current.set(values);
        }
      });
    }
    headerDS.setState('flagObj', {
      updateFlag,
      approveFlag,
      notPub: !pathname.includes('/pub'),
      createFlag: ['create'].includes(source),
    });
  }, [search, pathname, approveFlag, headerDS, lineDS, settleHeaderId, source, updateFlag]);

  const handleCustMessage = useCallback(
    (e) => {
      const { origin, data } = e || {};
      if (origin !== window.location.origin) return;
      const { type: customzieActionType, payload: customzieActionData } = data || {};
      // 回写头字段
      if (customzieActionType === 'setHeaderData') {
        const headerCurrent = headerDS.current;
        if (!headerCurrent) return;
        headerCurrent.set(customzieActionData || {});
      }
    },
    [headerDS]
  );

  const handleUpdateHedaer = useCallback(
    async (params) => {
      const { name, value, record, dataSet } = params;
      if (name === 'supplierCompanyNumLov') {
        const { companyId, purOrganizationId } = record.get(['companyId', 'purOrganizationId']);
        const supBankFlag = dataSet.getState('supBankFlag');
        const { supplierId, supplierCompanyId } = value || {};
        //  付款方式取值优先级调整为:并单规则>供应商主银行信息>供应商主数据>【付款方式定义】默认值
        // 付款条款默认值逻辑:并单规则>供应商主数据>【付款条款定义】默认值
        const resList = await Promise.all([
          querySupMasterPaymentInfo({
            companyId,
            supplierId,
            supplierCompanyId,
            purOrganizationId,
          }),
          getBankInfo({ companyId, supplierId, supplierCompanyId, supBankFlag }),
        ]);
        const [supMasterPaymentInfo, bankInfo] = resList.map((item) => getResponse(item));
        const reWriteData = {};
        if (supMasterPaymentInfo) {
          if (supMasterPaymentInfo.paymentTypeId) {
            Object.assign(
              reWriteData,
              ObjectBatchGet(supMasterPaymentInfo, ['paymentTypeId', 'paymentTypeName'])
            );
          }
          if (supMasterPaymentInfo.paymentTermId) {
            Object.assign(
              reWriteData,
              ObjectBatchGet(supMasterPaymentInfo, ['paymentTermId', 'paymentTermName'])
            );
          }
        }
        if (bankInfo) {
          if (!bankInfo.bankId && !bankInfo.associationAccountId) {
            reWriteData.bankIdLov = null;
          } else {
            Object.assign(
              reWriteData,
              ObjectBatchGet(bankInfo, [
                'bankId',
                'bankName',
                'bankBranchName',
                'bankAccountNum',
                'bankAccountName',
                'associationAccountId',
                'associationSystem',
                'bankFirm',
              ])
            );
          }
          if (bankInfo.paymentTypeId) {
            Object.assign(
              reWriteData,
              ObjectBatchGet(bankInfo, ['paymentTypeId', 'paymentTypeName'])
            );
          }
        }
        record.set(reWriteData);
      }
      if (remoteProps?.event) {
        remoteProps.event.fireEvent('handleHeaderUpdateCux', params);
      }
    },
    [remoteProps]
  );

  const onHeaderLoad = useCallback(
    ({ dataSet }) => {
      const [updateBtn, approveBtn, cancelBtn] = settleActionFlagger(dataSet.current, 'supplier', [
        'UPDATE',
        'APPROVE',
        'CANCEL',
      ]);
      const typeExpiredFlag =
        (updateFlag && !updateBtn) || (approveFlag && !approveBtn) || (cancelFlag && !cancelBtn);
      if (typeExpiredFlag) openExpiredTipsModal(onlyBackList);
    },
    [onlyBackList, updateFlag, approveFlag, cancelFlag]
  );

  useEffect(() => {
    headerDS.addEventListener('load', onHeaderLoad);
    return () => {
      headerDS.removeEventListener('load', onHeaderLoad);
    };
  }, [headerDS, onHeaderLoad]);

  useEffect(() => {
    if (remoteProps && remoteProps.event) {
      const cleanupFunc = remoteProps.event.fireEvent('onEffect', {
        updateFlag,
        setPinFixed,
        settleLineDs: lineDS,
        settleHeaderDs: headerDS,
      });
      if (isFunction(cleanupFunc)) return cleanupFunc;
    }
  }, [updateFlag, remoteProps, lineDS, headerDS]);

  useEffect(() => {
    fetchBankLovConfig();
    fetchPermissions();
    // 监听二开模块postMessage消息触发动作
    window.addEventListener('message', handleCustMessage);
    headerDS.addEventListener('update', handleUpdateHedaer);
    return () => {
      window.removeEventListener('message', handleCustMessage);
      headerDS.removeEventListener('update', handleUpdateHedaer);
    };
  }, [lineDS, headerDS, handleCustMessage, handleUpdateHedaer, fetchBankLovConfig]);

  /**
   * 手动查询权限集
   */
  const fetchPermissions = async () => {
    const res = getResponse(
      await getPermissions([
        `${permPrefix}.radio.button.update`,
        `${permPrefix}.radio.button.audit`,
        `${permPrefix}.radio.button.cancel`,
        `${permPrefix}.detail.pay.newimport`,
        `${permPrefix}.detail.pay.newexport`,
        `${permPrefix}.radio.button.recall`,
        `${buttonPermPrefix}.pre-line-add`,
        `${buttonPermPrefix}.pre-line-delete`,
        `${buttonPermPrefix}.pre-line-batch-modify`,
        `${buttonPermPrefix}.print-detail`,
        `${buttonPermPrefix}.new-print-detail`,
        `${buttonPermPrefix}.pre-head-batch-edit`,
        `${buttonPermPrefix}.pre-source-hold`,
        `${buttonPermPrefix}.pre-source-unhold`,
        `${buttonPermPrefix}.recall-workflow`,
        `${buttonPermPrefix}.recall-ext-sys`,
        `${buttonPermPrefix}.delete`,
      ])
    );
    if (res) {
      setCreatePermsMap(res);
    }
  };

  const fetchBankLovConfig = useCallback(async () => {
    const res = getResponse(await getBankLovConfig());
    if (isEmpty(res)) {
      headerDS.setState('supBankFlag', true);
    }
  }, [headerDS]);

  const linkToDetail = useCallback(
    (record) => {
      const { associateId } = record.toData();
      const { jumpPoFlag } = headerDS.current?.get(['jumpPoFlag']) || {};
      if (['PO_LINE', 'ORDER'].includes(prepaymentType)) {
        // jumpPoFlag === 1 我收到的订单 === 2 订单工作台
        if (jumpPoFlag === 1) {
          openTab({
            key: `/sodr/received-order/detail/${associateId}`,
            title: intl.get('ssta.common.view.title.myReceivedOrder').d('我收到的订单'),
            search: queryString.stringify({
              openFrom: 'settle',
              isBackFlag: 0,
            }),
          });
        } else {
          openTab({
            key: `/sodr/order-execution-workbench/all-orders/${associateId}`,
            title: intl.get('ssta.common.view.title.executionOrderWorkspace').d('销售方订单工作台'),
            search: queryString.stringify({
              openFrom: 'settle',
              isBackFlag: 0,
            }),
          });
        }
      } else if (['CONTRACT', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType)) {
        openTab({
          key: '/spcm/supplier-contract-view/detail',
          title: intl.get('ssta.common.view.title.myReceivedContract').d('我收到的协议'),
          search: queryString.stringify({
            pcHeaderId: associateId,
            backVoidPage: 'NO',
          }),
        });
      }
    },
    [headerDS, prepaymentType]
  );

  const columns = useMemo(() => {
    const normalColumns = [
      {
        width: 150,
        name: 'lineNum',
      },
      {
        width: 200,
        name: 'prepaymentAmount',
        editor: updateFlag,
      },
      !['PO_LINE', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType) && {
        name: 'associateNumLov',
        editor: false,
        renderer: ({ record }) => {
          const { jumpPoFlag, jumpPcFlag, prepaymentType: advancePaymentType } =
            headerDS.current?.toData() || {};
          if (
            (advancePaymentType === 'ORDER' && jumpPoFlag) ||
            (advancePaymentType === 'CONTRACT' && jumpPcFlag)
          ) {
            return <a onClick={() => linkToDetail(record)}>{record.get('associateNum')}</a>;
          } else {
            return record.get('associateNum');
          }
        },
      },
      ['PO_LINE', 'CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(prepaymentType) && {
        width: 200,
        name: 'associateNumAndLineNum',
        renderer: ({ record }) => {
          const { jumpPoFlag, jumpPcFlag, prepaymentType: advancePaymentType } =
            headerDS.current?.get(['jumpPoFlag', 'jumpPcFlag', 'prepaymentType']) || {};
          const jumpFlag =
            (advancePaymentType === 'PO_LINE' && jumpPoFlag) ||
            (['CONTRACT_STAGE', 'CONTRACT_SUBJECT'].includes(advancePaymentType) && jumpPcFlag);
          const text = `${record.get('associateNum')}-${record.get('associateLineNum')}`;
          return jumpFlag ? <a onClick={() => linkToDetail(record)}>{text}</a> : text;
        },
      },
      {
        width: 250,
        name: 'associateAmount',
      },
      {
        name: 'launchPrepaymentAmount',
        width: 200,
      },
      {
        name: 'prepaymentOccupiedAmount',
        width: 200,
      },
      {
        name: 'launchPrepaymentCompleteAmount',
        width: 200,
      },
      refundStatus !== 'REFUND' && {
        width: 250,
        name: 'prepaymentApplyAmount',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'itemName',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'quantity',
        align: 'right',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'taxIncludedLineAmount',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'lineAmount',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'categoryName',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'poCreatedName',
      },
      prepaymentType === 'PO_LINE' && {
        width: 250,
        name: 'poCreationDate',
      },
      ...(paymentControlRuleSource
        ? [
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
        name: 'paymentTypeName',
        width: 120,
      },
      {
        name: 'paymentTermName',
        width: 120,
      },
      settleStatus !== 'NEW' && {
        name: 'operate',
        title: intl.get('hzero.common.button.operating').d('操作记录'),
        align: 'left',
        width: 200,
        renderer: ({ record }) => {
          const actions = [];
          actions.push(
            record.get('lineNum') && {
              ele: (
                <a onClick={() => handleViewDetail(record)}>
                  {intl.get('ssta.common.view.title.writeOffRecord').d('核销记录')}
                </a>
              ),
              key: 'maintain',
              len: 4,
            },
            refundStatus !== 'REFUND' &&
              confirmedDate && {
                ele: (
                  <a onClick={() => handleViewRefundDetail(record)}>
                    {intl.get('ssta.common.view.title.refundRecord').d('退款记录')}
                  </a>
                ),
                key: 'refundRecord',
                len: 4,
              }
          );
          return operatorRender(actions);
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
      // 退款字段
      ...(refundStatus === 'REFUND'
        ? [
            {
              width: 140,
              name: 'associatedPrepaymentAmount',
            },
            {
              width: 150,
              name: 'refundAmount',
              editor: updateFlag,
            },
            {
              name: 'refundCompletedPreAmount',
              width: 140,
            },
            {
              width: 250,
              name: 'origPrepaymentApplyAmount',
            },
          ]
        : []),
      ...(refundStatus !== 'REFUND' && confirmedDate
        ? [
            {
              width: 140,
              name: 'sumRefundCompletedAmount',
            },
            {
              name: 'origPrepaymentAmount',
              width: 140,
            },
          ]
        : []),
    ];
    return remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_PRE_CUX_LINE_COLUMNS', normalColumns, {
          headerDS,
          updateFlag,
        })
      : normalColumns;
  }, [
    headerDS,
    remoteProps,
    prepaymentType,
    updateFlag,
    settleStatus,
    paymentControlRuleSource,
    handleViewDetail,
    linkToDetail,
    refundStatus,
    confirmedDate,
    handleViewRefundDetail,
  ]);

  const hxDs = useMemo(
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

  const handleViewRefundDetail = useCallback(
    (record) => {
      const prepaymentLineId = record?.get('prepaymentLineId');
      refundLineDs.setQueryParameter('prepaymentLineId', prepaymentLineId);
      Modal.open({
        key: Modal.key(),
        drawer: true,
        closable: true,
        className: commonStyles['ssta-medium-modal'],
        title: intl.get('ssta.common.view.title.prePaymentRefundRecord').d('预付款退款记录'),
        children: <Refund refundRecordDs={refundLineDs} />,
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [refundLineDs]
  );

  const handleViewDetail = useCallback(
    (record) => {
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
          width: 150,
        },
        {
          name: 'settleStatusMeaning', // 关联结算单号
          width: 150,
        },
        {
          name: 'lineNum', // 关联结算行号
          width: 100,
        },
        {
          name: 'applyAmount', //  核销金额
          width: 120,
          align: 'rignt',
          renderer: amountRender,
        },
      ];
      Modal.open({
        // mask: false,
        drawer: true,
        key: Modal.key(),
        closable: true,
        title: intl.get('ssta.common.view.title.writeOffRecord').d('核销记录'),
        className: commonStyles['ssta-medium-modal'],
        children: (
          <Table dataSet={hxDs} columns={hxColumns} style={{ maxHeight: `calc(100vh - 200px)` }} />
        ),
        okCancel: false,
        okText: intl.get('hzero.common.button.close').d('关闭'),
      });
    },
    [hxDs]
  );

  const getSaveSendData = useCallback(
    async ({ forceGetFlag, actionType } = {}) => {
      const validRes =
        forceGetFlag ||
        (await Promise.all([headerDS.validate(), lineDS.validate()])).every(Boolean);
      if (validRes) {
        const mergeData = {};
        if (remoteProps) {
          const cuxRes = await remoteProps.event.fireEvent('handleSaveBeforeCux', {
            headerDS,
            paymentStageDs,
            forceGetFlag,
            mergeData,
            actionType,
          });
          if (cuxRes === false) return false;
        }
        const headerData = headerDS.current.toData() || {};
        const lineData = lineDS.toData() || [];
        const { settleHeaderId: settleHeaderId1 } = headerData;
        const sendData = {
          customizeUnitCode,
          settleHeader: { ...headerData },
          prePaymentLineList: lineData.map((item) => ({
            ...item,
            settleHeaderId: settleHeaderId1,
          })),
          ...mergeData,
        };
        return sendData;
      } else {
        formatErrorInfo(
          headerDS,
          lineDS,
          intl.get(`${prefix}.view.title.transactionAmount`).d('交易金额信息')
        );
        return false;
      }
    },
    [headerDS, lineDS]
  );
  /**
   * 预付款打印
   */
  const handlePrint = async () => {
    const flag = checkPrintWindow();
    const selectData = headerDS.toData();
    headerDS.status = 'loading';
    const printRes = await prepaymentPrint({
      settleHeaderId,
      responseType: flag ? 'blob' : 'json',
      headers: flag ? {} : { 's-print-using-preview': '1' },
      menuCamp: 'SUPPLIER',
    });
    headerDS.status = 'ready';
    if (!printRes) return;
    if (flag) {
      const reader = new FileReader();
      reader.onload = async () => {
        const content = reader.result;
        try {
          const failedInfo = JSON.parse(content);
          notification.error({
            description: failedInfo.message,
          });
        } catch (e) {
          const file = new Blob([printRes], { type: 'application/pdf' });
          const fileURL = URL.createObjectURL(file);
          window.open(fileURL);
          headerDS.status = 'loading';
          const syncRes = getResponse(await syncPrintData(selectData));
          headerDS.status = 'ready';
          if (!syncRes) return;
          if (!syncRes[0]?.objectVersionNumber) return;
          headerDS.current.set('objectVersionNumber', syncRes[0].objectVersionNumber);
        }
      };
      reader.readAsText(printRes);
    } else {
      // 添加如下代码
      const { fileUrl, bucketName, fileToken } = printRes || {};
      const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
      window.open(url);
      headerDS.status = 'loading';
      const syncRes = getResponse(await syncPrintData(selectData));
      headerDS.status = 'ready';
      if (!syncRes) return;
      if (!syncRes[0]?.objectVersionNumber) return;
      headerDS.current.set('objectVersionNumber', syncRes[0].objectVersionNumber);
    }
  };

  const handleNewPrintOkCallback = useCallback(async () => {
    headerDS.status = 'loading';
    const syncRes = getResponse(await syncPrintData([headerDS.current?.toJSONData()]));
    headerDS.status = 'ready';
    if (!syncRes?.[0]?.objectVersionNumber) return;
    headerDS.current.init('objectVersionNumber', syncRes?.[0]?.objectVersionNumber);
  }, [headerDS]);

  const handleBackList = useCallback(() => {
    notification.success();
    history.push({
      pathname: '/ssta/new-supply-settle/list',
      state: { _back: 1 },
    });
  }, [history]);

  const onlyBackList = useCallback(() => {
    history.push('/ssta/new-supply-settle/list');
  }, [history]);

  const handleSplitAction = useCallback(() => {
    if (!isEmpty(settleList)) {
      notification.success();
      const filterList = settleList.filter((item) => item.settleHeaderId !== activeKey);
      const { settleHeaderId: nextHeaderId } = filterList[0];
      const newSearch = queryString.stringify(
        filterNullValueObject({
          type: 'UPDATE',
          source: 'detail',
          documentType: 'PREPAYMENT',
          settleHeaderId: nextHeaderId,
          list: filterList.length > 1 ? JSON.stringify(filterList) : null,
        })
      );
      history.push({
        pathname: `/ssta/new-supply-settle/pre-payment`,
        search: newSearch,
      });
      updateTab({
        key: getActiveTabKey(),
        search: newSearch,
      });
    } else {
      handleBackList();
    }
  }, [history, activeKey, settleList, handleBackList]);

  // 提交成功
  const handleSubmitValidateOk = useCallback(async () => {
    const sendData = await getSaveSendData();
    if (!sendData) return false;
    headerDS.status = 'loading';
    const validatedResultDTO = headerDS.getState('validatedResultDTO');
    Object.assign(sendData.settleHeader, { validatedResultDTO });
    const res = getResponse(await submitPrepayment(sendData));
    headerDS.status = 'ready';
    if (!res) return false;
    handleSplitAction();
  }, [headerDS, getSaveSendData, handleSplitAction]);

  // 提交校验警告弹窗取消
  const handleSubmitValidateCancel = useCallback(async () => {
    const sendData = await getSaveSendData({ forceGetFlag: true });
    const { settleHeader = {}, customizeUnitCode } = sendData;
    headerDS.status = 'loading';
    const validateCancelRes = getResponse(
      await validateSubmitWarnCancel({ ...settleHeader, customizeUnitCode })
    );
    headerDS.status = 'ready';
    if (!validateCancelRes) return false;
  }, [headerDS, getSaveSendData]);

  // 提交校验
  const handleSubmitValidate = useCallback(async () => {
    const sendData = await getSaveSendData({ actionType: 'submit' });
    if (sendData) {
      headerDS.status = 'loading';
      const validatedResultDTO = getResponse(await validateSubmitPrepayment(sendData));
      headerDS.status = 'ready';
      if (!validatedResultDTO) return;
      headerDS.setState('validatedResultDTO', validatedResultDTO);
      return getCustomValidationResponse(validatedResultDTO, handleSubmitValidateOk, {
        onWarnCancel: handleSubmitValidateCancel,
        msgListPrompt: intl
          .get('ssta.common.view.message.validErrorAndConfirmSubmitDoc', {
            documentName: settleTypeMeaning,
          })
          .d('存在以下校验未通过，请确认是否提交{documentName}'),
      });
    }
  }, [
    headerDS,
    settleTypeMeaning,
    getSaveSendData,
    handleSubmitValidateOk,
    handleSubmitValidateCancel,
  ]);

  // 判断阶段明细是否更新
  const handleValidateStageLineUpdate = useCallback(async () => {
    const sendData = await getSaveSendData();
    if (!sendData) return;
    headerDS.status = 'loading';
    const validatedResultDTO = getResponse(await validateStageLineUpdatePrepayment(sendData));
    headerDS.status = 'ready';
    if (!validatedResultDTO) return;
    const handleReMatchStageLine = async (action) => {
      if (action === 'ok') {
        headerDS.status = 'loading';
        const matchRes = getResponse(await reMatchStageLinePrepaymentSupplier(sendData));
        headerDS.status = 'ready';
        if (!matchRes) return false;
        paymentStageDs.query();
        headerDS.query(undefined, undefined, true);
        lineDS.query(undefined, undefined, true);
        // 校验警告提示 点了确定后不继续走下面逻辑，让用户再手动点提交
        return true;
      } else return handleSubmitValidate();
    };
    return getCustomValidationResponse(validatedResultDTO, handleReMatchStageLine, {
      okText: intl.get('ssta.common.view.message.validateOKText').d('更新并重新匹配阶段'),
    });
  }, [headerDS, handleSubmitValidate, getSaveSendData, paymentStageDs]);

  // 零行校验
  const handleValidateLine = useCallback(async () => {
    const sendData = await getSaveSendData();
    if (!sendData) return;
    const validRes = getResponse(await validatePrepaymentLine(sendData));
    if (!validRes) return;
    const { validatedResultDTO, prePaymentLineMap } = validRes;
    // 前端删除视图中零行记录，也要包括缓存行
    const deleteZeroRecords = (backEndDeleteIds = []) => {
      const deleteRecords = lineDS.all.filter(
        (record) =>
          math.isZero(record.get('prepaymentAmount')) ||
          backEndDeleteIds.includes(record.get('prepaymentLineId'))
      );
      lineDS.remove(deleteRecords, true);
      lineDS.query(undefined, undefined, true);
    };
    const deleteZeroLines = async (action) => {
      if (action === 'ok') {
        const { zeroAmountPrepaymentLines = [] } = prePaymentLineMap || {};
        // 后端删除数据（里面包含有新建数据）
        const backEndDeleteData = zeroAmountPrepaymentLines.filter(
          (item) => !isNil(item.prepaymentLineId)
        );
        const backEndDeleteIds = backEndDeleteData.map((item) => item.prepaymentLineId);
        if (!isEmpty(backEndDeleteData)) {
          headerDS.status = 'loading';
          const cancelRes = getResponse(await cancelPrepaymentLines(backEndDeleteData));
          headerDS.status = 'ready';
          if (!cancelRes) return;
          deleteZeroRecords(backEndDeleteIds);
          const oldCount = lineDS.totalCount;
          lineDS.totalCount = math.minus(oldCount, backEndDeleteData.length);
          headerDS.status = 'loading';
          const queryRes = getResponse(await getPrePaymentDetail(settleHeaderId, unitCodesHeader));
          headerDS.status = 'ready';
          if (!queryRes) return false;
          recordPickValues(headerDS.current, queryRes, ['prepaymentAmount', 'expectPaymentDate']);
        } else {
          deleteZeroRecords();
        }
      }
      return handleValidateStageLineUpdate();
    };
    return getCustomValidationResponse(validatedResultDTO, deleteZeroLines);
  }, [headerDS, lineDS, settleHeaderId, getSaveSendData, handleValidateStageLineUpdate]);

  const handleSubmit = useCallback(async () => {
    return handleValidateLine();
  }, [handleValidateLine]);

  const toLastDetailPage = useCallback(
    (key) => {
      updateTab({
        key: getActiveTabKey(),
        search: queryString.stringify({
          source: 'detail',
          settleHeaderId,
          type: key,
        }),
        state: {
          backPath: `${pathname}${search}`,
        },
      });
      history.push({
        pathname: '/ssta/new-supply-settle/pre-payment',
        search: queryString.stringify({
          source: 'detail',
          settleHeaderId,
          type: key,
        }),
        state: {
          backPath: `${pathname}${search}`,
        },
      });
    },
    [history, pathname, search, settleHeaderId]
  );

  const handleRevoke = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl.get(`ssta.costSheet.model.costSheet.withdrawning`).d('是否撤回？'),
    });
    if (confirmRes !== 'ok') return false;
    const sendData = headerDS.current?.toData() || {};
    headerDS.status = 'loading';
    const res = getResponse(await featchWithdraw(sendData));
    headerDS.status = 'ready';
    if (!res) return false;
    handleBackList();
  }, [headerDS, handleBackList]);

  // 删除
  const handleDeleteSettle = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.deleteSettleConfirm')
        .d('删除后将无法恢复，确认要删除当前单据吗?'),
    });
    if (confirmRes !== 'ok') return;
    const res = getResponse(await supplierPhysicsDelete({ settleHeaderId }));
    if (!res) return;
    handleBackList();
  }, [settleHeaderId, handleBackList]);

  /**
   * 头行一起保存
   */
  const handleSave = async () => {
    const sendData = await getSaveSendData({ actionType: 'save' });
    if (sendData) {
      if (remoteProps) {
        const beforeSaveRes = await remoteProps.event.fireEvent('beforeSave', {
          settleLineDs: lineDS,
          settleHeaderDs: headerDS,
          source,
        });
        if (beforeSaveRes === false) return false;
      }
      // beforeSave 二开事件中有更新ds数据的方法，需要获取最新数据
      const sendData = await getSaveSendData({ actionType: 'save' });
      headerDS.status = 'loading';
      const res = getResponse(await savePreSup(sendData));
      headerDS.status = 'ready';
      if (res && res.settleHeader) {
        if (source === 'create') {
          history.push({
            pathname: `/ssta/new-supply-settle/pre-payment`,
            search: queryString.stringify({
              source: 'detail',
              settleHeaderId: res.settleHeader.settleHeaderId,
              type: 'UPDATE',
            }),
          });
        } else if (source === 'detail') {
          notification.success();
          headerDS.query();
          lineDS.query(undefined, undefined, false);
          cuszLineDs.query();
          if (paymentStageDs) paymentStageDs.query();
        }
      }
    }
  };

  const handleCloseModifty = useCallback(async () => {
    headerDS.query();
    await lineDS.query(lineDS?.currentPage);
    lineDS.clearCachedSelected();
    cuszLineDs.query();
  }, [headerDS, lineDS, cuszLineDs]);

  // 批量编辑
  const handleBatchEdit = useCallback(() => {
    const settleHeaderIds = settleList.map((item) => item.settleHeaderId).join();
    Modal.open({
      drawer: true,
      closable: true,
      className: commonStyles['ssta-large-modal'],
      title: intl.get('ssta.common.view.title.batchEdit').d('批量编辑'),
      children: (
        <BatchEditHeader
          documentType="PREPAYMENT"
          settleHeaderIds={settleHeaderIds}
          okCallback={handleCloseModifty}
        />
      ),
    });
  }, [settleList, handleCloseModifty]);

  // 点击批量修改
  const handleBatchModify = () => {
    let editFieldNameList = [];
    if (lineDS.selected.length) {
      const firstSelectedRecord = lineDS.selected[0];
      // 审批页面不能修改编辑字段
      if (updateFlag) {
        // 从columns中查找所有渲染成编辑字段的标准列字段名
        const editorColumnNameList = columns.reduce((total, col) => {
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
        editFieldNameList = editorColumnNameList.reduce((total, name) => {
          //  去除ds禁用的字段名
          const field = lineDS.getField(name, firstSelectedRecord);
          return field.get('disabled') ? total : [...total, name];
        }, []);
      }
    }
    Modal.open({
      drawer: true,
      className: commonStyles['ssta-small-modal'],
      title: intl.get('ssta.common.button.bathModify').d('批量修改'),
      key: Modal.key(),
      children: (
        <BatchModifyModal
          customizeForm={customizeForm}
          updateFlag={updateFlag}
          lineDS={lineDS}
          editFieldNameList={editFieldNameList}
          headerDs={headerDS}
          closeCallback={handleCloseModifty}
        />
      ),
    });
  };

  const handleCancelLines = useCallback(async () => {
    const deleteRes = await lineDS.delete(lineDS.selected, getSelectedNegActConfirmMsg('delete'));
    if (!deleteRes) return;
    await lineDS.query(undefined, undefined, true);
    lineDS.clearCachedSelected();
    cuszLineDs.query();
    paymentStageDs.query();
    headerDS.status = 'loading';
    const queryRes = getResponse(await getPrePaymentDetail(settleHeaderId, unitCodesHeader));
    headerDS.status = 'ready';
    if (queryRes) {
      recordPickValues(headerDS.current, queryRes, ['prepaymentAmount', 'expectPaymentDate']);
    }
  }, [lineDS, headerDS, cuszLineDs, settleHeaderId, paymentStageDs]);

  /**
   * 行导出接口
   * @returns
   */
  const requestNewUrl = () => {
    const customizeUnitCode =
      'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH';
    return `/ssta/v1/${organizationId}/pre-payment-lines/supplier/export/prePaymentLineNew?customizeUnitCode=${customizeUnitCode}`;
  };

  /**
   * 导出参数
   */
  const getExportParams = () => {
    const { settleNum } = headerDS.current?.toData() || {};
    const prepaymentLineIdList = lineDS.selected.map((item) => item.get('prepaymentLineId'));
    const queryData = lineDS.queryDataSet.current?.toData() || {};
    if (lineDS.selected?.length > 0) {
      return filterNullValueObject({ prepaymentLineIdList, settleNums: [settleNum] });
    } else {
      return filterNullValueObject({ ...queryData, settleNums: [settleNum] });
    }
  };

  const readOnlyButtons = [
    createPermsMap.get(`${permPrefix}.detail.pay.newexport`) && (
      <ExcelExportPro
        buttonText={
          !isEmpty(lineDS.selected)
            ? intl.get('ssta.common.button.newLineTickExport').d('(新)行勾选导出')
            : intl.get('ssta.common.button.newLineExport').d('(新)行导出')
        }
        templateCode="SSTA_SETTLE_HEADER_DETAIL_PREPAYMENT_SUPPLIER_EXPORT"
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
        requestUrl={requestNewUrl()}
        queryParams={getExportParams}
        method="POST"
        allBody
      />
    ),
  ];
  // 有租户二开，导致新增行报错
  const normalPrepaymentTypeList = [
    'ORDER',
    'CONTRACT',
    'PO_LINE',
    'CONTRACT_STAGE',
    'CONTRACT_SUBJECT',
    'SUPPLIER',
  ];
  const buttons = [
    createPermsMap.get(`${buttonPermPrefix}.pre-line-add`) &&
      normalPrepaymentTypeList.includes(prepaymentType) && (
        <Button
          icon="playlist_add"
          onClick={() => handleAdd()}
          key="add"
          disabled={
            headerDS.current?.get('supplierSiteEnableFlag') === 1
              ? !(headerDS.current?.get('supplierSiteEnableFlag') && supplierSiteId)
              : false
          }
        >
          {intl.get('hzero.common.button.add').d('新增')}
        </Button>
      ),
    createPermsMap.get(`${buttonPermPrefix}.pre-line-delete`) && (
      <Button
        icon="delete_sweep"
        key="cancel"
        disabled={isEmpty(lineDS.selected)}
        onClick={handleCancelLines}
      >
        {intl.get('hzero.common.button.batchDelete').d('批量删除')}
      </Button>
    ),
    createPermsMap.get(`${buttonPermPrefix}.pre-line-batch-modify`) && (
      <Button icon="mode_edit" onClick={handleBatchModify} disabled={!lineDS.length}>
        {isEmpty(lineDS.selected)
          ? intl.get('ssta.common.button.batchModify').d('批量修改')
          : intl.get('ssta.common.button.selectedBatchModify').d('勾选批量修改')}
      </Button>
    ),
    createPermsMap.get(`${permPrefix}.detail.pay.newexport`) && (
      <ExcelExportPro
        buttonText={
          !isEmpty(lineDS.selected)
            ? intl.get('ssta.common.button.newLineTickExport').d('(新)行勾选导出')
            : intl.get('ssta.common.button.newLineExport').d('(新)行导出')
        }
        templateCode="SSTA_SETTLE_HEADER_DETAIL_PREPAYMENT_SUPPLIER_EXPORT"
        otherButtonProps={{
          type: 'c7n-pro',
          funcType: 'flat',
          color: 'primary',
          icon: 'unarchive',
        }}
        requestUrl={requestNewUrl()}
        queryParams={getExportParams}
        method="POST"
        allBody
      />
    ),
    createPermsMap.get(`${permPrefix}.detail.pay.newimport`) && (
      <Import
        buttonText={intl.get('ssta.common.button.newBatchUpdate').d('(新)批量编辑')}
        businessObjectTemplateCode="SSTA.PREPAYMENT_LINE_BATCH_UPDATE"
        buttonProps={{
          funcType: 'flat',
          color: 'primary',
          icon: 'archive',
        }}
        prefixPatch="/ssta"
        args={{
          tenantId: organizationId,
          templateCode: 'SSTA.PREPAYMENT_LINE_BATCH_UPDATE',
          settleHeaderId,
        }}
        successCallBack={async () => {
          headerDS.status = 'loading';
          const queryRes = getResponse(await getPrePaymentDetail(settleHeaderId, unitCodesHeader));
          headerDS.status = 'ready';
          if (queryRes) {
            recordPickValues(headerDS.current, queryRes, ['prepaymentAmount', 'expectPaymentDate']);
          }
          lineDS.query();
          cuszLineDs.query();
        }}
      />
    ),
  ];

  // 自定义行内 新建
  const handleAdd = () => {
    if (prepaymentType === 'SUPPLIER') {
      const amountPrecision = headerDS.current?.get('amountPrecision');
      lineDS.create({ amountPrecision }, 0);
    } else {
      Modal.open({
        drawer: true,
        className: commonStyles['ssta-large-modal'],
        title: intl.get('ssta.prePayment.view.title.add').d('新增'),
        key: Modal.key(),
        children: (
          <AddModal addLine={handleAddLine} headerDs={headerDS} createPermsMap={createPermsMap} />
        ),
        footer: null,
      });
    }
  };

  const handleAddLine = async (data, onClose) => {
    const onNext = async () => {
      headerDS.status = 'loading';
      const addRes = getResponse(await addLines({ list: data, settleHeaderId }));
      headerDS.status = 'ready';
      if (!addRes) return false;
      onClose();
      lineDS.query(undefined, undefined, true);
      cuszLineDs.query();
      paymentStageDs.query();
      const { prepaymentLineFirstCreateFlag } = addRes;
      if (Number(prepaymentLineFirstCreateFlag) === 1) {
        headerDS.query();
        return true;
      }
      headerDS.status = 'loading';
      const queryRes = getResponse(await getPreHeader(settleHeaderId, unitCodesHeader));
      headerDS.status = 'ready';
      if (queryRes) {
        recordPickValues(headerDS.current, queryRes);
      }
    };
    headerDS.status = 'loading';
    const validateRes = getResponse(await addLinesValidate({ list: data, settleHeaderId }));
    headerDS.status = 'ready';
    if (!validateRes) return;
    return getCustomValidationResponse(validateRes, onNext);
  };

  // 在做取消回退相关操作之前先弹框确认
  const operateBeforeConfirm = (actionType) => {
    const documentTypeMeaning = `${headerDS.current.get('documentTypeMeaning')}${intl
      .get('ssta.purchaseSettle.view.message.bill')
      .d('结算单')}`;
    const info = {
      action: actionType,
      bills: `${documentTypeMeaning}${headerDS.current.get('settleNum')}`,
      billType: documentTypeMeaning,
    };
    if (actionType === 'CANCEL') {
      confirmModal(info, handleCancel);
    }
  };

  /**
   * 取消
   */
  const handleCancel = async (filledData) => {
    const headerData = type === 'CANCEL' ? filledData : headerDS.current.toData();
    headerDS.status = 'loading';
    const res = getResponse(
      await cancelPrepaymentSup({
        body: [headerData],
        customizeUnitCode,
      })
    );
    headerDS.status = 'ready';
    if (!res) return false;
    handleSplitAction();
  };

  /**
   * 退回
   */
  const handleReturn = async (headerData) => {
    headerDS.status = 'loading';
    const res = getResponse(
      await returnPrepaymentSup({
        body: [headerData],
        customizeUnitCode,
      })
    );
    headerDS.status = 'ready';
    if (!res) return false;
    handleSplitAction();
  };

  /**
   * 确认
   */

  const handleConfirm = async (headerData) => {
    headerDS.status = 'loading';
    const res = getResponse(
      await confirmPrepaymentSup({
        body: [headerData],
        customizeUnitCode,
      })
    );
    headerDS.status = 'ready';
    if (!res) return false;
    handleSplitAction();
  };

  const handleFilledInfo = (action, onOk) => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: commonStyles['ssta-small-modal'],
      title: approveFlag
        ? intl.get(`${prefix}.view.title.approveInfo`).d('审核信息')
        : cancelFlag && intl.get(`${prefix}.view.title.cancelInfo`).d('取消信息'),
      children: (
        <FilledInfoModal
          onOk={onOk}
          action={action}
          headerDS={headerDS}
          custConfig={custConfig}
          customizeForm={customizeForm}
        />
      ),
    });
  };
  /**
   * 操作记录
   */
  const handleRecord = () => {
    const recordModal = Modal.open({
      title: intl.get(`${prefix}.view.title.operationHistory`).d('操作记录'),
      // mask: false,
      drawer: true,
      destroyOnClose: true,
      className: commonStyles['ssta-medium-modal'],
      // style: { width: 800 },
      children: <SettlementSheet settleHeaderId={settleHeaderId} />,
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
  const companyNumLovChange = () => {
    headerDS.current.set('supplierCompanyNumLov', null);
    headerDS.current.set('bankIdLov', null);
  };

  const editFlag = !updateFlag && source === 'detail';

  const titleObj = {
    ALL: intl.get(`${prefix}.view.title.settleView`).d('结算单查看'),
    UPDATE: intl.get(`${prefix}.view.title.settleUpdate`).d('结算单维护'),
    APPROVE: intl.get(`${prefix}.view.title.settleApprove`).d('结算单审核'),
    CANCEL: intl.get(`${prefix}.view.title.settleCancel`).d('结算单取消'),
    NUM: intl.get(`${prefix}.view.title.settleDetail`).d('结算单详情'),
    CREATE: intl.get(`${prefix}.view.title.settleCreate`).d('结算单创建'),
  };

  const supplierSiteChange = (record) => {
    const supplierSiteEnableFlag = headerDS.current.get('supplierSiteEnableFlag');
    if (supplierSiteEnableFlag === 1) {
      setSupplierSiteId(record?.supplierSiteId);
      headerDS.current.set('supplierSiteId', record?.supplierSiteId);
    }
  };

  const linkList = useMemo(() => {
    return [
      {
        key: 'basic',
        href: `supply-pre-settle-basic-${settleHeaderId}`,
        title: intl.get(`ssta.supplySettle.view.title.basicInfo`).d('基本信息'),
      },
      {
        key: 'pay',
        href: `supply-pre-settle-pay-${settleHeaderId}`,
        title: intl.get(`ssta.supplySettle.view.title.collectionInfo`).d('收款信息'),
      },
      source === 'detail' && {
        key: 'line',
        href: `supply-pre-settle-line-${settleHeaderId}`,
        title: intl.get(`ssta.supplySettle.view.title.settleDetailInfo`).d('结算明细信息'),
      },
      source === 'detail' && {
        key: 'cuszLine',
        href: `supply-pre-settle-cuszLine-${settleHeaderId}`,
        title: intl.get(`ssta.supplySettle.view.title.preCuszExpandLine`).d('个性化扩展行'),
      },
      source === 'detail' && {
        key: 'paymentStage',
        href: `purchase-pre-settle-paymentStage-${settleHeaderId}`,
        title: intl.get(`ssta.purchaseSettle.view.title.paymentStage`).d('付款阶段信息'),
      },
      {
        key: 'other',
        href: `supply-pre-settle-other-${settleHeaderId}`,
        title: intl.get(`ssta.supplySettle.view.title.otherInfo`).d('其他信息'),
      },
      source === 'detail' && {
        key: 'attachment',
        href: `supply-pre-settle-attachment-${settleHeaderId}`,
        title: intl.get(`ssta.supplySettle.view.message.panel.attachment`).d('附件'),
      },
    ].filter(Boolean);
  }, [settleHeaderId, source]);

  const detailTabPaneRender = () => {
    const {
      supplierSiteEnableFlag,
      settleNum,
      currencyCode,
      amountPrecision,
      taxAmount,
      prepaymentAmount,
      netAmount,
      // documentTypeMeaning,
      showUxFlag,
    } = headerDS.current?.toData() || {};
    const summaryProps = {
      title: intl.get(`ssta.common.view.message.title.prePayment`).d('预付款'),
      num: settleNum,
      currencyCode,
      taxAmount: formatNumber(taxAmount, amountPrecision),
      taxIncludedAmount: formatNumber(prepaymentAmount, amountPrecision),
      netAmount: formatNumber(netAmount, amountPrecision),
      desc: intl.get(`ssta.common.view.message.prePayment`).d('预付款'),
      changeFixed: () => {
        setPinFixed(!pinFixed);
      },
      totalText: intl.get(`ssta.common.view.message.summaryOfPrePayment`).d('预付款金额汇总'),
      noAmount: true,
      pinFixed,
      notPub,
      showCardFlag: showUxFlag,
      refundStatus,
      prepaymentRefundAmount: formatNumber(prepaymentRefundAmount, amountPrecision),
      associatedPrepaymentAmount: formatNumber(associatedPrepaymentAmount, amountPrecision),
      refundCompletedPreAmount: formatNumber(refundCompletedPreAmount, amountPrecision),
      origPrepaymentAmount: formatNumber(origPrepaymentAmount, amountPrecision),
      sumRefundCompletedAmount: formatNumber(
        math.isNaN(sumRefundCompletedAmount) ? 0 : sumRefundCompletedAmount,
        amountPrecision
      ),
    };
    const allLoading = headerDS.status !== 'ready';
    return (
      <div
        className={`${modalFlag && commonStyles['ssta-detail-modal-content']} ${
          commonStyles['ssta-detail-content']
        } ssta-detail-splite-content
      }`}
        id={`supply-pre-settle-detail-content-${settleHeaderId}`}
      >
        <Spin spinning={allLoading}>
          {source === 'detail' && <Summary summaryProps={summaryProps} />}
          <div className="ssta-detail-collapse-content">
            {customizeCollapse(
              {
                code: collapseCode,
              },
              <Collapse
                ghost
                trigger="icon"
                expandIconPosition="text-right"
                defaultActiveKey={defaultActiveKey}
              >
                <Panel
                  forceRender
                  key="basic"
                  header={intl.get(`ssta.supplySettle.view.title.basicInfo`).d('基本信息')}
                  dataSet={headerDS}
                  id={`supply-pre-settle-basic-${settleHeaderId}`}
                >
                  {customizeForm(
                    {
                      code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_BASIC_INFO',
                      readOnly: readOnlyFlag,
                      __force_record_to_update__: true,
                    },
                    <Form
                      useWidthPercent
                      dataSet={headerDS}
                      columns={3}
                      useColon={false}
                      labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
                    >
                      <FormItem
                        name="settleNum"
                        editor="textfield"
                        editable={updateFlag || source === 'create'}
                        disabled
                      />
                      <FormItem
                        name="settleStatus"
                        editor="select"
                        disabled
                        editable={updateFlag || source === 'create'}
                        renderer={
                          updateFlag || source === 'create' ? ({ text }) => text : statusTagRender
                        }
                      />
                      <FormItem
                        name="campMeaning"
                        disabled
                        editor="textfield"
                        editable={updateFlag || source === 'create'}
                      />
                      <FormItem
                        name="creationDate"
                        disabled
                        editor="datepicker"
                        editable={updateFlag || source === 'create'}
                      />
                      <FormItem
                        name="createdUserName"
                        disabled
                        editor="textfield"
                        editable={updateFlag || source === 'create'}
                      />
                      <FormItem
                        name="settleTypeMeaning"
                        disabled
                        editable={updateFlag || source === 'create'}
                      />
                      <FormItem name="companyNum" disabled={updateFlag || source === 'create'} />
                      <FormItem
                        name="companyNumLov"
                        editor="lov"
                        editable={updateFlag || source === 'create'}
                        onChange={companyNumLovChange}
                        disabled={updateFlag}
                      />
                      <FormItem
                        editor="lov"
                        editable={updateFlag || source === 'create'}
                        name="currencyCodeLov"
                        disabled={updateFlag}
                      />

                      <FormItem
                        name="supplierCompanyNum"
                        disabled={updateFlag || source === 'create'}
                        renderer={({ record }) =>
                          source === 'create'
                            ? record?.get('supplierCompanyNumLov')?.displaySupplierNum
                            : record?.get('supplierCompanyNum')
                        }
                      />

                      <FormItem
                        editor="lov"
                        editable={updateFlag || source === 'create'}
                        disabled={updateFlag}
                        name="supplierCompanyNumLov"
                        renderer={({ record, value }) =>
                          source === 'create'
                            ? value?.displayValue
                            : record?.get('supplierCompanyName')
                        }
                      />
                      <FormItem
                        editor="lov"
                        editable={type === 'UPDATE' || source === 'create'}
                        disabled={type === 'UPDATE'}
                        name="ouIdLov"
                      />
                      {supplierSiteEnableFlag === 1 && (
                        <FormItem
                          name="supplierSiteLov"
                          editor="lov"
                          disabled={!updateFlag}
                          editable={updateFlag}
                          onChange={supplierSiteChange}
                        />
                      )}
                      <FormItem name="unitName" disabled={updateFlag || source === 'create'} />
                      <FormItem
                        name="remark"
                        newLine
                        colSpan={2}
                        editor="textarea"
                        resize="vertical"
                        editable={updateFlag || source === 'create'}
                      />
                      {formItemRender({
                        name: 'approvedRemark',
                        editor: TextArea,
                        newLine: true,
                        colSpan: 2,
                        resize: 'vertical',
                        editorDisabled: updateFlag,
                        visible:
                          source === 'detail' &&
                          !['NEW', 'WAIT_SUPPLIER_CONFIRM'].includes(settleStatus) &&
                          !(settleStatus === 'SUBMITED' && approveFlag),
                      })}
                      {formItemRender({
                        name: 'canceledRemark',
                        editor: TextArea,
                        newLine: true,
                        colSpan: 2,
                        resize: 'vertical',
                        editorDisabled: updateFlag,
                        visible:
                          source === 'detail' &&
                          ![
                            'NEW',
                            'RETURN',
                            'SUBMITED',
                            'SUBMITED_APPROVING',
                            'WAIT_SUPPLIER_CONFIRM',
                            'WAIT_SUPPLIER_CANCEL',
                            'ES_SUBMITED_APPROVING',
                          ].includes(settleStatus) &&
                          !(settleStatus === 'CANCELING' && approveFlag),
                      })}
                      {formItemRender({
                        name: 'canceledReason',
                        editor: TextArea,
                        newLine: true,
                        colSpan: 2,
                        resize: 'vertical',
                        editorDisabled: updateFlag,
                        visible:
                          source === 'detail' &&
                          ![
                            'NEW',
                            'RETURN',
                            'SUBMITED',
                            'SUBMITED_APPROVING',
                            'WAIT_SUPPLIER_CONFIRM',
                            'ES_SUBMITED_APPROVING',
                          ].includes(settleStatus) &&
                          !cancelFlag,
                      })}
                      {formItemRender({
                        name: 'refundStatus',
                        editorDisabled: updateFlag || source === 'create',
                      })}
                      {formItemRender({
                        name: 'associatedPreSettleNum',
                        editorDisabled: updateFlag || source === 'create',
                        editor: TextArea,
                        newLine: true,
                        resize: 'vertical',
                      })}
                    </Form>
                  )}
                </Panel>
                <Panel
                  forceRender
                  key="pay"
                  header={intl.get(`ssta.supplySettle.view.title.collectionInfo`).d('收款信息')}
                  dataSet={headerDS}
                  id={`supply-pre-settle-pay-${settleHeaderId}`}
                >
                  {(updateFlag || source === 'create') && (
                    <DynamicAlert
                      requestUrl={`${SRM_SSTA}/v1/${organizationId}/settle-headers/bank-prompt-default`}
                    />
                  )}
                  {customizeForm(
                    {
                      code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_INFO',
                      readOnly: readOnlyFlag,
                    },
                    <Form
                      useWidthPercent
                      dataSet={headerDS}
                      columns={3}
                      useColon={false}
                      labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
                    >
                      <FormItem
                        name="prepaymentType"
                        editor="select"
                        editable={updateFlag || source === 'create'}
                        disabled={updateFlag}
                      />
                      {refundStatus !== 'REFUND'
                        ? [
                          <FormItem
                            name="prepaymentAmount"
                            disabled={updateFlag || source === 'create'}
                            editor="numberfield"
                          />,
                          <FormItem
                            name="bankIdLov"
                            editor="lov"
                            editable={updateFlag || source === 'create'}
                          />,
                          <FormItem
                            name="bankBranchName"
                            disabled={updateFlag || source === 'create'}
                          />,
                          <FormItem
                            name="bankAccountNum"
                            disabled={updateFlag || source === 'create'}
                          />,
                          <FormItem
                            name="bankAccountName"
                            disabled={updateFlag || source === 'create'}
                          />,
                          <FormItem
                            name="paymentMethodLov"
                            editor="lov"
                            editable={updateFlag || source === 'create'}
                          />,
                          <FormItem
                            name="paymentCondition"
                            editor="lov"
                            editable={updateFlag || source === 'create'}
                          />,
                          <FormItem
                            name="expectPaymentDate"
                            editor="datepicker"
                            editable={updateFlag || source === 'create'}
                          />,
                          ]
                        : [
                          <FormItem
                            name="prepaymentRefundAmount"
                            disabled={updateFlag || source === 'create'}
                            editor="numberfield"
                          />,
                          ]}
                      {Boolean(paymentControlRuleSource) &&
                        [
                          'planNum',
                          'versionNumber',
                          'planStageNum',
                          'planStageDesc',
                          'planStageAmount',
                          'planStageBalance',
                          'planStagePercent',
                          'planStageStartDate',
                          'planStageEndDate',
                        ].map((name) =>
                          formItemRender({
                            name,
                            editorDisabled: updateFlag,
                          })
                        )}
                    </Form>
                  )}
                </Panel>
                {source === 'detail' && (
                  <Panel
                    forceRender
                    key="line"
                    header={intl
                      .get(`ssta.supplySettle.view.title.settleDetailInfo`)
                      .d('结算明细信息')}
                    dataSet={lineDS}
                    id={`supply-pre-settle-line-${settleHeaderId}`}
                    className={commonStyles['ssta-no-expand-search-bar-wrapper']}
                  >
                    {customizeTable(
                      {
                        code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTIONDETAIL',
                        readOnly: editFlag,
                      },
                      <SearchBarTable
                        searchCode="SSTA.SUPPLY_SETTLE_DETAIL.PRE_TRANSACTION_DETAIL_SEARCH"
                        dataSet={lineDS}
                        columns={columns}
                        queryBar="none"
                        buttons={
                          refundStatus !== 'REFUND'
                            ? readOnlyFlag || (!updateFlag && source === 'detail')
                              ? readOnlyButtons
                              : buttons
                            : []
                        }
                        style={{ maxHeight: 430 }}
                        searchBarConfig={{
                          closeFilterSelector: true,
                        }}
                      />
                    )}
                  </Panel>
                )}
                {source === 'detail' && (
                  <Panel
                    forceRender
                    key="cuszLine"
                    id={`supply-pre-settle-cuszLine-${settleHeaderId}`}
                    header={intl
                      .get(`ssta.supplySettle.view.title.preCuszExpandLine`)
                      .d('个性化扩展行')}
                  >
                    <CuszLineSlot
                      cuszLineDs={cuszLineDs}
                      readOnlyFlag={readOnlyFlag}
                      customizeTable={customizeTable}
                    />
                  </Panel>
                )}
                {source === 'detail' && (
                  <Panel
                    forceRender
                    key="paymentStage"
                    id={`purchase-pre-settle-paymentStage-${settleHeaderId}`}
                    header={intl
                      .get(`ssta.purchaseSettle.view.title.paymentStage`)
                      .d('付款阶段信息')}
                    className={commonStyles['ssta-no-expand-search-bar-wrapper']}
                  >
                    <PaymentStage
                      headerDS={headerDS}
                      updateFlag={updateFlag}
                      readOnlyFlag={readOnlyFlag}
                      customizeTable={customizeTable}
                      paymentStageDs={paymentStageDs}
                      getSaveSendData={getSaveSendData}
                      lineDS={lineDS}
                    />
                  </Panel>
                )}
                <Panel
                  forceRender
                  key="other"
                  header={intl.get(`ssta.supplySettle.view.title.otherInfo`).d('其他信息')}
                  dataSet={headerDS}
                  id={`supply-pre-settle-other-${settleHeaderId}`}
                >
                  {customizeForm(
                    {
                      code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_PAYMENT_OTHER_INFO',
                      readOnly: readOnlyFlag,
                    },
                    <Form
                      useWidthPercent
                      dataSet={headerDS}
                      columns={3}
                      useColon={false}
                      labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
                    >
                      <FormItem
                        name="confirmCollaborativeModeMeaning"
                        disabled={updateFlag || source === 'create'}
                      />
                      <FormItem
                        name="confirmApproveMethodMeaning"
                        disabled={updateFlag || source === 'create'}
                      />
                      <FormItem
                        name="cancelCollaborativeModeMeaning"
                        disabled={updateFlag || source === 'create'}
                      />
                      <FormItem
                        name="cancelApproveMethodMeaning"
                        disabled={updateFlag || source === 'create'}
                      />
                      {formItemRender({
                        name: 'paymentControlRuleSource',
                        visible: headerDS.current?.get('paymentControlRuleSource') || false,
                        editorDisabled: updateFlag || source === 'create',
                      })}
                    </Form>
                  )}
                </Panel>
                {source === 'detail' && (
                  <Panel
                    forceRender
                    key="attachment"
                    header={intl.get(`ssta.supplySettle.view.message.panel.attachment`).d('附件')}
                    dataSet={headerDS}
                    id={`supply-pre-settle-attachment-${settleHeaderId}`}
                  >
                    {customizeForm(
                      {
                        code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_OTHER_ENCLOSURE',
                      },
                      <Form
                        dataSet={headerDS}
                        columns={2}
                        useColon={false}
                        labelLayout={updateFlag || source === 'create' ? 'float' : 'vertical'}
                      >
                        <Attachment
                          name="attachmentUuid"
                          showHistory={!updateFlag}
                          labelLayout="float"
                          readOnly={!updateFlag}
                          bucketDirectory="ssta-prepayment"
                          fieldClassName={commonStyles['attachment-float-wrapper']}
                        />
                        {remoteProps &&
                          remoteProps.process(
                            'SSTA_SUPPLYSETTLE_DETAIL_PRE_CUX_ATTACHMENT_INFO',
                            '',
                            {
                              formDs: headerDS,
                              updateFlag,
                            }
                          )}
                      </Form>
                    )}
                  </Panel>
                )}
              </Collapse>
            )}
          </div>
          {isEmpty(settleList) && (
            <NavigationAnchor
              linkList={linkList}
              currentOffsetTop={200}
              custConfig={custConfig[collapseCode]}
              id={`supply-pre-settle-detail-content-${settleHeaderId}`}
            />
          )}
        </Spin>
      </div>
    );
  };

  const headerBtns = () => {
    let allBtns = [];
    const allLoading = headerDS.status !== 'ready';
    const deleteBtn = source === 'detail' &&
      createPermsMap.get(`${buttonPermPrefix}.delete`) &&
      ['NEW'].includes(settleStatus) && {
        name: 'update-delete',
        child: intl.get('hzero.common.button.detele').d('删除'),
        btnProps: {
          icon: 'delete',
          loading: allLoading,
          onClick: handleDeleteSettle,
        },
      };
    if (type === 'NUM') {
      allBtns = [
        updateBtn &&
          createPermsMap.get(`${permPrefix}.radio.button.update`) && {
            name: 'readOnlyEdit',
            child: intl.get('hzero.common.button.edit').d('编辑'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'mode_edit',
              onClick: () => toLastDetailPage('UPDATE'),
              loading: allLoading,
            },
          },
        approveBtn &&
          createPermsMap.get(`${permPrefix}.radio.button.audit`) && {
            name: 'readOnlyApprove',
            child: intl.get('ssta.common.button.approve').d('审核'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'authorize',
              onClick: () => toLastDetailPage('APPROVE'),
              loading: allLoading,
            },
          },
        camp === 'SUPPLIER' &&
          ((['SUBMITED'].includes(settleStatus) &&
            createPermsMap.get(`${permPrefix}.radio.button.recall`)) ||
            (['SUBMITED_APPROVING'].includes(settleStatus) &&
              createPermsMap.get(`${buttonPermPrefix}.recall-workflow`)) ||
            (['ES_SUBMITED_APPROVING'].includes(settleStatus) &&
              createPermsMap.get(`${buttonPermPrefix}.recall-ext-sys`))) && {
            name: 'revoke',
            child: intl.get('hzero.common.button.recall').d('撤回'),
            btnProps: {
              icon: 'reply',
              wait: 1500,
              loading: allLoading,
              onClick: handleRevoke,
            },
          },
        cancelBtn &&
          createPermsMap.get(`${permPrefix}.radio.button.cancel`) && {
            name: 'readOnlyCancel',
            child: intl.get('hzero.common.button.cancel').d('取消'),
            btnProps: {
              type: 'c7n-pro',
              icon: 'cancel',
              onClick: () => toLastDetailPage('CANCEL'),
              loading: allLoading,
            },
          },
        printBtnDisable !== 1 &&
          createPermsMap.get(`${buttonPermPrefix}.print-detail`) && {
            name: 'print',
            child: intl.get('hzero.common.button.print').d('打印'),
            btnProps: {
              icon: 'print',
              onClick: handlePrint,
              loading: allLoading,
              funcType: 'flat',
              color: 'default',
              wait: 1000,
            },
          },
        printBtnDisable !== 1 &&
          createPermsMap.get(`${buttonPermPrefix}.new-print-detail`) && {
            name: 'newPrint',
            btnComp: PrintProButton,
            childFor: 'buttonText',
            child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
            btnProps: {
              buttonProps: { funcType: 'flat', wait: 1000 },
              requestUrl: `${apiPrefix}/settle-headers/list-print-new`,
              method: 'PUT',
              data: { settleHeaderIdList: [settleHeaderId], menuCamp: 'SUPPLIER' },
              successCallBack: handleNewPrintOkCallback,
              loading: allLoading,
            },
          },
        {
          name: 'readOnlyOperating',
          child: intl.get('hzero.common.button.operating').d('操作记录'),
          btnProps: {
            icon: 'operation_service_request',
            onClick: handleRecord,
            loading: allLoading,
            funcType: 'flat',
            color: 'default',
          },
        },
        deleteBtn,
      ];
    } else {
      allBtns = [
        updateFlag &&
          source === 'detail' && {
            name: 'submit',
            child: intl.get('hzero.common.button.submit').d('提交'),
            btnProps: {
              icon: 'check_circle',
              onClick: handleSubmit,
              loading: allLoading,
              disabled: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        (source === 'create' || (updateFlag && source === 'detail')) && {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
            icon: 'save',
            onClick: handleSave,
            loading: allLoading,
            disabled: allLoading,
            wait: 1500,
            waitType: 'throttle',
          },
        },
        source === 'detail' &&
          (updateFlag || cancelFlag) && {
            name: 'cancel',
            child: intl.get('hzero.common.button.cancel').d('取消'),
            btnProps: {
              icon: 'cancel',
              onClick: () => {
                if (updateFlag) {
                  return operateBeforeConfirm('CANCEL');
                }
                if (cancelFlag) {
                  return handleFilledInfo('CANCEL', handleCancel);
                }
              },
              loading: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        updateFlag &&
          settleList.length > 1 &&
          createPermsMap.get(`${buttonPermPrefix}.pre-head-batch-edit`) && {
            name: 'batchEdit',
            child: intl.get('ssta.common.view.button.batchEdit').d('批量编辑'),
            btnProps: {
              icon: 'mode_edit',
              loading: allLoading,
              onClick: handleBatchEdit,
            },
          },
        approveFlag &&
          source === 'detail' && {
            name: 'confirm',
            child: intl.get('hzero.common.button.confirm').d('确认'),
            btnProps: {
              icon: 'check',
              onClick: () => handleFilledInfo('CONFIRM', handleConfirm),
              loading: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        approveFlag &&
          source === 'detail' && {
            name: 'return',
            child: intl.get('hzero.common.button.return').d('退回'),
            btnProps: {
              icon: 'reply',
              onClick: () => handleFilledInfo('RETURN', handleReturn),
              loading: allLoading,
              wait: 1500,
              waitType: 'throttle',
            },
          },
        printBtnDisable !== 1 &&
          source === 'detail' &&
          createPermsMap.get(`${buttonPermPrefix}.print-detail`) && {
            name: 'print',
            child: intl.get('hzero.common.button.print').d('打印'),
            btnProps: {
              icon: 'print',
              onClick: handlePrint,
              loading: allLoading,
              funcType: 'flat',
              color: 'default',
              wait: 1000,
            },
          },
        source === 'detail' &&
          printBtnDisable !== 1 &&
          createPermsMap.get(`${buttonPermPrefix}.new-print-detail`) && {
            name: 'newPrint',
            btnComp: PrintProButton,
            childFor: 'buttonText',
            child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
            btnProps: {
              buttonProps: { funcType: 'flat' },
              requestUrl: `${apiPrefix}/settle-headers/list-print-new`,
              method: 'PUT',
              data: { settleHeaderIdList: [settleHeaderId] },
              successCallBack: handleNewPrintOkCallback,
              loading: allLoading,
            },
          },
        source === 'detail' && {
          name: 'operating',
          child: intl.get('hzero.common.button.operating').d('操作记录'),
          btnProps: {
            icon: 'operation_service_request',
            onClick: handleRecord,
            loading: allLoading,
            funcType: 'flat',
            color: 'default',
          },
        },
        deleteBtn,
      ];
    }
    const processBtns = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_PRE_CUX_HEAER_BTNS', allBtns, {
          type,
          remotePageData,
        })
      : allBtns;
    return formatDynamicBtns(processBtns);
  };

  const handleTabChange = useCallback((newActiveKey) => {
    setActiveKey(newActiveKey);
  }, []);

  // 网络错误，接口错误拦截
  if (settleHeaderId && !headerDS.current?.get('settleHeaderId')) return <Spin />;

  return (
    <Fragment>
      {!headerHideFlag && (
        <Header
          title={notPub ? (source === 'create' ? titleObj.CREATE : titleObj[type]) : ''}
          backPath={notPub ? state?.backPath || '/ssta/new-supply-settle/list' : null}
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
            {
              code: 'SSTA.SUPPLY_SETTLE_DETAIL.PRE_HEAD_BTNS',
              pro: true,
            },
            <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={headerBtns()} />
          )}
        </Header>
      )}
      {settleList.length > 1 ? (
        <Tabs
          defaultActiveKey={settleHeaderId}
          tabPosition="left"
          onChange={handleTabChange}
          tabBarExtraContent={<SplitTabBarExtra />}
          className={styles['settle-detail-tabs']}
        >
          {settleList.map((item) => (
            <Tabs.TabPane tab={item.settleNum} key={item.settleHeaderId}>
              {detailTabPaneRender(item.settleHeaderId)}
            </Tabs.TabPane>
          ))}
        </Tabs>
      ) : (
        detailTabPaneRender(settleHeaderId)
      )}
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'ssta.prePayment',
      'ssta.supplySettle',
      'entity.attachment',
      'ssta.purchaseSettle',
      'ssta.common',
      'ssta.costSheet',
      'ssta.invoiceSheet',
      'ssta.purchaseInvoicePool',
      'ssta.supplyInvoicePool',
    ],
  }),
  withCustomize({
    unitCode,
  }),
  remote({
    code: 'SSTA_SUPPLYSETTLE_DETAIL_PRE_CUX',
    name: 'remote',
  }),
  observer
)(Detail);
