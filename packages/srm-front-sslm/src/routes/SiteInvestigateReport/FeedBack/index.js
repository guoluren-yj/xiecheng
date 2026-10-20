/**
 * index - 现场考察报告反馈列表页
 * @date: 2020/11/20
 * @author: zhanghao <hao.zhang07@hand-china.com>
 * @version: 0.0.1,
 * @copyright: Copyright 2019, Hand
 */
import React, { Fragment, memo, useMemo, useEffect, useState, useCallback } from 'react';
import { DataSet, Tabs } from 'choerodon-ui/pro';
import { tableHeight, tableMaxHeight } from '@/routes/components/utils';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { compose, isEmpty } from 'lodash';
import SearchBarTable from '_components/SearchBarTable';
import querystring from 'querystring';

import withProps from 'utils/withProps';
import intl from 'utils/intl';
import { Header, Content } from 'components/Page';
import formatterCollections from 'utils/intl/formatterCollections';
import { getTabPaneList } from './utils';

import indexDS from './store/indexDS';

const { TabPane } = Tabs;

let searchBarRef; // 筛选器ref

const Index = memo(({ waitFeeddataSet, alreadyFeedDataSet, history, mixObj, customizeTabPane }) => {
  const [activeKey, setActiveKey] = useState(mixObj.activeKey);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);

  const tabPaneList = useMemo(() => getTabPaneList(), []);

  const dsObj = {
    waitFeedback: waitFeeddataSet,
    alreadyFeedback: alreadyFeedDataSet,
  };

  useEffect(() => {
    const currentDs = dsObj[activeKey];
    currentDs.query(currentDs.currentPage);
  }, [activeKey]);

  const handleTabsChange = useCallback(key => {
    // eslint-disable-next-line no-param-reassign
    mixObj.activeKey = key;
    setActiveKey(key);
  }, []);

  const columns = useMemo(() => [
    {
      name: 'evalStatusMeaning',
      width: 100,
    },
    {
      name: 'evalNum',
      width: 140,
      renderer: ({ record, text }) => (
        <a
          onClick={() =>
            history.push({
              pathname: `/sslm/site-investigate-report/feed-back/detail/${record.get(
                'evalHeaderId'
              )}/${record.get('evalType')}`,
              search: querystring.stringify({
                tabPaneKey: activeKey,
              }),
            })
          }
        >
          {text}
        </a>
      ),
    },
    {
      name: 'evalDescription',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'companyName',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'supplierName',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'evalTplName',
      width: 150,
      tooltip: 'overflow',
    },
    {
      name: 'creationDate',
      width: 160,
    },
    {
      name: 'realName',
      width: 120,
      tooltip: 'overflow',
    },
  ]);

  const handleQuery = (params, dataSet, customizeUnitCode) => {
    dataSet.setQueryParameter('customizeUnitCode', customizeUnitCode.join());
    if (dataSet.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const dataObj = dataSet.queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiCombineNumOrNames'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      // 处理多单号
      const reqList = params.multiCombineNumOrNames;
      clearParams.multiCombineNumOrNames = isEmpty(reqList) ? null : reqList.join(',');
      dataSet.queryDataSet.current.set({
        ...params,
        ...clearParams,
      });
      if (pageChacheFlag) {
        dataSet.query(dataSet.currentPage);
      } else {
        dataSet.query();
      }
    } else {
      // 解决设置默认值查询不生效问题
      searchBarRef.handleQuery(true);
    }
  };

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.siteInvestigateReport.view.feedBack.title').d('现场考察报告反馈')}
      />
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM_SITEINVESTIGATE_FEEDBACK_LIST.TABS',
            custDefaultActive: key => handleTabsChange(key || activeKey),
          },
          <Tabs activeKey={activeKey} onChange={handleTabsChange}>
            {tabPaneList.map(pane => {
              const { key } = pane;
              const curDataSet = dsObj[key];
              const customizeUnitCode = [pane.searchCode, pane.customizeCode];
              return (
                <TabPane key={key} tab={pane.tab}>
                  <div style={{ height: tableHeight.hasTab }}>
                    <SearchBarTable
                      key={key}
                      cacheState
                      columns={columns}
                      dataSet={curDataSet}
                      searchCode={pane.searchCode}
                      style={{ maxHeight: tableMaxHeight.hasTab }}
                      searchBarRef={ref => {
                        searchBarRef = ref;
                      }}
                      searchBarConfig={{
                        onQuery: ({ params }) => handleQuery(params, curDataSet, customizeUnitCode),
                        onFieldChange: () => {
                          setPageChacheFlag(false);
                        },
                      }}
                    />
                  </div>
                </TabPane>
              );
            })}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
});

export default compose(
  formatterCollections({
    code: ['sslm.siteInvestigateReport'],
  }),
  withCustomize({
    unitCode: ['SSLM_SITEINVESTIGATE_FEEDBACK_LIST.TABS'],
  }),
  withProps(
    () => {
      const waitFeeddataSet = new DataSet(indexDS());
      const alreadyFeedDataSet = new DataSet(indexDS('alreadyFeedback'));
      const mixObj = { activeKey: 'waitFeedback' };
      return { waitFeeddataSet, alreadyFeedDataSet, mixObj };
    },
    { cacheState: true }
  )
)(Index);
