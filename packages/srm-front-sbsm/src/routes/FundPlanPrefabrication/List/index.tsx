import React, { Fragment, useContext, useMemo, useCallback, useRef, useState, useEffect } from 'react';
import { Tabs, Tooltip, Icon } from 'choerodon-ui/pro';
import { isEmpty } from 'lodash';
import { observer } from 'mobx-react';
import { stringify } from 'querystring';
import { math } from 'choerodon-ui/dataset';
import { DataToJSON } from 'choerodon-ui/dataset/data-set/enum';

import intl from 'utils/intl';
import { SRM_SBDM } from '_utils/config';
import { Header, Content } from 'components/Page';
import ExcelExportPro from 'components/ExcelExportPro';
import DynamicButtons from "srm-front-boot/lib/components/DynamicButtons";
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import notification from 'utils/notification';

import type { StoreValueType } from './stores';
import StoreProvider, { Store } from './stores';
import SourceTable from './components/SourceTable';
import StageTable from './components/StageTable';
import { ActiveKey, ListTabsCustCode, ListTableBtnCode } from '../utils/type';
import { formatDynamicBtns, confirmDocNegAction } from '../../../utils/utils';
import DynamicBtn from '../../../components/DynamicBtn';
import { getTableConfig } from '../utils/api';


const { TabPane, TabGroup } = Tabs;
const TemplateCodeMap: Record<ActiveKey, string> = {
  [ActiveKey.SourceAll]: 'SRM_C_SBSM_FP_PREP_POOL_HEADER_ALL',
  [ActiveKey.SourceCompile]: 'SRM_C_SBSM_FP_PREP_POOL_HEADER_PREPARATION',
  [ActiveKey.SourceSummary]: 'SRM_C_SBSM_FP_PREP_POOL_HEADER_BALANCE',
  [ActiveKey.SourceLines]: 'SRM_C_SBSM_FP_PREP_POOL_LINE_ALL',
  [ActiveKey.SourceError]: '',
  [ActiveKey.StageAll]: 'SRM_C_SBSM_FP_PREP_POOL_STAGE_ALL',
  [ActiveKey.StageCompile]: 'SRM_C_SBSM_FP_PREP_POOL_STAGE_COMPILE',
  [ActiveKey.StageSummary]: 'SRM_C_SBSM_FP_PREP_POOL_STAGE_SUMMARY',
};

// 列表页导出组件requestUrl
const ListExportUrl: Record<ActiveKey, string> = {
  [ActiveKey.SourceAll]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-pool-headers/excel/export/list-all`,
  [ActiveKey.SourceCompile]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-pool-headers/excel/export/list-preparation`,
  [ActiveKey.SourceSummary]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-pool-headers/excel/export/list-balance`,
  [ActiveKey.SourceLines]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-pool-headers/excel/export/line/list-all`,
  [ActiveKey.SourceError]: '',
  [ActiveKey.StageAll]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-pool-stages/export-all`,
  [ActiveKey.StageCompile]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-pool-stages/export-prep-able`,
  [ActiveKey.StageSummary]: `${SRM_SBDM}/v1/${getCurrentOrganizationId()}/prep-pool-stages/export-balance-able`,
};

const List = observer(() => {
  const {
    dsMap,
    remote,
    customizeTabPane,
    customizeBtnGroup,
    defaultActiveKey,
    cacheState,
    getTotalCount,
    isOpenClearCashed,
    location,
    setIsOpenClearCashed,
    history,
    permissionMap,
  } = useContext(Store) as StoreValueType;

  const initRecords = useRef<Record<string, boolean>>({});
  const [activeKey, setActiveKey] = useState<ActiveKey>(defaultActiveKey as ActiveKey);
  const { state } = location || {};

  const tableDs = dsMap[activeKey];
  const { selected, queryDataSet } = tableDs;
  const loading = tableDs.status !== 'ready';


  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
    cacheState.set('activeKey', key);
    if (initRecords.current[key]) dsMap[key].query(dsMap[key].currentPage);
  },
    [setActiveKey, dsMap, cacheState]
  );

  useEffect(() => {
    getTotalCount(activeKey);
  }, [getTotalCount, activeKey]);


  // 如果是在详情操作后返回的列表页需要情况缓存的勾选
  useEffect(() => {
    if (tableDs && isOpenClearCashed && state?._back !== -1) {
      const { selected } = tableDs;
      tableDs.batchUnSelect(selected);
      setIsOpenClearCashed(false);
    }
  }, [tableDs, isOpenClearCashed, state, setIsOpenClearCashed]);

  // 表格初始化回调
  const handleRecordInit = useCallback((key: ActiveKey) => {
    initRecords.current[key] = true;
  }, []);

  const getExportParams = useCallback(() => {
    const idList = selected.map((item) => item.key);
    const queryData = queryDataSet?.current?.toData() || {};
    const { primaryKey } = tableDs.props;
    if (selected.length > 0) {
      return filterNullValueObject({ [`${primaryKey}List`]: idList });
    } else {
      return filterNullValueObject({...queryData, exportSearchbarUnitCode: tableDs.getQueryParameter('customizeUnitCode') });
    }
  }, [tableDs, selected, queryDataSet]);

  const handleToDetail = useCallback(({ balHeaderId, prepHeaderId }) => {
    if (balHeaderId) {
      history.push({
        pathname: `/sbsm/fund-plan-summary/detail/${balHeaderId}`,
        search: stringify({ operate: 'edit' }),
      });
    } else if (prepHeaderId) {
      history.push({
        pathname: `/sbsm/fund-plan-preparation/detail/${prepHeaderId}`,
        search: stringify({ operate: 'edit' }),
      });
    }
  }, [history]);

  const handleAdd = useCallback(async() => {
    const res = await tableDs.setState('submitType', 'create').submit();
    if (res) {
      const result = await getTableConfig(activeKey);
      const { balAsyncLength = '', balMode = '', prepAsyncLength = '', prepMode = '' } = (result && !isEmpty(result)) ? (result?.[0] || {}) : {};
      const { content } = res || {};
      const { prepHeaderId, balHeaderId } = content[0] || {};
      if (ActiveKey.SourceSummary === activeKey || ActiveKey.StageSummary === activeKey) {
        if (balMode === 'LINE_AND_REL' && !math.isNaN(balAsyncLength) && math.gt(selected.length, Number(balAsyncLength))) {
          // 如果明细大于阈值 异步
          notification.success({
            description: intl.get('sbsm.common.view.message.createTips').d('批量创建中，您可以离开当前页面，创建失败的单据，将通过系统消息展示失败原因，并重新展示在可编制列表'),
          });
        } else {
          notification.success({});
          handleToDetail({ balHeaderId });
        }
      } else if (prepMode === 'LINE_AND_REL' && !math.isNaN(prepAsyncLength) && math.gt(selected.length, Number(prepAsyncLength))) {
        // 如果明细大于阈值 异步
        notification.success({
          description: intl.get('sbsm.common.view.message.createTips').d('批量创建中，您可以离开当前页面，创建失败的单据，将通过系统消息展示失败原因，并重新展示在可编制列表'),
        });
      } else {
        notification.success({});
        handleToDetail({ prepHeaderId });
      }
      await tableDs.query();
      tableDs.clearCachedSelected();
      tableDs.unSelectAll();
    }
  }, [tableDs, activeKey, handleToDetail, selected]);

  const handleReturn = useCallback(async() => {
    const res = await tableDs.setState('submitType', 'return').submit();
    if (res) {
      notification.success({});
      await tableDs.query();
      tableDs.clearCachedSelected();
      tableDs.unSelectAll();
    }
  }, [tableDs]);

  const handleReturnPrePool = useCallback(async() => {
    if (remote && remote.event) {
      const beforeRes = await remote.event.fireEvent('handleReturnPrePoolCux', {
        tableDs,
        selected,
      });
      if (beforeRes === false) return false;
    }
    const feedback = await confirmDocNegAction({
          action: 'return',
          documentName: intl.get('sbsm.common.view.message.returnPoolTips').d('编制池-待编制？'),
          documentNum: '',
        });
    if (!feedback) return;
    const res = await tableDs.setState('submitType', 'returnPrePool').submit();
    if (res) {
      notification.success({});
      await tableDs.query();
      tableDs.clearCachedSelected();
      tableDs.unSelectAll();
    }
  }, [tableDs, remote, selected]);

  const handleCreateAll = useCallback(async() => {
    const submitType = ActiveKey.SourceCompile === activeKey ? 'allCreateCompile' : 'allCreate';
    tableDs.dataToJSON = DataToJSON.all;
    const res = await tableDs.setState('submitType', submitType).submit();
    tableDs.dataToJSON = DataToJSON.selected;
    if (res) {
      notification.success({
        description: intl.get('sbsm.common.view.message.createTipsSummary').d('批量创建中，您可以离开当前页面，创建失败的单据，将通过系统消息展示失败原因，并重新展示在可汇总列表'),
      });
      tableDs.query();
    }
  }, [tableDs, activeKey]);

  const buttons: any = useMemo(() => {
    const btns: any = [
      (ActiveKey.StageCompile === activeKey || ActiveKey.StageSummary === activeKey) && {
        name: 'create',
        child: intl.get('hzero.common.button.create').d('新建'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'add',
          onClick: handleAdd,
          disabled: isEmpty(selected),
          loading,
        },
      },
      (ActiveKey.SourceCompile === activeKey || ActiveKey.SourceSummary === activeKey) && {
        name: 'createBtnGroup',
        group: true,
        child: (...customChildArgs) => (
          <DynamicBtn
            icon="add"
            loading={loading}
            customChildArgs={customChildArgs}
            text={intl.get(`hzero.common.button.create`).d('新建')}
            extra={<Icon type="expand_more" style={{ fontSize: 14, margin: '-2px 0 0 4px' }} />}
          />
        ),
        children: [
          {
            name: 'create',
            child: intl.get(`sbsm.common.view.button.selectedCreate`).d('勾选新建'),
            btnProps: {
              loading,
              icon: 'add',
              disabled: isEmpty(selected),
              onClick: handleAdd,
            },
          },
          permissionMap?.get('allCreate') && {
            name: 'allCreate',
            child: intl.get(`sbsm.common.button.allCreate`).d('全选新建'),
            btnProps: { loading, wait: 1000, onClick: handleCreateAll, icon: 'add' },
          },
        ],
      },
      // (ActiveKey.SourceSummary === activeKey) && permissionMap?.get('allCreate') && {
      //   name: 'allCreate',
      //   child: intl.get(`sbsm.common.button.allCreate`).d('全选新建'),
      //   btnProps: {
      //     type: 'c7n-pro',
      //     icon: 'add',
      //     onClick: handleCreateAll,
      //   },
      // },
      (ActiveKey.SourceSummary === activeKey) && permissionMap?.get('returnPrePool') && {
        name: 'returnPrePool',
        child: intl.get(`sbsm.common.view.button.returnPrePool`).d('退回可编制'),
        btnProps: {
          type: 'c7n-pro',
          icon: 'reply',
          onClick: handleReturnPrePool,
          disabled: isEmpty(selected),
        },
      },
      ActiveKey.SourceLines === activeKey && {
        name: 'returned',
        child: (
          <>
            {intl.get('sbsm.common.button.returned').d('退回')}
            <Tooltip
              title={intl.get('sbsm.common.button.returned.tips').d('将编制来源单据退回上游，退回后可在收货/发票申请页面重新推送，触发重新预制')}
            >
              <Icon type="help" style={{ marginLeft: 4, fontSize: '14px', marginTop: '-2px' }} />
            </Tooltip>
          </>
        ),
        btnProps: {
          type: 'c7n-pro',
          icon: 'reply',
          onClick: handleReturn,
          disabled: isEmpty(selected),
        },
      },
      (([ActiveKey.StageCompile, ActiveKey.StageSummary, ActiveKey.StageAll].includes(activeKey) && permissionMap?.get('stageExport')) ||
      [ActiveKey.SourceAll, ActiveKey.SourceCompile, ActiveKey.SourceSummary, ActiveKey.SourceLines].includes(activeKey)) && {
        name: 'export',
        btnComp: ExcelExportPro,
        childFor: 'buttonText',
        child: isEmpty(selected)
          ? intl.get(`sbsm.common.view.button.export`).d('导出')
          : intl.get(`sbsm.common.view.button.selectedExport`).d('勾选导出'),
        btnProps: {
          templateCode: TemplateCodeMap[activeKey],
          otherButtonProps: { funcType: 'flat' },
          method: 'POST',
          allBody: true,
          requestUrl: ListExportUrl[activeKey],
          queryParams: getExportParams,
        },
      },
    ].filter((v) => v);
    const processBtns = remote
    ? remote.process('SBSM.FUND_PLAN_PREFABRICATION_LIST_CUX.HEAD_BTNS', btns, {
      tableDs,
      loading,
      selected,
      activeKey,
      handleToDetail,
    })
    : btns;
    return formatDynamicBtns(processBtns);
  }, [
    remote,
    loading,
    tableDs,
    selected,
    activeKey,
    handleAdd,
    handleReturn,
    handleToDetail,
    getExportParams,
    handleReturnPrePool,
    permissionMap,
    handleCreateAll,
  ]);

  const sourceColumns: any = useMemo(() => {
    return [
      {
        key: ActiveKey.SourceCompile,
        tab: intl.get(`sbsm.fundPlan.view.stage.prepard`).d('可编制'),
      },
      {
        key: ActiveKey.SourceSummary,
        tab: intl.get(`sbsm.fundPlan.view.stage.summary`).d('可汇总'),
      },
      {
        key: ActiveKey.SourceAll,
        tab: intl.get(`sbsm.fundPlan.view.affair.all`).d('全部'),
      },
    ];
  }, []);

  const sourceColumnsLine: any = useMemo(() => {
    return [
      {
        key: ActiveKey.SourceError,
        tab: intl.get(`sbsm.fundPlan.view.affair.error`).d('错误记录池'),
      },
      {
        key: ActiveKey.SourceLines,
        tab: intl.get(`sbsm.fundPlan.view.affair.all`).d('全部'),
      },
    ];
  }, []);


  const stageColumns = useMemo(() => {
    return [
      {
        key: ActiveKey.StageCompile,
        tab: intl.get(`sbsm.fundPlan.view.stage.prepard`).d('可编制'),
      },
      {
        key: ActiveKey.StageSummary,
        tab: intl.get(`sbsm.fundPlan.view.stage.summary`).d('可汇总'),
      },
      {
        key: ActiveKey.StageAll,
        tab: intl.get(`sbsm.fundPlan.view.stage.all`).d('全部'),
      },
    ];
  }, []);

  return (
    <Fragment>
      <Header title={intl.get('sbsm.fundPlan.view.title.fundPlanPrefabricationPool').d('资金计划编制池')}>
        {customizeBtnGroup(
          { code: ListTableBtnCode, pro: true },
          <DynamicButtons unitCode={ListTableBtnCode} buttons={buttons} maxNum={5} defaultBtnType="c7n-pro" />
        )}
      </Header>
      <div>
        <Content>
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
                    count={dsMap[key].getState('totalCount')}
                  >
                    <StageTable handleRecordInit={handleRecordInit} activeKey={key} />
                  </TabPane>
                ))}
              </TabGroup>
              <TabGroup tab={intl.get(`sbsm.fundPlan.view.tabs.sourceDoc`).d('编制来源单据')} key="source">
                {sourceColumns.map(({ key, tab }) => {
                  return (
                    <TabPane
                      tab={tab}
                      key={key}
                      count={dsMap[key].getState('totalCount')}
                    >
                      <SourceTable customSourceType='PREP_SOURCE_DOC' handleRecordInit={handleRecordInit} activeKey={key} />
                    </TabPane>
                  );
                })}
              </TabGroup>
              <TabGroup tab={intl.get(`sbsm.fundPlan.view.tabs.sourceDocLine`).d('编制来源单据行')} key="sources">
                {sourceColumnsLine.map(({ key, tab }) => {
                  return (
                    <TabPane
                      tab={tab}
                      key={key}
                      count={dsMap[key].getState('totalCount')}
                    >
                      <SourceTable customSourceType='PREP_SOURCE_DOC_LINE' handleRecordInit={handleRecordInit} activeKey={key} />
                    </TabPane>
                  );
                })}
              </TabGroup>
            </Tabs>
          )}
        </Content>
      </div>
    </Fragment>
  );
});

const FundPlanPrefabricationList = (props) => <StoreProvider {...props}><List /></StoreProvider>;

export default FundPlanPrefabricationList;
