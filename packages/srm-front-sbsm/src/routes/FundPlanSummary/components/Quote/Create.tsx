import React, { useMemo, useCallback, useState, useEffect, createElement, cloneElement } from 'react';
import { runInAction } from 'mobx';
import { observer } from 'mobx-react';
import { DataSet, Tabs, Button } from 'choerodon-ui/pro';
import { flow, isEmpty, isArray, isFunction } from 'lodash';
import { DataSetStatus, DataToJSON } from 'choerodon-ui/dataset/data-set/enum';
import notification from 'utils/notification';
import { math } from 'choerodon-ui/dataset';

import intl from 'utils/intl';
import { getResponse } from 'utils/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withRemote from 'utils/remote';

import StageTable from './StageTable';
import SourceTable from './SourceTable';
import { fetchQuoteCreateTotal, getTableConfig } from '../../utils/api';
import { sourceTableDS, stageTableDS } from './storeDS';
import { CreateSourceCode, CreateStageCode, QuoteCreateTabsCode, PermissionCode } from '../../utils/type';
import permissionDS from '../../../../utils/permissionDS';
import { confirmDocNegAction } from '../../../../utils/utils';

const { TabPane, TabGroup } = Tabs;

interface QuoteCreateProps {
  okCallback?: Function;
}

const source = 'create';

const QuoteCreate = flow(
  observer,
  withCustomize({
    unitCode: [
      QuoteCreateTabsCode,
      CreateStageCode.Grid,
      CreateSourceCode.Grid,
    ],
  }),
  withRemote({
    code: 'SBSM.FUND_PLAN_SUMMARY_CREATE_CUX',
    name: 'remote',
  }),
  formatterCollections({ code: ['sbsm.common', 'sbsm.fundPlan', 'sbsm.fundPlanForecast'] }),
)((props) => {
  const {
    modal,
    custConfig,
    okCallback,
    customizeTable,
    customizeTabPane,
    remote,
  } = props;

  const { fields = [] } = custConfig?.[QuoteCreateTabsCode] || {};
  const { fieldCode } = fields.find(item => item?.defaultActive === 1) || {};
  const [activeKey, setActiveKey] = useState(fieldCode || 'stageSum');
  const dsMap = useMemo(() => ({
    stageSum: new DataSet(stageTableDS()),
    sourceSum: new DataSet(sourceTableDS()),
  }), []);
  const tableDs = useMemo(() => dsMap[activeKey], [activeKey, dsMap]);
  const { selected } = tableDs;
  const loading = tableDs.status !== DataSetStatus.ready;
  const permissionDs = useMemo<DataSet>(() => new DataSet(permissionDS(PermissionCode)), []);
  const permissionMap = permissionDs.current;

  const handleSubmit = useCallback(async () => {
    const res = await tableDs.setState('submitType', 'create').submit();
    if (!res) return false;
    const result = getResponse(await getTableConfig());
    const { balAsyncLength = '', balMode = '' } = (result && !isEmpty(result)) ? (result?.[0] || {}) : {};
    if (balMode === 'LINE_AND_REL' && !math.isNaN(balAsyncLength) && math.gt(selected.length, Number(balAsyncLength))) {
      // 如果明细大于阈值 异步
      modal.close();
      notification.success({
        description: intl.get('sbsm.common.view.message.createTips').d('批量创建中，您可以离开当前页面，创建失败的单据，将通过系统消息展示失败原因，并重新展示在可编制列表'),
      });
    } else {
      notification.success({});
      if (isFunction(okCallback)) okCallback(res.content[0]);
    }
  }, [tableDs, okCallback, selected, modal]);

  const handleReturnPrePool = useCallback(async()=> {
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
    if (!feedback || activeKey !== 'sourceSum') return;
    const res = await tableDs.setState('submitType', 'returnPrePool').submit();
    if (!res) return false;
    await tableDs.query();
    tableDs.clearCachedSelected();
    tableDs.unSelectAll();
  }, [tableDs, activeKey, remote, selected]);

  const handleCreateAll = useCallback(async() => {
    tableDs.dataToJSON = DataToJSON.all;
    const res = await tableDs.setState('submitType', 'allCreate').submit();
    tableDs.dataToJSON = DataToJSON.selected;
    if (res) {
      notification.success({
        description: intl.get('sbsm.common.view.message.createTipsSummary').d('批量创建中，您可以离开当前页面，创建失败的单据，将通过系统消息展示失败原因，并重新展示在可汇总列表'),
      });
      tableDs.query();
    }
  }, [tableDs]);

  useEffect(() => {
    if (modal) {
      modal.handleOk(handleSubmit);
      modal.update({
        okProps: { disabled: isEmpty(selected) },
        footer: (okBtn, cancelBtn) => [
          cloneElement(okBtn, { loading }),
          activeKey === 'sourceSum' && permissionMap?.get('createAll') && (<Button loading={loading} onClick={() => handleCreateAll()}>{intl.get(`sbsm.common.button.allCreate`).d('全选新建')}</Button>),
          activeKey === 'sourceSum' && permissionMap?.get('returnPrePool') && (<Button loading={loading} disabled={isEmpty(selected)} onClick={() => handleReturnPrePool()}>{intl.get(`sbsm.common.view.button.returnPrePool`).d('退回可编制')}</Button>),
          cancelBtn,
        ].filter((v) => v),
      });
    }
  }, [handleSubmit, selected, modal, handleReturnPrePool, loading, activeKey, permissionMap, handleCreateAll]);

  const fetchTabKeysCount = useCallback(async (countTabKeys) => {
    if (!isArray(countTabKeys)) return;
    const resMap = await Promise.all(
      countTabKeys.map((item) => fetchQuoteCreateTotal({ activeKey: item }))
    );
    runInAction(() => {
      resMap.forEach((res, index) => {
        const { totalElements = 0 } = getResponse(res) || {};
        dsMap[countTabKeys[index]].setState('totalCount', totalElements);
      });
    });
  }, [dsMap]);

  // 切换Tab页回调
  const handleTabChange = useCallback((key) => {
    setActiveKey(key);
    const currentTableDs = dsMap[key];
    currentTableDs.query();
    fetchTabKeysCount([key]);
  }, [dsMap, fetchTabKeysCount]);

  useEffect(() => {
    fetchTabKeysCount(Object.keys(dsMap));
  }, [dsMap, fetchTabKeysCount]);

  const tabColumns = useMemo(() => [
    {
      key: 'stage',
      defaultActiveKey: 'stageSum',
      tab: intl.get(`sbsm.fundPlan.view.tabs.stageView`).d('阶段'),
      content: StageTable,
      children: [
        { key: 'stageSum', tab: intl.get(`sbsm.fundPlan.view.stage.summary`).d('可汇总') },
      ],
    },
    {
      key: 'source',
      defaultActiveKey: 'sourceSum',
      tab: intl.get(`sbsm.fundPlan.view.tabs.sourceDoc`).d('编制来源单据'),
      content: SourceTable,
      children: [
        { key: 'sourceSum', tab: intl.get(`sbsm.fundPlan.view.stage.summary`).d('可汇总') },
      ],
    },
  ], []);

  return customizeTabPane(
    {
      code: QuoteCreateTabsCode,
      cascade: true,
    },
    <Tabs keyboard={false} activeKey={activeKey} onChange={handleTabChange}>
      {tabColumns.map(({ key, tab, content, children, defaultActiveKey }) => (
        <TabGroup tab={tab} key={key} defaultActiveKey={defaultActiveKey}>
          {children.map(({ key, tab }) => (
            <TabPane tab={tab} key={key} count={dsMap[key]?.getState('totalCount')}>
              {createElement(content, { key, source, tableDs: dsMap[key], customizeTable })}
            </TabPane>
          ))}
        </TabGroup>
      ))}
    </Tabs>
  );
}) as React.FC<QuoteCreateProps>;

export default QuoteCreate;
