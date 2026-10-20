/*
 * @Description: file content
 * @Date: 2022-02-09 11:39:13
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @version: 0.0.1
 * @copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import React, { useMemo, useContext, useCallback, Fragment, useEffect, useState } from 'react';
import { Button, Tabs, Modal, useModal, Tooltip, Icon } from 'choerodon-ui/pro';
import { isEmpty, isNil, isArray, pick } from 'lodash';
import { observer } from 'mobx-react';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { SRM_SSTA } from '_utils/config';
import notification from 'utils/notification';
import CommonImport from 'components/Import';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from '_components/DynamicButtons';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import affairIcon from '@/assets/affair.svg';
import affairSuccessIcon from '@/assets/affair_success.svg';
import invDoneIcon from '@/assets/inv_done.svg';
import invDoneSuccessIcon from '@/assets/inv_done_success.svg';
import multiAssignIcon from '@/assets/multi_assign.svg';
import multiAssignSuccessIcon from '@/assets/multi_assign_success.svg';
import payInfoIcon from '@/assets/pay_info.svg';
import payInfoSuccessIcon from '@/assets/pay_info_success.svg';
import quoteInvIcon from '@/assets/quote_inv.svg';
import quoteInvSuccessIcon from '@/assets/quote_inv_success.svg';
import settleLineIcon from '@/assets/settle_line.svg';
import settleLineSuccessIcon from '@/assets/edit_settle_line_success.svg';
import taxInvIcon from '@/assets/tax_inv.svg';
import taxInvSuccessIcon from '@/assets/tax_inv_success.svg';
import {
  getSettleHeaderDataSup,
  saveCreateSettleStep,
  getInvoiceLineCount,
} from '@/services/settlePoolServices';
import { recordPickValues, transformQselectDate, transformSupplierData } from '@/utils/utils';
import { getPaymentCreateSelectConfig } from '@/utils/api';
import { Store } from '../Detail/StoreProvider';
import CreateSettleSteps from '../components/CreateSettleSteps';
import QuoteInvoice from '../components/QuoteInvoice';
import SettleAffair from '../components/SettleAffair';
import SettleLine from '../components/SettleLine';
import TaxInvoice from '../components/TaxInvoice';
import TaxInvoicePool from '../components/TaxInvoicePool';
import PaymentInfo from '../components/PaymentInfo';
import MultiDimensionPay from '../components/MultiDimensionPay';
import { useModalOpen } from '../hooks';
import BatchEditHeader from '../components/BatchEditHeader';
import styles from './index.less';
import { clickDefaultPlanAmountFlagger } from '@/utils/amountConfig';
import commonStyles from '@/routes/common.less';
import { getCustomValidationResponse } from '@/components/CustomValidation';

const { TabPane } = Tabs;
const organizationId = getCurrentOrganizationId();
const apiPrefix = `${SRM_SSTA}/v1/${organizationId}`;

export default observer(() => {
  const {
    modal,
    history,
    tenantId,
    branchStep,
    onQueryList,
    defaultCurrent,
    settleType,
    documentType,
    settleLineDs,
    quoteInvoiceDs,
    settleHeaderDs,
    settleHeaderId,
    settleAffairDs,
    settleLineAddDs,
    headPayment,
    stepNameList,
    headPrePaymentVer,
    multiDimensionPayDs,
    headMultiDimensionPayment,
    permissionMap,
    baseInvFlag,
    loading,
    remoteProps,
    headerTitle,
    setHeaderTitle, // 如果是一个页面，会传递setHeaderTitle来更新Header
    advanceInvFlag,
    taxInvoiceDs,
    taxInvoicePoolDs,
    customizeBtnGroup,
  } = useContext(Store);
  const stateCurrent = settleHeaderDs.current?.getState('current');
  const current = isNil(stateCurrent) ? defaultCurrent : stateCurrent;
  const { selected: quoteInvoiceSelected = [] } = quoteInvoiceDs || {};
  const { selected: settleAffairSelected = [] } = settleAffairDs || {};
  const { selected: settleAddLineSelected = [] } = settleLineAddDs || {};
  const { selected: taxInvoicePoolSelected = [] } = taxInvoicePoolDs || {};
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const branchFlag = [branchStep, settleHeaderDs.current?.get('branchStep')].includes(
    'SETTLE_LINE'
  );
  const { paymentDimension, paymentControlRuleSource, prepaymentDimensionMeaning } =
    settleHeaderDs.current?.get([
      'paymentDimension',
      'paymentControlRuleSource',
      'prepaymentDimensionMeaning',
    ]) || {};
  const paymentDimensionParam = multiDimensionPayDs.queryDataSet?.current?.get('paymentDimension');
  const endTitleMap = useMemo(
    () => ({
      INVOICE: intl.get(`ssta.supplySettle.view.title.generateInvoice`).d('生成发票申请单'),
      PAYMENT: intl.get(`ssta.supplySettle.view.title.generateCollection`).d('生成收款申请单'),
      INVOICE_PAYMENT: intl
        .get(`ssta.supplySettle.view.title.generateColIncludeInv`)
        .d('生成收款申请单（含发票）'),
    }),
    []
  );

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

  const getQuoteInvoiceExportParams = useCallback(() => {
    const { queryParameter } = quoteInvoiceDs;
    if (isEmpty(quoteInvoiceSelected)) {
      const queryData = quoteInvoiceDs.queryDataSet?.current?.toData() || {};
      return filterNullValueObject({
        ...queryData,
        ...queryParameter,
        ...transformQselectDate(queryData, { creationDateRange: 'creationDate' }),
        ...transformSupplierData(queryData.supplierCompanyId),
      });
    } else {
      return {
        ...queryParameter,
        settleHeaderIdList: quoteInvoiceSelected.map((record) => record.get('settleHeaderId')),
      };
    }
  }, [quoteInvoiceDs, quoteInvoiceSelected]);

  const handleSetActiveKey = useCallback(
    (key) => {
      settleHeaderDs.currentIndex = key;
      handleUpdateTitle();
    },
    [settleHeaderDs, handleUpdateTitle]
  );

  const handleUpdateTitle = useCallback(() => {
    const originTitle = headerTitle || modal.props.title;
    const baseTitle = originTitle.split('-')[0];
    const {
      settleNum = '',
      currencyCode = '',
      taxIncludedAmount = '',
      invoiceNetAmount = '',
      invoiceTaxAmount = '',
      companyName = '',
      companyNum = '',
      supplierCompanyName = '',
      supplierCompanyNum = '',
    } =
      settleHeaderDs.current.get([
        'settleNum',
        'currencyCode',
        'taxIncludedAmount',
        'invoiceNetAmount',
        'invoiceTaxAmount',
        'companyName',
        'companyNum',
        'supplierCompanyName',
        'supplierCompanyNum',
      ]) || {};
    let filledTitle =
      settleType === 'PAYMENT'
        ? settleHeaderDs.totalCount > 1
          ? ''
          : `-${settleNum}`
        : `-${settleNum} ${taxIncludedAmount} ${currencyCode}`;
    if (advanceInvFlag) {
      filledTitle = `-${companyNum || ''} ${companyName || ''} ${supplierCompanyNum || ''} ${
        supplierCompanyName || ''
      } ${intl
        .get(`ssta.common.view.message.taxInvNetAmount`)
        .d('税务发票不含税金额')}:${invoiceNetAmount},${intl
        .get(`ssta.common.view.message.deductibleAmount`)
        .d('可抵扣金额')}:${invoiceTaxAmount}`;
    }
    const newTitle = baseTitle + filledTitle;
    // 如果是一个页面的情况下，title显示在Header上
    if (setHeaderTitle) {
      setHeaderTitle(newTitle);
    } else {
      modal.update({ title: newTitle });
    }
  }, [modal, settleHeaderDs, settleType, setHeaderTitle, advanceInvFlag, headerTitle]);

  const handleToDetail = useCallback(
    (currentHeaderId, settleList = []) => {
      if (settleList.length > 1) {
        const { settleHeaderId: firstHeaderId } = settleList[0];
        history.push({
          pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${firstHeaderId}`,
          search: stringify({
            source: 'step',
            type: 'update',
            list: JSON.stringify(settleList),
          }),
        });
      } else {
        const params = { source: 'step', type: 'update' };
        if (advanceInvFlag) params.advanceInvFlag = true;
        history.push({
          pathname: `/ssta/new-supply-settle/${documentType.toLowerCase()}/${currentHeaderId}`,
          search: stringify(params),
        });
      }
    },
    [history, documentType, advanceInvFlag]
  );

  const handleSetStepsCurrent = useCallback(
    async (type, options) => {
      const { okNoticeOptions = {} } = options || {};
      const stateCurrent = settleHeaderDs.current?.getState('current');
      const oldCurrent = isNil(stateCurrent) ? defaultCurrent : stateCurrent;
      const newCurrent = type === 'next' ? oldCurrent + 1 : oldCurrent - 1;
      settleHeaderDs.current.setState('current', newCurrent);
      if (type === 'next' && !advanceInvFlag) notification.success(okNoticeOptions);
      const step = stepNameList[newCurrent];
      if (!step) return;
      const currentHeaderId = settleHeaderDs.current?.get('settleHeaderId');
      const objectVersionNumber = settleHeaderDs.current?.get('objectVersionNumber');
      // 如果是先发票且不是最后一步，不调用该接口
      if (!(advanceInvFlag && step !== 'END')) {
        settleHeaderDs.status = 'loading';
        const res = getResponse(
          await saveCreateSettleStep({
            step,
            settleHeaderId: currentHeaderId,
            objectVersionNumber,
          })
        );
        settleHeaderDs.status = 'ready';
        if (!res) return;
        settleHeaderDs.current.init('objectVersionNumber', res.objectVersionNumber);
      }
      settleHeaderDs.current.init('step', step);
      if (step === 'END') {
        const hasNotEndRecord = settleHeaderDs.some((record) => record.get('step') !== 'END');
        if (!hasNotEndRecord) {
          const settleList = settleHeaderDs.map((record) =>
            record.get(['settleHeaderId', 'settleNum'])
          );
          handleToDetail(currentHeaderId, settleList);
        } else {
          const nextNotEndIndex = settleHeaderDs.findIndex(
            (record, index) => index > settleHeaderDs.currentIndex && record.get('step') !== 'END'
          );
          if (nextNotEndIndex > -1) {
            handleSetActiveKey(nextNotEndIndex);
            return;
          }
          const firstNotEndIndex = settleHeaderDs.findIndex(
            (record) => record.get('step') !== 'END'
          );
          if (firstNotEndIndex > -1) {
            handleSetActiveKey(firstNotEndIndex);
          }
        }
      }
    },
    [
      defaultCurrent,
      settleHeaderDs,
      stepNameList,
      handleSetActiveKey,
      handleToDetail,
      advanceInvFlag,
    ]
  );

  const handleSaveBranchStep = useCallback(async () => {
    const stateCurrent = settleHeaderDs.current?.getState('current');
    if (isNil(stateCurrent)) {
      settleHeaderDs.current.setState('current', 1);
    }
    const objectVersionNumber = settleHeaderDs.current?.get('objectVersionNumber');
    settleHeaderDs.status = 'loading';
    const res = getResponse(
      await saveCreateSettleStep({
        step: 'SETTLE_LINE',
        branchStep: 'SETTLE_LINE',
        settleHeaderId,
        objectVersionNumber,
      })
    );
    settleHeaderDs.status = 'ready';
    if (!res) return;
    settleHeaderDs.current.init('step', 'SETTLE_LINE');
    settleHeaderDs.current.init('branchStep', 'SETTLE_LINE');
    settleHeaderDs.current.init('objectVersionNumber', res.objectVersionNumber);
  }, [settleHeaderDs, settleHeaderId]);

  const handleCreateSelected = useCallback(async () => {
    const res = await settleAffairDs.setState('submitType', 'createSelected').submit();
    if (!res || isEmpty(res.content)) return;
    const { step, settleHeaderId: currentHeaderId } = res.content[0] || {};
    const settleList = res.content.map((item) => ({
      settleHeaderId: item.settleHeaderId,
      settleNum: item.settleNum,
    }));
    // // 纯发票申请单开启账扣后单据创建即完成提交，无需打开step或者跳转详情页
    // if (settleType === 'INVOICE' && enableChargeDebitFlag === 1) {
    //   notification.success();
    //   onQueryList();
    //   modal.close();
    // }
    // 结算策略配置跳过step，直接跳转结算单详情页
    if (step === 'END') {
      notification.success();
      handleToDetail(currentHeaderId, settleList);
      return;
    }
    const settleHeaderIds = res.content.map((item) => item.settleHeaderId).join();
    const paramName = res.content.length > 1 ? 'settleHeaderIds' : 'settleHeaderId';
    settleHeaderDs.setQueryParameter(paramName, settleHeaderIds);
    await settleHeaderDs.query();
    handleUpdateTitle();
    settleHeaderDs.forEach((record) => record.setState('current', 1));
    notification.success();
    await settleAffairDs.query();
    settleAffairDs.clearCachedSelected();
    if (onQueryList) onQueryList();
  }, [settleAffairDs, settleHeaderDs, onQueryList, handleToDetail, handleUpdateTitle]);

  // 处理勾选异步创建，成功后关闭弹框，然后弹出提示内容
  const handleSyncCreateSelected = useCallback(async () => {
    settleAffairDs.dataToJSON = 'selected';
    const res = await settleAffairDs.setState('submitType', 'createSelectedSync').submit();
    if (!res) return;
    Modal.destroyAll();
    notification.success({
      duration: 8,
      message: intl
        .get('ssta.common.view.message.waiting.settleCreateAll')
        .d(
          '单据后台处理中，创建成功的单据，将通过系统消息提示，并可在结算单工作台可编辑、全部页签中找到单据进行及编辑；操作失败的事务将重新展示在结算池'
        ),
    });
    settleAffairDs.query();
  }, [settleAffairDs]);

  const handleCreatePayQuoteInvSync = useCallback(async () => {
    quoteInvoiceDs.dataToJSON = 'selected';
    const res = await quoteInvoiceDs.setState('submitType', 'createSelectedSync').submit();
    if (!res) return;
    Modal.destroyAll();
    notification.success({
      duration: 8,
      message: intl
        .get('ssta.common.view.message.waiting.settleCreateAll')
        .d(
          '单据后台处理中，创建成功的单据，将通过系统消息提示，并可在结算单工作台可编辑、全部页签中找到单据进行及编辑；操作失败的事务将重新展示在结算池'
        ),
    });
    quoteInvoiceDs.query();
  }, [quoteInvoiceDs]);

  const handleCreatePayQuoteInv = useCallback(async () => {
    const res = await quoteInvoiceDs.setState('submitType', 'submit').submit();
    if (!res) return;
    notification.success();
    const { step, settleHeaderId: currentHeaderId } = res.content[0];
    const settleList = res.content.map((item) => ({
      settleHeaderId: item.settleHeaderId,
      settleNum: item.settleNum,
    }));
    if (step === 'END') {
      handleToDetail(currentHeaderId, settleList);
      return;
    }
    const settleHeaderIds = res.content.map((item) => item.settleHeaderId).join();
    const paramName = res.content.length > 1 ? 'settleHeaderIds' : 'settleHeaderId';
    settleHeaderDs.setQueryParameter(paramName, settleHeaderIds);
    await settleHeaderDs.query();
    handleUpdateTitle();
    settleHeaderDs.forEach((record) => record.setState('current', 1));
    // notification.success();
    await quoteInvoiceDs.query();
    quoteInvoiceDs.clearCachedSelected();
    if (onQueryList) onQueryList();
  }, [quoteInvoiceDs, settleHeaderDs, onQueryList, handleToDetail, handleUpdateTitle]);

  const handleCreate = useCallback(
    async (type) => {
      // 埋点校验通过之后的操作
      const handleContinueAddAfterValidate = async () => {
        if (type === 'selected') {
          if (settleType === 'PAYMENT') {
            // 付款 引用事务勾选创建时，先查询配置表最大数量，然后根据阈值判断走原来逻辑还是新的异步创建逻辑
            const { selected } = settleAffairDs;
            const syncFlag = math.gte(selected.length, selectedThreshold);
            if (syncFlag) {
              // 异步创建不走校验
              return handleSyncCreateSelected();
            } else {
              const res = await settleAffairDs
                .setState('submitType', 'createSelectedValidate')
                .submit();
              if (!res) return;
              return getCustomValidationResponse(res.content[0], handleCreateSelected);
            }
          } else {
            return handleCreateSelected();
          }
        } else if (type === 'all') {
          const confirmRes = await Modal.confirm({
            title: intl.get('ssta.common.view.title.tip').d('提示'),
            children: intl
              .get(`ssta.common.view.confirm.selectTotalCountSettleAffairToCreate`, {
                count: settleAffairDs.totalCount > 1000 ? '1000+' : settleAffairDs.totalCount,
              })
              .d('您已选择全部结算事务，共 {count} 条，请确认是否新建'),
          });
          if (confirmRes !== 'ok') return;
          settleAffairDs.dataToJSON = 'all';
          const res = await settleAffairDs.setState('submitType', 'createAll').submit();
          settleAffairDs.dataToJSON = 'selected';
          if (!res) return;
          Modal.destroyAll();
          notification.success({
            duration: 8,
            message: intl
              .get('ssta.common.view.message.waiting.settleCreateAll')
              .d(
                '单据后台处理中，创建成功的单据，将通过系统消息提示，并可在结算单工作台可编辑、全部页签中找到单据进行及编辑；操作失败的事务将重新展示在结算池'
              ),
          });
          await settleAffairDs.query();
        } else if (type === 'batch') {
          const templateCode =
            documentType === 'INVOICE'
              ? 'SSTA.SETTLE_POOL_INV_CREATE'
              : 'SSTA.SETTLE_POOL_PAY_CREATE';
          history.push({
            pathname: `/ssta/new-supply-settle/data-import/${templateCode}`,
            search: stringify({
              backPath: `/ssta/new-supply-settle/list`,
              action: intl.get('ssta.common.title.batchImport').d('批量导入'),
              historyButton: false,
              args: JSON.stringify({
                camp: 'SUPPLIER',
                templateCode,
                tenantId,
              }),
            }),
          });
        } else if (type === 'quoteInvoice') {
          // 查询发票行数据
          const { selected } = quoteInvoiceDs;
          const settleHeaderIds = selected.map((item) => {
            return { settleHeaderId: item?.get('settleHeaderId') };
          });
          const resCount = await getInvoiceLineCount(settleHeaderIds);
          let num = 0;
          if (resCount && isArray(resCount)) {
            num = math.sum(...resCount.map((item) => item.settleLineCount || 0));
          }
          if (math.gte(num, selectedThreshold)) {
            // 异步不走校验
            return handleCreatePayQuoteInvSync();
          } else {
            const res = await quoteInvoiceDs.setState('submitType', 'createValidate').submit();
            if (!res) return;
            return getCustomValidationResponse(res.content[0], handleCreatePayQuoteInv);
          }
        } else if (type === 'createInvSelected') {
          const data = taxInvoicePoolDs.selected.map((item) => item.toData());
          const res = await settleLineAddDs
            .setState('submitType', 'createInvSelected')
            .setState('invoiceHeaderList', data)
            .submit();
          if (!res) return;
          const { content = [] } = res || {};
          // settleHeaderDs.current.set({...content[0] || {}, step: 'END'});
          // const settleList = content.map((item) => ({
          //   settleHeaderId: item.settleHeaderId,
          //   settleNum: item.settleNum,
          // }));
          return handleAdvanceInvCreate(content);
          // handleToDetail(content[0]?.settleHeaderId, settleList);
          // handleToleranceAdjust();
        } else if (type === 'createInvAll') {
          const confirmRes = await Modal.confirm({
            title: intl.get('ssta.common.view.title.tip').d('提示'),
            children: intl
              .get(`ssta.common.view.confirm.selectTotalCountSettleAffairToCreate`, {
                count: settleLineAddDs.totalCount > 1000 ? '1000+' : settleLineAddDs.totalCount,
              })
              .d('您已选择全部结算事务，共 {count} 条，请确认是否新建'),
          });
          if (confirmRes !== 'ok') return;
          const data = taxInvoicePoolDs.selected.map((item) => item.get('invoiceHeaderId'));
          settleLineAddDs.dataToJSON = 'all';
          const res = await settleLineAddDs
            .setState('submitType', 'createInvAll')
            .setState('invoiceHeaderIds', data.join())
            .submit();
          settleLineAddDs.dataToJSON = 'selected';
          if (!res) return;
          Modal.destroyAll();
          notification.success({
            duration: 8,
            message: intl
              .get('ssta.common.view.message.waiting.settleCreateAll')
              .d(
                '单据后台处理中，创建成功的单据，将通过系统消息提示，并可在结算单工作台可编辑、全部页签中找到单据进行及编辑；操作失败的事务将重新展示在结算池'
              ),
          });
          settleLineAddDs.query();
        }
      };
      if (remoteProps?.event) {
        const beforeCreateSupplySettleRes = await remoteProps.event.fireEvent(
          'beforeCreateSupplySettle',
          {
            type,
            settleAffairDs,
            handleContinueAddAfterValidate,
          }
        );
        if (beforeCreateSupplySettleRes === false) return false;
      }
      await handleContinueAddAfterValidate();
    },
    [
      tenantId,
      history,
      settleType,
      settleAffairDs,
      quoteInvoiceDs,
      documentType,
      settleLineAddDs,
      handleAdvanceInvCreate,
      taxInvoicePoolDs,
      handleCreateSelected,
      handleCreatePayQuoteInv,
      selectedThreshold,
      handleSyncCreateSelected,
      handleCreatePayQuoteInvSync,
    ]
  );

  const handleAdvanceInvCreate = useCallback(
    async (content = []) => {
      const settleList = content.map((item) => ({
        settleHeaderId: item.settleHeaderId,
        settleNum: item.settleNum,
      }));
      settleHeaderDs.status = 'loading';
      const response = getResponse(
        await saveCreateSettleStep({
          step: 'END',
          settleHeaderId: content[0]?.settleHeaderId,
          objectVersionNumber: content[0]?.objectVersionNumber,
        })
      );
      settleHeaderDs.status = 'ready';
      if (!response) return;
      handleToDetail(content[0]?.settleHeaderId, settleList);
    },
    [handleToDetail, settleHeaderDs]
  );

  const handleSettleLineAddOk = useCallback(async () => {
    if (isEmpty(settleLineAddDs.selected)) {
      return handleSetStepsCurrent('next');
    }
    const addSettleLine = async () => {
      const res = await settleLineAddDs.setState('submitType', 'addSettleLine').submit();
      if (!res) return false;
      await settleLineAddDs.query();
      settleLineAddDs.clearCachedSelected();
      // 如果从下一步返回了上一步，选择了事务需要重新再更新下已选的结算事务数据
      settleLineDs.query();
      const cuszLineDs = settleHeaderDs.children?.attributeList;
      if (cuszLineDs) cuszLineDs.query();
      settleHeaderDs.status = 'loading';
      const newHeaderData = getResponse(
        await getSettleHeaderDataSup({ documentType, settleHeaderId })
      );
      settleHeaderDs.status = 'ready';
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
      ]);
      handleUpdateTitle();
      return handleSetStepsCurrent('next');
    };
    if (settleType === 'PAYMENT') {
      const res = await settleLineAddDs.setState('submitType', 'addSettleLineValidate').submit();
      if (!res) return;
      return getCustomValidationResponse(res.content[0], addSettleLine);
    } else {
      return addSettleLine();
    }
  }, [
    settleType,
    settleLineDs,
    settleHeaderDs,
    settleLineAddDs,
    documentType,
    handleUpdateTitle,
    settleHeaderId,
    handleSetStepsCurrent,
  ]);

  const handleCancel = useCallback(async () => {
    if (settleHeaderId) {
      const { settleNum, settleTypeMeaning } = settleHeaderDs.current.get([
        'settleNum',
        'settleTypeMeaning',
      ]);
      const confirmModal = Modal.open({
        border: false,
        header: null,
        className: 'c7n-pro-confirm-wrapper',
        children: (
          <div className="c7n-pro-confirm">
            <div className="c7n-pro-confirm-title">
              {intl.get('ssta.common.view.message.tip').d('提示')}
            </div>
            <div className="c7n-pro-confirm-content">
              <span>{intl.get('ssta.common.view.message.confirm').d('确定要')}</span>
              <span>{intl.get('hzero.common.button.cancel').d('取消')}</span>
              <span>{settleTypeMeaning}</span>
              <span>{settleNum}?</span>
            </div>
            <div>
              {intl
                .get('ssta.common.view.message.freeAffairAfterCancel')
                .d('取消后将会释放结算事务')}
            </div>
          </div>
        ),
        okText: intl.get('ssta.common.view.button.confirmCancelDocument').d('确认取消单据'),
        cancelText: intl.get('ssta.common.view.button.gottaThink').d('我再想想'),
        onOk: () => handleDeleteSettle(confirmModal),
        footer: (okBtn, cancelBtn) => [
          cancelBtn,
          <Button onClick={() => handleSaveSettle(confirmModal)}>
            {intl.get('ssta.common.view.button.saveDraft').d('保存草稿')}
          </Button>,
          okBtn,
        ],
      });
    } else {
      modal.close();
    }
  }, [modal, settleHeaderId, handleDeleteSettle, handleSaveSettle, settleHeaderDs]);

  const handleInvCancel = useCallback(
    async (type) => {
      if (type === 'addair') {
        Modal.open({
          border: false,
          header: null,
          className: 'c7n-pro-confirm-wrapper',
          children: (
            <div className="c7n-pro-confirm">
              <div className="c7n-pro-confirm-title">
                {intl.get('ssta.common.view.message.tip').d('提示')}
              </div>
              <div>
                {intl
                  .get('ssta.common.view.message.cancelInvAffair')
                  .d('确认取消当前单据？您当前勾选的税务发票将不被记录，下次新建时需重新勾选')}
              </div>
            </div>
          ),
          okText: intl.get('ssta.common.view.button.confirmCancelDocument').d('确认取消单据'),
          cancelText: intl.get('ssta.common.view.button.gottaThink').d('我再想想'),
          onOk: () => modal.close(),
        });
      } else modal.close();
    },
    [modal]
  );

  const handleSavePayInfo = useCallback(async () => {
    const okNoticeOptions = {};
    const headerValidateFlag = await settleHeaderDs.current.validate(true, true);
    if (!headerValidateFlag) return;
    if ([headPayment, headPrePaymentVer].includes('EDIT')) {
      const assignRes = await settleHeaderDs.setState('submitType', 'payAutoAssign').forceSubmit();
      const { warnMessage } = assignRes.content?.[0] || {};
      okNoticeOptions.description = warnMessage;
      if (!assignRes) return;
      settleHeaderDs.status = 'loading';
      const newHeaderData = getResponse(
        await getSettleHeaderDataSup({ documentType, settleHeaderId })
      );
      settleHeaderDs.status = 'ready';
      if (!newHeaderData) return;
      settleHeaderDs.current.set(
        pick(newHeaderData, [
          'applyAmount',
          'paymentAmount',
          'paymentSpliteRule',
          'prepaymentSpliteRule',
          'objectVersionNumber',
        ])
      );
    }
    const res = await settleHeaderDs.setState('submitType', 'update').forceSubmit();
    if (!res) return;
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ documentType, settleHeaderId })
    );
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    settleHeaderDs.current.commit(newHeaderData, settleHeaderDs);
    return handleSetStepsCurrent('next', { okNoticeOptions });
  }, [
    settleHeaderDs,
    handleSetStepsCurrent,
    headPayment,
    headPrePaymentVer,
    documentType,
    settleHeaderId,
  ]);

  // 移除当前记录前需要计算下一个待操作的单据并跳转
  const handleRemoveCurrent = useCallback(
    (confirmModal) => {
      const hasOtherNotEnd = settleHeaderDs.some(
        (record, index) => record.get('step') !== 'END' && index !== settleHeaderDs.currentIndex
      );
      if (hasOtherNotEnd) {
        settleHeaderDs.remove(settleHeaderDs.current, true);
        const settleHeaderIds = settleHeaderDs.getQueryParameter('settleHeaderIds') || '';
        const newSettleHeaderIds = settleHeaderIds
          .split(',')
          .filter((id) => id !== String(settleHeaderId))
          .join();
        settleHeaderDs.setQueryParameter('settleHeaderIds', newSettleHeaderIds);
        const firstNotEndIndex = settleHeaderDs.findIndex((record) => record.get('step') !== 'END');
        confirmModal.close();
        handleSetActiveKey(firstNotEndIndex);
      } else {
        Modal.destroyAll();
        if (onQueryList) onQueryList();
      }
    },
    [settleHeaderDs, settleHeaderId, onQueryList, handleSetActiveKey]
  );

  const handleSaveSettle = useCallback(
    async (confirmModal) => {
      const step = settleHeaderDs.current.get('step');
      const headerValidateFlag = await settleHeaderDs.current.validate(true, true);
      const lineValidateFlag = await settleLineDs.validate();
      if (step === 'PAYMENT_INFO' && !headerValidateFlag) return;
      if (step === 'SETTLE_LINE' && !lineValidateFlag) return;
      const res = await settleHeaderDs.setState('submitType', 'update').forceSubmit();
      if (!res) return;
      handleRemoveCurrent(confirmModal);
    },
    [settleHeaderDs, settleLineDs, handleRemoveCurrent]
  );

  const handleDeleteSettle = useCallback(
    async (confirmModal) => {
      const bankValidateRes = await settleHeaderDs
        .setState('submitType', 'deleteValidate')
        .forceSubmit();
      if (!bankValidateRes) return;
      const { validatedCode, msg, closeAllSettleNumFlag } = bankValidateRes.content[0] || {};
      if (validatedCode === 'WARNING') {
        const actionName = await Modal.confirm({
          title: intl.get('ssta.common.view.message.tip').d('提示'),
          children: msg,
          autoCenter: true,
        });
        // 修复确认框阴影未关闭
        if (actionName !== 'ok') return;
        const res = await settleHeaderDs.setState('submitType', 'delete').forceSubmit();
        if (!res) return;
        if (closeAllSettleNumFlag) {
          Modal.destroyAll();
          if (onQueryList) onQueryList(true);
          return;
        }
        handleRemoveCurrent(confirmModal);
      } else if (validatedCode === 'ERROR') {
        notification.error({
          message: intl.get('hzero.common.notification.error').d('操作失败'),
          description: msg,
        });
      } else {
        const res = await settleHeaderDs.setState('submitType', 'delete').forceSubmit();
        if (!res) return;
        handleRemoveCurrent(confirmModal);
      }
    },
    [settleHeaderDs, onQueryList, handleRemoveCurrent]
  );

  const handleSaveLines = useCallback(async () => {
    const validateFlag = await settleLineDs.validate();
    if (!validateFlag) return;
    const res = await settleHeaderDs.setState('submitType', 'update').forceSubmit();
    if (!res) return;
    handleUpdateTitle();
    return handleSetStepsCurrent('next');
  }, [settleHeaderDs, settleLineDs, handleSetStepsCurrent, handleUpdateTitle]);

  const handleToleranceAdjust = useCallback(async () => {
    if (
      Number(settleHeaderDs.current.get('amountAdjustFlag')) === 0 ||
      Number(settleHeaderDs.current.get('stepAdjustFlag')) !== 1
    ) {
      return handleSetStepsCurrent('next');
    }
    if (remoteProps) {
      const feedback = await remoteProps.process(
        'SSTA_SUPPLYSETTLE_DETAIL.FB_BEFORE_TOLE_ADJUST',
        undefined,
        {
          settleHeaderDs,
        }
      );
      if (feedback === 'skip') return handleSetStepsCurrent('next');
      if (feedback === 'stop') return;
    }
    const res = await settleHeaderDs.setState('submitType', 'toleranceAdjust').forceSubmit();
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
    const { errorMessageMap } = res.content[0];
    if (!isEmpty(errorMessageMap)) {
      const errorMsg = Object.values(errorMessageMap)
        .map((item) => item?.desc)
        .join('');
      const actionName = await Modal.confirm({
        title: intl.get('ssta.common.view.message.tip').d('提示'),
        children: errorMsg,
        okText: intl.get('hzero.common.status.yes').d('是'),
        cancelText: intl.get('hzero.common.status.no').d('否'),
      });
      // 修复确认框阴影未关闭
      if (actionName === 'ok') return handleSetStepsCurrent('next');
    } else {
      return handleSetStepsCurrent('next');
    }
  }, [remoteProps, settleHeaderDs, handleSetStepsCurrent, settleHeaderId, documentType]);

  // 先发票后事务，录入发票后点击下一步
  const handleAdvanceInvNext = useCallback(async () => {
    const res = await taxInvoicePoolDs.setState('submitType', 'createInv').submit();
    if (res) {
      notification.success();
      const { content = [] } = res || {};
      const {
        companyId,
        supplierCompanyId,
        supplierId,
        supplierTenantId,
        settleHeaderId,
        invoiceNetAmount,
        invoiceTaxAmount,
        companyName,
        companyNum,
        supplierCompanyName,
        supplierCompanyNum,
      } = content[0] || {};
      settleHeaderDs.current.set({
        companyId,
        supplierCompanyId,
        supplierId,
        supplierTenantId,
        settleHeaderId,
        invoiceNetAmount,
        invoiceTaxAmount,
        companyName,
        companyNum,
        supplierCompanyName,
        supplierCompanyNum,
      });
      taxInvoicePoolDs.setQueryParameter('settleHeaderId', settleHeaderId);
      handleUpdateTitle();
      return handleSetStepsCurrent('next');
    }
  }, [taxInvoicePoolDs, handleUpdateTitle, handleSetStepsCurrent, settleHeaderDs]);

  const handleSaveMultiDimension = useCallback(async () => {
    const paymentSpliteRule = settleHeaderDs.current?.get('paymentSpliteRule');
    multiDimensionPayDs.forEach((record) => {
      record.set('paymentSpliteRule', paymentSpliteRule);
    });
    const res = await multiDimensionPayDs.setState('submitType', 'submit').submit();
    if (!res) return false;
    const { warnMessage } = res.content?.[0] || {};
    const okNoticeOptions = { description: warnMessage };
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ documentType, settleHeaderId })
    );
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, [
      'paymentDimension',
      'paymentSpliteRule',
      'paymentAmount',
      'applyAmount',
    ]);
    return handleSetStepsCurrent('next', { okNoticeOptions });
  }, [settleHeaderDs, documentType, settleHeaderId, multiDimensionPayDs, handleSetStepsCurrent]);

  const handleBatchQuery = useCallback(async () => {
    const { currentIndex } = settleHeaderDs;
    const currentList = settleHeaderDs.map((record) => record.getState('current'));
    await settleHeaderDs.query();
    settleHeaderDs.locate(currentIndex);
    settleHeaderDs.forEach((record, index) => {
      record.setState('current', currentList[index]);
    });
  }, [settleHeaderDs]);

  // 批量编辑，暂时只做了付款，开票类型的留了口子
  const handleBatchEdit = useCallback(() => {
    const settleHeaderIds = settleHeaderDs.map((record) => record.get('settleHeaderId')).join();
    modalOpen({
      editFlag: true,
      size: 'large',
      title: intl.get('ssta.common.view.title.batchEdit').d('批量编辑'),
      children: (
        <BatchEditHeader
          documentType={documentType}
          settleHeaderIds={settleHeaderIds}
          okCallback={handleBatchQuery}
        />
      ),
    });
  }, [modalOpen, documentType, settleHeaderDs, handleBatchQuery]);

  const handleViewLine = useCallback(() => {
    modalOpen({
      editFlag: false,
      size: 'large',
      title: intl.get('ssta.common.button.viewSelectedSettleAffair').d('查看已选结算事务'),
      children: <SettleLine source="view" />,
    });
  }, [modalOpen]);

  const handleViewInvoiceLine = useCallback(() => {
    modalOpen({
      editFlag: false,
      size: 'large',
      title: intl.get('ssta.common.view.message.chaeckInvoice').d('查看已维护的税务发票行'),
      children: <TaxInvoicePool source="view" />,
    });
  }, [modalOpen]);

  const handleSetStepsAdvanceInv = useCallback(() => {
    // 点上一步，还原虚拟id为-1
    taxInvoiceDs.setQueryParameter('settleHeaderId', -1);
    settleHeaderDs.current.set({ settleHeaderId: -1 });
    return handleSetStepsCurrent('prev');
  }, [taxInvoiceDs, settleHeaderDs, handleSetStepsCurrent]);

  // 响应【一键默认计划金额】按钮点击
  const handleAutoApplyAmount = useCallback(async () => {
    const res = await multiDimensionPayDs.setState('submitType', 'autoApplyAmount').forceSubmit();
    const newData = res?.content;
    if (!isArray(newData)) return;
    // 后端存在DTO数据类型转换，由前端重新拼接
    const realData = newData.map(({ prePaymentLineDTOList, ...others }) => ({
      ...others,
      settleApplyLineList: prePaymentLineDTOList || [],
    }));
    multiDimensionPayDs.loadData(realData);
    notification.success();
  }, [multiDimensionPayDs]);

  // 一键预付款自动核销
  const handleAutoWriteOff = useCallback(async () => {
    const confirmRes = await Modal.confirm({
      title: intl.get('ssta.common.view.message.tip').d('提示'),
      children: intl
        .get('ssta.common.view.help.oneClickPrepayAutoWriteOff', { prepaymentDimensionMeaning })
        .d(
          '点击【一键预付款自动核销】按钮后，系统将按照该单据的预付款核销维度「{prepaymentDimensionMeaning}」进行自动核销，会将之前核销的记录覆盖，且该操作不可逆。同时会根据配置规则自动赋值于【本次付款金额】，核销后请检查本次付款金额和本次核销金额是否符合业务要求'
        ),
    });
    if (confirmRes !== 'ok') return;
    const res = await multiDimensionPayDs.setState('submitType', 'autoWriteOff').forceSubmit();
    if (!res) return;
    notification.success();
    settleHeaderDs.status = 'loading';
    const newHeaderData = getResponse(
      await getSettleHeaderDataSup({ documentType, settleHeaderId })
    );
    settleHeaderDs.status = 'ready';
    if (!newHeaderData) return;
    recordPickValues(settleHeaderDs.current, newHeaderData, ['paymentAmount', 'applyAmount']);
  }, [
    documentType,
    settleHeaderId,
    settleHeaderDs,
    multiDimensionPayDs,
    prepaymentDimensionMeaning,
  ]);

  const stepList = useMemo(() => {
    const clickDefaultPlanAmountFlag = clickDefaultPlanAmountFlagger({
      paymentDimension,
      paymentDimensionParam,
      paymentControlRuleSource,
    });
    const cancelBtn = {
      name: 'cancel',
      child: intl.get('hzero.common.button.cancel').d('取消'),
      btnProps: {
        loading,
        wait: 1000,
        onClick: handleCancel,
      },
    };
    const prevBtn = {
      name: 'prevStep',
      child: intl.get(`ssta.common.button.prevStep`).d('上一步'),
      btnProps: {
        loading,
        wait: 1000,
        onClick: () => handleSetStepsCurrent('prev'),
      },
    };
    const skipBtn = {
      name: 'skip',
      child: intl.get('ssta.common.button.skip').d('跳过'),
      btnProps: {
        loading,
        wait: 1000,
        onClick: () => handleSetStepsCurrent('next'),
      },
    };
    const batchEditBtn = documentType === 'PAYMENT' &&
      settleHeaderDs.totalCount > 1 &&
      permissionMap.get(`payHeadBatchEdit`) && {
        name: 'batchEdit',
        child: intl.get('ssta.common.view.button.batchEdit').d('批量编辑'),
        btnProps: {
          loading,
          onClick: handleBatchEdit,
        },
      };
    const viewLineBtn = {
      name: 'viewSelectedSettleAffair',
      child: intl.get('ssta.common.button.viewSelectedSettleAffair').d('查看已选结算事务'),
      btnProps: {
        loading,
        wait: 1000,
        onClick: handleViewLine,
      },
    };
    const viewInvoiceLineBtn = {
      name: 'viewSelectedSettleInvoice',
      child: intl.get('ssta.common.view.message.chaeckInvoice').d('查看已维护的税务发票行'),
      btnProps: {
        loading,
        wait: 1000,
        onClick: handleViewInvoiceLine,
      },
    };
    const nextBtn = (props) => {
      const { btnText = intl.get(`ssta.common.button.nextStep`).d('下一步'), ...btnPorps } = props;
      return {
        name: 'nextStep',
        child: btnText,
        btnProps: {
          loading,
          wait: 1000,
          color: 'primary',
          ...btnPorps,
        },
      };
    };
    // 如果是先发票后事务，因为有调用别的接口逻辑，重新return一个数组,避免修改原数组
    if (advanceInvFlag) {
      return [
        {
          title: intl.get('ssta.supplySettle.view.title.enterTaxInvoice').d('录入税务发票'),
          name: 'TAX_INVOICE',
          content: <TaxInvoicePool source="step" />,
          footerBtns: [
            nextBtn({
              onClick: handleAdvanceInvNext,
              disabled: isEmpty(taxInvoicePoolSelected),
            }),
            {
              name: 'cancel',
              child: intl.get('hzero.common.button.cancel').d('取消'),
              btnProps: {
                loading,
                wait: 1000,
                onClick: () => {
                  handleInvCancel('invoice');
                },
              },
            },
          ],
        },
        {
          title: intl
            .get('ssta.supplySettle.view.title.quoteSettleAffairCreate')
            .d('引用结算事务新建'),
          icon: <img alt="" src={affairIcon} />,
          successIcon: <img alt="" src={affairSuccessIcon} />,
          name: 'AFFAIR',
          content: <SettleAffair source="step" />,
          footerBtns: [
            {
              ...prevBtn,
              btnProps: {
                loading,
                wait: 1000,
                onClick: handleSetStepsAdvanceInv,
              },
            },
            {
              name: 'selectedCreate',
              child: intl.get(`ssta.common.button.selectedCreate`).d('勾选新建'),
              btnProps: {
                loading,
                wait: 1000,
                color: 'primary',
                disabled: isEmpty(settleAddLineSelected),
                onClick: () => handleCreate('createInvSelected'),
              },
            },
            permissionMap.get('allCreate') && {
              name: 'allCreate',
              child: intl.get(`ssta.common.button.allCreate`).d('全选新建'),
              btnProps: {
                loading,
                wait: 1000,
                onClick: () => handleCreate('createInvAll'),
              },
            },
            {
              name: 'cancel',
              child: intl.get('hzero.common.button.cancel').d('取消'),
              btnProps: {
                loading,
                wait: 1000,
                onClick: () => {
                  handleInvCancel('addair');
                },
              },
            },
            viewInvoiceLineBtn,
          ],
        },
        {
          title: endTitleMap[settleType],
          name: 'END',
          content: '',
          footerBtns: [],
        },
      ];
    }
    return [
      {
        title: intl
          .get('ssta.supplySettle.view.title.quoteSettleAffairCreate')
          .d('引用结算事务新建'),
        icon: <img alt="" src={affairIcon} />,
        successIcon: <img alt="" src={affairSuccessIcon} />,
        name: 'AFFAIR',
        content: <SettleAffair source="step" />,
        footerBtns: settleHeaderId
          ? [nextBtn({ onClick: handleSettleLineAddOk }), viewLineBtn, batchEditBtn, cancelBtn]
          : [
              {
                name: 'selectedCreate',
                child: intl.get(`ssta.common.button.selectedCreate`).d('勾选新建'),
                btnProps: {
                  loading,
                  wait: 1000,
                  color: 'primary',
                  disabled: isEmpty(settleAffairSelected),
                  onClick: () => handleCreate('selected'),
                },
              },
              documentType === 'INVOICE' &&
                permissionMap.get('allCreate') && {
                  name: 'allCreate',
                  child: intl.get(`ssta.common.button.allCreate`).d('全选新建'),
                  btnProps: {
                    loading,
                    wait: 1000,
                    onClick: () => handleCreate('all'),
                  },
                },
              permissionMap.get('updateNewExport') && {
                name: 'importCreate',
                btnComp: CommonImport,
                btnProps: {
                  businessObjectTemplateCode:
                    documentType === 'INVOICE'
                      ? 'SSTA.SETTLE_POOL_INV_CREATE'
                      : 'SSTA.SETTLE_POOL_PAY_CREATE',
                  prefixPatch: '/ssta',
                  buttonText: intl.get(`ssta.common.button.newimportCreate`).d('(新)导入新建'),
                  successCallBack: () => settleAffairDs.query(),
                  args: {
                    camp: 'SUPPLIER',
                    templateCode:
                      documentType === 'INVOICE'
                        ? 'SSTA.SETTLE_POOL_INV_CREATE'
                        : 'SSTA.SETTLE_POOL_PAY_CREATE',
                    tenantId,
                  },
                  buttonProps: {
                    type: 'c7n-pro',
                    icon: '',
                    loading,
                  },
                },
              },
              cancelBtn,
            ],
      },
      {
        title: intl.get('ssta.supplySettle.view.title.quoteInvoicerCreate').d('引用发票申请单新建'),
        icon: <img alt="" src={quoteInvIcon} />,
        successIcon: <img alt="" src={quoteInvSuccessIcon} />,
        name: 'QUOTEINVOICE',
        content: <QuoteInvoice />,
        footerBtns: [
          {
            name: 'selectedCreate',
            child: intl.get(`ssta.common.button.selectedCreate`).d('勾选新建'),
            btnProps: {
              loading,
              wait: 1000,
              color: 'primary',
              disabled: isEmpty(quoteInvoiceSelected),
              onClick: () => handleCreate('quoteInvoice'),
            },
          },
          settleHeaderId && viewLineBtn,
          permissionMap.get(`quoteInvoiceExport`) && {
            name: 'quoteInvoiceExport',
            btnComp: ExcelExportPro,
            childFor: 'buttonText',
            child: isEmpty(quoteInvoiceSelected)
              ? intl.get(`ssta.common.button.export`).d('导出')
              : intl.get(`ssta.common.button.selectedExport`).d('勾选导出'),
            btnProps: {
              templateCode: 'SRM_C_SRM_SSTA_SUP_PAYMENT_BY_INV ',
              otherButtonProps: { loading },
              method: 'POST',
              allBody: true,
              requestUrl: `${apiPrefix}/settle-headers/supplier/payment-by-invoice/export`,
              queryParams: getQuoteInvoiceExportParams,
            },
          },
          cancelBtn,
        ],
      },
      {
        title: intl.get('ssta.supplySettle.view.title.editSettleLineInfo').d('编辑结算单行信息'),
        icon: <img alt="" src={settleLineIcon} />,
        successIcon: <img alt="" src={settleLineSuccessIcon} />,
        name: 'SETTLE_LINE',
        content: (
          <SettleLine
            source="step"
            onSetStepsCurrent={handleSetStepsCurrent}
            onUpdateModalTitle={handleUpdateTitle}
          />
        ),
        footerBtns: [nextBtn({ onClick: handleSaveLines }), prevBtn, skipBtn, cancelBtn],
      },
      {
        title: intl.get('ssta.supplySettle.view.title.enterTaxInvoice').d('录入税务发票'),
        icon: <img alt="" src={taxInvIcon} />,
        successIcon: <img alt="" src={taxInvSuccessIcon} />,
        name: 'TAX_INVOICE',
        content: <TaxInvoice source="step" />,
        footerBtns: [
          nextBtn({ onClick: handleToleranceAdjust, loading }),
          !branchFlag &&
            settleType === 'INVOICE' && {
              name: 'editSettleLineInfo',
              child: intl.get(`ssta.common.button.editSettleLineInfo`).d('编辑结算单行信息'),
              btnProps: {
                loading,
                wait: 1000,
                onClick: handleSaveBranchStep,
              },
            },
          prevBtn,
          settleType === 'INVOICE_PAYMENT' && skipBtn,
          viewLineBtn,
          cancelBtn,
        ],
      },
      {
        title: intl.get('ssta.supplySettle.view.title.collectionInfoFilled').d('收款信息填写'),
        icon: <img alt="" src={payInfoIcon} />,
        successIcon: <img alt="" src={payInfoSuccessIcon} />,
        name: 'PAYMENT_INFO',
        content: <PaymentInfo source="step" />,
        footerBtns: [
          nextBtn({ onClick: handleSavePayInfo }),
          prevBtn,
          headMultiDimensionPayment === 'EDIT' && skipBtn,
          viewLineBtn,
          batchEditBtn,
          cancelBtn,
        ],
      },

      {
        title: intl.get('ssta.supplySettle.view.title.multiDimensionAssign').d('多维度分配'),
        icon: <img alt="" src={multiAssignIcon} />,
        successIcon: <img alt="" src={multiAssignSuccessIcon} />,
        name: 'MULTI_DIMENSION',
        content: <MultiDimensionPay isModalEdit />,
        footerBtns: [
          nextBtn({ onClick: handleSaveMultiDimension }),
          prevBtn,
          viewLineBtn,
          batchEditBtn,
          clickDefaultPlanAmountFlag &&
            permissionMap.get('clickDefaultPlanAmount') && {
              name: 'autoApplyAmount',
              child: (
                <Fragment>
                  {intl
                    .get('ssta.common.view.button.oneClickDefaultPlanAmount')
                    .d('一键默认计划金额')}
                  <Tooltip
                    title={intl
                      .get('ssta.common.view.tooltip.oneClickDefaultPlanAmount')
                      .d(
                        '点击【一键默认计划金额】按钮，系统将把付款计划「剩余阶段金额」及付款计划下未核销的预付款写入「本次付款金额」&「本次核销金额」中'
                      )}
                  >
                    <Icon type="help" className={commonStyles['ssta-button-help-icon']} />
                  </Tooltip>
                </Fragment>
              ),
              btnProps: {
                loading,
                wait: 1000,
                onClick: handleAutoApplyAmount,
              },
            },
          !clickDefaultPlanAmountFlag &&
            permissionMap.get('clickPrepayAutoWriteOff') && {
              name: 'prepayAutoWriteOff',
              child: intl
                .get('ssta.common.view.button.oneClickPrepayAutoWriteOff')
                .d('一键预付款自动核销'),
              btnProps: {
                loading,
                wait: 1000,
                onClick: handleAutoWriteOff,
              },
            },
          cancelBtn,
        ],
      },
      {
        title: endTitleMap[settleType],
        name: 'END',
        icon: <img alt="" src={invDoneIcon} />,
        successIcon: <img alt="" src={invDoneSuccessIcon} />,
        content: '',
        footerBtns: [],
      },
    ];
  }, [
    settleType,
    branchFlag,
    endTitleMap,
    documentType,
    handleCreate,
    handleCancel,
    settleHeaderId,
    handleSaveBranchStep,
    handleSaveLines,
    settleAffairSelected,
    handleSetStepsCurrent,
    handleSettleLineAddOk,
    handleSavePayInfo,
    quoteInvoiceSelected,
    headMultiDimensionPayment,
    handleSaveMultiDimension,
    handleUpdateTitle,
    handleToleranceAdjust,
    handleViewLine,
    permissionMap,
    settleAffairDs,
    tenantId,
    handleViewInvoiceLine,
    handleSetStepsAdvanceInv,
    settleAddLineSelected,
    taxInvoicePoolSelected,
    advanceInvFlag,
    loading,
    settleHeaderDs,
    handleBatchEdit,
    handleAdvanceInvNext,
    handleInvCancel,
    paymentDimension,
    paymentDimensionParam,
    handleAutoWriteOff,
    handleAutoApplyAmount,
    paymentControlRuleSource,
    getQuoteInvoiceExportParams,
  ]);
  const showList = useMemo(() => stepList.filter((item) => stepNameList.includes(item.name)), [
    stepNameList,
    stepList,
  ]);
  return (
    <Fragment>
      {settleHeaderDs.totalCount > 1 ? (
        <Tabs
          tabPosition="left"
          defaultActiveKey="0"
          onChange={handleSetActiveKey}
          className={styles['settle-create-left-tabs']}
          activeKey={settleHeaderDs.currentIndex.toString()}
        >
          {settleHeaderDs.map((record, index) => {
            return (
              <TabPane
                key={index.toString()}
                tab={record.get('settleNum')}
                disabled={record.get('step') === 'END'}
              >
                <CreateSettleSteps current={current} showList={showList} />
              </TabPane>
            );
          })}
        </Tabs>
      ) : (
        <CreateSettleSteps current={current} showList={showList} />
      )}
      <div className="ssta-body-footer">
        {customizeBtnGroup(
          {
            code: `SSTA.SUPPLY_SETTLE_LIST.${baseInvFlag ? 'PAYINVOICE' : settleType}.DRAWER_BTNS`,
            pro: true,
          },
          <DynamicButtons
            defaultBtnType="c7n-pro"
            buttons={
              remoteProps
                ? remoteProps.process(
                    'SSTA_SUPPLYSETTLE_DETAIL.STEP_FOOTER_BTNS',
                    showList[current]?.footerBtns,
                    {
                      loading,
                      quoteInvoiceDs,
                      settleAffairDs,
                      settleType,
                      advanceInvFlag,
                      current,
                      baseInvFlag,
                      handleCreate,
                      settleHeaderId,
                    }
                  )
                : showList[current]?.footerBtns
            }
          />
        )}
      </div>
    </Fragment>
  );
});
