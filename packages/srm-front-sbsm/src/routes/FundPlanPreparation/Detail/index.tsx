import { stringify } from 'querystring';
import React, { Fragment, useMemo, useCallback, useContext } from 'react';
import { Spin, useModal, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { DataSetStatus } from 'choerodon-ui/dataset/data-set/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { isEmpty, isNil } from 'lodash';
import notification from 'utils/notification';

import AmountSummary from './components/AmountSummary';
import styles from '../../../common.less';
// import style from './index.less';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import { formatDynamicBtns, notifyValidErrors, confirmDocNegAction } from '../../../utils/utils';
import type { Operate } from '../utils/type';
import { DetailCollapseCode, DetailBtnCode, actionEnum } from '../utils/type';
import Basic from './components/Basic';
import PreLine from './components/Line';
import PrepResult from './components/PrepResult';
import { getCustomValidationResponse } from '../../../components/CustomValidation';
import { useModalOpen } from '../../../hooks';
import OperateRecord from '../../../components/HistoryRecord';
import SummaryPanel from '../../../components/SummaryPanel';
import { actionFlagger } from '../utils/utils';
import { deletePrepLine } from '../utils/api';

const { Panel } = Collapse;
const defaultActiveKey = [
  'summary',
  'basic',
  'result',
  'preLine',
];

const Detail = observer(() => {
  const {
    remote,
    history,
    editFlag,
    location,
    headerDs,
    customizeCollapse,
    customizeBtnGroup,
    viewFlag,
    prepHeaderId,
    preLineDs,
    handleToList,
    cancelFlag,
    pubFlag,
    workflowCaller,
    prepResultDs,
    permissionMap,
  } = useContext<StoreValueType>(Store);
  const c7nModal = useModal();
  const modalOpen = useModalOpen(c7nModal);
  const { prepNum, currencyCode = '', prepPayAmount, prepReportStatus } = headerDs.current?.get(['prepNum', 'currencyCode', 'prepPayAmount', 'prepReportStatus']) || {};
  const loading = headerDs.status !== 'ready';
  const { state } = location;

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`sbsm.fundPlan.view.title.basicInfo`).d('基本信息'),
        content: <Basic />,
      },
      {
        key: 'result',
        header: intl.get(`sbsm.fundPlan.view.title.prepResult`).d('多维度编制结果'),
        content: <PrepResult />,
      },
      {
        key: 'preLine',
        header: intl.get(`sbsm.fundPlan.view.title.preStageLine`).d('编制行信息'),
        content: <PreLine />,
      } as any,
    ].filter(Boolean);
  }, []);

  const backPath = useMemo(() => {
    return state?.backPath || '/sbsm/fund-plan-preparation/list';
  }, [state]);
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
      pathname: `/sbsm/fund-plan-preparation/detail/${prepHeaderId}`,
      search: stringify(filterNullValueObject({ operate: operateType })),
      state: {
        backPath: `${pathname}${search}`,
      },
    });
  }, [updateTabLink, history, location, prepHeaderId]);

  // 操作提交
  const handleSubmit = useCallback(async() => {
    const res = await headerDs.setState('submitType', 'submit').submit();
    if (!res) return false;
    handleToList();
  }, [headerDs, handleToList]);

  const handleUpdateLineSubmit = useCallback(async(feedback) => {
    if (feedback === 'ok') {
      const res = await headerDs.setState('submitType', 'updateLine').forceSubmit();
      if (!res) return false;
      // 调用成功后 更新行，不更新行上的可编辑字段
      preLineDs.query(undefined, undefined, true);
      headerDs.query(undefined, undefined, true);
      return true;
    }
    return handleSubmit();
  }, [headerDs, preLineDs, handleSubmit]);

  const handleValidateSubmit = useCallback(async() => {
    const validateLineRes = await headerDs.setState('submitType', 'validate').submit();
    if (!validateLineRes) return;
    const content = validateLineRes?.content[0] || {};
    getCustomValidationResponse(content, handleUpdateLineSubmit, {codeField: 'validCode'});
  }, [headerDs, handleUpdateLineSubmit]);

  const handleValidateLine = useCallback(async(feedback) => {
    if (feedback === 'ok') {
      const validateLineContent = headerDs.getState('validateLineContent') || {};
      // 预留 lineHandleType 行检验类型
      const { prepLineList, lineHandleType } = validateLineContent;
      if (!isNil(prepLineList) && !isEmpty(prepLineList) && lineHandleType === 'ZERO_AMOUNT_LINE_DELETE') {
        const deleteLineIds: any = [];
        prepLineList.forEach((item: any) => {
          const { prepLineId } = item;
          deleteLineIds.push(prepLineId);
        });
        const deleteRecords = preLineDs.filter((record) =>
          deleteLineIds.includes(record?.get('prepLineId'))
        );
        headerDs.status = DataSetStatus.loading;
        const cancelRes = await deletePrepLine(prepLineList);
        headerDs.status = DataSetStatus.ready;
        if (!cancelRes) return;
        preLineDs.remove(deleteRecords, true);
        const oldCount = preLineDs.totalCount;
        preLineDs.totalCount = oldCount - preLineDs.length;
        await headerDs.query(undefined, undefined, true);
        handleValidateSubmit();
        return true;
      }
    }
    return handleValidateSubmit();
  }, [handleValidateSubmit, headerDs, preLineDs]);

  // 提交 先做校验接口
  const handleBeforeSubmit = useCallback(async() => {
    const validRes = await headerDs.validate();
    // 校验失败，通知校验内容
    if (!validRes) {
      notifyValidErrors(headerDs);
      return undefined;
    };
    const validateLineRes = await headerDs.setState('submitType', 'validateLine').submit();
    if (!validateLineRes) return;
    const content = validateLineRes?.content[0] || {};
    const { msg } = content;
    headerDs.setState('validateLineContent', content);
    return getCustomValidationResponse({...content, msg: `${msg},${intl.get('sbsm.common.debounceSubmitValidate.paymentMessageLine').d('是否删除行？')}`}, handleValidateLine, {
      codeField: 'validCode',
      okText: intl.get('hzero.common.status.yes').d('是'),
      cancelText: intl.get('hzero.common.status.no').d('否'),
    });
  }, [headerDs, handleValidateLine]);

  // 操作保存
  const handleSave = useCallback(async() => {
    const validRes = await headerDs.validate();
    // 校验失败，通知校验内容
    if (!validRes) {
      notifyValidErrors(headerDs);
      return undefined;
    };
    const res = await headerDs.setState('submitType', 'save').submit();
    if (!res) return false;
    notification.success({});
    headerDs.query();
    prepResultDs.query();
  }, [headerDs, prepResultDs]);

  // 编辑取消(删除)
  const handleDelete = useCallback(async() => {
    const confirmFlag = await confirmDocNegAction({ action: 'cancel', documentName: '', documentNum: prepNum });
    if (!confirmFlag) return;
    const res = await headerDs.setState('submitType', 'delete').forceSubmit();
    if (!res) return false;
    handleToList();
  }, [prepNum, handleToList, headerDs]);

  const handleCancel = useCallback(async() => {
    const confirmFlag = await confirmDocNegAction({ action: 'cancel', documentName: intl.get(`sbsm.fundPlan.view.title.prepDoc`).d('编制单'), documentNum: prepNum });
    if (!confirmFlag) return;
    const res = await headerDs.setState('submitType', 'cancel').forceSubmit();
    if (!res) return false;
    handleToList();
  }, [headerDs, handleToList, prepNum]);

  const handleApprove = useCallback(() => {
    workflowCaller.goApprove({ record: headerDs.current, onSuccess: handleToList });
  }, [headerDs, workflowCaller, handleToList]);

  const handleRevoke = useCallback(async() => {
    const confirmRes = await Modal.confirm({
      title: intl.get('sbsm.common.view.title.tip').d('提示'),
      children: intl
        .get('sbsm.common.view.message.confirmRevokeApprovalTip')
        .d(
          '是否确认撤销审批?撤销后您仍可再次提交发起审批(工作流审批时仅工作流审批发起人可执行撤销)'
        ),
    });
    if (confirmRes !== 'ok') return false;
    const res = await workflowCaller.goRevoke(headerDs.current);
    if (res) {
      handleToList();
    }
  }, [headerDs, workflowCaller, handleToList]);

  const handleOperationRecord = useCallback(() => {
    modalOpen({
      size: 'large',
      editFlag: false,
      title: intl.get('hzero.common.button.operating').d('操作记录'),
      style: {width: 742},
      children: <OperateRecord
        approvalProps={{
          categoryLovCode: 'SBSM.APPROVE_CATEGORY',
          readTransport: {
            url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-header-approvals/${prepHeaderId}`,
            method: 'GET',
          },
          dataSource: [],
        }}
        operationProps={{
          actionEnum,
          primaryKey: 'prepHeaderId',
          documentName: intl.get(`sbsm.fundPlan.view.title.fundPlanPreparation`).d('编制工作台'),
          readTransport: {
            url: `/sbdm/v1/${getCurrentOrganizationId()}/prep-header-actions/${prepHeaderId}`,
            method: 'GET',
          },
          fieldsConfig: {
            userName: { alias: 'processUser' },
            time: { alias: 'processDate' },
            typeName: { alias: 'processStatusMeaning' },
            remark: { alias: 'processRemark' },
            typeCode: { alias: 'processStatus' },
          },
        }}
      />,
    });
  }, [modalOpen, prepHeaderId]);

  const buttons = useCallback(() => {
    const [editBtn, approveBtn, cancelBtn, revokeBtn] = actionFlagger({
      workflowCaller,
      record: headerDs.current,
      action: ['edit', 'approve', 'cancel', 'revoke'],
      permissionMap,
    });
    const btns = pubFlag ? [
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
    ] : [
      viewFlag && editBtn && {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          icon: 'mode_edit',
          loading,
          onClick: () => linkToUpdateDetail('edit'),
        },
      },
      viewFlag && cancelBtn && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          loading,
          onClick: () => linkToUpdateDetail('cancel'),
        },
      },
      editFlag && editBtn && {
          name: 'submit',
          child: intl.get('hzero.common.button.submit').d('提交'),
          btnProps: {
            icon: 'check',
            loading,
            onClick: handleBeforeSubmit,
          },
      },
      editFlag && editBtn && {
          name: 'save',
          child: intl.get('hzero.common.button.save').d('保存'),
          btnProps: {
              icon: 'save',
              loading,
              onClick: handleSave,
          },
      },
      ((editFlag && editBtn) || ['ASYNC_CREATING'].includes(prepReportStatus)) && {
          name: 'update-cancel',
          child: intl.get('hzero.common.button.cancel').d('取消'),
          btnProps: {
            icon: 'cancel',
            loading,
            onClick: handleDelete,
          },
      },
      cancelBtn && cancelFlag && {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          icon: 'cancel',
          loading,
          onClick: handleCancel,
        },
      },
      approveBtn && {
        name: 'approve',
        child: intl.get('sbsm.common.button.approve').d('审核'),
        btnProps: {
          loading,
          icon: 'authorize',
          onClick: handleApprove,
        },
      },
      revokeBtn && {
        name: 'revoke',
        child: intl.get('hzero.common.button.recall').d('撤回'),
        btnProps: {
          loading,
          icon: 'reply',
          onClick: handleRevoke,
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
    ];
    const processBtns = remote
    ? remote.process('SBSM.FUND_PLAN_PREPARATION_DETAIL_CUX.HEAD_BTNS', btns, { loading, headerDs, notifyValidErrors })
    : btns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    loading,
    editFlag,
    viewFlag,
    headerDs,
    workflowCaller,
    pubFlag,
    linkToUpdateDetail,
    handleSave,
    handleBeforeSubmit,
    handleDelete,
    handleCancel,
    handleOperationRecord,
    cancelFlag,
    handleApprove,
    handleRevoke,
    permissionMap,
    prepReportStatus,
  ]);

  const title = useMemo(() => {
    if (editFlag) return intl.get('sbsm.fundPlan.view.fundPlan.workbenchEditPrep').d('编辑资金计划编制');
    else if (cancelFlag) return intl.get('sbsm.fundPlan.view.title.workbenchCancelPrep').d('取消资金计划编制');
    else if (viewFlag) return intl.get('sbsm.fundPlan.view.fundPlan.workbenchDetailPrepView').d('查看资金计划编制');
    return intl.get('sbsm.fundPlan.view.fundPlan.workbenchDetailPrepView').d('查看资金计划编制');
  }, [editFlag, cancelFlag, viewFlag]);

  const summaryHeader = useMemo(() => {
    if (!prepNum) return '';
    return `${prepNum} ${currencyCode || ''} ${intl.get('sbsm.fundPlan.model.fundPlan.prePayAmount').d('本次编制付款金额')} ${prepPayAmount}`;
  }, [currencyCode, prepPayAmount, prepNum]);

  return (
    <Fragment>
      <Header
        title={!pubFlag && title}
        backPath={!pubFlag ? backPath : ''}
        onBack={() => {
            if (!pubFlag && state?.backPath) {
                updateTabLink(state?.backPath.split('?')[1], null);
            }
        }}
      >
        {customizeBtnGroup(
        { code: DetailBtnCode, pro: true },
          <DynamicButtons buttons={buttons()} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <Content wrapperClassName={styles[`collapse-content-wrap`]} className={styles[`collapse-content`]}>
        <Spin spinning={loading}>
          <div className='sbsm-detail-collapse-content'>
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
                    <SummaryPanel key="summary" header={summaryHeader} showArrow={false} showExtra>
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
          </div>
        </Spin>
      </Content>

    </Fragment>
  );
});

const FundPlanPreparationetail = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export default FundPlanPreparationetail;
