import { stringify } from 'querystring';
import React, { Fragment, useCallback, useContext, useMemo } from 'react';
import { Collapse } from 'choerodon-ui';
import { Spin, useModal, Modal } from 'choerodon-ui/pro';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import PrintProButton from '_components/PrintProButton';
import DynamicButtons from '_components/DynamicButtons';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getResponse, filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';

import { checkCurrency } from '../utils/api';
import type { Operate } from '../utils/type';
import { useModalOpen } from '../../../hooks';
import BasicInfo from './components/BasicInfo';
import BepResult from './components/BepResult';
import StoreProvider, { Store } from './stores';
import commonStyles from '../../../common.less';
import WorkflowCard from './components/WorkflowCard';
import FillHeadInfo from './components/FillHeadInfo';
import InitateBep from './components/InitiatePay/Bep';
import MatchLineInfo from './components/MatchLineInfo';
import AttachmentInfo from './components/AttachmentInfo';
import { formatDynamicBtns } from '../../../utils/utils';
import InitatePaper from './components/InitiatePay/Paper';
import PaymentLineInfo from './components/PaymentLineInfo';
import OperationRecord from './components/OperationRecord';
import InitateOffline from './components/InitiatePay/Offline';
import StatementLineInfo from './components/StatementLineInfo';
import StatementLineStep from './components/StatementLineStep';
import { DetailBtnsCustCode, DetailCollapseCode } from '../utils/type';
import { getCustomValidationResponse } from '../../../components/CustomValidation';

const { Panel } = Collapse;

const Detail = () => {

  const {
    boolMap,
    loading,
    history,
    location,
    headerDs,
    permissionMap,
    customizeForm,
    customizeTable,
    workflowCaller,
    customizeBtnGroup,
    customizeCollapse,
  } = useContext(Store);
  const { state } = location;
  const modalOpen = useModalOpen(useModal());
  const {
    payForm,
    payStatus,
    payHeaderId,
    statementLineEditPoint,
  } = headerDs.current?.get(['payForm', 'payStatus', 'payHeaderId', 'statementLineEditPoint']);

  const paneList = useMemo(() => {
    const hiddenStatementFlag = statementLineEditPoint === 'APPROVE' && ['NEW', 'RETURN', 'SUBMITTED'].includes(payStatus);
    return [
      {
        key: 'basic',
        header: intl.get('sbsm.common.view.title.basicInfo').d('基础信息'),
        content: <BasicInfo />,
      },
      {
        key: 'paymentLine',
        header: intl.get('sbsm.common.view.title.paymentLineInfo').d('支付行信息'),
        content: <PaymentLineInfo />,
      },
      !hiddenStatementFlag && {
        key: 'statementLine',
        header: intl.get('sbsm.common.view.title.statementLineInfo').d('流水行信息'),
        content: <StatementLineInfo />,
      },
      !hiddenStatementFlag && {
        key: 'matchLine',
        header: intl.get('sbsm.common.view.title.statementLineMatchPaymentLine').d('流水行匹配支付行'),
        content: <MatchLineInfo />,
      },
      payForm === 'BANK_CORPORATE_EXPRESS' && {
        key: 'bepResult',
        header: intl.get('sbsm.common.view.title.bepResult').d('银企支付结果'),
        content: <BepResult />,
      } as any,
      {
        key: 'attachment',
        header: intl.get('sbsm.common.view.title.attachment').d('附件'),
        content: <AttachmentInfo />,
      },
    ].filter(Boolean);
  }, [payForm, payStatus, statementLineEditPoint]);

  const defaultActiveKey = useMemo(() => paneList.map(item => item.key), [paneList]);

  const backPath = useMemo(() => {
    if (boolMap.pubFlag) return null;
    return state?.backPath || '/sbsm/payment-workbench/list';
  }, [state, boolMap]);

  const handleBackList = useCallback(() => {
    notification.success({});
    history.push({
      pathname: '/sbsm/payment-workbench/list',
      state: { _back: 1 },
    });
  }, [history]);

  const updateTabLink = useCallback((search, stateKey) => {
    updateTab({
      key: getActiveTabKey(),
      search,
      state: stateKey,
    });
  }, []);

  const linkToDetail = useCallback((operateType: Operate) => {
    const { pathname, search } = location;
    updateTabLink(stringify(filterNullValueObject({ operate: operateType })), {
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `/sbsm/payment-workbench/detail/${payHeaderId}`,
      search: stringify(filterNullValueObject({ operate: operateType })),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [updateTabLink, history, location, payHeaderId]);

  const handleApprove = useCallback(() => {
    workflowCaller.goApprove({ onSuccess: handleBackList });
  }, [workflowCaller, handleBackList]);

  const handleRevokeApproval = useCallback(() => {
    Modal.confirm({
      title: intl.get('sbsm.common.view.message.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
      onOk: async () => {
        const res = await workflowCaller.goRevoke();
        if (!res) return;
        handleBackList();
      },
    });
  }, [workflowCaller, handleBackList]);

  const handleSubmit = useCallback(async () => {
    const validRes = await headerDs
      .setState('submitType', 'submitValidate')
      .submit();
    if (!validRes) return;
    const handleRealSubmit = async () => {
      const createRes = await headerDs
        .setState('cacheData', { submitPoint: 'DETAIL' })
        .setState('submitType', 'submit')
        .submit();
      if (!createRes) return;
      handleBackList();
    };
    return getCustomValidationResponse(validRes?.content[0] || {}, handleRealSubmit);
  }, [headerDs, handleBackList]);

  const handleSave = useCallback(async () => {
    const res = await headerDs.setState('submitType', 'update').submit();
    if (!res) return;
    headerDs.query();
  }, [headerDs]);

  const handleFillHeadInfo = useCallback((action, okCallback) => {
    modalOpen({
      size: 'small',
      editFlag: true,
      children: <FillHeadInfo action={action} okCallback={okCallback} customizeForm={customizeForm} />,
    });
  }, [modalOpen, customizeForm]);

  const handleCancel = useCallback(async (submitType = 'cancel') => {
    handleFillHeadInfo('cancel', async (filledHeadData) => {
      const res = await headerDs
        .setState('cacheData', filledHeadData)
        .setState('submitType', submitType)
        .forceSubmit();
      if (!res) return false;
      handleBackList();
    });
  }, [headerDs, handleBackList, handleFillHeadInfo]);

  const handleInitiateBep = useCallback(async () => {
    const topSelected = [headerDs.current];
    const res = getResponse(await checkCurrency(topSelected.map(record => record?.key)));
    if (!res) return;
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('sbsm.paymentWorkbench.view.button.bepEmailVrify').d('银企支付邮箱验证'),
      children: <InitateBep topSelected={topSelected} customizeTable={customizeTable} okCallback={handleBackList} />,
    });
  }, [modalOpen, headerDs, customizeTable, handleBackList]);

  const handleInitiateOffline = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: true,
      title: intl.get('sbsm.common.view.button.offlinePayConfirm').d('线下支付确认'),
      children: <InitateOffline okCallback={handleBackList} />,
    });
  }, [modalOpen, handleBackList]);

  const handleInitiatePaper = useCallback(() => {
    const realPayConfirm = () => {
      modalOpen({
        size: 'large',
        editFlag: true,
        title: intl.get('sbsm.common.view.button.paperPayConfirm').d('票据支付确认'),
        children: <InitatePaper okCallback={handleBackList} />,
      });
    };
    if (statementLineEditPoint === 'APPROVE') {
      modalOpen({
        size: 'large',
        editFlag: true,
        title: intl.get('sbsm.paymentWorkbench.view.title.maintainSettlementLine').d('维护流水行'),
        children: <StatementLineStep source='approveEdit' />,
        okText: intl.get('sbsm.common.button.paymentConfirm').d('支付确认'),
        onOk: realPayConfirm,
      });
    } else {
      realPayConfirm();
    }

  }, [modalOpen, handleBackList, statementLineEditPoint]);

  const handleReverse = useCallback(() => {
    handleFillHeadInfo('reverse', async (filledHeadData) => {
      const res = await headerDs
        .setState('cacheData', filledHeadData)
        .setState('submitType', 'reverse')
        .forceSubmit();
      if (!res) return false;
      handleBackList();
    });
  }, [headerDs, handleBackList, handleFillHeadInfo]);

  const handleOpenOperationRecord = useCallback(() => {
    modalOpen({
      size: 'medium',
      eidtFlag: false,
      title: intl.get('hzero.common.button.operationRecord').d('操作记录'),
      children: <OperationRecord payHeaderId={payHeaderId} />,
    });
  }, [modalOpen, payHeaderId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      ...(boolMap.allFlag ? [
        boolMap.editBtn && {
          name: 'editBtn',
          child: intl.get('hzero.common.button.edit').d('编辑'),
          btnProps: { loading, wait: 1000, icon: 'mode_edit', onClick: () => linkToDetail('edit') },
        },
        boolMap.approveBtn && {
          name: 'approveBtn',
          child: intl.get('sbsm.common.button.approve').d('审核'),
          btnProps: { loading, wait: 1000, icon: 'authorize', onClick: handleApprove },
        },
        boolMap.revokeApprovalBtn && {
          name: 'revokeApprovalBtn',
          child: intl.get('sbsm.common.button.revokeApproval').d('撤销审批'),
          btnProps: { loading, wait: 1000, icon: 'reply', onClick: handleRevokeApproval },
        },
        boolMap.reverseBtn && {
          name: 'reverseBtn',
          child: intl.get('hzero.common.button.reverse').d('冲销'),
          btnProps: { loading, icon: 'test', onClick: () => linkToDetail('reverse') },
        },
      ] : []),
      ...(boolMap.editFlag ? [
        permissionMap.get('submit') && {
          name: 'submit',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnProps: { loading, wait: 1000, icon: 'check', onClick: handleSubmit },
        },
        {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: { loading, wait: 1000, icon: 'save', onClick: handleSave },
        },
        permissionMap.get('cancel') && {
          name: 'cancel',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: { loading, wait: 1000, icon: 'cancel', onClick: () => handleCancel('cancel') },
        },
      ] : []),
      ...(boolMap.confirmFlag ? [
        payForm === 'BANK_CORPORATE_EXPRESS' && permissionMap.get('bepInitiate') && {
          name: 'bepInitiate',
          child: intl.get('sbsm.common.view.button.bepInitiate').d('银企支付发起'),
          btnProps: { loading, wait: 1000, icon: 'near_me', onClick: handleInitiateBep },
        },
        payForm === 'BANK_CORPORATE_EXPRESS' && permissionMap.get('bepInitiate') && {
          name: 'bepCancel',
          child: intl.get('sbsm.common.view.button.bepCancel').d('银企支付取消'),
          btnProps: { loading, wait: 1000, icon: 'cancel', onClick: () => handleCancel('bepCancel') },
        },
        payForm === 'OFFLINE_PAY' && permissionMap.get('offlineConfirm') && {
          name: 'offlineConfirm',
          child: intl.get('sbsm.common.view.button.offlinePayConfirm').d('线下支付确认'),
          btnProps: { loading, wait: 1000, icon: 'near_me', onClick: handleInitiateOffline },
        },
        payForm === 'OFFLINE_PAY' && permissionMap.get('offlineConfirm') && {
          name: 'offlineCancel',
          child: intl.get('sbsm.common.view.button.offlinePayCancel').d('线下支付取消'),
          btnProps: { loading, wait: 1000, icon: 'cancel', onClick: () => handleCancel('payCancel') },
        },
        payForm === 'BANK_PAPER' && permissionMap.get('paperConfirm') && {
          name: 'paperConfirm',
          child: intl.get('sbsm.common.view.button.paperPayConfirm').d('票据支付确认'),
          btnProps: { loading, wait: 1000, icon: 'near_me', onClick: handleInitiatePaper },
        },
        payForm === 'BANK_PAPER' && permissionMap.get('paperConfirm') && {
          name: 'paperCancel',
          child: intl.get('sbsm.common.view.button.paperPayCancel').d('票据支付取消'),
          btnProps: { loading, wait: 1000, icon: 'cancel', onClick: () => handleCancel('payCancel') },
        },
      ] : []),
      boolMap.reverseFlag && permissionMap.get('reverse') && {
        name: 'reverse',
        child: intl.get('hzero.common.button.reverse').d('冲销'),
        btnProps: { loading, wait: 1000, icon: 'test', onClick: handleReverse },
      },
      permissionMap.get('operationRecord') && {
        name: 'operationRecord',
        child: intl.get('hzero.common.button.operating').d('操作记录'),
        btnProps: {
          loading,
          funcType: 'flat',
          color: 'default',
          icon: 'operation_service_request',
          onClick: handleOpenOperationRecord,
        },
      },
      permissionMap.get('print') && {
        name: 'print',
        btnComp: PrintProButton,
        childFor: 'buttonText',
        child: intl.get('sbsm.common.view.button.print').d('打印'),
        btnProps: {
          buttonProps: { funcType: 'flat' },
          requestUrl: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/pay-headers/print`,
          method: 'PUT',
          data: { payHeaderIds: [payHeaderId] },
          loading,
        },
      },
    ];
    return formatDynamicBtns(normalBtns);
  }, [
    payForm,
    boolMap,
    loading,
    handleSave,
    payHeaderId,
    linkToDetail,
    handleCancel,
    handleSubmit,
    handleReverse,
    handleApprove,
    permissionMap,
    handleInitiateBep,
    handleInitiatePaper,
    handleRevokeApproval,
    handleInitiateOffline,
    handleOpenOperationRecord,
  ]);

  const title = useMemo(() => {
    if (boolMap.editFlag) return intl.get('sbsm.paymentWorkbench.view.title.editPayDoc').d('编辑支付单');
    if (boolMap.confirmFlag) return intl.get('sbsm.paymentWorkbench.view.title.payConfirmPayDoc').d('支付确认支付单');
    if (boolMap.reverseFlag) return intl.get('sbsm.paymentWorkbench.view.title.reversePayDoc').d('冲销支付单');
    return intl.get('sbsm.paymentWorkbench.view.title.viewPayDoc').d('查看支付单');
  }, [boolMap]);

  return (
    <Fragment>
      {!boolMap.pubFlag && (
        <Header backPath={backPath} title={title}>
          {customizeBtnGroup(
            { code: DetailBtnsCustCode, pro: true },
            <DynamicButtons defaultBtnType="c7n-pro" maxNum={5} buttons={buttons} />
          )}
        </Header>
      )}
      <Content
        wrapperClassName={`${boolMap.modalFlag && commonStyles['collapse-content-modal']} ${commonStyles['collapse-content-wrap']}`}
        className={commonStyles[`collapse-content`]}
      >
        <Spin spinning={loading}>
          {boolMap.pubFlag && <WorkflowCard buttons={buttons} />}
          {customizeCollapse(
            { code: DetailCollapseCode },
            <Collapse
              ghost
              trigger="icon"
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {paneList.map((item) => {
                const { content, ...panelProps } = item;
                return (
                  <Panel showArrow={false} {...panelProps}>
                    {content}
                  </Panel>
                );
              })}
            </Collapse>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

const PaymentWorkbenchDetail = (props) => <StoreProvider {...props}><Detail /></StoreProvider>;

export default PaymentWorkbenchDetail;