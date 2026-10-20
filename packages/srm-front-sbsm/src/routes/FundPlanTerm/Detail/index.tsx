import { stringify } from 'querystring';
import React, { Fragment, useMemo, useCallback, useContext } from 'react';
import { Button, Icon, Spin, Dropdown, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { FuncType, ButtonColor } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import notification from 'utils/notification';

import styles from './index.less';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import TermBasic from './components/TermBasic';
import TermLine from './components/TermLine';
import { editPayFundPlan, revoke, cancelPublish } from '../utils/api';
import { notifyValidErrors, formatDynamicBtns } from '../../../utils/utils';
import { DetailCollapseCode, DetailBtnCode } from '../utils/type';
import type { Operate, SubmitType } from '../utils/type';
import VersionRecord from '../../../components/HistoryRecord/VersionRecord';
import ApprovalRecord from '../../../components/HistoryRecord/ApprovalRecord';
import stylesCommon from '../../../common.less';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'payPlanStage',
];

const Detail = observer(() => {
  const {
    state,
    search,
    pathname,
    history,
    operate,
    allFlag,
    editFlag,
    copyFlag,
    createFlag,
    historyFlag,
    hideBackFlag,
    termHeaderDs,
    termHeaderId,
    handleBackList,
    handleToDetail,
    customizeCollapse,
    snapshotFlag,
    notPub,
    permissionMap,
    customizeBtnGroup,
  } = useContext<StoreValueType>(Store);

  const {
    termNum,
    termStatus,
    versionNumber,
    parentTermHeaderStatus,
    releaseBusinessKey,
    dataSource,
  } = termHeaderDs.current?.get([
    'termNum',
    'termStatus',
    'versionNumber',
    'parentTermHeaderStatus',
    'releaseBusinessKey',
    'dataSource',
  ]) || {};
  const loading = termHeaderDs.status !== 'ready';
  const saveBtnFlag = createFlag || editFlag || copyFlag;


  const titlePrefixMap = useMemo<Record<Operate, string>>(() => {
    return {
      all: intl.get('hzero.common.button.view').d('查看'),
      edit: intl.get('hzero.common.button.edit').d('编辑'),
      copy: intl.get('hzero.common.button.copy').d('复制'),
      view: intl.get('hzero.common.button.view').d('查看'),
      create: intl.get('hzero.common.button.create').d('新建'),
      history: intl.get('hzero.common.button.view').d('查看'),
    };
  }, []);

  const tltle: string = useMemo(() => {
    const titlePrefix = titlePrefixMap[operate] || titlePrefixMap.view;
    const titleSuffix = historyFlag
      ? intl.get('sbsm.payTermsCtrl.view.message.versionVNumber', { versionNumber }).d('版本v{versionNumber}')
      : '';
    const titleContent = intl.get(`sbsm.payTermsCtrl.view.title.paymentTerm`).d('付款条款');
    return `${titlePrefix}${titleContent} ${titleSuffix}`;
  }, [operate, historyFlag, versionNumber, titlePrefixMap]);

  const backPath = useMemo(() => {
    if (Number(hideBackFlag) === 1) return undefined;
    else return state?.backPath || '/sbsm/payment-terms/list';
  }, [state, hideBackFlag]);

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`sbsm.payTermsCtrl.view.title.payTermBasicInfo`).d('付款条款基本信息'),
        content: <TermBasic />,
      },
      (!createFlag && {
        key: 'payPlanStage',
        header: intl.get(`sbsm.payTermsCtrl.view.title.payPlanStage`).d('付款条款阶段'),
        content: <TermLine />,
      }) as any,
    ].filter(Boolean);
  }, [createFlag]);

  const handleEdit = useCallback(async () => {
    const res = getResponse(await editPayFundPlan(termHeaderDs.current));
    const { termHeaderId: newTermHeaderId } = res || {};
    if (!newTermHeaderId) return;
    const locationData = {
      pathname: `/sbsm/payment-terms/detail/${newTermHeaderId}`,
      search: stringify({ operate: 'edit' }),
      state: { backPath: `${pathname}${search}` },
    };
    history.push(locationData);
    updateTab({
      key: getActiveTabKey(),
      ...locationData,
    });
  }, [
    search,
    history,
    pathname,
    termHeaderDs,
  ]);

  const handleBack = useCallback(() => {
    if (notPub && state?.backPath) {
      updateTab({
        key: getActiveTabKey(),
        search: state?.backPath.split('?')[1],
        state: { backPath: null },
      });
    }
  }, [state, notPub]);

  /**
   * @description: DataSet提交方法
   * @param {SubmitType} submitType 提交类型
   * @return {object | undefined} 提交方法返回
   */
  const handleSubmit = useCallback(async (submitType: SubmitType) => {
    // 校验
    const validRes = await termHeaderDs.validate();
    // 校验失败，通知校验内容
    if (!validRes) {
      notifyValidErrors(termHeaderDs);
      return undefined;
    };
    const res = await termHeaderDs.setState('submitType', submitType).forceSubmit();
    return res;
  }, [termHeaderDs]);

  // 保存按钮响应
  const handleSave = useCallback(async () => {
    if (editFlag) {
      const res = await handleSubmit('save');
      if (!res) return;
      // 后端没办法将 __id 返回，只能手动塞值
      termHeaderDs.loadData(res.content);
    } else if (createFlag || copyFlag) {
      const res = await handleSubmit(createFlag ? 'create' : 'copy');
      if (!res) return;
      const { termHeaderId } = res.content[0];
      handleToDetail(termHeaderId, 'edit');
    };
  }, [createFlag, copyFlag, editFlag, termHeaderDs, handleSubmit, handleToDetail]);

  // 发布按钮响应
  const handleRelease = useCallback(async () => {
    if (parentTermHeaderStatus === 'DISABLE') {
      const feedback = await Modal.confirm({
        title: intl.get('sbsm.payTermsCtrl.view.title.tip').d('提示'),
        children: intl
          .get('sbsm.payTermsCtrl.view.message.disabledParentTermReleaseTip')
          .d('当前条款为禁用状态，发布后将直接生效变为“已发布”，请确认是否发布'),
      });
      if (feedback !== 'ok') return;
    }
    const res = await handleSubmit('release');
    if (!res) return;
    handleBackList();
  }, [handleSubmit, handleBackList, parentTermHeaderStatus]);

  const handleViewHistory = useCallback(({ record }) => {
    const termHeaderId = record?.get('termHeaderId');
    if (!termHeaderId) return;
    const newLocation = { search: stringify({ operate: 'history' }), state };
    if (!historyFlag) newLocation.state = { backPath: `${pathname}${search}` };
    history.push({
      pathname: `/sbsm/payment-terms/detail/${termHeaderId}`,
      ...newLocation,
    });
    updateTab({ key: getActiveTabKey(), ...newLocation });
  }, [state, search, history, pathname, historyFlag]);

  // 取消发布
  const handleCancelPublish = useCallback(async () => {
    const res = getResponse(await cancelPublish(termHeaderId));
    if (!res) return;
    termHeaderDs.query();
    notification.success({});
  }, [termHeaderDs, termHeaderId]);

  // 撤回
  const handleRevoke = useCallback(async () => {
    const res = getResponse(await revoke(releaseBusinessKey));
    if (!res) return;
    termHeaderDs.query();
    notification.success({});
  }, [termHeaderDs, releaseBusinessKey]);

  // 审批记录
  const handleArroveRecord = useCallback(() => {
    Modal.open({
      drawer: true,
      closable: true,
      title: intl.get('sbsm.common.button.cancel.approveRecord').d('审批记录'),
      className: stylesCommon['sbsm-large-modal'],
      cancelButton: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
      style: { width: 742 },
      children: <ApprovalRecord
        categoryLovCode='SBSM.APPROVE_CATEGORY'
        readTransport={{
          url: `/sbdm/v1/${getCurrentOrganizationId()}/term-headers/release/approve-records`,
          method: 'GET',
          params: { termHeaderId },
        }}
      />,
    });
  }, [termHeaderId]);

  const buttons = useMemo(() => {
    const btns = [
      permissionMap?.get('edit') && allFlag && (termStatus === 'UN_PUBLISH' || snapshotFlag) && ['SRM'].includes(dataSource) && notPub && {
        name: 'edit',
        child: intl.get('hzero.common.button.edit').d('编辑'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'mode_edit',
          onClick: handleEdit,
          funcType: FuncType.flat,
          color: ButtonColor.default,
          loading,
        },
      },
      saveBtnFlag && !createFlag && !copyFlag && notPub && ['SRM'].includes(dataSource) && {
        name: 'publish',
        child: intl.get('hzero.common.button.publish').d('发布'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'publish2',
          onClick: handleRelease,
          loading,
        },
      },
      saveBtnFlag && notPub && ['SRM'].includes(dataSource) && {
        name: 'save',
        child: intl.get('hzero.common.button.save').d('保存'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'save',
          onClick: handleSave,
          loading,
        },
      },
      permissionMap?.get('revoke') && ['SRM'].includes(dataSource) && termStatus === 'RELEASE_APPROVING' && {
        name: 'revoke',
        child: intl.get('hzero.common.button.recall').d('撤回'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'reply',
          onClick: handleRevoke,
          loading,
        },
      },
      permissionMap?.get('cancelPublish') && ['SRM'].includes(dataSource) && termStatus === 'RELEASE_REJECT' && {
        name: 'cancelPublish',
        child: intl.get('sbsm.common.button.cancel.publish').d('取消发布'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'cancel',
          onClick: handleCancelPublish,
          loading,
        },
      },
      permissionMap?.get('approveRecord') && ['SRM'].includes(dataSource) && !createFlag && !copyFlag && {
        name: 'approveRecord',
        child: intl.get('sbsm.common.button.cancel.approveRecord').d('审批记录'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'operation_service_request',
          onClick: handleArroveRecord,
          funcType: FuncType.flat,
          color: ButtonColor.default,
          loading,
        },
      },
    ];
    return formatDynamicBtns(btns);
  }, [handleEdit, loading, handleSave, permissionMap, allFlag, termStatus, snapshotFlag, notPub, handleRelease, createFlag, copyFlag, saveBtnFlag, handleCancelPublish, handleArroveRecord, handleRevoke, dataSource]);

  return (
    <Fragment>
      <Header title={notPub && tltle} backPath={notPub ? backPath : ''} onBack={handleBack}>
        {customizeBtnGroup(
          { code: DetailBtnCode, pro: true },
          <DynamicButtons unitCode={DetailBtnCode} buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
        {
          !copyFlag && (Number(versionNumber) > 1 || historyFlag) && notPub && (
            <Dropdown
              placement={Placements.bottomRight}
              overlay={
                <VersionRecord
                  primaryKey='termHeaderId'
                  currentKey={termHeaderId}
                  onClick={handleViewHistory}
                  fieldsConfig={{
                    userName: { alias: 'publishedByName' },
                    time: { alias: 'publishedDate' },
                  }}
                  readTransport={{
                    url: `/sbdm/v1/${getCurrentOrganizationId()}/term-headers/history/page`,
                    method: 'GET',
                    params: { termNum },
                  }}
                />
              }
            >
              <Button name='history' funcType={FuncType.flat} icon="schedule" loading={loading}>
                {intl.get('hzero.common.button.historyVersion').d('历史版本')}
                <Icon type="expand_more" />
              </Button>
            </Dropdown>
          )
        }
        {/* {allFlag && (termStatus === 'UN_PUBLISH' || snapshotFlag) && notPub && (
          <PermissionButton
            type="c7n-pro"
            size="small"
            icon="mode_edit"
            funcType={FuncType.flat}
            onClick={handleEdit}
            permissionList={[
            {
              code: permissionCodeMap.edit,
              type: 'button',
            },
           ]}
          >
            {intl.get('hzero.common.button.edit').d('编辑')}
          </PermissionButton>
        )}
        {saveBtnFlag && !createFlag && !copyFlag && notPub && (
          <Button icon="publish2" color={ButtonColor.primary} onClick={handleRelease} loading={loading}>
            {intl.get('hzero.common.button.publish').d('发布')}
          </Button>
        )}
        {saveBtnFlag && notPub && (
          <Button
            icon="save"
            loading={loading}
            funcType={createFlag || copyFlag ? FuncType.raised : FuncType.flat}
            onClick={handleSave}
            color={createFlag || copyFlag ? ButtonColor.primary : ButtonColor.default}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
        {!copyFlag && (Number(versionNumber) > 1 || historyFlag) && notPub && (
          <Dropdown
            placement={Placements.bottomRight}
            overlay={
              <VersionRecord
                primaryKey='termHeaderId'
                currentKey={termHeaderId}
                onClick={handleViewHistory}
                fieldsConfig={{
                  userName: { alias: 'createdByName' },
                  time: { alias: 'publishedDate' },
                }}
                readTransport={{
                  url: `/sbdm/v1/${getCurrentOrganizationId()}/term-headers/history/page`,
                  method: 'GET',
                  params: { termNum },
                }}
              />
            }
          >
            <Button funcType={FuncType.flat} icon="schedule" loading={loading}>
              {intl.get('hzero.common.button.historyVersion').d('历史版本')}
              <Icon type="expand_more" />
            </Button>
          </Dropdown>
        )} */}
      </Header>
      <Content
        className={styles[`collapse-content`]}
        wrapperClassName={styles[`collapse-content-wrap`]}
      >
        <Spin spinning={loading}>
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
});

const PayTermsFundingPlanDetail = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export default PayTermsFundingPlanDetail;
