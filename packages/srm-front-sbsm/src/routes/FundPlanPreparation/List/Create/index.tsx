import React, { Fragment, useContext, useMemo, useCallback, useState, useEffect } from 'react';
import { Tabs } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { stringify } from 'querystring';

import intl from 'utils/intl';
import notification from 'utils/notification';
import { math } from 'choerodon-ui/dataset';

import DynamicButtons from '_components/DynamicButtons';
import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import SourceTable from './components/SourceTable';
import StageTable from './components/StageTable';
import { ListTabsCustCode, CreateTabsCode, CreateFooterCode } from '../../utils/type';
import { getTableConfig } from '../../utils/api';
// import styles from '../Detail/index.less';

const { TabPane, TabGroup } = Tabs;

const List = observer(() => {
  const {
    remote,
    customizeTabPane,
    customizeBtnGroup,
    custConfig,
    sourceTableDs,
    stageTableDs,
    modal,
    history,
  } = useContext(Store) as StoreValueType;

  const { fields = [] } = custConfig?.[CreateTabsCode] || {};
  const { fieldCode } = fields.find(item => item?.defaultActive === 1) || {};

  const [activeKey, setActiveKey] = useState(fieldCode || 'stage');

  const tableDs = activeKey === 'stage' ? stageTableDs : sourceTableDs;
  const { selected } = tableDs;
  const loading = tableDs.status !== 'ready';

  const handleCancel = useCallback(() => {
    modal.close();
  }, [modal]);

  const handleToDetail = useCallback((prepHeaderId) => {
    if (!prepHeaderId) return;
    history.push({
      pathname: `/sbsm/fund-plan-preparation/detail/${prepHeaderId}`,
      search: stringify({ operate: 'edit' }),
    });
  }, [history]);

  const handleSubmit = useCallback(async () => {
    const res = await tableDs.setState('submitType', 'create').submit();
    if (!res) return false;
    const result = await getTableConfig();
    const { prepAsyncLength = '', prepMode = '' } = (result && !isEmpty(result)) ? (result?.[0] || {}) : {};
    const { content } = res || {};
    const { prepHeaderId } = content[0] || {};
    modal.close();
    if (prepMode === 'LINE_AND_REL' && !math.isNaN(prepAsyncLength) && math.gt(selected.length, Number(prepAsyncLength))) {
      // 如果明细大于阈值 异步
      notification.success({
        description: intl.get('sbsm.common.view.message.createTips').d('批量创建中，您可以离开当前页面，创建失败的单据，将通过系统消息展示失败原因，并重新展示在可编制列表'),
      });
    } else {
      notification.success({});
      handleToDetail(prepHeaderId);
    }
  }, [tableDs, modal, handleToDetail, selected]);

  const buttons = useMemo(() => {
    const normalBtns = [
      {
        name: 'ok',
        child: intl.get('hzero.common.button.ok').d('确定'),
        btnProps: {
          loading,
          color: 'primary',
          onClick: handleSubmit,
          disabled: isEmpty(selected),
        },
      },
      {
        name: 'cancel',
        child: intl.get('hzero.common.button.cancel').d('取消'),
        btnProps: {
          onClick: handleCancel,
        },
      },
    ];
    const processBtns = remote
      ? remote.process('SBSM.FUND_PLAN_PREPARATION_CREATE_CUX.FOOTER_BTNS', normalBtns, {
        modal,
        tableDs,
        loading,
        selected,
        activeKey,
        handleToDetail,
      })
      : normalBtns;
    return processBtns;
  }, [
    modal,
    remote,
    tableDs,
    loading,
    selected,
    activeKey,
    handleCancel,
    handleSubmit,
    handleToDetail,
  ]);

  useEffect(() => {
    if (modal) {
      modal.update({
        footer: customizeBtnGroup(
          { code: CreateFooterCode, pro: true },
          <DynamicButtons buttons={buttons} defaultBtnType="c7n-pro" />
        ),
      });
    }
  }, [
    modal,
    buttons,
    customizeBtnGroup,
  ]);

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
  }, [setActiveKey]);

  const sourceColumns = useMemo(() => {
    return [
      {
        key: 'source',
        tab: intl.get(`sbsm.fundPlan.view.stage.prepard`).d('可编制'),
      },
    ];
  }, []);

  const stageColumns = useMemo(() => {
    return [
      {
        key: 'stage',
        tab: intl.get(`sbsm.fundPlan.view.stage.prepard`).d('可编制'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <div>
        {customizeTabPane(
          {
            code: ListTabsCustCode,
            cascade: true,
          },
          <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
            <TabGroup tab={intl.get(`sbsm.fundPlan.view.tabs.stageView`).d('阶段')} key="stage">
              {stageColumns.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={stageTableDs?.totalCount}
                >
                  <StageTable />
                </TabPane>
              ))}
            </TabGroup>
            <TabGroup tab={intl.get(`sbsm.fundPlan.view.tabs.sourceDoc`).d('编制来源单据')} key="source">
              {sourceColumns.map(({ key, tab }) => (
                <TabPane
                  tab={tab}
                  key={key}
                  count={sourceTableDs?.totalCount}
                >
                  <SourceTable />
                </TabPane>
              ))}
            </TabGroup>
          </Tabs>
        )}
      </div>
    </Fragment>
  );
});

const ListCreate = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default ListCreate;
