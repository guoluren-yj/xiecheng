/*
 * @Description: 付款计划详情页
 * @Author: JSS <shangshang.jing@gong-link.com>
 * @Date: 2022-09-26 12:57:20
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2022, Hand
 */
import { stringify } from 'querystring';
import React, { useMemo, Fragment, useContext, useCallback, useEffect } from 'react';
import { Spin, Dropdown, Button, Icon, Modal } from 'choerodon-ui/pro';
import { Collapse } from 'choerodon-ui';
import { math } from 'choerodon-ui/dataset';
import { Placements } from 'choerodon-ui/pro/lib/dropdown/enum';
import { ButtonColor, FuncType } from 'choerodon-ui/pro/lib/button/enum';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { updateTab, getActiveTabKey } from 'utils/menuTab';


import styles from './index.less';
import PlanRule from './components/PlanRule';
import PlanLine from './components/PlanLine';
import PlanBasic from './components/PlanBasic';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import { DetailCollapseCode } from '../utils/type';
import { notifyValidErrors } from '../utils/utils';
import CuszFormSlot from './components/CuszFormSlot';
import CuszLineSlot from './components/CuszLineSlot';
import AmountSummary from './components/AmountSummary';
import WholeAmountRule from './components/WholeAmountRule';
import OperationRecord from './components/OperationRecord';
import HistoryVersion from '../List/components/HistoryVersion';
import SummaryPanel from '../../../components/SummaryPanel';

const { Panel } = Collapse;
const defaultActiveKey = [
  'summary',
  'basic',
  'cuszForm',
  'stage',
  'cuszLine',
  'wholeRule',
  'stageRule',
];

const Detail = () => {

  const {
    state,
    search,
    history,
    pathname,
    loading,
    allFlag,
    editFlag,
    modalFlag,
    changeFlag,
    historyFlag,
    planHeaderDs,
    permissionMap,
    headerTitle: initialHeaderTitle,
    onPartChildRef,
    contentStyleType,
    handleSetLoading,
    customizeCollapse,
    remote,
    planLineDs,
  } = useContext<StoreValueType>(Store);
  const {
    planNum,
    planStatus,
    planHeaderId,
    versionNumber,
    enableTermFlag,
    paymentDiffAmount,
  } = planHeaderDs.current?.get([
    'planNum',
    'planStatus',
    'planHeaderId',
    'versionNumber',
    'enableTermFlag',
    'paymentDiffAmount',
  ]) || {};

  const headerTitle = useMemo(() => {
    if (initialHeaderTitle) return initialHeaderTitle;
    else if (changeFlag) return intl.get('ssta.paymentPlan.view.title.paymentPlanChangeControlRules').d('付款计划变更管控规则');
    else return intl.get('ssta.paymentPlan.view.title.paymentPlanDetail').d('付款计划详情');
  }, [changeFlag, initialHeaderTitle]);

  const backPath = useMemo(() => {
    return state?.backPath || '/ssta/payment-plan/list';
  }, [state]);

  const handleQuery = useCallback(() => {
    // 注意 editFlag 和 showHeaderCode的传值
    planHeaderDs.query();
  }, [planHeaderDs]);

  // 保存方法抛出作为一个Promise供其他模块调用，请谨慎更改
  const handleSave = useCallback(async () => {
    if (!planHeaderDs.current) return;
    // 校验
    const validRes = await planHeaderDs.validate();
    // 校验失败，通知校验内容
    if (!validRes) {
      notifyValidErrors(planHeaderDs);
      return false;
    };
    const res = await planHeaderDs.setState('submitType', 'update').submit();
    // version1、后端没办法将 __id 返回，只能手动塞值
    // planHeaderDs.loadData(res.content);
    // version2、后端也无法将最新数据返回，无法loadData，只能重新查询
    // version3、来源单据提交失败后也会更新头信息，因此刷新逻辑由来源单据模块执行
    // version4、无论成功失败都查询，带 showHeaderCode=DRAFT 参数
    await planHeaderDs.query();
    return !!res;
  }, [planHeaderDs]);

  // 抛出保存方法供外部模块使用
  useEffect(() => {
    if (onPartChildRef) {
      onPartChildRef({
        handleSave,
        handleQuery,
        handleSetLoading,
      });
    }
  }, [onPartChildRef, handleSave, handleQuery, handleSetLoading]);

  const handleBack = useCallback(() => {
    if (state?.backPath) {
      updateTab({
        key: getActiveTabKey(),
        search: state?.backPath.split('?')[1],
        state: { backPath: null },
      });
    }
  }, [state]);

  const handleToChangePage = useCallback(() => {
    const changeLocationData = {
      search: stringify({ operate: 'change' }),
      state: { backPath: `${pathname}${search}` },
    };
    history.push(changeLocationData);
    updateTab({ ...changeLocationData, key: getActiveTabKey() });
  }, [search, pathname, history]);

  const handleChangeConfirm = useCallback(async () => {
    if (planHeaderDs.dirty === false) {
      notification.warning({
        description: intl.get('ssta.paymentPlan.view.message.noDataModifiedAndCheck').d('当前未修改任何数据，请检查'),
      });
      return;
    }
    const res = await planHeaderDs.setState('submitType', 'change').submit();
    if (!res) return;
    history.push({
      pathname: `/ssta/payment-plan/list`,
    });
  }, [history, planHeaderDs]);

  const handleViewOperation = useCallback(() => {
    Modal.open({
      drawer: true,
      title: intl.get('hzero.common.button.operation').d('操作记录'),
      closable: true,
      key: Modal.key(),
      className: styles['ssta-medium-modal'],
      children: <OperationRecord planNum={planNum} />,
      okCancel: false,
      okText: intl.get('hzero.common.button.close').d('关闭'),
    });
  }, [planNum]);

  const paneList = useMemo<any[]>(() => {
    return [
      {
        key: 'basic',
        header: intl.get(`ssta.paymentPlan.view.title.basicInfo`).d('基本信息'),
        content: <PlanBasic />,
      },
      {
        key: 'cuszForm',
        header: intl.get(`ssta.paymentPlan.view.title.cuszExpandInfo`).d('个性化扩展信息'),
        content: <CuszFormSlot />,
      },
      Number(enableTermFlag) > 0 && {
        key: 'stage',
        header: intl.get(`ssta.paymentPlan.view.title.paymentStageInfo`).d('付款阶段信息'),
        content: <PlanLine />,
      },
      {
        key: 'cuszLine',
        header: intl.get(`ssta.paymentPlan.view.title.cuszExpandLine`).d('个性化扩展行'),
        content: <CuszLineSlot />,
      },
      Number(enableTermFlag) > 0 && {
        key: 'wholeRule',
        header: intl.get(`ssta.paymentPlan.view.title.payPlanWholeCtrlRule`).d('付款计划整单管控规则'),
        content: <WholeAmountRule />,
      },
      Number(enableTermFlag) === 1 && {
        key: 'stageRule',
        header: intl.get(`ssta.paymentPlan.view.title.payPlanStageCtrlRule`).d('付款计划阶段管控规则'),
        content: <PlanRule />,
      },
    ].filter((item) => item);
  }, [enableTermFlag]);

  return (
    <Fragment>
      {!modalFlag && (
        <Header
          title={headerTitle}
          backPath={backPath}
          onBack={handleBack}
        >
          {permissionMap?.get('change') && allFlag && ['EFFECTIVE', 'EXECUTING'].includes(planStatus) && (
            <Button
              loading={loading}
              color={ButtonColor.primary}
              icon="mode_edit"
              onClick={handleToChangePage}
            >
              {intl.get('ssta.paymentPlan.view.button.changeControlRules').d('变更管控规则')}
            </Button>
          )}
          {changeFlag && (
            <Button
              loading={loading}
              color={ButtonColor.primary}
              icon="check"
              onClick={handleChangeConfirm}
            >
              {intl.get('hzero.common.button.confirm').d('确认')}
            </Button>
          )}
          <Button
            loading={loading}
            funcType={FuncType.flat}
            icon="operation_service_request"
            onClick={handleViewOperation}
          >
            {intl.get('hzero.common.button.operation').d('操作记录')}
          </Button>
          {(Number(versionNumber) > 1 || historyFlag) && (
            <Dropdown
              placement={Placements.bottomRight}
              overlay={<HistoryVersion planNum={planNum} planHeaderId={planHeaderId} history={history} />}
            >
              <Button funcType={FuncType.flat} icon="schedule" loading={loading}>
                {intl.get('hzero.common.button.historyVersion').d('历史版本')}
                <Icon type="expand_more" />
              </Button>
            </Dropdown>
          )}
          {remote
            ? remote.process('SSTA.PAYMENT_PLAN_DETAIL_CUX.HEADER_BTNS', '', {
              planHeaderDs,
              editFlag,
              modalFlag,
              changeFlag,
              planLineDs,
            })
            : ''}
        </Header>
      )}
      <Content
        wrapperClassName={styles[`collapse-content-wrap`]}
        className={styles[`collapse-content${contentStyleType === 'fullfit' ? '-fullfit' : ''}`]}
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
              {editFlag && Boolean(paymentDiffAmount) && !math.isZero(paymentDiffAmount) && (
                <SummaryPanel key="summary">
                  <AmountSummary />
                </SummaryPanel>
              )}
              {paneList.map((item) => {
                const { content, ...panelProps } = item;
                return (
                  <Panel forceRender showArrow={false} {...panelProps}>
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

const PaymentPlanDetail = (props) => {
  return (
    <StoreProvider {...props}>
      <Detail />
    </StoreProvider>
  );
};



export default PaymentPlanDetail;
