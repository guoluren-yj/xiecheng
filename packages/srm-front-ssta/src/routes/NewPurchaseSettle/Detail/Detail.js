/*
 * @Description: file content
 * @Date: 2022-01-27 22:03:39
 * @Author: JSS <shangshang.jing@gong-link.com>se
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { parse, stringify } from 'querystring';
import React, { Fragment, useContext, useMemo, useCallback, useEffect, useState } from 'react';
import { Tabs, Modal, useModal, SelectBox, Tooltip, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty, isNil } from 'lodash';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import PrintProButton from '_components/PrintProButton';
import DynamicButtons from '_components/DynamicButtons';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import { SettlementSheet } from '@/routes/Components';
import { formatErrorInfo } from '@/routes/Components/ErrorInfo';
import {
  recordsCommit,
  recordPickValues,
  getValidationResponse,
  formatNumber,
  formatDynamicBtns,
} from '@/utils/utils';
import {
  getSettleHeaderData,
  getSettlelinesByIds,
  invoiceCheck,
  print,
  syncPrintData,
  cancelPurchaseSettleLine,
  debounceSubmitValidate,
  getSettleApproveWay,
  fetchInvoicePlatformRed,
} from '@/services/settlePoolServices';
import { getBusinessRules } from '@/services/invoicePurPoolService';
import { taxInvoiceCheckFlagger } from '@/utils/amountConfig';
import Styles from '@/routes/common.less';

import { useModalOpen } from '../hooks';
import { Store } from './StoreProvider';
import styles from './index.less';
import DetailContent from './DetailContent';
import MainStrategy from '../components/MainStrategy';
import FilledInfoModal from '../components/FilledInfoModal';
import BatchEditHeader from '../components/BatchEditHeader';
import SplitTabBarExtra from '../components/SplitTabBarExtra';
import PayApplyExcuteQuery from '../components/PayApplyExcuteQuery';
import InvoiceProgressQuery from '../components/InvoiceProgressQuery';
import RedInvConfirm from '../components/RedConfirm';
import BatchSettleList from '../components/BatchSettlePayment/settleList';
import { getCustomValidationResponse } from '@/components/CustomValidation';
import { handleViewBatchNum } from '../BatchSubmit/modal';
import RedInkTaxInvoice from '../components/RedInkTaxInvoice';

const lineCodes = {
  PAYMENT:
    'SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH',
  INVOICE:
    'SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTIONDETAIL,SSTA.PURCHASE_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH',
};

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${organizationId}`;

export default observer(() => {
  const {
    type,
    state,
    search,
    notPub,
    history,
    loading,
    syncBtn,
    syncFlag,
    pathname,
    isEditPub,
    updateBtn,
    cancelBtn,
    approveBtn,
    allFlag,
    updateFlag,
    cancelFlag,
    approveFlag,
    settleHeader,
    settleStatus,
    settleLineDs,
    documentType,
    permissionMap,
    workflowCaller,
    settleHeaderDs,
    settleHeaderId,
    checkPointCode,
    enableCheckFlag,
    customizeBtnGroup,
    taxInvoiceDs,
    activeKey,
    setActiveKey,
    setSettleList,
    settleList,
    toleAdjustManualCuxFlag,
    payAutoAssignPermission,
    remoteProps,
    docLinkFlag,
    isNewPub,
    source,
    headerHideFlag,
    customizeTable,
    paymentStageDs,
    batchApproveId,
    custConfig,
  } = useContext(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const {
    camp,
    settleNum = '',
    settleTypeMeaning = '',
    settleType = '',
    amountAdjustFlag,
    invoiceUxFlag,
    sstaAiApproveResult,
    settleConfigNum,
    amountPrecision,
    printBtnDisable,
    invoiceMatchRuleCode,
    directInvoicingType,
    invoiceSettleCancelFlag,
    enableRedConfirmFlag,
  } =
    settleHeader?.get([
      'camp',
      'settleNum',
      'settleTypeMeaning',
      'settleType',
      'amountAdjustFlag',
      'invoiceUxFlag',
      'sstaAiApproveResult',
      'settleConfigNum',
      'amountPrecision',
      'printBtnDisable',
      'invoiceMatchRuleCode',
      'directInvoicingType',
      'invoiceSettleCancelFlag',
      'enableRedConfirmFlag',
    ]) || {};

  const { aiApproveStatus } = sstaAiApproveResult || {};

  const amountMap =
    settleHeaderDs.current?.get([
      'invoiceTaxIncludedAmount',
      'invoiceNetAmount',
      'invoiceTaxAmount',
      'invoiceDifferenceAmount',
      'diffNetAmount',
      'diffTaxAmount',
    ]) || {};

  const [
    invoiceTaxIncludedAmount,
    invoiceNetAmount,
    invoiceTaxAmount,
    invoiceDifferenceAmount,
    diffNetAmount,
    diffTaxAmount,
  ] = Object.values(amountMap).map((item) => formatNumber(item || 0, amountPrecision));

  const titleObj = {
    view: intl.get(`ssta.purchaseSettle.view.title.settleView`).d('结算单查看'),
    update: intl.get(`ssta.purchaseSettle.view.title.settleUpdate`).d('编辑结算单'),
    approve: intl.get(`ssta.purchaseSettle.view.title.settleApprove`).d('结算单审核'),
    cancel: intl.get(`ssta.purchaseSettle.view.title.settleCancel`).d('结算单取消'),
    sync: intl.get(`ssta.purchaseSettle.view.title.settleSync`).d('结算单同步'),
    all: intl.get(`ssta.purchaseSettle.view.title.settleDetail`).d('结算单详情'),
  };
  const title = notPub ? titleObj[type] : '';
  const backPath =
    notPub && !Number(docLinkFlag) ? state?.backPath || '/ssta/new-purchase-settle/list' : null;

  const cuxShowHeaderBtnFlag = remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_BTNS_AREA', true, {
    source,
  });

  const [enableDirInvFlag, setEnableDirInvFlag] = useState(false);

  useEffect(() => {
    fetchEnableDirInvConfig();
  }, [fetchEnableDirInvConfig]);

  const fetchEnableDirInvConfig = useCallback(async () => {
    const res = getResponse(await getBusinessRules({ cnfCode: 'SITE.SSTA.ENABLE_DIRECT_INVOICE' }));
    if (res) {
      setEnableDirInvFlag(Boolean(res));
    }
  }, [setEnableDirInvFlag]);

  const getEcInvCancelInfo = useCallback(() => {
    let message;
    const withCancelEcSettleFlag = Number(invoiceSettleCancelFlag) === 1;
    if (
      settleType === 'INVOICE' &&
      ['INVOICE_EXCEPTION', 'INVOICE_SUCCESS', 'CONFIRM'].includes(settleStatus) &&
      invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
      directInvoicingType === 'EC'
    ) {
      message = withCancelEcSettleFlag
        ? intl
            .get('ssta.common.view.message.autoRedOffsetTaxInvoiceTip', { settleConfigNum })
            .d(
              '根据单据主策略【{settleConfigNum}】发票匹配规则配置，您取消发票结算单成功后，将自动红冲税票'
            )
        : intl
            .get('ssta.common.view.message.offlineProcessSyncCancelTip')
            .d(
              '您当前正发起取消发票结算单，由于您结算策略未配置票单同步取消，srm取消成功后，需要您线下联系电商人员处理对方系统单据，否则将会阻塞您下次线上直连开票流程'
            );
    }
    return { ecInvCancelMsg: message, withCancelEcSettleFlag };
  }, [
    settleType,
    settleStatus,
    settleConfigNum,
    directInvoicingType,
    invoiceMatchRuleCode,
    invoiceSettleCancelFlag,
  ]);

  const handleSetActiveKey = useCallback(
    async (key) => {
      const { updated } = settleHeaderDs;
      const { updated: updatedLine } = settleLineDs;
      if (
        batchApproveId &&
        ((updated?.length > 0 && !isNil(updated[0]?.dirtyData)) || updatedLine.length > 0)
      ) {
        const confirmRes = await Modal.confirm({
          title: intl.get('ssta.common.view.title.tip').d('提示'),
          children: intl
            .get('ssta.common.view.message.batchChangeTips')
            .d('有信息未保存，切换新单后，本单未保存信息将会丢失，请确认是否切换'),
          okText: intl.get('ssta.common.view.message.saveAndChange').d('保存并切换'),
          cancelText: intl.get('ssta.common.view.message.noSaveAndChange').d('无需保存，直接切换'),
        });
        if (confirmRes === 'ok') {
          const res = await handleSave();
          if (!res) return false;
        }
      }
      setActiveKey(key);
    },
    [setActiveKey, settleHeaderDs, settleLineDs, batchApproveId, handleSave]
  );

  const handleBackList = useCallback(() => {
    notification.success();
    history.push({
      pathname: '/ssta/new-purchase-settle/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleReplaceRouter = useCallback(
    ({ settleHeaderId = settleHeaderId, assignSearchObj = {} }) => {
      notification.success();
      if (!settleHeaderId) return handleBackList();
      let newSearch = search;
      if (!isEmpty(assignSearchObj)) {
        const newSearchObj = Object.assign(parse(search.substring(1)), assignSearchObj);
        newSearch = stringify(filterNullValueObject(newSearchObj));
      }
      history.push({
        pathname: `/ssta/new-purchase-settle/${documentType.toLowerCase()}/${settleHeaderId}`,
        search: newSearch,
      });
      updateTab({
        key: getActiveTabKey(),
        search: newSearch,
      });
    },
    [search, history, documentType, handleBackList]
  );

  const handleSplitAction = useCallback(() => {
    const { list } = parse(search.substring(1));
    if (!isEmpty(settleList)) {
      const filterList = settleList.filter((item) => item.settleHeaderId !== activeKey);
      const { settleHeaderId: nextHeaderId } = filterList[0] || {};
      const assignSearchObj = { source: 'detail' };
      if (list) {
        assignSearchObj.list = filterList.length > 1 ? JSON.stringify(filterList) : null;
      }
      handleReplaceRouter({
        assignSearchObj,
        settleHeaderId: nextHeaderId,
      });
    } else {
      handleBackList();
    }
  }, [search, activeKey, settleList, handleBackList, handleReplaceRouter]);

  // 付款自动分配
  const handlePayAutoMatch = useCallback(async () => {
    const res = await settleHeaderDs.setState('submitType', 'payAutoAssign').submit();
    if (!res) return;
    const { warnMessage } = res.content?.[0] || {};
    notification.success({ description: warnMessage });
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(await getSettleHeaderData({ documentType, settleHeaderId }));
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'applyAmount',
      'paymentAmount',
      'paymentSpliteRule',
      'prepaymentSpliteRule',
    ]);
    settleLineDs.query();
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
    return true;
  }, [settleHeaderDs, settleLineDs, documentType, settleHeaderId]);

  // 校验前端数据
  const handleValidateFrontData = useCallback(async () => {
    const validateRes = await settleHeaderDs.validate();
    if (!validateRes) {
      formatErrorInfo(
        settleHeaderDs,
        settleLineDs,
        intl.get(`ssta.purchaseSettle.view.title.settleDetailInfo`).d('结算明细信息')
      );
    }
    return validateRes;
  }, [settleHeaderDs, settleLineDs]);

  const handleSave = useCallback(
    async (hideTipFlag) => {
      const validateRes = await handleValidateFrontData();
      if (!validateRes) return;
      if (!payAutoAssignPermission && settleType !== 'INVOICE') {
        settleHeaderDs.current.set('paymentMatchFlag', 1);
      }
      // 卫龙需要使用该埋点：解决编辑富文本时触发重新渲染导致的光标重新定位问题
      if (remoteProps) {
        remoteProps.event.fireEvent('handleSaveBeforeCux', {
          settleHeaderDs,
          isEditPub,
        });
        // 校验埋点
        const beforeSaveRes = await remoteProps.event.fireEvent('beforeSave', {
          settleHeaderDs,
          isEditPub,
        });
        if (beforeSaveRes === false) return false;
      }
      const lineData = settleLineDs.toJSONData();
      const res = await settleHeaderDs.setState('submitType', 'update').submit();
      if (!res) return;
      if (!hideTipFlag) notification.success(); // hideTipFlag 隐藏提示标识
      await settleHeaderDs.query();
      if (taxInvoiceDs) taxInvoiceDs.query();
      if (isEmpty(lineData)) return res;
      const cuszLineDs = settleHeaderDs.children?.attributeList;
      if (cuszLineDs) cuszLineDs.query();
      if (paymentStageDs) paymentStageDs.query();
      settleHeaderDs.status = 'loading';
      const refreshedLines = getResponse(
        await getSettlelinesByIds({
          settleLineIdList: lineData.map((item) => item.settleLineId),
          customizeUnitCode: lineCodes[documentType],
        })
      );
      settleHeaderDs.status = 'ready';
      if (!refreshedLines) return;
      recordsCommit(refreshedLines, settleLineDs, 'settleLineId');
      return res;
    },
    [
      settleType,
      settleHeaderDs,
      documentType,
      settleLineDs,
      payAutoAssignPermission,
      handleValidateFrontData,
      taxInvoiceDs,
      isEditPub,
      remoteProps,
      paymentStageDs,
    ]
  );

  // 提交取消校验
  const handleSubmitWarnCancel = useCallback(
    async (validatedResultDTO) => {
      if (settleType === 'PAYMENT') {
        const res = await settleHeaderDs
          .setState('submitType', 'submitWarnCancelValidate')
          .forceSubmit();
        if (!res) return false;
      }
      if (remoteProps) {
        remoteProps.event.fireEvent('submitWarnCancelCallback', {
          settleHeaderDs,
          validatedResultDTO,
        });
      }
    },
    [settleType, remoteProps, settleHeaderDs]
  );

  // 真正提交接口
  const handleRealSubmit = useCallback(async () => {
    if (remoteProps) {
      const beforeSubmitRes = await remoteProps.event.fireEvent('beforeSubmit', {
        settleHeaderDs,
        handleSave,
      });
      if (beforeSubmitRes === false) return false;
    }
    const res = await settleHeaderDs.setState('submitType', 'submit').submit();
    if (res) handleSplitAction();
    return res;
  }, [remoteProps, settleHeaderDs, handleSplitAction, handleSave]);

  const handleDirectInvoiceSubmit = useCallback(() => {
    const taxIncludedAmount = settleHeaderDs.current?.get('taxIncludedAmount');
    const normalFlag =
      documentType === 'INVOICE' &&
      math.lt(taxIncludedAmount, 0) &&
      directInvoicingType === 'INVOICE_PLATFORM' &&
      invoiceMatchRuleCode === 'DIRECT_INVOICING';
    const porcessFlag = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL.RED_NEG_INV_FILL_FLAG', normalFlag)
      : normalFlag;
    if (porcessFlag) {
      modalOpen({
        editFlag: true,
        size: 'small',
        title: intl
          .get('ssta.common.view.title.negativeNumInvTips')
          .d('当前发票申请单总金额为负数，您正在发起红冲税票，需补充维护以下信息'),
        children: (
          <RedInkTaxInvoice settleHeaderDs={settleHeaderDs} okCallback={handleRealSubmit} />
        ),
      });
    } else handleRealSubmit();
  }, [
    remoteProps,
    handleRealSubmit,
    settleHeaderDs,
    directInvoicingType,
    invoiceMatchRuleCode,
    documentType,
    modalOpen,
  ]);

  // 提交校验（第二次）
  const handleSubmitValidate = useCallback(async () => {
    // 标准逻辑
    const standardSubmitValidate = async () => {
      const validateRes = await settleHeaderDs.setState('submitType', 'submitValidate').submit();
      if (!validateRes) return;
      const validatedResultDTO = validateRes.content?.[0];
      if (remoteProps) {
        remoteProps.event.fireEvent('submitValidateCallback', {
          settleHeaderDs,
          validatedResultDTO,
        });
      }
      settleHeaderDs.setState('validatedResultDTO', validatedResultDTO);
      return getCustomValidationResponse(validatedResultDTO, handleDirectInvoiceSubmit, {
        onWarnCancel: () => handleSubmitWarnCancel(validatedResultDTO),
        msgListPrompt: intl
          .get('ssta.common.view.message.validErrorAndConfirmSubmitDoc', {
            documentName: settleTypeMeaning,
          })
          .d('存在以下校验未通过，请确认是否提交{documentName}'),
      });
    };
    // 提交校验 - 前置埋点处理
    if (remoteProps && remoteProps.event) {
      return remoteProps.event.fireEvent('handleRemoteBeforeSubmitValidate', {
        standardSubmitValidate,
        settleHeaderDs,
        settleType,
      });
    }
    return standardSubmitValidate();
  }, [
    settleHeaderDs,
    settleTypeMeaning,
    handleDirectInvoiceSubmit,
    handleSubmitWarnCancel,
    remoteProps,
    settleType,
  ]);

  // 校验行
  const handleValidateLine = useCallback(
    async (zeroLineList) => {
      if (!isNil(zeroLineList) && !isEmpty(zeroLineList)) {
        const zeroLineNumList = [];
        const deleteLineIds = [];
        zeroLineList.forEach((item) => {
          const { lineNum, settleLineId } = item;
          zeroLineNumList.push(lineNum);
          deleteLineIds.push(settleLineId);
        });
        const zeroLineNums = zeroLineNumList.join();
        const deleteRecords = settleLineDs.filter((record) =>
          deleteLineIds.includes(record.get('settleLineId'))
        );
        Modal.confirm({
          title: intl.get('ssta.common.view.message.tip').d('提示'),
          children:
            settleType === 'INVOICE_PAYMENT' ? (
              <div>
                <p>
                  {`${
                    intl
                      .get('ssta.purchaseSettle.debounceSubmitValidate.message')
                      .d('结算单存在发票申请金额为0且付款申请金额为0的行【') + zeroLineNums
                  }】`}
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
                  {`${
                    intl
                      .get('ssta.purchaseSettle.debounceSubmitValidate.paymentMessage')
                      .d('结算单存在付款申请金额为0的行【') + zeroLineNums
                  }】`}
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
            settleHeaderDs.status = 'loading';
            const cancelRes = await cancelPurchaseSettleLine(zeroLineList);
            settleHeaderDs.status = 'ready';
            if (!cancelRes) return;
            settleLineDs.remove(deleteRecords, true);
            const oldCount = settleLineDs.totalCount;
            settleLineDs.totalCount = oldCount - zeroLineList.length;
            settleHeaderDs.status = 'loading';
            const newHeaderData = getResponse(
              await getSettleHeaderData({ settleHeaderId, documentType })
            );
            settleHeaderDs.status = 'ready';
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
            ]);
            return handleSubmitValidate();
          },
        });
      } else {
        return handleSubmitValidate();
      }
    },
    [settleType, documentType, settleLineDs, settleHeaderDs, settleHeaderId, handleSubmitValidate]
  );

  // 提交校验（第一次）
  const handleSubmitFirstValidate = useCallback(async () => {
    settleHeaderDs.current.set('paymentMatchFlag', undefined);
    settleHeaderDs.status = 'loading';
    // 添加卫龙埋点
    if (remoteProps) {
      remoteProps.event.fireEvent('handleSubmitBeforeCux', {
        settleHeaderDs,
      });
    }
    const validateLineRes = getResponse(
      await debounceSubmitValidate(settleHeaderDs.current.toJSONData())
    );
    settleHeaderDs.status = 'ready';
    if (!validateLineRes) return;
    const { validatedResultDTO, settleLines = [] } = validateLineRes;
    if (validatedResultDTO) {
      const { validatedCode, msg } = validatedResultDTO;
      if (['APP_APPLY_WARNING', 'APP_SAVE_WARNING'].includes(validatedCode)) {
        Modal.confirm({
          title: intl.get('ssta.common.view.message.tip').d('提示'),
          children: msg,
          autoCenter: true,
          footer: (_, cancelBtn, modal) => [
            cancelBtn,
            validatedCode === 'APP_APPLY_WARNING' && (
              <Button
                onClick={async () => {
                  await handleSave();
                  modal.close();
                }}
              >
                {intl.get('ssta.common.view.button.sumLineAmount').d('汇总行金额')}
              </Button>
            ),
            <Button
              color="primary"
              onClick={async () => {
                const payAutoAssignRes = await handlePayAutoMatch();
                if (!payAutoAssignRes) return;
                modal.close();
              }}
            >
              {intl.get(`ssta.purchaseSettle.button.paymentAutoAssign`).d('付款自动分配')}
            </Button>,
          ],
        });
      } else {
        return handleValidateLine(settleLines);
      }
    } else {
      return handleValidateLine(settleLines);
    }
  }, [settleHeaderDs, handlePayAutoMatch, handleValidateLine, handleSave, remoteProps]);

  // 校验税务发票
  const handleValidateTaxInvoice = useCallback(async () => {
    if (documentType === 'INVOICE') {
      taxInvoiceDs.dataToJSON = 'all';
      const taxInvoiceValidateFlag = await taxInvoiceDs.validate();
      if (!taxInvoiceValidateFlag) {
        // 税务发票行校验不通过时，给出提示信息
        formatErrorInfo(
          settleHeaderDs,
          taxInvoiceDs,
          intl.get(`ssta.purchaseSettle.view.title.taxInvoiceDetail`).d('税务发票明细')
        );
        // 报错消息提示后再修改dataToJSON为selected，否则会导致税务发票明细的提示消息失败
        taxInvoiceDs.dataToJSON = 'selected';
        return;
      }
      // 报错消息提示后再修改dataToJSON为selected，否则会导致税务发票明细的提示消息失败
      taxInvoiceDs.dataToJSON = 'selected';
      const { autoCheckFlag } = settleHeaderDs.current?.get(['autoCheckFlag']) || {};
      if (
        autoCheckFlag === 1 &&
        enableCheckFlag === 1 &&
        ['INITIATE', 'BOTH'].includes(checkPointCode)
      ) {
        let res = null;
        // 需要用try catch接收一下submit方法的报错，不然submit报错后不会往下执行
        try {
          res = await settleHeaderDs.setState('submitType', 'autoCheckTaxInvoice').forceSubmit();
        } catch (e) {
          throw e;
        }
        // 自动查验失败也需更新税务发票明细，未更新的话在手工查验时会版本号过时
        taxInvoiceDs.query();
        if (!res) return;
        settleHeaderDs.status = 'loading';
        const newHeaderData = getResponse(
          await getSettleHeaderData({ documentType, settleHeaderId })
        );
        settleHeaderDs.status = 'ready';
        if (!newHeaderData) return;
        recordPickValues(settleHeaderDs.current, newHeaderData, [
          'invoiceNetAmount',
          'invoiceTaxAmount',
          'invoiceTaxIncludedAmount',
          'diffNetAmount',
          'diffTaxAmount',
          'invoiceDifferenceAmount',
        ]);
        const { errorMessageMap, validatedResultDTO } = res.content[0];
        if (JSON.stringify(errorMessageMap) !== '{}') {
          const errorMsg = Object.values(errorMessageMap)
            .map((item) => item?.desc)
            .join('');
          notification.error({ message: errorMsg });
          return;
        }
        if (!isEmpty(validatedResultDTO) && validatedResultDTO.validatedCode !== 'SUCCESS') {
          return getValidationResponse(validatedResultDTO, handleSubmitFirstValidate);
        }
      }
    } else if (documentType === 'PAYMENT') {
      settleHeaderDs.status = 'loading';
      const response = await settleHeaderDs
        .setState('submitType', 'stageLineValidate')
        .forceSubmit();
      settleHeaderDs.status = 'ready';
      if (!response) return false;
      const validatedResultDTO = response.content[0] || {};
      const handleReMatchStageLine = async (action) => {
        if (action === 'ok') {
          settleHeaderDs.status = 'loading';
          const matchRes = await settleHeaderDs
            .setState('submitType', 'stageLineReMatch')
            .forceSubmit();
          settleHeaderDs.status = 'ready';
          // 校验警告提示 点了确定后不继续走下面逻辑，让用户再手动点提交
          if (!matchRes) return false;
          if (paymentStageDs) paymentStageDs.query();
          settleHeaderDs.query(undefined, undefined, true);
          return true;
        } else return handleSubmitFirstValidate();
      };
      return getCustomValidationResponse(validatedResultDTO, handleReMatchStageLine, {
        okText: intl.get('ssta.common.view.message.validateOKText').d('更新并重新匹配阶段'),
      });
    }
    return handleSubmitFirstValidate();
  }, [
    documentType,
    taxInvoiceDs,
    checkPointCode,
    settleHeaderId,
    settleHeaderDs,
    enableCheckFlag,
    handleSubmitFirstValidate,
    paymentStageDs,
  ]);

  // 批量提交操作
  const handleApproveBathSubmitFinal = useCallback(
    async (options) => {
      const { handleBeforeSubmitFinal } = options || {};
      if (handleBeforeSubmitFinal) {
        const beforeSubmitFinalRes = await handleBeforeSubmitFinal();
        if (beforeSubmitFinalRes === false) return false;
      }
      const res = await settleHeaderDs.setState('submitType', 'batchSubmit').forceSubmit();
      if (!res) return false;
      const { content } = res;
      const { status } = content[0] || {};
      if (status === 'SYSTEM_SUBMITING') {
        notification.info({
          message: intl
            .get(`ssta.common.view.message.batchSubmiyAsync`)
            .d(
              '结算单后台提交中，您可以离开当前页面进行其他操作，提交失败的单据，将通过系统消息展示失败原因，并重新展示在可编辑列表'
            ),
        });
      } else notification.success();
      history.push({
        pathname: '/ssta/new-purchase-settle/list',
        state: { _back: 1 },
      });
      return true;
    },
    [settleHeaderDs, history]
  );

  // 批量提交操作
  const handleBathSubmit = useCallback(
    async (data, options) => {
      const res = await settleHeaderDs
        .setState('settleHeaderBatchApprove', data)
        .setState('submitType', 'batchApproveValidate')
        .forceSubmit();
      if (!res) return false;
      const validatedResultDTO = res.content[0] || {};
      getCustomValidationResponse(
        validatedResultDTO,
        async (action) => {
          if (action === 'ok') {
            // 是点了弹框警告
            const res = await settleHeaderDs
              .setState('submitType', 'batchApproveCancel')
              .forceSubmit();
            if (!res) return false;
          }
          handleApproveBathSubmitFinal(options);
        },
        { okText: intl.get('ssta.common.view.message.sureDeleteBatchText').d('确认删除') }
      );
    },
    [settleHeaderDs, handleApproveBathSubmitFinal]
  );

  // 提交入口
  const handleSubmit = useCallback(async () => {
    const frontDataValidRes = await handleValidateFrontData();
    if (!frontDataValidRes) return;
    if (documentType === 'PAYMENT' && batchApproveId) {
      const resMethods = getResponse(await getSettleApproveWay(settleHeaderDs.current?.toData()));
      if (!resMethods) return;
      if (resMethods === 'BATCH_WORKFLOW_APPROVAL') {
        const saveRes = await handleSave(true);
        if (!saveRes) return;
        // 提交（生产批次）二开校验
        const confirmMsg = remoteProps
          ? await remoteProps.process('SSTA_PURCHASESETTLE_LIST.SUBMIT_BATCH_TIPS', settleList)
          : { errorFlag: false, message: undefined, listSelected: [] };

        if (confirmMsg.errorFlag) {
          notification.error({
            description: confirmMsg.message,
          });
          return;
        }
        const res = await settleHeaderDs
          .setState('batchApproveId', batchApproveId)
          .setState('submitType', 'batchSubmitValidate')
          .forceSubmit();
        if (!res) return;
        const { content } = res;
        // 失败的校验数据
        const failedList = content?.filter((item) => item?.validatedCode === 'ERROR');
        // 警告数据
        const warnList = content?.filter((item) => item?.validatedCode === 'WARNING');
        if (!isEmpty(failedList)) {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: failedList?.map((item) => item?.msg).join('\n'),
            style: {
              whiteSpace: 'pre-line',
            },
          });
          return false;
        } else {
          // 如果是批次提交 调用批次提交接口
          getCustomValidationResponse(
            {
              validatedCode: !isEmpty(warnList) ? 'WARNING' : 'SUCCESS',
              msg: warnList?.map((item) => item?.msg).join('\n'),
            },
            () =>
              handleViewBatchNum({
                batchApproveId,
                operate: 'edit',
                handleOk: handleBathSubmit,
                remoteProps,
                listSelected: confirmMsg.listSelected,
              })
          );
        }
        return;
      }
    }
    return handleValidateTaxInvoice();
  }, [
    handleValidateFrontData,
    handleValidateTaxInvoice,
    documentType,
    batchApproveId,
    settleHeaderDs,
    handleBathSubmit,
    handleSave,
    settleList,
    remoteProps,
  ]);

  const handleConfirm = useCallback(
    async (filledInfoDs) => {
      const cuxValidateFlag = await remoteProps.process(
        'SSTA_PURCHASESETTLE_DETAIL_CUX.HEADERBTN_CONFIRM.VALIDATE',
        true,
        {
          filledInfoDs,
          settleHeaderDs,
          settleLineDs,
        }
      );
      if (!cuxValidateFlag) return false;
      if (!['SUBMITED', 'WAIT_SUPPLIER_CONFIRM'].includes(settleStatus)) {
        const res = await filledInfoDs.setState('submitType', 'confirm').forceSubmit();
        if (res) return handleBackList();
      }
      const bankValidateRes = await filledInfoDs
        .setState('submitType', 'confirmValidate')
        .forceSubmit();
      if (!bankValidateRes) return;
      const { validatedCode, msg } = bankValidateRes.content[0] || {};
      if (validatedCode === 'WARNING') {
        Modal.confirm({
          title: intl.get('ssta.common.view.message.tip').d('提示'),
          children: msg,
          autoCenter: true,
          onOk: async () => {
            const res = await filledInfoDs.setState('submitType', 'confirm').forceSubmit();
            if (res) handleBackList();
          },
        });
        return false;
      } else if (validatedCode === 'ERROR') {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: msg,
        });
        return false;
      } else {
        const res = await filledInfoDs.setState('submitType', 'confirm').forceSubmit();
        if (res) handleBackList();
      }
    },
    [settleStatus, handleBackList, remoteProps, settleHeaderDs]
  );

  const handleReturn = useCallback(
    async (filledInfoDs) => {
      const res = await filledInfoDs.setState('submitType', 'return').forceSubmit();
      if (res) handleBackList();
    },
    [handleBackList]
  );

  const handleSyncPaymentBefore = useCallback(() => {
    const hiddenFlag = custConfig['SSTA.PURCHASE_SETTLE_DETAIL.PAY_SYNC']?.fields?.every(
      (item) => item.visible !== 1
    );
    // 如果个性化配置字段都隐藏，不打开弹框
    if (hiddenFlag) handleSync(settleHeaderDs);
    else handleFilledInfo('SYNC', handleSync);
  }, [custConfig, settleHeaderDs, handleSync, handleFilledInfo]);

  const handleSync = useCallback(
    async (ds) => {
      const res = await ds.setState('submitType', 'sync').forceSubmit();
      if (!res) return;
      return getValidationResponse(res.content[0], async (onlyRefresh) => {
        if (onlyRefresh) {
          const queryRes = await settleHeaderDs.query();
          ds.loadData([queryRes]);
          return false;
        }
        handleBackList();
      });
    },
    [handleBackList, settleHeaderDs]
  );

  // const handleRedInvConfirmInfo = useCallback(
  //   async (okCallback) => {
  //     modalOpen({
  //       editFlag: true,
  //       size: 'medium',
  //       title: intl
  //         .get('ssta.common.view.title.entryRedInvFormAndconfirmationCode')
  //         .d('红字发票表/确认单编码录入'),
  //       children: <RedInvConfirmInfo settleHeaderId={settleHeaderId} okCallback={okCallback} />,
  //     });
  //   },
  //   [modalOpen, settleHeaderId]
  // );

  const handleCancel = useCallback(
    async (filledInfoDs) => {
      const handleCancelOpr = async () => {
        const bankValidateRes = await filledInfoDs
          .setState('submitType', 'cancelValidate')
          .forceSubmit();
        if (!bankValidateRes) return;
        const { validatedCode, msg } = bankValidateRes.content[0] || {};
        if (validatedCode === 'WARNING') {
          Modal.confirm({
            title: intl.get('ssta.common.view.message.tip').d('提示'),
            children: msg,
            autoCenter: true,
            onOk: async () => {
              const res = await filledInfoDs.setState('submitType', 'cancel').forceSubmit();
              if (res) handleBackList();
            },
          });
          return false;
        } else if (validatedCode === 'ERROR') {
          notification.error({
            message: intl.get('hzero.common.notification.error').d('操作失败'),
            description: msg,
          });
          return false;
        } else {
          const res = await filledInfoDs.setState('submitType', 'cancel').forceSubmit();
          if (res) handleBackList();
        }
      };
      const { ecInvCancelMsg } = getEcInvCancelInfo();
      if (isNil(ecInvCancelMsg)) return handleCancelOpr();
      Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: ecInvCancelMsg,
        onOk: handleCancelOpr,
      });
    },
    [handleBackList, getEcInvCancelInfo]
  );

  const handleDelete = useCallback(async () => {
    const message = (
      <span>
        <span>{intl.get('ssta.purchaseSettle.view.message.confirm').d('确定要')}</span>
        <span>{intl.get('hzero.common.button.cancel').d('取消')}</span>
        <span>{settleTypeMeaning}</span>
        <span>{settleNum}?</span>
      </span>
    );
    const handleDeleteOpr = async () => {
      const bankValidateRes = await settleHeaderDs
        .setState('submitType', 'deleteValidate')
        .forceSubmit();
      if (!bankValidateRes) return;
      const { validatedCode, msg, closeAllSettleNumFlag } = bankValidateRes.content[0] || {};
      if (validatedCode === 'WARNING') {
        Modal.confirm({
          title: intl.get('ssta.common.view.message.tip').d('提示'),
          children: msg,
          autoCenter: true,
          onOk: async () => {
            const res = await settleHeaderDs.setState('submitType', 'delete').forceSubmit();
            if (!res) return;
            if (closeAllSettleNumFlag) {
              handleBackList();
            } else {
              handleSplitAction();
            }
            Modal.destroyAll();
          },
        });
      } else if (validatedCode === 'ERROR') {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: msg,
        });
      } else {
        const res = await settleHeaderDs.setState('submitType', 'delete').forceSubmit();
        if (res) handleSplitAction();
        Modal.destroyAll();
      }
    };
    // 发票已退回取消红冲弹框
    const handleRedInv = async () => {
      if (
        enableDirInvFlag &&
        documentType === 'INVOICE' &&
        settleStatus === 'RETURN' &&
        directInvoicingType === 'INVOICE_PLATFORM' &&
        invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
        Number(invoiceSettleCancelFlag) === 1
      ) {
        settleHeaderDs.status = 'loading';
        const res = getResponse(
          await fetchInvoicePlatformRed({ settleHeaderIdList: [settleHeaderId] })
        );
        settleHeaderDs.status = 'ready';
        if (!res) return;
        if (isEmpty(res)) handleDeleteOpr();
        else {
          modalOpen({
            editFlag: true,
            size: 'middle',
            title: intl.get(`ssta.purchaseSettle.view.title.cancelInfo`).d('取消信息'),
            children: (
              <FilledInfoModal
                onOk={handleDeleteOpr}
                action="DELETE"
                enableDirInvFlag={enableDirInvFlag}
                redList={res}
                isDelete
              />
            ),
          });
        }
      } else handleDeleteOpr();
    };
    const { ecInvCancelMsg } = getEcInvCancelInfo();
    if (remoteProps) {
      const beforeCancelRes = await remoteProps.event.fireEvent('beforeCancel', {
        modalOpen,
        settleHeaderDs,
      });
      if (beforeCancelRes === false) return false;
    }
    const confirmMsg = remoteProps
      ? remoteProps.process(
          'SSTA_PURCHASESETTLE_DETAIL.CANCEL_CONFIRM_TIPS',
          ecInvCancelMsg || message,
          {
            settleType,
            settleHeaderDs,
          }
        )
      : ecInvCancelMsg || message;
    Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: confirmMsg,
      onOk: handleRedInv,
    });
  }, [
    modalOpen,
    settleNum,
    settleHeaderDs,
    handleBackList,
    handleSplitAction,
    settleTypeMeaning,
    getEcInvCancelInfo,
    remoteProps,
    settleType,
    documentType,
    settleStatus,
    directInvoicingType,
    invoiceMatchRuleCode,
    invoiceSettleCancelFlag,
    settleHeaderId,
    enableDirInvFlag,
  ]);

  // 批量编辑，暂时只做了付款，开票类型的留了口子
  const handleBatchEdit = useCallback(() => {
    const settleHeaderIds = settleList.map((item) => item.settleHeaderId).join();
    modalOpen({
      editFlag: true,
      size: 'large',
      title: intl.get('ssta.common.view.title.batchEdit').d('批量编辑'),
      children: (
        <BatchEditHeader
          documentType={documentType}
          settleHeaderIds={settleHeaderIds}
          okCallback={() => settleHeaderDs.query()}
        />
      ),
    });
  }, [modalOpen, settleList, documentType, settleHeaderDs]);

  const handleInvAutoMatch = useCallback(async () => {
    Modal.confirm({
      title: intl.get('ssta.common.view.title.taxInvoiceAutoMatch').d('税务发票自动匹配'),
      children: <SelectBox name="invoiceSpliteRule" dataSet={settleHeaderDs} />,
      onOk: async () => {
        const res = await settleHeaderDs.setState('submitType', 'invAutoMatch').forceSubmit();
        if (!res) return;
        settleHeaderDs.status = 'loading';
        const newHeaderData = getResponse(
          await getSettleHeaderData({ settleHeaderId, documentType })
        );
        settleHeaderDs.status = 'ready';
        if (newHeaderData) {
          recordPickValues(settleHeaderDs.current, newHeaderData, [
            'netAmount',
            'taxAmount',
            'taxIncludedAmount',
            'invoiceSpliteRule',
            'diffNetAmount',
            'diffTaxAmount',
            'invoiceDifferenceAmount',
          ]);
        }
        settleLineDs.query();
        const cuszLineDs = settleHeaderDs.children?.attributeList;
        if (cuszLineDs) cuszLineDs.query();
      },
    });
  }, [settleHeaderDs, settleHeaderId, documentType, settleLineDs]);

  const handleToleranceAdjust = useCallback(async () => {
    const res = await settleHeaderDs.setState('submitType', 'toleranceAdjust').forceSubmit();
    if (!res) return;
    settleLineDs.query();
    const cuszLineDs = settleHeaderDs.children?.attributeList;
    if (cuszLineDs) cuszLineDs.query();
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(await getSettleHeaderData({ settleHeaderId, documentType }));
    settleHeaderDs.status = 'ready';
    if (newHeaderData) {
      recordPickValues(settleHeaderDs.current, newHeaderData, [
        'netAmount',
        'taxAmount',
        'taxIncludedAmount',
        'invoiceSpliteRule',
        'diffNetAmount',
        'diffTaxAmount',
        'invoiceDifferenceAmount',
      ]);
    }
  }, [settleLineDs, settleHeaderDs, settleHeaderId, documentType]);

  const handleConfirmToleranceAdjust = useCallback(() => {
    Modal.confirm({
      title: intl.get('ssta.common.view.button.adjustTailDiff').d('调整尾差'),
      children: (
        <div>
          <div>
            <span>{intl.get('ssta.common.view.message.current').d('当前')}</span>
            <span>{intl.get('ssta.common.model.common.taxInvoiceAmount').d('税务发票金额')} </span>
            <span>
              {intl.get('ssta.common.model.common.taxIncluded').d('含税')}：
              {invoiceTaxIncludedAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxExcluded').d('不含税')}：{invoiceNetAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxAamount').d('税额')}：{invoiceTaxAmount}{' '}
            </span>
          </div>
          <div>
            <span>{intl.get('ssta.common.view.message.current').d('当前')}</span>
            <span>{intl.get('ssta.common.model.common.balanceAmount').d('尾差金额')} </span>
            <span>
              {intl.get('ssta.common.model.common.taxIncluded').d('含税')}：
              {invoiceDifferenceAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxExcluded').d('不含税')}：{diffNetAmount}{' '}
            </span>
            <span>
              {intl.get('ssta.common.model.common.taxAamount').d('税额')}：{diffTaxAmount}{' '}
            </span>
          </div>
        </div>
      ),
      onOk: handleToleranceAdjust,
    });
  }, [
    handleToleranceAdjust,
    invoiceTaxIncludedAmount,
    invoiceNetAmount,
    invoiceTaxAmount,
    diffNetAmount,
    diffTaxAmount,
    invoiceDifferenceAmount,
  ]);

  const handleFilledInfo = useCallback(
    async (action, onOk) => {
      let redList = [];
      if (
        action === 'CANCEL' &&
        enableDirInvFlag &&
        documentType === 'INVOICE' &&
        settleStatus === 'CONFIRM' &&
        directInvoicingType === 'INVOICE_PLATFORM' &&
        invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
        Number(invoiceSettleCancelFlag) === 1
      ) {
        settleHeaderDs.status = 'loading';
        const res = getResponse(
          await fetchInvoicePlatformRed({ settleHeaderIdList: [settleHeaderId] })
        );
        settleHeaderDs.status = 'ready';
        if (!res) return;
        redList = res;
      }
      modalOpen({
        editFlag: true,
        size: !isEmpty(redList) ? 'middle' : 'small',
        title: approveFlag
          ? intl.get(`ssta.purchaseSettle.view.title.approveInfo`).d('审核信息')
          : cancelFlag
          ? intl.get(`ssta.purchaseSettle.view.title.cancelInfo`).d('取消信息')
          : syncFlag && intl.get(`ssta.purchaseSettle.view.title.syncInfo`).d('同步信息'),
        children: (
          <FilledInfoModal
            onOk={onOk}
            action={action}
            enableDirInvFlag={enableDirInvFlag}
            redList={redList}
            getEcInvCancelInfo={getEcInvCancelInfo}
          />
        ),
      });
    },
    [
      approveFlag,
      cancelFlag,
      syncFlag,
      modalOpen,
      getEcInvCancelInfo,
      enableDirInvFlag,
      settleHeaderId,
      settleHeaderDs,
      documentType,
      settleStatus,
      directInvoicingType,
      invoiceMatchRuleCode,
      invoiceSettleCancelFlag,
    ]
  );

  // 点击新增/移除结算单
  const handleAddOrRemove = useCallback(() => {
    modalOpen({
      title: intl.get('ssta.common.button.settle.removeOrAdd').d('新增/移除结算单'),
      size: 'large',
      editFlag: false,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-detailDrawer-modal'],
      children: (
        <BatchSettleList
          batchApproveId={batchApproveId}
          setActiveKey={setActiveKey}
          settleHeaderId={settleHeaderId}
          handleBackList={handleBackList}
          setSettleList={setSettleList}
          handleReplaceRouter={handleReplaceRouter}
        />
      ),
    });
  }, [
    modalOpen,
    batchApproveId,
    setActiveKey,
    settleHeaderId,
    handleBackList,
    setSettleList,
    handleReplaceRouter,
  ]);

  const handleSmartPreReview = useCallback(async () => {
    const dirtyFlag =
      settleHeaderDs.current?.dirtyData?.size ||
      settleLineDs.find((record) => record.dirtyData?.size);
    if (dirtyFlag) {
      notification.error({
        description: intl
          .get('ssta.common.view.message.smartPreReviewDirtyError')
          .d('操作失败，当前单据存在未保存的数据，请先保存数据后重新点击智能预审'),
      });
      return;
    }
    const res = await settleHeaderDs.setState('submitType', 'smartPreReview').forceSubmit();
    if (!res) return;
    settleHeaderDs.current.init('sstaAiApproveResult', res.content?.[0]);
  }, [settleLineDs, settleHeaderDs]);

  const handlePayApplyQuery = useCallback(() => {
    modalOpen({
      title: intl.get('hzero.common.button.viewDetails').d('查看详情'),
      size: 'large',
      editFlag: false,
      drawer: true,
      key: Modal.key(),
      destroyOnClose: true,
      closable: true,
      className: Styles['ssta-detailDrawer-modal'],
      children: (
        <PayApplyExcuteQuery
          record={settleHeaderDs.current}
          history={history}
          customizeTable={customizeTable}
        />
      ),
    });
  }, [settleHeaderDs, history, modalOpen, customizeTable]);

  const handleMainStrategy = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get(`ssta.purchaseSettle.message.panel.mainStrategyInfo`).d('主策略信息'),
      children: <MainStrategy />,
    });
  }, [modalOpen]);

  const handleOperationRecord = useCallback(() => {
    modalOpen({
      size: 'medium',
      editFlag: false,
      title: intl.get(`ssta.purchaseSettle.view.title.operationHistory`).d('操作记录'),
      children: <SettlementSheet settleHeaderId={settleHeaderId} isFilter />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [modalOpen, settleHeaderId]);

  const handleToLastDetail = useCallback(
    (key) => {
      updateTab({
        key: getActiveTabKey(),
        search: stringify({
          source: 'detail',
          type: key,
        }),
        state: {
          backPath: `${pathname}${search}`,
        },
      });
      history.push({
        pathname,
        search: stringify({
          source: 'detail',
          type: key,
        }),
        state: {
          backPath: `${pathname}${search}`,
        },
      });
    },
    [history, pathname, search]
  );

  const handleApprove = useCallback(() => {
    if (['SUBMITED_APPROVING', 'CANCEL_APPROVING'].includes(settleStatus)) {
      workflowCaller.goApprove({ onSuccess: handleBackList });
    } else {
      handleToLastDetail('approve');
    }
  }, [settleStatus, workflowCaller, handleBackList, handleToLastDetail]);

  const handleRevoke = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: batchApproveId
        ? intl
            .get('ssta.common.view.message.confirmRevokeApprovalTipBatch')
            .d(
              '当前结算单为批次审批，是否确认撤销审批（批次下所有结算单会一并撤销审批）?撒销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
            )
        : intl
            .get('ssta.common.view.message.confirmRevokeApprovalTip')
            .d(
              '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
            ),
    });
    if (confirmRes !== 'ok') return false;
    const res = await settleHeaderDs
      .setState('submitType', batchApproveId ? 'revokeBatch' : 'revoke')
      .forceSubmit();
    if (!res) return;
    notification.success();
    handleBackList();
  }, [settleHeaderDs, handleBackList, batchApproveId]);

  const handlePrint = useCallback(async () => {
    settleHeaderDs.status = 'loading';
    const flag = checkPrintWindow();
    const printRes = getResponse(
      await print({
        settleHeaderId,
        responseType: flag ? 'blob' : 'json',
        headers: flag ? {} : { 's-print-using-preview': '1' },
        menuCamp: 'PURCHASER',
      })
    );
    settleHeaderDs.status = 'ready';
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
          settleHeaderDs.status = 'loading';
          const syncRes = getResponse(await syncPrintData([settleHeaderDs.current?.toJSONData()]));
          settleHeaderDs.status = 'ready';
          if (!syncRes?.[0]?.objectVersionNumber) return;
          settleHeaderDs.current.init('objectVersionNumber', syncRes?.[0]?.objectVersionNumber);
        }
      };
      reader.readAsText(printRes);
    } else {
      // 添加如下代码
      const { fileUrl, bucketName, fileToken } = printRes || {};
      const url = await getPdfPreviewUrl({ fileUrl, bucketName, fileToken });
      window.open(url);
      settleHeaderDs.status = 'loading';
      const syncRes = getResponse(await syncPrintData([settleHeaderDs.current?.toJSONData()]));
      settleHeaderDs.status = 'ready';
      if (!syncRes?.[0]?.objectVersionNumber) return;
      settleHeaderDs.current.init('objectVersionNumber', syncRes?.[0]?.objectVersionNumber);
    }
  }, [settleHeaderDs, settleHeaderId]);

  const handleNewPrintOkCallback = useCallback(async () => {
    settleHeaderDs.status = 'loading';
    const syncRes = getResponse(await syncPrintData([settleHeaderDs.current?.toJSONData()]));
    settleHeaderDs.status = 'ready';
    if (!syncRes?.[0]?.objectVersionNumber) return;
    settleHeaderDs.current.init('objectVersionNumber', syncRes?.[0]?.objectVersionNumber);
  }, [settleHeaderDs]);

  const handleTaxCheck = useCallback(async () => {
    settleHeaderDs.status = 'loading';
    const res = getResponse(await invoiceCheck(settleHeaderId, 'MANUAL'));
    settleHeaderDs.status = 'ready';
    if (!res) return;
    taxInvoiceDs.query();
    const { errorMessageMap } = res || {};
    if (JSON.stringify(errorMessageMap) === '{}') {
      notification.success();
    } else {
      const errorMsg = Object.values(errorMessageMap)
        .map((item) => item?.desc)
        .join('');
      notification.error({
        message: errorMsg,
        duration: 10,
      });
    }
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(await getSettleHeaderData({ documentType, settleHeaderId }));
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'invoiceNetAmount',
      'invoiceTaxAmount',
      'invoiceTaxIncludedAmount',
      'diffNetAmount',
      'diffTaxAmount',
      'invoiceDifferenceAmount',
    ]);
  }, [taxInvoiceDs, settleHeaderDs, settleHeaderId, documentType]);

  const handleInvoiceProgressQuery = useCallback(() => {
    modalOpen({
      editFlag: false,
      size: 'medium',
      title: intl.get('ssta.costSheet.model.costSheet.invoiceProgressQuery').d('开票进度查询'),
      children: <InvoiceProgressQuery settleHeaderId={settleHeaderId} />,
    });
  }, [settleHeaderId, modalOpen]);

  const handleViewInvoiceRedConfirm = useCallback(() => {
    modalOpen({
      editFlag: false,
      size: 'medium',
      title: intl.get('ssta.common.view.button.operateRedConfirm').d('操作红字确认单'),
      children: (
        <RedInvConfirm
          record={settleHeaderDs.current}
          type="settle"
          okCallback={() => settleHeaderDs.query()}
        />
      ),
    });
  }, [modalOpen, settleHeaderDs]);

  const handleDeleteSettle = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl
        .get('ssta.common.view.message.deleteSettleConfirm')
        .d('删除后将无法恢复，确认要删除当前单据吗?'),
    });
    if (confirmRes !== 'ok') return;
    const res = await settleHeaderDs.setState('submitType', 'deleteSettle').forceSubmit();
    if (!res) return;
    handleSplitAction();
  }, [settleHeaderDs, handleSplitAction]);

  const headerBtns = useMemo(() => {
    if (docLinkFlag) {
      return [
        {
          name: 'operation',
          child: intl.get('hzero.common.button.operating').d('操作记录'),
          btnProps: {
            icon: 'operation_service_request',
            funcType: 'flat',
            color: 'default',
            loading,
            onClick: handleOperationRecord,
          },
        },
      ];
    }
    const standardBtns = [
      updateFlag && {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          loading,
          wait: 1000,
          onClick: handleSubmit,
        },
      },
      updateFlag && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          loading,
          onClick: handleSave,
          wait: 2000,
          waitType: 'throttle',
        },
      },
      updateFlag && {
        name: 'update-cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          loading,
          onClick: handleDelete,
        },
      },
      updateFlag &&
        documentType === 'PAYMENT' &&
        settleList.length > 1 &&
        permissionMap.get(`payHeadBatchEdit`) && {
          name: 'batchEdit',
          child: intl.get('ssta.common.view.button.batchEdit').d('批量编辑'),
          btnProps: {
            icon: 'mode_edit',
            loading,
            onClick: handleBatchEdit,
          },
        },
      updateFlag &&
        documentType === 'INVOICE' &&
        invoiceUxFlag !== 1 &&
        !['INVOICE_EXCEPTION', 'INVOICE_SUCCESS'].includes(settleStatus) &&
        permissionMap.get(`invoiceAutoMatch`) && {
          name: 'invoiceAutoMatch',
          child: intl.get(`ssta.purchaseSettle.button.invoiceAutoMatch`).d('发票自动匹配'),
          btnProps: {
            loading,
            wait: 1000,
            icon: 'baseline-file_copy',
            onClick: handleInvAutoMatch,
          },
        },
      updateFlag &&
        documentType === 'INVOICE' &&
        Number(amountAdjustFlag) === 1 &&
        invoiceUxFlag !== 1 &&
        toleAdjustManualCuxFlag &&
        settleStatus !== 'INVOICE_SUCCESS' &&
        permissionMap.get(`toleranceAdjust`) && {
          name: 'toleranceAdjust',
          child: intl.get(`ssta.purchaseSettle.button.toleranceAdjust`).d('尾差调整'),
          btnProps: {
            loading,
            wait: 1000,
            icon: 'adjust',
            onClick: handleConfirmToleranceAdjust,
          },
        },
      updateFlag &&
        batchApproveId &&
        documentType === 'PAYMENT' && {
          name: 'addOrRemove',
          child: intl.get('ssta.common.button.settle.removeOrAdd').d('新增/移除结算单'),
          btnProps: {
            icon: 'mode_edit',
            loading,
            wait: 1000,
            onClick: handleAddOrRemove,
          },
        },
      updateFlag &&
        ['INVOICE', 'PAYMENT'].includes(settleType) && {
          name: 'smartPreReview',
          child: intl.get('ssta.common.view.button.smartPreReview').d('智能预审'),
          btnProps: {
            icon: 'offline_bolt-o',
            loading,
            wait: 1000,
            disabled: aiApproveStatus === 'APPROVING',
            onClick: handleSmartPreReview,
          },
        },
      approveFlag && {
        name: 'confirm',
        child: intl.get('hzero.common.button.confirm').d('确认'),
        btnProps: {
          icon: 'check',
          loading,
          onClick: () => handleFilledInfo('CONFIRM', handleConfirm),
        },
      },
      approveFlag && {
        name: 'return',
        child: intl.get('hzero.common.button.return').d('退回'),
        btnProps: {
          icon: 'reply',
          loading,
          onClick: () => handleFilledInfo('RETURN', handleReturn),
        },
      },
      syncFlag && {
        name: 'sync',
        child: intl.get('hzero.common.button.sync').d('同步'),
        btnProps: {
          icon: 'sync',
          loading,
          onClick: () =>
            documentType === 'INVOICE'
              ? handleFilledInfo('SYNC', handleSync)
              : handleSyncPaymentBefore(),
        },
      },
      cancelFlag && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          loading,
          onClick: () => handleFilledInfo('CANCEL', handleCancel),
        },
      },
      // 功能编辑、审批、工作流审批手动查验
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
        child: (
          <Tooltip
            placement="top"
            title={intl
              .get('ssta.common.invoiceSheet.view.button.tooltip.checkoutInfo')
              .d('当天开具的发票建议最早于次日进行查验')}
          >
            {intl.get('hzero.common.button.invoiceToCheck').d('发票查验')}
          </Tooltip>
        ),
        btnProps: {
          icon: 'receipt',
          loading,
          onClick: handleTaxCheck,
        },
      },
      allFlag &&
        updateBtn &&
        permissionMap.get(`updatePane`) && {
          name: 'updateBtn',
          child: intl.get('hzero.common.button.edit').d('编辑'),
          btnProps: {
            icon: 'mode_edit',
            loading,
            onClick: () => handleToLastDetail('update'),
          },
        },
      allFlag &&
        approveBtn &&
        permissionMap.get('auditPane') && {
          name: 'approveBtn',
          child: intl.get('ssta.common.button.approve').d('审核'),
          btnProps: {
            icon: 'authorize',
            loading,
            onClick: handleApprove,
          },
        },
      allFlag &&
        camp === 'PURCHASER' &&
        (settleStatus === 'SUBMITED' ||
          (['SUBMITED_APPROVING'].includes(settleStatus) &&
            workflowCaller?.getRevokeFlag() &&
            permissionMap.get('recallBtn')) ||
          (['ES_SUBMITED_APPROVING'].includes(settleStatus) &&
            permissionMap.get('recallExtSysBtn'))) && {
          name: 'revoke',
          child: intl.get('hzero.common.button.recall').d('撤回'),
          btnProps: {
            icon: 'reply',
            loading,
            wait: 1500,
            onClick: handleRevoke,
          },
        },
      allFlag &&
        cancelBtn &&
        permissionMap.get(`cancelPane`) && {
          name: 'cancelBtn',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: {
            icon: 'cancel',
            loading,
            onClick: () => handleToLastDetail('cancel'),
          },
        },
      allFlag &&
        syncBtn &&
        permissionMap.get(`syncPane`) && {
          name: 'syncBtn',
          child: intl.get('hzero.common.button.sync').d('同步'),
          btnProps: {
            icon: 'sync',
            loading,
            onClick: () => handleToLastDetail('sync'),
          },
        },
      settleType === 'INVOICE' &&
        ['DIRECT_INVOICING'].includes(settleStatus) &&
        invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
        directInvoicingType === 'EC' && {
          name: 'invoiceProgressQuery',
          child: intl.get('ssta.costSheet.model.costSheet.invoiceProgressQuery').d('开票进度查询'),
          btnProps: {
            icon: 'track_changes',
            funcType: 'flat',
            color: 'default',
            loading,
            onClick: handleInvoiceProgressQuery,
          },
        },
      settleType === 'INVOICE' &&
        Number(enableRedConfirmFlag) === 1 &&
        permissionMap.get('redConfirm') && {
          name: 'invoiceRedConfirm',
          child: intl.get('ssta.common.view.button.operateRedConfirm').d('操作红字确认单'),
          btnProps: {
            icon: 'check',
            funcType: 'flat',
            color: 'default',
            loading,
            onClick: handleViewInvoiceRedConfirm,
          },
        },

      {
        name: 'operation',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          icon: 'operation_service_request',
          funcType: 'flat',
          color: 'default',
          loading,
          onClick: handleOperationRecord,
        },
      },
      printBtnDisable !== 1 &&
        permissionMap.get(`printDetailBtn`) && {
          name: 'print',
          child: intl.get('hzero.common.button.print').d('打印'),
          btnProps: {
            icon: 'print',
            funcType: 'flat',
            color: 'default',
            loading,
            wait: 1000,
            onClick: handlePrint,
          },
        },
      printBtnDisable !== 1 &&
        permissionMap.get(`newPrintDetailBtn`) && {
          name: 'newPrint',
          btnComp: PrintProButton,
          childFor: 'buttonText',
          child: intl.get('ssta.common.view.button.newPrint').d('(新)打印'),
          btnProps: {
            buttonProps: { funcType: 'flat', wait: 1000 },
            requestUrl: `${apiPrefix}/settle-headers/list-print-new`,
            method: 'PUT',
            data: { settleHeaderIdList: [settleHeaderId], menuCamp: 'PURCHASER' },
            successCallBack: handleNewPrintOkCallback,
            loading,
          },
        },
      {
        name: 'strategy',
        child: intl.get('ssta.common.button.mainStrategyInfo').d('主策略信息'),
        btnProps: {
          icon: 'ballot',
          funcType: 'flat',
          color: 'default',
          loading,
          onClick: handleMainStrategy,
        },
      },
      settleType === 'INVOICE' &&
        permissionMap?.get('payApplyExeQuery') && {
          name: 'payApplyQuery',
          child: intl.get('ssta.common.button.payApplyQuery').d('付款申请执行查询'),
          btnProps: {
            icon: 'visibility-o',
            funcType: 'flat',
            color: 'default',
            loading,
            onClick: handlePayApplyQuery,
          },
        },
      settleStatus === 'NEW' &&
        permissionMap.get('deleteSettle') && {
          name: 'update-delete',
          child: intl.get('hzero.common.button.detele').d('删除'),
          btnProps: {
            icon: 'delete',
            loading,
            onClick: handleDeleteSettle,
          },
        },
      settleHeaderDs.current?.get('batchApproveId') &&
        !updateFlag && {
          name: 'settlementBatch',
          child: intl.get('ssta.common.button.settle.settlementBatch').d('结算单批次'),
          btnProps: {
            icon: 'article-o',
            loading,
            wait: 1000,
            onClick: () =>
              handleViewBatchNum({ batchApproveId: settleHeaderDs.current?.get('batchApproveId') }),
          },
        },
    ].filter(Boolean);

    const btns = remoteProps
      ? remoteProps.process('SSTA_PURCHASESETTLE_DETAIL_BTNS', standardBtns, {
          loading,
          isEditPub,
          updateFlag,
          handleSave,
          notPub,
          settleHeaderDs,
          handleValidateFrontData,
          record: settleHeaderDs?.current,
          taxInvoiceDs,
          getSettleHeaderData,
          documentType,
          recordPickValues,
          settleLineDs,
          handleBackList,
          approveFlag,
        })
      : standardBtns;

    return formatDynamicBtns(btns);
  }, [
    camp,
    allFlag,
    settleList,
    isEditPub,
    approveBtn,
    approveFlag,
    cancelBtn,
    cancelFlag,
    checkPointCode,
    documentType,
    enableCheckFlag,
    handleCancel,
    handleConfirm,
    handleFilledInfo,
    handleOperationRecord,
    handlePrint,
    handleReturn,
    handleDelete,
    handleSave,
    handleSubmit,
    handleSync,
    handleRevoke,
    handleToLastDetail,
    loading,
    notPub,
    permissionMap,
    syncBtn,
    syncFlag,
    updateBtn,
    updateFlag,
    settleType,
    settleHeaderDs,
    workflowCaller,
    invoiceMatchRuleCode,
    directInvoicingType,
    handleTaxCheck,
    handleMainStrategy,
    amountAdjustFlag,
    handleInvAutoMatch,
    toleAdjustManualCuxFlag,
    handleConfirmToleranceAdjust,
    settleStatus,
    invoiceUxFlag,
    printBtnDisable,
    settleHeaderId,
    handleNewPrintOkCallback,
    remoteProps,
    docLinkFlag,
    handleApprove,
    handleBatchEdit,
    handleValidateFrontData,
    handlePayApplyQuery,
    taxInvoiceDs,
    handleInvoiceProgressQuery,
    settleLineDs,
    handleBackList,
    handleDeleteSettle,
    handleAddOrRemove,
    batchApproveId,
    handleSyncPaymentBefore,
    handleViewInvoiceRedConfirm,
    enableRedConfirmFlag,
    aiApproveStatus,
    handleSmartPreReview,
  ]);

  return (
    <Fragment>
      {!isNewPub && !headerHideFlag && (
        <Header
          title={title}
          backPath={backPath}
          onBack={() => {
            if (notPub && state?.backPath) {
              updateTab({
                key: getActiveTabKey(),
                search: backPath.split('?')[1],
                state: null,
              });
            }
          }}
        >
          {cuxShowHeaderBtnFlag &&
            customizeBtnGroup(
              { code: 'SSTA.PURCHASE_SETTLE_DETAIL.HEAD_BTNS', pro: true },
              <DynamicButtons maxNum={5} defaultBtnType="c7n-pro" buttons={headerBtns} />
            )}
        </Header>
      )}
      {settleList.length > 1 ? (
        <Tabs
          tabPosition="left"
          onChange={handleSetActiveKey}
          activeKey={activeKey}
          tabBarExtraContent={<SplitTabBarExtra />}
          className={styles['settle-detail-tabs']}
        >
          {settleList.map((item) => {
            return (
              <TabPane key={item.settleHeaderId} tab={item.settleNum}>
                <DetailContent />
              </TabPane>
            );
          })}
        </Tabs>
      ) : (
        <DetailContent headerBtns={headerBtns} />
      )}
    </Fragment>
  );
});
