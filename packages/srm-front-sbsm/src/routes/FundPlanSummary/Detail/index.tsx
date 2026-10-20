import { stringify } from 'querystring';
import React, { Fragment, useMemo, useCallback, useContext } from 'react';
import { observer } from 'mobx-react';
import { Collapse } from 'choerodon-ui';
import { Spin, useModal, Modal } from 'choerodon-ui/pro';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { filterNullValueObject } from 'utils/utils';
import DynamicButtons from "_components/DynamicButtons";
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { isEmpty, isNil } from 'lodash';

import Line from './components/Line';
import Basic from './components/Basic';
import type { Operate } from '../utils/type';
import { useModalOpen } from '../../../hooks';
import MultiLine from './components/MultiLine';
import StoreProvider, { Store } from './stores';
import AmountSummary from './components/AmountSummary';
import SummaryPanel from '../../../components/SummaryPanel';
import { DetailCollapseCode, DetailBtnCode } from '../utils/type';
import { getCustomValidationResponse } from '../../../components/CustomValidation';
import { formatDynamicBtns, notifyValidErrors, confirmDocNegAction } from '../../../utils/utils';
import styles from '../../../common.less';
import OperationRecord from './components/OperationRecord';
import { balHeaderHandle, deleteBalLine } from '../utils/api';

const { Panel } = Collapse;
const defaultActiveKey = [
  'summary',
  'basic',
  'multLine',
  'balLine',
];

const Detail = observer(() => {
  const {
    remote,
    boolMap,
    history,
    location,
    headerDs,
    customizeCollapse,
    customizeBtnGroup,
    balHeaderId,
    workflowCaller,
    lineDs,
  } = useContext(Store);

  const {
    balNum,
    currencyCode = '',
    balPayAmount,
    balRemainApplyAmount,
    balRemainPayAmount,
  } = headerDs.current?.get(['balNum', 'currencyCode', 'balPayAmount', 'balRemainApplyAmount', 'balRemainPayAmount']) || {};
  const loading = headerDs.status !== 'ready';
  const { state } = location;
  const modalOpen = useModalOpen(useModal());
  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`sbsm.fundPlan.view.title.basicInfo`).d('基本信息'),
        content: <Basic />,
      },
      {
        key: 'balLine',
        header: intl.get(`sbsm.fundPlan.view.title.prepSumLineInfo`).d('编制汇总行信息'),
        content: <Line />,
      } as any,
      {
        key: 'multLine',
        header: intl.get(`sbsm.fundPlan.view.title.multSumQuery`).d('多维度汇总查询'),
        content: <MultiLine />,
      },
    ].filter(Boolean);
  }, []);

  const backPath = useMemo(() => {
    if(boolMap.pubFlag) return null;
    return state?.backPath || '/sbsm/fund-plan-summary/list';
  }, [state, boolMap]);

  const handleBackList = useCallback(() => {
    notification.success({});
    history.push({
      pathname: '/sbsm/fund-plan-summary/list',
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

  const linkToUpdateDetail = useCallback((operateType: Operate) => {
    const { pathname, search } = location;
    updateTabLink(stringify(filterNullValueObject({ operate: operateType })), {
      backPath: `${pathname}${search}`,
    });
    history.push({
      pathname: `/sbsm/fund-plan-summary/detail/${balHeaderId}`,
      search: stringify(filterNullValueObject({ operate: operateType })),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [updateTabLink, history, location, balHeaderId]);

  const handleFrontValidate = useCallback(async () => {
    const validRes = await headerDs.validate();
    // 校验失败，通知校验内容
    if (!validRes) {
      notifyValidErrors(headerDs);
      return false;
    };
    return true;
  }, [headerDs]);

  // 操作提交
  const handleLastSubmit = useCallback(async () => {
    const res = await headerDs.setState('submitType', 'submit').submit();
    if (!res) return false;
    handleBackList();
  }, [headerDs, handleBackList]);

  const handleFormatLine = useCallback(async (feedback) => {
    if(feedback === 'ok') {
      headerDs.status = DataSetStatus.loading;
      const res = await balHeaderHandle('formatLine', headerDs.current?.toJSONData());
      headerDs.status = DataSetStatus.ready;
      if (!res) return false;
      headerDs.query(undefined, undefined, true);
      return true;
    }
    return handleLastSubmit();
  }, [headerDs, handleLastSubmit]);

  // 提交 先做校验接口
  const handleSubmitValidate = useCallback(async () => {
    headerDs.status = DataSetStatus.loading;
    const validateRes = await balHeaderHandle('submitValidate', headerDs.current?.toJSONData());
    headerDs.status = DataSetStatus.ready;
    if (!validateRes) return false;
    return getCustomValidationResponse(validateRes, handleFormatLine);
  }, [headerDs, handleFormatLine]);

  // 删除零行
  const handleDeleteZeroLine = useCallback(async(feedback) => {
    if(feedback === 'ok') {
      const validateLineContent = headerDs.getState('validateLineContent') || {};
      // 预留 lineHandleType 行检验类型
      const { balanceLineList, lineHandleType } = validateLineContent;
      if (!isNil(balanceLineList) && !isEmpty(balanceLineList) && lineHandleType === 'ZERO_AMOUNT_LINE_DELETE') {
        const deleteLineIds: any = [];
        balanceLineList.forEach((item: any) => {
          const { balLineId } = item;
          deleteLineIds.push(balLineId);
        });
        const deleteRecords = lineDs.filter((record) =>
          deleteLineIds.includes(record?.get('balLineId'))
        );
        headerDs.status = DataSetStatus.loading;
        const cancelRes = await deleteBalLine(balanceLineList);
        headerDs.status = DataSetStatus.ready;
        if (!cancelRes) return;
        lineDs.remove(deleteRecords, true);
        const oldCount = lineDs.totalCount;
        lineDs.totalCount = oldCount - lineDs.length;
        await headerDs.query(undefined, undefined, true);
        handleSubmitValidate();
        return true;
      }
    } else return handleSubmitValidate();
  }, [handleSubmitValidate, headerDs, lineDs]);

  // 零行校验
  const handleZeroLineValidate = useCallback(async () => {
    headerDs.status = DataSetStatus.loading;
    const validateRes = await balHeaderHandle('submitZeroLineValidate', headerDs.current?.toJSONData());
    headerDs.status = DataSetStatus.ready;
    if (!validateRes) return false;
    headerDs.setState('validateLineContent', validateRes);
    return getCustomValidationResponse(validateRes, handleDeleteZeroLine, {
      okText: intl.get('hzero.common.status.yes').d('是'),
      cancelText: intl.get('hzero.common.status.no').d('否'),
    });
  }, [handleDeleteZeroLine, headerDs]);

  const handleSubmit = useCallback(async () => {
    const frontValidRes = await handleFrontValidate();
    if (!frontValidRes) return false;
    return handleZeroLineValidate();
  }, [handleFrontValidate, handleZeroLineValidate]);

  // 操作保存
  const handleSave = useCallback(async () => {
    const frontValidRes = await handleFrontValidate();
    if (!frontValidRes) return;
    const res = await headerDs.setState('submitType', 'save').submit();
    if (!res) return;
    notification.success({});
    headerDs.query();
  }, [headerDs, handleFrontValidate]);

  // 编辑取消(删除)
  const handleDelete = useCallback(async () => {
    const confirmFlag = await confirmDocNegAction({ action: 'cancel', documentName: '', documentNum: balNum });
    if (!confirmFlag) return;
    const res = await headerDs.setState('submitType', 'delete').submit();
    if (!res) return;
    handleBackList();
  }, [balNum, headerDs, handleBackList]);

  const handleCancel = useCallback(async () => {
    // 不存在未汇总金额balPayAmount-balEnablePayAmount === 0 && balApplyAmount - balEnableApplyAmount === 0
    const noBalFlag = math.eq(balRemainApplyAmount, 0) && math.eq(balRemainPayAmount, 0);
    const confirmFlag = await confirmDocNegAction({
      customName: !noBalFlag && intl.get('sbsm.common.view.message.balCancelTips', {balNum})
      .d('取消后，未汇总金额将按对应汇总单行「未汇总金额处理」释放至【编制池-可编制/可汇总】,请确认是否取消汇总单{balNum}？'),
      action: 'cancel',
      documentName: intl.get(`sbsm.fundPlan.view.title.balDoc`).d('汇总单'),
      documentNum: balNum,
    });
    if (!confirmFlag) return;
    const res = await headerDs.setState('submitType', 'cancel').submit();
    if (!res) return;
    handleBackList();
  }, [headerDs, handleBackList, balNum, balRemainApplyAmount, balRemainPayAmount]);

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

  const handleOpenOperationRecord = useCallback(() => {
    modalOpen({
      size: 'medium',
      eidtFlag: false,
      title: intl.get('hzero.common.button.operationRecord').d('操作记录'),
      children: <OperationRecord balHeaderId={balHeaderId} />,
    });
  }, [modalOpen, balHeaderId]);

  const buttons = useMemo(() => {
    const normalBtns = [
      boolMap.allFlag && boolMap.editBtn && {
        name: 'editBtn',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          loading,
          wait: 1000,
          icon: 'mode_edit',
          onClick: () => linkToUpdateDetail('edit'),
        },
      },
      boolMap.allFlag && boolMap.approveBtn && {
        name: 'approveBtn',
        child: intl.get('sbsm.common.button.approve').d('审核'),
        btnProps: {
          loading,
          icon: 'authorize',
          onClick: handleApprove,
        },
      },
      boolMap.allFlag && boolMap.revokeApprovalBtn && {
        name: 'revokeApprovalBtn',
        child: intl.get('sbsm.common.button.revokeApproval').d('撤销审批'),
        btnProps: {
          loading,
          icon: 'reply',
          onClick: handleRevokeApproval,
        },
      },
      boolMap.allFlag && boolMap.cancelBtn && {
        name: 'cancelBtn',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          loading,
          wait: 1000,
          icon: 'cancel',
          onClick: () => linkToUpdateDetail('cancel'),
        },
      },
      boolMap.editFlag && {
        name: 'submit',
        child: intl.get('hzero.common.button.submit').d('提交'),
        btnProps: {
          icon: 'check',
          loading,
          onClick: handleSubmit,
        },
      },
      boolMap.editFlag && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          icon: 'save',
          loading,
          onClick: handleSave,
        },
      },
      boolMap.editFlag && {
        name: 'new-cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          loading,
          icon: 'cancel',
          onClick: handleDelete,
        },
      },
      boolMap.cancelFlag && {
        name: 'confirm-cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          loading,
          icon: 'cancel',
          onClick: handleCancel,
        },
      },
      {
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
    ];
  const processBtns = remote
    ? remote.process('SBSM.FUND_PLAN_SUMMARY_DETAIL_CUX.HEAD_BTNS', normalBtns, { loading, headerDs, boolMap })
    : normalBtns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    loading,
    boolMap,
    headerDs,
    handleSave,
    handleDelete,
    handleCancel,
    handleSubmit,
    handleApprove,
    linkToUpdateDetail,
    handleRevokeApproval,
    handleOpenOperationRecord,
  ]);

  const title = useMemo(() => {
    if (boolMap.pubFlag) return null;
    if (boolMap.editFlag) return intl.get('sbsm.fundPlan.view.title.balSumDocEdit').d('编辑资金计划汇总单');
    if (boolMap.cancelFlag) return intl.get('sbsm.fundPlan.view.title.balSumDocCancel').d('取消资金计划汇总单');
    if (boolMap.viewFlag) return intl.get('sbsm.fundPlan.view.title.balSumDocView').d('查看资金计划汇总单');
    return intl.get('sbsm.fundPlan.view.title.balSumDocView').d('查看资金计划汇总单');
  }, [boolMap]);

  const summaryHeader = useMemo(() => {
    if (!balNum) return '-';
    return `${balNum} ${currencyCode || ''} ${intl.get('sbsm.fundPlan.view.title.thisSumPaymentAmount').d('本次汇总付款金额')} ${balPayAmount}`;
  }, [balNum, currencyCode, balPayAmount]);

  return (
    <Fragment>
      <Header
        title={title}
        backPath={backPath}
        onBack={() => {
          if (state?.backPath) {
            updateTabLink(state?.backPath.split('?')[1], null);
          }
        }}
      >
        {customizeBtnGroup(
          { code: DetailBtnCode, pro: true },
          <DynamicButtons buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <Content wrapperClassName={styles[`collapse-content-wrap`]} className={styles[`collapse-content`]}>
        <Spin spinning={loading}>
          {customizeCollapse(
            { code: DetailCollapseCode },
            <Collapse
              ghost
              trigger="icon"
              expandIconPosition="text-right"
              defaultActiveKey={defaultActiveKey}
            >
              {
                !!currencyCode && (
                  <SummaryPanel key="summary" header={summaryHeader} showArrow={false} showExtra={!boolMap.pubFlag}>
                    <AmountSummary />
                  </SummaryPanel>
                )
              }
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
});

const FundPlanSummaryDetail = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export default FundPlanSummaryDetail;
