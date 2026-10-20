/**
 * @Description: 供应商计划评估工作台
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2022-12-04 21:26:56
 * @Copyright (c) 2022 by ZhenYun, All Rights Reserved.
 */
import React, { Fragment, useCallback, useState, useEffect } from 'react';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import { DataSet, Button, Tabs, Modal } from 'choerodon-ui/pro';

import { compose, isEmpty, isNil } from 'lodash';
import qs from 'querystring';
import { observer } from 'mobx-react-lite';
import notification from 'utils/notification';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import withProps from 'utils/withProps';
import { getResponse, getCurrentOrganizationId, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';
import { SRM_SSLM } from '_utils/config';
import intl from 'utils/intl';
import { tableMaxHeight, tableHeight } from '@/routes/components/utils';
import {
  handleBatchDeleteRecord,
  handleCreateEvaluationReport,
  getWholeCount,
  getDetailCount,
} from '@/services/vendorEvaluationPlanService';
import {
  handleGetSteps,
  handleCheckIsNewStrategy,
} from '@/services/purchaserEvaluationWorkbenchServices';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';
import ExcelExportPro from 'components/ExcelExportPro';
import { getNotPermissionBtns } from '@/routes/components/utils/utils';

import { getTabsConfig, getColumns } from './utils';

import { getWholeListDs, getDetailListDs } from './stores';

const { TabPane, TabGroup } = Tabs;
const organizationId = getCurrentOrganizationId();

let searchBarRef; // 筛选器ref

// 头按钮组
const OperationButtons = observer(
  ({
    currentTabKey,
    dataSet,
    handleCreate,
    handleDelete,
    getExportParams,
    handleBatchCreateEvaluationReport,
    customizeBtnGroup,
  }) => {
    const isDisabled = isEmpty(dataSet.selected);
    const loading = dataSet.status === 'loading';
    switch (currentTabKey) {
      case 'tabPaneSubmitted':
        return (
          <Fragment>
            {customizeBtnGroup(
              {
                code: 'SSLM.SUP_PLAN_WORKBENCH_LIST.SUBMITTED_TABLE',
              },
              [
                <Button
                  icon="add"
                  data-name="add"
                  color="primary"
                  onClick={handleCreate}
                  loading={loading}
                >
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>,
                <Button
                  icon="delete_sweep"
                  data-name="delete"
                  disabled={isDisabled}
                  funcType="flat"
                  onClick={handleDelete}
                  loading={loading}
                >
                  {intl.get('hzero.common.button.batchdelete').d('批量删除')}
                </Button>,
              ]
            )}
          </Fragment>
        );
      case 'tabPaneAll':
        return (
          <Fragment>
            {customizeBtnGroup(
              {
                code: 'SSLM.SUP_PLAN_WORKBENCH_LIST.ALL_BUTTON',
              },
              [
                <Button
                  icon="add"
                  data-name="add"
                  color="primary"
                  onClick={handleCreate}
                  loading={loading}
                >
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>,
                <ExcelExportPro
                  data-name="newExport"
                  allBody
                  method="POST"
                  queryParams={() => getExportParams()}
                  requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-plan-headers/list/export`}
                  templateCode="SRM_C_EVAL_PLAN_HEADER_LIST_EXPORT"
                  buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'flat',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.partner.vendor-evaluation-plan-workbench.api.all.list.export',
                        type: 'button',
                        meaning: '供应商评估计划工作台-整单新导出',
                      },
                    ],
                  }}
                />,
              ]
            )}
          </Fragment>
        );
      case 'tabPaneEvaluated':
        return (
          <Fragment>
            {customizeBtnGroup(
              {
                code: 'SSLM.SUP_PLAN_WORKBENCH_LIST.PUBLISHED_BUTTONS',
              },
              [
                <Button
                  icon="add"
                  data-name="add"
                  color="primary"
                  onClick={handleBatchCreateEvaluationReport}
                  loading={loading}
                  disabled={isDisabled}
                >
                  {intl
                    .get(`sslm.vendorEvaluationPlan.button.createEvaluationReport`)
                    .d('新建评估报告')}
                </Button>,
              ]
            )}
          </Fragment>
        );
      case 'tabPaneDetailAll':
        return (
          <Fragment>
            {customizeBtnGroup(
              {
                code: 'SSLM.SUP_PLAN_WORKBENCH_LIST.DETAIL_ALL_BUTTON',
              },
              [
                <ExcelExportPro
                  data-name="newExport"
                  allBody
                  method="POST"
                  queryParams={() => getExportParams()}
                  requestUrl={`${SRM_SSLM}/v1/${organizationId}/eval-plan-lines/list/export`}
                  templateCode="SRM_C_EVAL_PLAN_HEADER_EXPORT"
                  buttonText={intl.get('hzero.common.button.newExport').d('(新)导出')}
                  otherButtonProps={{
                    type: 'c7n-pro',
                    funcType: 'flat',
                    icon: 'unarchive',
                    permissionList: [
                      {
                        code: 'srm.partner.vendor-evaluation-plan-workbench.api.all.list.export',
                        type: 'button',
                        meaning: '供应商评估计划工作台-明细新导出',
                      },
                    ],
                  }}
                />,
              ]
            )}
          </Fragment>
        );

      default:
        return null;
    }
  }
);

const VendorEvaluationPlanWorkbench = ({
  activeTabObj,
  TabsTableList,
  history,
  customizeTable,
  custLoading,
  customizeTabPane,
  customizeBtnGroup,
}) => {
  // 当前选中的Tabs的key
  const [activeTabKey, setActiveTabKey] = useState(activeTabObj.activeTabKey || 'tabPaneSubmitted');

  const [tabCount, setTabCount] = useState({});

  const tabs = getTabsConfig();

  const [progressList, setProgressList] = useState([]); // 评估进度-进度条

  const [approvalInfo, setApprovalInfo] = useState({});

  const [notPermissionBtns, setNotPermissionBtns] = useState([]);

  useEffect(() => {
    if (TabsTableList?.tabPaneAll) {
      TabsTableList.tabPaneAll.addEventListener('load', handleDsLoadAfter);
    }
    handleBtnPermissionBtn();
    return () => {
      if (TabsTableList?.tabPaneAll) {
        TabsTableList.tabPaneAll.removeEventListener('load', handleDsLoadAfter);
      }
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet } = dataSetProps;
    const businessKeys = dataSet.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setApprovalInfo({
          approvalDataMap,
          revokeDataMap,
          approvalHistoryMap,
        });
      }
    });
  };

  // 处理按钮权限集
  const handleBtnPermissionBtn = async () => {
    const codeList = [
      {
        code: 'srm.partner.vendor-evaluation-plan-workbench.button.all-list.approval',
        name: 'approval',
      },
      {
        code: 'srm.partner.vendor-evaluation-plan-workbench.button.all-list.repeal-approval',
        name: 'revokeApproval',
      },
    ];
    const notPermissionBtnList = await getNotPermissionBtns(codeList);
    if (notPermissionBtnList) {
      setNotPermissionBtns(notPermissionBtnList);
    }
  };

  const handleTabChange = useCallback(newKey => {
    setActiveTabKey(newKey);
    // eslint-disable-next-line no-param-reassign
    activeTabObj.activeTabKey = newKey;
  }, []);

  const handleCreate = useCallback(() => {
    history.push({
      pathname: `/sslm/vendor-evaluation-plan-workbench/details/create`,
    });
  }, []);

  // 删除操作
  const handleDelete = useCallback(() => {
    const params = TabsTableList[activeTabKey]?.selected.map(i => {
      return i.data;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.vendorEvaluationPlan.modal.confirm.deleteRecord')
        .d('确定要删除所选行吗？'),
      onOk: () => {
        return handleBatchDeleteRecord(params).then(res => {
          const result = getResponse(res);
          if (result) {
            notification.success();
            if (TabsTableList[activeTabKey]) {
              TabsTableList[activeTabKey].unSelectAll(); // 详情页返回清空勾选
              TabsTableList[activeTabKey].clearCachedSelected();
            }
            handleQueryList();
            handleQueryCount();
          }
        });
      },
    });
  }, [activeTabKey, TabsTableList]);

  // 批量创建评估报告
  const handleBatchCreateEvaluationReport = async () => {
    const evalPlanLineIds = TabsTableList[activeTabKey]?.selected.map(i => {
      return i.data.evalPlanLineId;
    });
    const result = await handleCheckIsNewStrategy({ evalPlanLineIds });
    const res = getResponse(result);
    if (res) {
      const { sameFlag, newStrategyId, oldStrategyId, evalHeaderId } = res;
      if (sameFlag) {
        notification.success();
        // 创建成功刷新数据
        TabsTableList[activeTabKey].query();
        history.push({
          pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
          search: qs.stringify({
            evalHeaderId,
          }),
        });
      } else {
        Modal.open({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          okText: intl.get(`sslm.vendorEvaluationPlan.strategyModal.confirm.ok`).d('最新版本'),
          cancelText: intl
            .get('sslm.vendorEvaluationPlan.strategyModal.confirm.cancel')
            .d('当前版本'),
          onOk: () => {
            return handleCreateEvaluationReport({
              evalPlanLineIds,
              strategyId: newStrategyId,
            }).then(resp => {
              const response = getResponse(resp);
              if (response) {
                notification.success();
                // 创建成功刷新数据
                TabsTableList[activeTabKey].query();
                history.push({
                  pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                  search: qs.stringify({
                    evalHeaderId: response.evalHeaderId,
                  }),
                });
                return true;
              } else {
                return false;
              }
            });
          },
          onCancel: () => {
            return handleCreateEvaluationReport({
              evalPlanLineIds,
              strategyId: oldStrategyId,
            }).then(resp => {
              const response = getResponse(resp);
              if (response) {
                notification.success();
                // 创建成功刷新数据
                TabsTableList[activeTabKey].query();
                history.push({
                  pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                  search: qs.stringify({
                    evalHeaderId: response.evalHeaderId,
                  }),
                });
                return true;
              } else {
                return false;
              }
            });
          },
          children: intl
            .get('sslm.vendorEvaluationPlan.strategyModal.tooltip')
            .d('来源评估计划关联的评估策略版本已更新，请选择继续使用当前版本或选用最新版本。'),
          footer: (okBtn, cancelBtn, modal) => {
            return (
              <Fragment>
                <Button
                  onClick={() => {
                    modal.close();
                  }}
                >
                  {intl.get('hzero.common.button.cancel').d('取消')}
                </Button>
                {cancelBtn}
                {okBtn}
              </Fragment>
            );
          },
        });
      }
    }
  };

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
      // 处理多单号
      const reqList = params.multiSelectReqNums;
      clearParams.multiSelectReqNums = isEmpty(reqList) ? null : reqList.join(',');
      // eslint-disable-next-line no-unused-expressions
      TabsTableList[activeTabKey]?.queryDataSet?.current?.set({
        ...params,
        ...clearParams,
      });
    } else if (searchBarRef) {
      searchBarRef.handleQuery(true);
    }

    switch (activeTabKey) {
      case 'tabPaneSubmitted':
        TabsTableList[activeTabKey].setQueryParameter('evalStatusCustoms', ['NEW', 'REJECT']);
        break;

      case 'tabPaneUnderApproval':
        TabsTableList[activeTabKey].setQueryParameter('evalStatusCustoms', ['APPROVING']);
        break;

      case 'tabPaneApproved':
      case 'tabPaneEvaluated':
        TabsTableList[activeTabKey].setQueryParameter('evalStatusCustoms', ['PUBLISHED']);
        break;

      default:
        TabsTableList[activeTabKey].setQueryParameter('evalStatusCustoms', null);
        break;
    }

    TabsTableList[activeTabKey].query(TabsTableList[activeTabKey].currentPage);
  };

  const handleQueryCount = async () => {
    const wholeCount = getResponse(await getWholeCount()) || {};
    const detailCount = getResponse(await getDetailCount()) || {};
    setTabCount({
      tabPaneSubmitted: wholeCount.toBeReleased,
      tabPaneUnderApproval: wholeCount.APPROVING,
      tabPaneApproved: wholeCount.PUBLISHED,
      tabPaneAll: wholeCount.ALL,
      tabPaneEvaluated: detailCount.toBeReleased,
      tabPaneDetailAll: detailCount.ALL,
    });
  };

  const renderLeftSearchBar = queryDataSet => {
    return (
      <MultipleTextField
        name="multiSelectReqNums"
        dataSet={queryDataSet}
        style={{ width: 280 }}
        placeholder={intl
          .get('sslm.supplierEvaluation.model.query.evaluationQuerys')
          .d('请输入评估计划单号、评估报告描述查询')}
      />
    );
  };

  const getStepList = useCallback(() => {
    handleGetSteps().then(response => {
      const res = getResponse(response);
      if (res) {
        setProgressList(res);
      }
    });
  }, []);

  // 获取导出参数
  const getExportParams = useCallback(() => {
    const dataObj = TabsTableList[activeTabKey]?.queryDataSet?.current?.toData() || {};
    const queryParams = searchBarRef && searchBarRef.getQueryParameter();
    const otherParams = {};
    if (activeTabKey === 'tabPaneAll') {
      otherParams.exportsearchbarUnitcode = 'SSLM.SUP_PLAN_WORKBENCH_LIST.HEADER';
    } else if (activeTabKey === 'tabPaneDetailAll') {
      otherParams.exportsearchbarUnitcode = 'SSLM.SUP_PLAN_WORKBENCH_LIST.SEARCH_DETAIL_ALL';
    }
    if (!isEmpty(dataObj) && dataObj.multiSelectReqNums) {
      otherParams.multiSelectReqNums = dataObj.multiSelectReqNums;
    }
    const params = { ...filterNullValueObject(queryParams), ...otherParams };
    return params;
  }, [searchBarRef]);

  useEffect(() => {
    handleQueryCount();
    getStepList();
  }, [activeTabKey]);

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.vendorEvaluationPlan.view.header.Title').d('供应商计划评估工作台')}
      >
        <OperationButtons
          currentTabKey={activeTabKey}
          dataSet={TabsTableList[activeTabKey]}
          handleDelete={handleDelete}
          handleCreate={handleCreate}
          getExportParams={getExportParams}
          handleBatchCreateEvaluationReport={handleBatchCreateEvaluationReport}
          customizeBtnGroup={customizeBtnGroup}
        />
      </Header>
      <Content>
        {customizeTabPane(
          { code: 'SSLM.SUP_PLAN_WORKBENCH_LIST.TABS', cascade: true },
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
                              columns={getColumns(
                                tabPaneKey,
                                history,
                                TabsTableList[tabPaneKey],
                                handleQueryList,
                                handleQueryCount,
                                progressList,
                                approvalInfo,
                                notPermissionBtns
                              )}
                              custLoading={custLoading}
                              searchCode={searchBarCode}
                              searchBarRef={ref => {
                                searchBarRef = ref;
                              }}
                              searchBarConfig={{
                                onQuery: handleQueryList,
                                autoQuery: true,
                                fieldProps: {
                                  ...(['tabPaneEvaluated', 'tabPaneDetailAll'].includes(tabPaneKey)
                                    ? {
                                        supplierIdCombine: {
                                          valueField: 'supplierCompanyId',
                                          transformRequest: value => {
                                            const params = value?.map(
                                              ({ supplierCompanyId, supplierId, ...others }) => {
                                                return {
                                                  ...others,
                                                  supplierCompanyId:
                                                    supplierCompanyId || supplierId,
                                                  supplierId,
                                                };
                                              }
                                            );
                                            return params;
                                          },
                                        },
                                      }
                                    : {}),
                                },
                                left: {
                                  render: (_, queryDataSet) => renderLeftSearchBar(queryDataSet),
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
      'sslm.vendorEvaluationPlan',
      'sslm.vendorEvaluationPlanDetail',
      'sslm.common',
      'sslm.purchaserEvaluation',
      'sslm.siteInvestigateReport',
      'sslm.supplierEvaluation',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_ALL',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_SUBMITTED',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_APPROVAL',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_APPROVED',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_DET_ALL',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_DET_EVALUATED',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.SUBMITTED_TABLE',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.ALL_BUTTON',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.PUBLISHED_BUTTONS',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.TABS',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.SEARCH_PUBLISH',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.SEARCH_DETAIL_ALL',
      'SSLM.SUP_PLAN_WORKBENCH_LIST.DETAIL_ALL_BUTTON',
    ],
  }),
  withProps(
    () => {
      const activeTabObj = { activeTabKey: 'tabPaneSubmitted' };
      const tabPaneSubmittedDs = new DataSet(
        getWholeListDs(
          'multiple',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.SUBMITTED',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_SUBMITTED'
        )
      ); // 待发布
      const tabPaneUnderApprovalDs = new DataSet(
        getWholeListDs(
          true,
          'SSLM.SUP_PLAN_WORKBENCH_LIST.UNDER_APPROVAL',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_APPROVAL'
        )
      ); // 审批中
      const tabPaneApprovedDs = new DataSet(
        getWholeListDs(
          false,
          'SSLM.SUP_PLAN_WORKBENCH_LIST.TABPANE_APPROVED',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_APPROVED'
        )
      ); // 已发布
      const tabPaneAllDs = new DataSet(
        getWholeListDs(
          false,
          'SSLM.SUP_PLAN_WORKBENCH_LIST.HEADER',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_ALL'
        )
      ); // 全部 - 整单
      const tabPaneEvaluatedDs = new DataSet(
        getDetailListDs(
          'multiple',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.SEARCH_PUBLISH',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_DET_EVALUATED'
        )
      ); // 已发布
      const tabPaneDetailAllDs = new DataSet(
        getDetailListDs(
          false,
          'SSLM.SUP_PLAN_WORKBENCH_LIST.SEARCH_DETAIL_ALL',
          'SSLM.SUP_PLAN_WORKBENCH_LIST.TABLE_DET_ALL'
        )
      ); // 全部 - 明细
      return {
        TabsTableList: {
          tabPaneSubmitted: tabPaneSubmittedDs,
          tabPaneUnderApproval: tabPaneUnderApprovalDs,
          tabPaneApproved: tabPaneApprovedDs,
          tabPaneAll: tabPaneAllDs,
          tabPaneEvaluated: tabPaneEvaluatedDs,
          tabPaneDetailAll: tabPaneDetailAllDs,
        },
        activeTabObj,
      };
    },
    { cacheState: true }
  )
)(VendorEvaluationPlanWorkbench);
