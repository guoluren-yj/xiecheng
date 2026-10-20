/*
 * @Description: file content
 * @Date: 2022-01-27 22:03:39
 * @Author: JSS <shangshang.jing@gong-link.com>se
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import React, { Fragment, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { Tabs, Modal, useModal, SelectBox, Tooltip, Button } from 'choerodon-ui/pro';
import { observer } from 'mobx-react';
import { isEmpty, isNil } from 'lodash';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import { Header } from 'components/Page';
import notification from 'utils/notification';
import PrintProButton from '_components/PrintProButton';
import DynamicButtons from '_components/DynamicButtons';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import { checkPrintWindow, getPdfPreviewUrl } from 'srm-front-boot/lib/utils/utils';

import { SettlementSheet } from '@/routes/Components';
import { formatErrorInfo } from '@/routes/Components/ErrorInfo';
import {
  recordsCommit,
  recordPickValues,
  getValidationResponse,
  // openEmbedPage,
  formatNumber,
  formatDynamicBtns,
} from '@/utils/utils';
import {
  print,
  invoiceCheck,
  syncPrintData,
  getSettleHeaderDataSup,
  getSettlelinesByIds,
  getDirectInvoiceApplysettleNum,
  cancelSupplySettleLine,
  debounceSubmitValidate,
  fetchInvoicePlatformRed,
} from '@/services/settlePoolServices';
import { getBusinessRules } from '@/services/invoicePurPoolService';
import { taxInvoiceCheckFlagger } from '@/utils/amountConfig';
import Styles from '@/routes/common.less';
// import { openTab } from 'utils/menuTab';

import { useModalOpen } from '../hooks';
import { Store } from './StoreProvider';
import styles from './index.less';
import DetailContent from './DetailContent';
import MainStrategy from '../components/MainStrategy';
import FilledInfoModal from '../components/FilledInfoModal';
import BatchEditHeader from '../components/BatchEditHeader';
import SplitTabBarExtra from '../components/SplitTabBarExtra';
import PayApplyExcuteQuery from '../components/PayApplyExcuteQuery';
import { getCustomValidationResponse } from '@/components/CustomValidation';
import RedInkTaxInvoice from '../components/RedInkTaxInvoice';

const lineCodes = {
  PAYMENT:
    'SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.PAY_TRANSACTION_DETAIL_SEARCH',
  INVOICE:
    'SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTIONDETAIL,SSTA.SUPPLY_SETTLE_DETAIL.TRANSACTION_DETAIL_SEARCH',
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
    pathname,
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
    settleHeaderDs,
    settleHeaderId,
    checkPointCode,
    enableCheckFlag,
    customizeBtnGroup,
    taxInvoiceDs,
    activeKey,
    setActiveKey,
    settleList,
    readOnlyFlag,
    toleAdjustManualCuxFlag,
    payAutoAssignPermission,
    remoteProps,
    isNewPub,
    source,
    headerHideFlag,
    customizeTable,
    paymentStageDs,
  } = useContext(Store);
  const c7nModal = useModal();
  const [remotePageData, setRemoteData] = useState(null); // 二开初始化数据
  const modalOpen = useModalOpen(c7nModal);
  const {
    camp,
    settleNum = '',
    settleTypeMeaning = '',
    settleType = '',
    amountAdjustFlag,
    invoiceUxFlag,
    amountPrecision,
    printBtnDisable,
    sdimPreviewFlag,
    directInvoicePoint,
    directInvoicingType,
    invoiceMatchRuleCode,
    invoiceSettleCancelFlag,
    settleConfigNum,
  } =
    settleHeader?.get([
      'camp',
      'settleNum',
      'settleTypeMeaning',
      'settleType',
      'amountAdjustFlag',
      'invoiceUxFlag',
      'amountPrecision',
      'printBtnDisable',
      'sdimPreviewFlag',
      'directInvoicePoint',
      'directInvoicingType',
      'invoiceMatchRuleCode',
      'invoiceSettleCancelFlag',
      'settleConfigNum',
    ]) || {};
  const taxInvApplyPreviewFlag =
    invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
    directInvoicingType === 'INVOICE_PLATFORM' &&
    directInvoicePoint === 'SUBMITED' &&
    settleStatus !== 'INVOICE_EXCEPTION' &&
    Number(sdimPreviewFlag) === 1;
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
    view: intl.get(`ssta.supplySettle.view.title.settleView`).d('结算单查看'),
    update: intl.get(`ssta.supplySettle.view.title.settleUpdate`).d('编辑结算单'),
    approve: intl.get(`ssta.supplySettle.view.title.settleApprove`).d('结算单审核'),
    cancel: intl.get(`ssta.supplySettle.view.title.settleCancel`).d('结算单取消'),
    all: intl.get(`ssta.supplySettle.view.title.settleDetail`).d('结算单详情'),
  };
  const title = notPub ? titleObj[type] : '';
  const backPath = notPub ? state?.backPath || '/ssta/new-supply-settle/list' : null;

  const cuxShowHeaderBtnFlag = remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_BTNS_AREA', true, {
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

  useEffect(() => {
    remoteInit(); // 页面加载埋点
  }, []);

  const remoteInit = async () => {
    if (remoteProps) {
      setRemoteData({
        // ...(remotePageData || {}),
        btnHiddenFlag: true,
      });
      await remoteProps.event.fireEvent('remoteInit', {
        remotePageData,
        setRemoteData,
      });
    }
  };

  const handleSetActiveKey = useCallback(
    (key) => {
      setActiveKey(key);
    },
    [setActiveKey]
  );

  const handleBackList = useCallback(() => {
    notification.success();
    history.push({
      pathname: '/ssta/new-supply-settle/list',
      state: { _back: 1 },
    });
  }, [history]);

  const handleSplitAction = useCallback(() => {
    if (!isEmpty(settleList)) {
      notification.success();
      const filterList = settleList.filter((item) => item.settleHeaderId !== activeKey);
      const { settleHeaderId: nextHeaderId } = filterList[0];
      const newSearch = stringify(
        filterNullValueObject({
          source: 'detail',
          type: 'update',
          list: filterList.length > 1 ? JSON.stringify(filterList) : null,
        })
      );
      history.push({
        pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${nextHeaderId}`,
        search: newSearch,
      });
      updateTab({
        key: getActiveTabKey(),
        search: newSearch,
      });
    } else {
      handleBackList();
    }
  }, [history, activeKey, settleList, documentType, handleBackList]);

  // 付款自动分配
  const handlePayAutoMatch = useCallback(async () => {
    const res = await settleHeaderDs.setState('submitType', 'payAutoAssign').submit();
    if (!res) return;
    const { warnMessage } = res.content?.[0] || {};
    notification.success({ description: warnMessage });
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ documentType, settleHeaderId })
    );
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

  const handleValidateFrontData = useCallback(async () => {
    const validateRes = await settleHeaderDs.validate();
    if (!validateRes) {
      formatErrorInfo(
        settleHeaderDs,
        settleLineDs,
        intl.get(`ssta.supplySettle.view.title.settleDetailInfo`).d('结算明细信息')
      );
    }
    return validateRes;
  }, [settleHeaderDs, settleLineDs]);

  const handleSave = useCallback(async () => {
    const validateRes = await handleValidateFrontData();
    if (!validateRes) return;
    if (!payAutoAssignPermission && settleType !== 'INVOICE') {
      settleHeaderDs.current.set('paymentMatchFlag', 1);
    }
    if (remoteProps) {
      // 校验埋点
      const beforeSaveRes = await remoteProps.event.fireEvent('beforeSave', {
        settleHeaderDs,
      });
      if (beforeSaveRes === false) return false;
    }
    const lineData = settleLineDs.toJSONData();
    const res = await settleHeaderDs.setState('submitType', 'update').submit();
    if (!res) return;
    notification.success();
    await settleHeaderDs.query();
    if (taxInvoiceDs) taxInvoiceDs.query();
    if (paymentStageDs) paymentStageDs.query();
    if (isEmpty(lineData)) return;
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
  }, [
    settleType,
    settleHeaderDs,
    documentType,
    settleLineDs,
    payAutoAssignPermission,
    handleValidateFrontData,
    taxInvoiceDs,
    paymentStageDs,
    remoteProps,
  ]);

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
    const res = await settleHeaderDs.setState('submitType', 'submit').submit();
    if (!res) return false;
    if (taxInvApplyPreviewFlag) {
      handleToApplyInvoice('preview', true);
    } else handleSplitAction();
  }, [settleHeaderDs, handleSplitAction, taxInvApplyPreviewFlag, handleToApplyInvoice]);

  const handleDirectInvoiceSubmit = useCallback(() => {
    const taxIncludedAmount = settleHeaderDs.current?.get('taxIncludedAmount');
    const normalFlag =
      documentType === 'INVOICE' &&
      math.lt(taxIncludedAmount, 0) &&
      directInvoicingType === 'INVOICE_PLATFORM' &&
      invoiceMatchRuleCode === 'DIRECT_INVOICING';
    const porcessFlag = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.RED_NEG_INV_FILL_FLAG', normalFlag)
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

  // 第二次提交校验
  const handleSubmitValidate = useCallback(async () => {
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
  }, [
    remoteProps,
    settleHeaderDs,
    settleTypeMeaning,
    handleDirectInvoiceSubmit,
    handleSubmitWarnCancel,
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
            const cancelRes = await cancelSupplySettleLine(zeroLineList);
            settleHeaderDs.status = 'ready';
            if (!cancelRes) return;
            settleLineDs.remove(deleteRecords, true);
            const oldCount = settleLineDs.totalCount;
            settleLineDs.totalCount = oldCount - zeroLineList.length;
            settleHeaderDs.status = 'loading';
            const newHeaderData = getResponse(
              await getSettleHeaderDataSup({ settleHeaderId, documentType })
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
    const validateLineRes = getResponse(
      await debounceSubmitValidate(settleHeaderDs.current.toJSONData())
    );
    settleHeaderDs.status = 'ready';
    if (!validateLineRes) return;
    const { validatedResultDTO, settleLines } = validateLineRes;
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
  }, [settleHeaderDs, handlePayAutoMatch, handleValidateLine, handleSave]);

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
          intl.get(`ssta.supplySettle.view.title.taxInvoiceDetail`).d('税务发票明细')
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
          await getSettleHeaderDataSup({ documentType, settleHeaderId })
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

  // 提交入口
  const handleSubmit = useCallback(async () => {
    const frontDataValidRes = await handleValidateFrontData();
    if (!frontDataValidRes) return;
    if (remoteProps) {
      const beforeSubmitRes = await remoteProps.event.fireEvent('beforeSubmit', {
        documentType,
      });
      if (beforeSubmitRes === false) return false;
    }
    return handleValidateTaxInvoice();
  }, [handleValidateFrontData, handleValidateTaxInvoice, documentType, remoteProps]);

  const handleConfirm = useCallback(
    async (filledInfoDs) => {
      if (!['SUBMITED', 'WAIT_SUPPLIER_CONFIRM'].includes(settleStatus)) {
        const res = await filledInfoDs.setState('submitType', 'confirm').forceSubmit();
        if (res) return handleBackList();
      }
      const bankValidateRes = await filledInfoDs
        .setState('submitType', 'confirmValidate')
        .forceSubmit();
      if (!bankValidateRes) return false;
      const { validatedCode, msg } = bankValidateRes.content[0] || {};
      if (validatedCode === 'WARNING') {
        Modal.confirm({
          title: intl.get('ssta.common.view.message.tip').d('提示'),
          children: msg,
          autoCenter: true,
          onOk: async () => {
            const res = await filledInfoDs.setState('submitType', 'confirm').forceSubmit();
            if (!res) return;
            const { content = [] } = res || {};
            const { sdimApplyStatus } = content[0] || {};
            if (sdimApplyStatus === 'CREATE_SUCCESS') {
              // 如果结算策略的开票节点是审核且映射的开票规则是预览申请，跳转到开票申请单页
              return handleToApplyInvoice('confirm');
            }
            handleBackList();
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
        if (!res) return false;
        const { content = [] } = res || {};
        const { sdimApplyStatus } = content[0] || {};
        if (sdimApplyStatus === 'CREATE_SUCCESS') {
          // 如果结算策略的开票节点是审核且映射的开票规则是预览申请，跳转到开票申请单页
          return handleToApplyInvoice('confirm');
        }
        handleBackList();
      }
    },
    [settleStatus, handleBackList, handleToApplyInvoice]
  );

  const handleReturn = useCallback(
    async (filledInfoDs) => {
      const res = await filledInfoDs.setState('submitType', 'return').forceSubmit();
      if (!res) return false;
      handleBackList();
    },
    [handleBackList]
  );

  const handleCancel = useCallback(
    async (filledInfoDs) => {
      const {
        invoiceMatchRuleCode,
        directInvoicingType,
        settleType,
        settleStatus,
      } = settleHeaderDs.current.get([
        'invoiceMatchRuleCode',
        'directInvoicingType',
        'settleType',
        'settleStatus',
      ]);
      const handleCancelOpr = async () => {
        const bankValidateRes = await filledInfoDs
          .setState('submitType', 'cancelValidate')
          .forceSubmit();
        if (!bankValidateRes) return false;
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
          if (!res) return false;
          handleBackList();
        }
      };
      const ecFlag =
        invoiceMatchRuleCode === 'DIRECT_INVOICING' &&
        directInvoicingType === 'EC' &&
        settleType === 'INVOICE' &&
        settleStatus === 'CONFIRM';
      if (!ecFlag) return handleCancelOpr();
      Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl
          .get(`ssta.common.view.message.cancelSingleEcInvoiceWarning`)
          .d(
            '请注意：您当前正对线上直连开票成功的电商发票结算单进行取消，由于第三方电商暂未提供线上取消接口，您在srm取消时，需线下联系电商人员处理对方系统数据，否则将会阻塞您下次线上直连开票流程。'
          ),
        onOk: () => {
          return handleCancelOpr();
        },
      });
    },
    [handleBackList, settleHeaderDs]
  );

  const handleDelete = useCallback(async () => {
    const message = (
      <span>
        <span>{intl.get('ssta.common.view.message.confirm').d('确定要')}</span>
        <span>{intl.get('hzero.common.button.cancel').d('取消')}</span>
        <span>{settleTypeMeaning}</span>
        <span>{settleNum}?</span>
      </span>
    );
    if (remoteProps) {
      const beforeCancelRes = await remoteProps.event.fireEvent('beforeCancel', {
        modalOpen,
        settleHeaderDs,
      });
      if (beforeCancelRes === false) return false;
    }
    const confirmMsg = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL.CANCEL_CONFIRM_TIPS', message, {
          settleType,
          settleHeaderDs,
        })
      : message;
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
                redList={res}
                isDelete
                enableDirInvFlag={enableDirInvFlag}
              />
            ),
          });
        }
      } else handleDeleteOpr();
    };
    Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: confirmMsg,
      onOk: handleRedInv,
    });
  }, [
    modalOpen,
    settleHeaderDs,
    handleSplitAction,
    settleNum,
    settleTypeMeaning,
    handleBackList,
    remoteProps,
    documentType,
    settleStatus,
    directInvoicingType,
    invoiceMatchRuleCode,
    invoiceSettleCancelFlag,
    settleHeaderId,
    enableDirInvFlag,
    settleType,
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
  }, [settleHeaderDs, customizeTable, history, modalOpen]);

  const handleInvAutoMatch = useCallback(async () => {
    Modal.confirm({
      title: intl.get('ssta.common.view.title.taxInvoiceAutoMatch').d('税务发票自动匹配'),
      children: <SelectBox name="invoiceSpliteRule" dataSet={settleHeaderDs} />,
      onOk: async () => {
        const res = await settleHeaderDs.setState('submitType', 'invAutoMatch').forceSubmit();
        if (!res) return;
        settleHeaderDs.status = 'loading';
        const newHeaderData = getResponse(
          await getSettleHeaderDataSup({ settleHeaderId, documentType })
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
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ settleHeaderId, documentType })
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
        title:
          approveFlag || ['WAIT_SUPPLIER_INVOICE'].includes(settleStatus)
            ? intl.get(`ssta.supplySettle.view.title.approveInfo`).d('审核信息')
            : cancelFlag && intl.get(`ssta.supplySettle.view.title.cancelInfo`).d('取消信息'),
        children: (
          <FilledInfoModal
            onOk={onOk}
            action={action}
            enableDirInvFlag={enableDirInvFlag}
            redList={redList}
          />
        ),
      });
    },
    [
      approveFlag,
      cancelFlag,
      modalOpen,
      settleStatus,
      enableDirInvFlag,
      settleHeaderId,
      settleHeaderDs,
      documentType,
      directInvoicingType,
      invoiceMatchRuleCode,
      invoiceSettleCancelFlag,
    ]
  );

  // 点击取消之前的判断
  const handleCancelBefore = useCallback(async () => {
    if (directInvoicingType === 'INVOICE_PLATFORM' && Number(invoiceSettleCancelFlag) === 1) {
      const confirmRes = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: intl
          .get('ssta.common.view.help.directInvoiceCancelTips', { settleConfigNum })
          .d(
            '请注意：根据单据主策略{settleConfigNum}发票匹配规则配置，您取消发票结算单成功后，将自动红冲税票;由于srm暂不支持”红字发票信息确认单“在线申请以及确认流程，您需要线下完成此流程后再重新发起红冲。'
          ),
      });
      if (confirmRes !== 'ok') return;
    }
    handleFilledInfo('CANCEL', handleCancel);
  }, [
    handleFilledInfo,
    directInvoicingType,
    handleCancel,
    invoiceSettleCancelFlag,
    settleConfigNum,
  ]);

  const handleMainStrategy = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get(`ssta.supplySettle.message.panel.mainStrategyInfo`).d('主策略信息'),
      children: <MainStrategy />,
    });
  }, [modalOpen]);

  const handleOperationRecord = useCallback(() => {
    modalOpen({
      size: 'medium',
      editFlag: false,
      title: intl.get(`ssta.supplySettle.view.title.operationHistory`).d('操作记录'),
      children: <SettlementSheet settleHeaderId={settleHeaderId} />,
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

  const handleRevoke = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.title.tip').d('提示'),
      children: intl.get(`ssta.costSheet.model.costSheet.withdrawning`).d('是否撤回？'),
    });
    if (confirmRes !== 'ok') return false;
    const res = await settleHeaderDs.setState('submitType', 'revoke').forceSubmit();
    if (!res) return;
    handleBackList();
  }, [settleHeaderDs, handleBackList]);

  /**
   * 打开直连开票弹窗
   * @param trigger - 'confirm' | 'manual' | 'preview'
   */
  const handleToApplyInvoice = useCallback(
    async (trigger, flag) => {
      settleHeaderDs.status = 'loading';
      const res = getResponse(
        await getDirectInvoiceApplysettleNum({ settleHeaderId, apiType: 'normal' })
      );
      settleHeaderDs.status = 'ready';
      if (!res || isEmpty(res)) return;
      const applyList = res.map(({ applyNum, applyHeaderId }) => ({ applyNum, applyHeaderId }));
      const { applyHeaderId, billingType } = applyList[0];
      const baseSearch = {
        applyHeaderId,
        sourceDocId: settleHeaderId,
        type: 'edit',
        source: 'settle',
        apiType: 'transform',
        trigger,
        sourceDocNum: settleNum,
        docSearchFlag: applyList.length > 1, // 开票申请单详情页是否查询标识
        operateType: type,
        dataSource: 'SRM_SETTLE_HEADER',
        billingType,
      };
      if (flag) handleSplitAction();
      history.push({
        pathname: `/ssta/direct-pool-supply/apply/detail`,
        search: stringify(baseSearch),
      });
    },
    [settleHeaderId, settleHeaderDs, settleNum, type, handleSplitAction, history]
  );

  // 税票申请预览
  // const handlePreviewTaxInvApply = useCallback(async () => {
  //   const res = await settleHeaderDs.setState('submitType', 'taxInvApplyPreview').forceSubmit();
  //   if (!res) return;
  //   const { content = [] } = res || {};
  //   const { sdimApplyStatus } = content[0] || {};
  //   if (sdimApplyStatus === 'CREATE_SUCCESS') {
  //     // 如果结算策略的开票节点是审核且映射的开票规则是预览申请，跳转到开票申请单页
  //     return handleToApplyInvoice('preview');
  //   }
  // }, [settleHeaderDs, handleToApplyInvoice]);

  const handlePrint = useCallback(async () => {
    settleHeaderDs.status = 'loading';
    const flag = checkPrintWindow();
    const printRes = getResponse(
      await print({
        settleHeaderId,
        responseType: flag ? 'blob' : 'json',
        headers: flag ? {} : { 's-print-using-preview': '1' },
        menuCamp: 'SUPPLIER',
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
          const syncRes = getResponse(await syncPrintData([settleHeaderDs.current.toJSONData()]));
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
      const syncRes = getResponse(await syncPrintData([settleHeaderDs.current.toJSONData()]));
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
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ documentType, settleHeaderId })
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
  }, [settleHeaderDs, settleHeaderId, documentType, taxInvoiceDs]);

  // const handleDirectInvoice = useCallback(async () => {
  //   const res = await settleHeaderDs.setState('submitType', 'directInvoice').forceSubmit();
  //   if (!res) return;
  //   const { content = [] } = res || {};
  //   const { sdimApplyStatus } = content[0] || {};
  //   if (sdimApplyStatus === 'CREATE_SUCCESS') {
  //     // 如果结算策略的开票节点是审核且映射的开票规则是预览申请，跳转到开票申请单页
  //     return handleToApplyInvoice('manual');
  //   }
  //   handleBackList();
  // }, [settleHeaderDs, handleToApplyInvoice, handleBackList]);

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
    handleBackList();
  }, [settleHeaderDs, handleBackList]);

  const headerBtns = useMemo(() => {
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
      // updateFlag &&
      //   taxInvApplyPreviewFlag && {
      //     name: 'taxInvApplyPreview',
      //     child: intl.get('ssta.common.view.button.taxInvApplyPreview').d('税票申请预览'),
      //     btnProps: {
      //       icon: 'find_in_page',
      //       loading,
      //       wait: 1000,
      //       onClick: handlePreviewTaxInvApply,
      //     },
      //   },
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
      // 当为直连开票异常且直连开票类型为电商的时候不显示取消
      updateFlag &&
        !(
          settleStatus === 'INVOICE_EXCEPTION' &&
          settleHeaderDs.current?.get('directInvoicingType') === 'EC'
        ) && {
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
        settleStatus !== 'INVOICE_EXCEPTION' &&
        permissionMap.get(`invoiceAutoMatch`) && {
          name: 'invoiceAutoMatch',
          child: intl.get(`ssta.purchaseSettle.button.invoiceAutoMatch`).d('发票自动匹配'),
          btnProps: {
            loading,
            await: 500,
            icon: 'baseline-file_copy',
            onClick: handleInvAutoMatch,
          },
        },
      updateFlag &&
        documentType === 'INVOICE' &&
        Number(amountAdjustFlag) === 1 &&
        invoiceUxFlag !== 1 &&
        toleAdjustManualCuxFlag &&
        permissionMap.get(`toleranceAdjust`) && {
          name: 'toleranceAdjust',
          child: intl.get(`ssta.purchaseSettle.button.toleranceAdjust`).d('尾差调整'),
          btnProps: {
            loading,
            await: 500,
            icon: 'adjust',
            onClick: handleConfirmToleranceAdjust,
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
      cancelFlag && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          loading,
          onClick: () => handleCancelBefore(),
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
      }) &&
        ['CONFIRM', 'BOTH'].includes(checkPointCode) && {
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
            wait: 1000,
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
        permissionMap.get(`auditPane`) && {
          name: 'approveBtn',
          child: intl.get('ssta.common.button.approve').d('审核'),
          btnProps: {
            icon: 'authorize',
            loading,
            onClick: () => handleToLastDetail('approve'),
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
        camp === 'SUPPLIER' &&
        ((['SUBMITED'].includes(settleStatus) && permissionMap.get('recallBtn')) ||
          (['SUBMITED_APPROVING'].includes(settleStatus) &&
            permissionMap.get('recallWorkflowBtn')) ||
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
      readOnlyFlag &&
        settleStatus === 'WAIT_SUPPLIER_INVOICE' && {
          name: 'directInvoice',
          child: intl.get('ssta.common.button.directInvoice').d('直连开票'),
          btnProps: {
            loading,
            wait: 1000,
            icon: 'request_page',
            onClick: () => handleFilledInfo('CONFIRM', handleConfirm), // 调用确认接口
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
            data: { settleHeaderIdList: [settleHeaderId], menuCamp: 'SUPPLIER' },
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
          child: intl.get('ssta.common.button.collectApplyQuery').d('收款申请执行查询'),
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
    ].filter(Boolean);

    const btns = remoteProps
      ? remoteProps.process('SSTA_SUPPLYSETTLE_DETAIL_BTNS', standardBtns, {
          record: settleHeaderDs?.current,
          handleValidateFrontData,
          settleHeaderDs,
          loading,
          remotePageData,
          handleBackList,
          updateFlag,
          taxInvoiceDs,
          settleLineDs,
          type,
          notPub,
        })
      : standardBtns;
    return formatDynamicBtns(btns);
  }, [
    camp,
    allFlag,
    settleType,
    settleList,
    approveBtn,
    approveFlag,
    cancelBtn,
    cancelFlag,
    checkPointCode,
    documentType,
    remotePageData,
    enableCheckFlag,
    handleConfirm,
    handleFilledInfo,
    handleOperationRecord,
    handlePrint,
    handleReturn,
    handleDelete,
    handleSave,
    handleSubmit,
    handleToLastDetail,
    loading,
    notPub,
    permissionMap,
    updateBtn,
    updateFlag,
    handleTaxCheck,
    handleMainStrategy,
    settleHeaderDs,
    settleStatus,
    amountAdjustFlag,
    handleInvAutoMatch,
    toleAdjustManualCuxFlag,
    handleConfirmToleranceAdjust,
    invoiceUxFlag,
    // handleDirectInvoice,
    readOnlyFlag,
    printBtnDisable,
    settleHeaderId,
    handleNewPrintOkCallback,
    remoteProps,
    handleBatchEdit,
    // taxInvApplyPreviewFlag,
    // handlePreviewTaxInvApply,
    handleValidateFrontData,
    taxInvoiceDs,
    handleRevoke,
    handlePayApplyQuery,
    settleLineDs,
    handleDeleteSettle,
    handleCancelBefore,
    handleBackList,
    type,
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
              { code: 'SSTA.SUPPLY_SETTLE_DETAIL.HEAD_BTNS', pro: true },
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
