/*
 * @Description: 付款条款管控-详情页
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-16 10:20:23
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import React, { Fragment, useMemo, useCallback, useContext } from 'react';
import { Button, Icon, Spin, Dropdown, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';
import { observer } from 'mobx-react';
import intl from 'utils/intl';
import { SRM_SSTA }from '_utils/config';
import { Header, Content } from 'components/Page';
import { getActiveTabKey, updateTab } from 'utils/menuTab';
import { getResponse, getCurrentOrganizationId } from 'utils/utils';
import { Button as PermissionButton } from 'components/Permission';

import styles from './index.less';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import TermBasic from './components/TermBasic';
import TermLine from './components/TermLine';
import { editPayTermsCtrl } from '../utils/api';
import { notifyValidErrors } from '../utils/utils';
import { DetailCollapseCode, permissionCodeMap } from '../utils/type';
import type { Operate, SubmitType } from '../utils/type';
import TermRule from './components/TermRule';
import CuszFormSlot from './components/CuszFormSlot';
import CuszLineSlot from './components/CuszLineSlot';
import WholeAmountRule from './components/WholeAmountRule';
import VersionRecord from '../components/HistoryRecord/VersionRecord';

const { Panel } = Collapse;
const defaultActiveKey = [
  'basic',
  'cuszForm',
  'stage',
  'cuszLine',
  'wholeRule',
  'stageRule',
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
  } = useContext<StoreValueType>(Store);

  const {
    termNum,
    termStatus,
    snapshotFlag,
    versionNumber,
    enableTermFlag,
    parentTermHeaderStatus,
  } = termHeaderDs.current?.get([
    'termNum',
    'termStatus',
    'snapshotFlag',
    'versionNumber',
    'enableTermFlag',
    'parentTermHeaderStatus',
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
    ? intl.get('smdm.payTermsCtrl.view.message.versionVNumber', { versionNumber }).d('版本v{versionNumber}')
    : '';
  const titleContent = intl.get(`smdm.payTermsCtrl.view.title.paymentTerm`).d('付款条款');
  return `${titlePrefix}${titleContent} ${titleSuffix}`;
  }, [operate, historyFlag, versionNumber, titlePrefixMap]);

  const backPath = useMemo(() => {
    if (Number(hideBackFlag) === 1) return undefined;
    else return state?.backPath || '/smdm/payment-terms/list';
  }, [state, hideBackFlag]);

  const paneList = useMemo(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`smdm.payTermsCtrl.view.title.payTermBasicInfo`).d('付款条款基本信息'),
        content: <TermBasic />,
      },
      {
        key: 'cuszForm',
        header: intl.get(`smdm.payTermsCtrl.view.title.cuszExpandInfo`).d('个性化扩展信息'),
        content: <CuszFormSlot />,
      },
      Number(enableTermFlag) > 0 && {
        key: 'stage',
        header: intl.get(`smdm.payTermsCtrl.view.title.payTermStructuration`).d('付款条款结构化定义'),
        content: <TermLine />,
      },
      {
        key: 'cuszLine',
        header: intl.get(`smdm.payTermsCtrl.view.title.cuszExpandLine`).d('个性化扩展行'),
        content: <CuszLineSlot />,
      },
      Number(enableTermFlag) > 0 && {
        key: 'wholeRule',
        header: intl.get(`smdm.payTermsCtrl.view.title.payPlanWholeCtrlRule`).d('付款计划整单管控规则'),
        content: <WholeAmountRule />,
      },
      (Number(enableTermFlag) === 1 && {
        key: 'stageRule',
        header: intl.get(`smdm.payTermsCtrl.view.title.payPlanStageCtrlRule`).d('付款计划阶段管控规则'),
        content: <TermRule />,
      }) as any,
    ].filter(Boolean);
  }, [enableTermFlag]);

  const handleEdit = useCallback(async () => {
    const res = getResponse(await editPayTermsCtrl(termHeaderId));
    const { termHeaderId: newTermHeaderId } = res || {};
    if (!newTermHeaderId) return;
    const locationData = {
      pathname: `/smdm/payment-terms/detail/${newTermHeaderId}`,
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
    termHeaderId,
  ]);

  const handleBack = useCallback(() => {
    if (state?.backPath) {
      updateTab({
        key: getActiveTabKey(),
        search: state?.backPath.split('?')[1],
        state: { backPath: null },
      });
    }
  }, [state]);

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
        title: intl.get('smdm.payTermsCtrl.view.title.tip').d('提示'),
        children: intl
          .get('smdm.payTermsCtrl.view.message.disabledParentTermReleaseTip')
          .d('当前条款为禁用状态，草稿发布后将直接生效变为“已发布”，请确认是否发布'),
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
    if(!historyFlag) newLocation.state = { backPath: `${pathname}${search}` };
    history.push({
      pathname: `/smdm/payment-terms/detail/${termHeaderId}`,
      ...newLocation,
    });
    updateTab({ key: getActiveTabKey(), ...newLocation });
  }, [state, search, history, pathname, historyFlag]);

  return (
    <Fragment>
      <Header title={tltle} backPath={backPath} onBack={handleBack}>
        {allFlag && Number(snapshotFlag) === 1 && (
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
        {saveBtnFlag && (
          <Button icon="publish2" color={ButtonColor.primary} onClick={handleRelease} loading={loading}>
            {intl.get('hzero.common.button.publish').d('发布')}
          </Button>
        )}
        {saveBtnFlag && (
          <Button
            icon="save"
            loading={loading}
            funcType={FuncType.flat}
            onClick={handleSave}
          >
            {intl.get('hzero.common.button.save').d('保存')}
          </Button>
        )}
        {!copyFlag && termStatus === 'PUBLISHED' && (Number(versionNumber) > 1 || historyFlag) && (
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
                  url: `${SRM_SSTA}/v1/${getCurrentOrganizationId()}/term-headers/history/page`,
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
        )}
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

const PayTermsCtrlDetail = (props) => {
  return <StoreProvider {...props}><Detail /></StoreProvider>;
};

export default PayTermsCtrlDetail;
