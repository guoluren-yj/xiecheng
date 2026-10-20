/**
 * @Description: 供应商评估工作台 - 列表页
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-02-10 15:30:25
 * @FilePath: /srm-front-sslm/src/routes/SupplierEvaluationWorkbench/index.js
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useMemo, useState, useCallback, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import { Tabs, DataSet } from 'choerodon-ui/pro';
import SearchBarTable from '_components/SearchBarTable';
import MultipleTextField from '@/routes/components/MultipleTextField';
import intl from 'utils/intl';
import { compose, isNil, isEmpty } from 'lodash';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import withProps from 'utils/withProps';
import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import { getResponse } from 'utils/utils';

import {
  getFeedbackCount,
  getPermission,
  getPlanCount,
} from '@/services/purchaserEvaluationWorkbenchServices';

import { getTabsConfig, getColumns } from './utils';
import { getTableDs } from './stores';
import '../SupplierEvaluationWorkbench/index.less';

const { TabPane, TabGroup } = Tabs;

const SupplierEvaluationWorkbench = ({
  activeTabObj,
  customizeTable,
  TabsTableList,
  custLoading,
  history,
  customizeTabPane,
}) => {
  let cuzDefaultTabIndex = ''; // 个性化默认激活页签
  // 查询权限
  const [permissionCode, setPermissionCode] = useState(activeTabObj.tabPermission);
  // 当前选中的Tabs的key
  const [activeTabKey, setActiveTabKey] = useState(
    activeTabObj?.activeTabKey || 'evaluationPlanAll'
  );
  // 标签页 数量数据值
  const [tabCount, setTabCount] = useState({});

  const tabs = useMemo(() => getTabsConfig(permissionCode), [permissionCode]);

  const searchPermission = async () => {
    const permissionList = [
      'srm.partner.supplier.evaluation-workbench.api.button.eval.plan', // 评估计划
      'srm.partner.supplier.evaluation-workbench.api.button.report.score', // 评估报告
    ];
    const res = getResponse(await getPermission(permissionList));
    if (res) {
      const isScore = res.find(n => n.code === permissionList[1]) || {};
      // 个性化配置默认激活页签优先级最高
      const defaultTabIndex = isEmpty(cuzDefaultTabIndex)
        ? isScore.approve
          ? 'toBeSelfEvaluated'
          : 'evaluationPlanAll'
        : cuzDefaultTabIndex;
      // eslint-disable-next-line no-param-reassign
      activeTabObj.activeKey = defaultTabIndex;
      setActiveTabKey(defaultTabIndex);
      setPermissionCode(res);
      // eslint-disable-next-line no-param-reassign
      activeTabObj.tabPermission = res;
    }
  };

  useEffect(() => {
    if (!permissionCode) {
      searchPermission();
    }
  }, [permissionCode]);

  //  Tab切换触发
  const handleTabChange = useCallback(newKey => {
    setActiveTabKey(newKey);
    // eslint-disable-next-line no-param-reassign
    activeTabObj.activeTabKey = newKey;
  }, []);

  // 查询数据
  const handleQueryList = ({ params = {} } = {}) => {
    const clearParams = {}; // 清理
    // eslint-disable-next-line no-unused-expressions
    const dataObj = TabsTableList[activeTabKey]?.queryDataSet?.current?.toData();
    if (dataObj) {
      for (const key in dataObj) {
        if (!['multiSelectReqNums'].includes(key)) {
          // 排除掉自定义的查询条件
          if (!Object.prototype.hasOwnProperty?.call(params, key)) {
            clearParams[key] = undefined;
          }
        }
      }
    }
    const reqList = params.multiSelectReqNums;
    clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
    // eslint-disable-next-line no-unused-expressions
    TabsTableList[activeTabKey]?.queryDataSet?.current?.set({
      ...params,
      ...clearParams,
    });
    if (TabsTableList[activeTabKey]) {
      TabsTableList[activeTabKey].query();
    }
  };

  // 查询
  const queryList = () => {
    if (TabsTableList[activeTabKey]) {
      TabsTableList[activeTabKey].query(TabsTableList[activeTabKey].currentPage);
    }
  };

  /**
   * @description: 查询标签页各个页签数据量
   * @return {*}
   */
  const handleQueryCount = async () => {
    let res = {};
    const evaluationPlanFlag = ['evaluationPlanAll'].includes(activeTabKey);
    if (evaluationPlanFlag) {
      res = getResponse(await getPlanCount());
    } else {
      res = getResponse(await getFeedbackCount());
    }
    if (res) {
      setTabCount({
        selfRatedEvaluated: res.FEEDBACK_BAK || null,
        toBeSelfEvaluated: res.WAITINGREJECTED || null,
        published: res.PUBLISHED || null,
        evaluationPlanAll: res.ALL || null,
      });
    }
  };

  const renderLeftSearchBar = (queryDataSet, groupKey) => {
    return (
      <MultipleTextField
        name="multiSelectReqNums"
        dataSet={queryDataSet}
        style={{ width: 280 }}
        placeholder={
          groupKey === 'tabGroupEvaluationReport'
            ? intl
                .get('sslm.supplierEvaluation.model.query.evaluationQuery')
                .d('请输入评估报告编号、评估报告描述查询')
            : intl
                .get('sslm.supplierEvaluation.model.query.evaluationPlanQuery')
                .d('请输入评估计划编号、评估计划名称查询')
        }
      />
    );
  };

  useEffect(() => {
    handleQueryCount();
    queryList();
    // 页面卸载调用
    return () => {
      // eslint-disable-next-line no-unused-expressions
      TabsTableList[activeTabKey]?.unSelectAll(); // 详情页返回清空勾选
      // eslint-disable-next-line no-unused-expressions
      TabsTableList[activeTabKey]?.clearCachedSelected();
    };
  }, [activeTabKey]);

  return (
    <Fragment>
      <Header title={intl.get('sslm.supplierEvaluation.view.header.Title').d('销售方评估工作台')} />
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM.PURCHASER_ASSESS_LIST.TABS',
            cascade: true,
            custDefaultActive: key => {
              // 获取个性化配置的默认激活key，没配置的值为undefined
              const currentKey = key;
              // 解决个性化配置加载顺序 快于 useEffect 问题，将个性化默认激活页签保存下来，在useEffect中进行设置
              cuzDefaultTabIndex = currentKey;
            },
          },
          <Tabs
            keyboard={false}
            activeKey={activeTabKey}
            onChange={handleTabChange}
            customizable
            customizedCode="vendor-evaluation-plan-workbench-tab-customized-group"
          >
            {tabs.map(({ tab, children, key: groupKey }) => {
              return (
                <TabGroup tab={tab} key={groupKey}>
                  {children.map(({ tabPane, key: tabPaneKey, searchBarCode, tableCode }) => {
                    return (
                      <TabPane
                        tab={tabPane}
                        key={tabPaneKey}
                        count={!isNil(tabCount[tabPaneKey]) && tabCount[tabPaneKey]}
                        overflowCount={999}
                      >
                        <div style={{ height: tableHeight.hasGroupTab }}>
                          {customizeTable(
                            {
                              code: tableCode,
                            },
                            <SearchBarTable
                              key={tabPaneKey}
                              cacheState
                              dataSet={TabsTableList[tabPaneKey]}
                              columns={getColumns({
                                customizeTable,
                                tabPaneKey,
                                history,
                                dataSet: TabsTableList[tabPaneKey],
                                queryList,
                                handleQueryCount,
                              })}
                              custLoading={custLoading}
                              searchCode={searchBarCode}
                              searchBarConfig={{
                                onQuery: handleQueryList,
                                autoQuery: false,
                                left: {
                                  render: (_, queryDataSet) =>
                                    renderLeftSearchBar(queryDataSet, groupKey),
                                },
                              }}
                              style={{
                                maxHeight: tableMaxHeight.hasGroupTab,
                              }}
                            />
                          )}
                        </div>
                      </TabPane>
                    );
                  })}
                  ;
                </TabGroup>
              );
            })}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.purchaserEvaluation',
      'sslm.purchaserEvaluationDetail',
      'sslm.supplierEvaluation',
      'sslm.supplierEvaluationDetail',
      'sslm.evaluationStrategy',
      'sslm.evaluationStrategyDetail',
      'sslm.common',
      'sslm.commonApplication',
      'sslm.vendorEvaluationPlan',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.PURCHASER_ASSESS_LIST.WAIT_ASSESS',
      'SSLM.PURCHASER_ASSESS_LIST.WAIT_ASSESS_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.PUBLISHED',
      'SSLM.PURCHASER_ASSESS_LIST.PUBLISHED_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.TABS',
      'SSLM.PURCHASER_ASSESS_LIST.PLAN.ALL_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.PLAN.ALL_SEARCH',
      'SSLM.PURCHASER_ASSESS_LIST.REFORMCONTENT_MODAL',
    ],
  }),
  withProps(
    () => {
      const activeTabObj = { activeTabKey: 'toBeSelfEvaluated' };
      // 评估报告-已自评
      const selfRatedEvaluatedDs = new DataSet(
        getTableDs({
          filterCode: 'SSLM.PURCHASER_ASSESS_LIST.ALREADY_ASSESS',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.ALREADY_ASSESS_TABLE',
          currentTab: 'selfRatedEvaluated',
        })
      );
      // 评估报告-待自评
      const toBeSelfEvaluatedDs = new DataSet(
        getTableDs({
          filterCode: 'SSLM.PURCHASER_ASSESS_LIST.WAIT_ASSESS',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.WAIT_ASSESS_TABLE',
          currentTab: 'toBeSelfEvaluated',
        })
      );
      // 评估报告-已发布
      const publishedDs = new DataSet(
        getTableDs({
          filterCode: 'SSLM.PURCHASER_ASSESS_LIST.PUBLISHED',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.PUBLISHED_TABLE',
          currentTab: 'published',
        })
      );
      // 评估计划-全部
      const evaluationPlanAllDs = new DataSet(
        getTableDs({
          filterCode: 'SSLM.PURCHASER_ASSESS_LIST.PLAN.ALL_SEARCH',
          tableCode: 'SSLM.PURCHASER_ASSESS_LIST.PLAN.ALL_TABLE',
          currentTab: 'evaluationPlanAll',
        })
      );
      return {
        TabsTableList: {
          selfRatedEvaluated: selfRatedEvaluatedDs,
          toBeSelfEvaluated: toBeSelfEvaluatedDs,
          published: publishedDs,
          evaluationPlanAll: evaluationPlanAllDs,
        },
        activeTabObj,
      };
    },
    { cacheState: true }
  )
)(SupplierEvaluationWorkbench);
