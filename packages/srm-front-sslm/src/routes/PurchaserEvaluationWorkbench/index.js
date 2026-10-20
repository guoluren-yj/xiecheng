/**
 * @Description: 采购方评估工作台
 * @Author: 杨一昊 yihao.yang@going-link.com
 * @Date: 2023-01-28 14:37:38
 * @Copyright (c) 2023 by ZhenYun, All Rights Reserved.
 */
import querystring from 'querystring';
import { Button, Tabs, DataSet, Modal } from 'choerodon-ui/pro';
import { compose, isEmpty, isNil, forIn, isFunction } from 'lodash';
import React, { Fragment, useState, useCallback, useMemo, useEffect, createRef } from 'react';

import intl from 'utils/intl';
import remotes from 'utils/remote';
import withProps from 'utils/withProps';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import { getResponse, filterNullValueObject } from 'utils/utils';
import formatterCollections from 'utils/intl/formatterCollections';

import MultipleTextField from '@/routes/components/MultipleTextField';
import { tableMaxHeight, tableHeight, useSetState } from '@/routes/components/utils';
import { getNotPermissionBtns } from '@/routes/components/utils/utils';
import {
  batchRelease,
  getManageCount,
  getScoreCount,
  handleBatchDeleteRecord,
  handleBatchDiscardRecord,
  handleCheckIsNewStrategy,
  handleEvalPlanCreate,
  handleGetSteps,
  getPermission,
  batchExportAttachment,
} from '@/services/purchaserEvaluationWorkbenchServices';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import HeaderBtns from './HeaderBtns';
import EvalPlanDrawer from './EvalPlanDrawer';
import { getTabsConfig, getColumns } from './utils';
import { getTableDs, getEvalPlanDs } from './stores';
import ExportReportAttachment from './ExportReportAttachment';

const { TabPane, TabGroup } = Tabs;

let searchBarRef; // 筛选器ref

const PurchaserEvaluationWorkbench = ({
  activeTabObj,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
  TabsTableList,
  custLoading,
  history,
  location,
  remote,
}) => {
  const exportReportAttRef = createRef(null);
  let cuzDefaultTabIndex = ''; // 个性化默认激活页签
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [location]);
  const {
    defaultTabIndex, // 默认激活页签
  } = routerParams;
  // 当前选中的Tabs的key
  const [activeTabKey, setActiveTabKey] = useState(
    defaultTabIndex || activeTabObj.activeTabKey || 'tabPaneAssessmentReserve'
  );
  // 查询权限
  const [permissionCode, setPermissionCode] = useState(activeTabObj.tabPermission);
  // 标签页 数量数据值
  const [tabCount, setTabCount] = useState({});
  const [progressList, setProgressList] = useState([]); // 评估进度-进度条
  const [buttonShow, setButtonShow] = useState(true);

  const [state, setState] = useSetState({
    manageAllInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {}, // 审批进度
    },
    scoreAllInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {}, // 审批进度
    },
    notPermissionBtns: [],
  });

  const tabs = useMemo(() => getTabsConfig(permissionCode), [permissionCode]);

  const searchPermission = async () => {
    const permissionList = [
      'srm.partner.purchaser.evaluation-workbench.button.report.manage',
      'srm.partner.purchaser.evaluation-workbench.button.report.score',
    ];
    const res = getResponse(await getPermission(permissionList));
    if (res) {
      // eslint-disable-next-line no-param-reassign
      const list = res.filter(i => i.code === permissionList[0]);
      setButtonShow(list[0].approve);
      // 优先取路径上默认的页签
      const manageDefaultTab = defaultTabIndex || 'tabPaneAssessmentReserve';
      // eslint-disable-next-line no-param-reassign
      activeTabObj.activeKey = list[0].approve ? manageDefaultTab : 'tabPaneWaitScore';

      // 个性化配置默认激活页签优先级最高
      setActiveTabKey(
        list[0].approve ? cuzDefaultTabIndex || manageDefaultTab : 'tabPaneWaitScore'
      );
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

  useEffect(() => {
    if (TabsTableList.tabPaneManageAll) {
      TabsTableList.tabPaneManageAll.setState('dsKey', 'manageAllInfo');
      TabsTableList.tabPaneManageAll.addEventListener('load', handleDsLoadAfter);
    }
    if (TabsTableList.tabPaneScoreAll) {
      TabsTableList.tabPaneScoreAll.setState('dsKey', 'scoreAllInfo');
      TabsTableList.tabPaneScoreAll.addEventListener('load', handleDsLoadAfter);
    }
    handleBtnPermissionBtn();
    return () => {
      // eslint-disable-next-line no-unused-expressions
      TabsTableList.tabPaneManageAll?.removeEventListener('load', handleDsLoadAfter);
      // eslint-disable-next-line no-unused-expressions
      TabsTableList.tabPaneScoreAll?.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet } = dataSetProps;
    const dsKey = dataSet.getState('dsKey');
    const businessKeys = dataSet.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    // 查询审批相关
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setState({
          [dsKey]: {
            approvalDataMap,
            revokeDataMap,
            approvalHistoryMap,
          },
        });
      }
    });
  };

  // 处理按钮权限集
  const handleBtnPermissionBtn = async () => {
    const codeList = [
      {
        code: 'srm.partner.purchaser.evaluation-workbench.button.report.all-list.approval',
        name: 'manageApproval',
      },
      {
        code: 'srm.partner.purchaser.evaluation-workbench.button.report.all-list.repeal-approval',
        name: 'manageRevokeApproval',
      },
      {
        code: 'srm.partner.purchaser.evaluation-workbench.button.score.all-list.approval',
        name: 'scoreApproval',
      },
      {
        code: 'srm.partner.purchaser.evaluation-workbench.button.score.all-list.repeal-approval',
        name: 'scoreRevokeApproval',
      },
    ];
    const notPermissionBtnList = await getNotPermissionBtns(codeList);
    if (notPermissionBtnList) {
      setState({
        notPermissionBtns: notPermissionBtnList,
      });
    }
  };

  //  Tab切换触发
  const handleTabChange = useCallback(newKey => {
    setActiveTabKey(newKey);
    // eslint-disable-next-line no-param-reassign
    activeTabObj.activeTabKey = newKey;
  }, []);

  // 查询数据
  const handleQueryList = (props = {}) => {
    const { params = {} } = props;
    const clearParams = {}; // 清理
    let pageFlag = false;
    // 带查询条件时不分页
    const { customizeOrderField, ...otherParams } = params;
    if (isEmpty(otherParams)) {
      pageFlag = true;
    }
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
      // 评估准备
      case 'tabPaneAssessmentReserve':
        TabsTableList[activeTabKey].setQueryParameter('progressStatus', 'EVAL_PREPARE');
        break;
      // 评估中
      case 'tabPaneUnderEvaluation':
        TabsTableList[activeTabKey].setQueryParameter('progressStatus', 'EVAL_PROGRESSING');
        break;
      // 评估完成
      case 'tabPaneEvaluationCompleted':
        TabsTableList[activeTabKey].setQueryParameter('progressStatus', 'EVAL_COMPLETE');
        break;
      case 'tabPaneWaitScore':
        TabsTableList[activeTabKey].setQueryParameter('createMethod', 'eval_report');
        break;

      default:
        TabsTableList[activeTabKey].setQueryParameter('evalStatusCustoms', null);
        break;
    }
    if (pageFlag) {
      TabsTableList[activeTabKey].query(TabsTableList[activeTabKey].currentPage);
    } else {
      TabsTableList[activeTabKey].query();
    }
  };

  // 查询
  const queryList = () => {
    switch (activeTabKey) {
      // 评估准备
      case 'tabPaneAssessmentReserve':
        TabsTableList[activeTabKey].setQueryParameter('progressStatus', 'EVAL_PREPARE');
        break;
      // 评估中
      case 'tabPaneUnderEvaluation':
        TabsTableList[activeTabKey].setQueryParameter('progressStatus', 'EVAL_PROGRESSING');
        break;
      // 评估完成
      case 'tabPaneEvaluationCompleted':
        TabsTableList[activeTabKey].setQueryParameter('progressStatus', 'EVAL_COMPLETE');
        break;
      case 'tabPaneWaitScore':
        TabsTableList[activeTabKey].setQueryParameter('createMethod', 'eval_report');
        break;

      default:
        TabsTableList[activeTabKey].setQueryParameter('progressStatus', null);
        break;
    }

    TabsTableList[activeTabKey].query(TabsTableList[activeTabKey].currentPage);
  };

  /**
   * @description: 手动创建 --- 跳转至创建详情
   * @return {*}
   */
  const handleManualCreation = () => {
    history.push(`/sslm/purchaser-evaluation-workbench/details/create`);
  };

  const handleEvalPlanCreation = async ds => {
    const evalPlanLineIds = ds?.selected.map(i => {
      return i.data.evalPlanLineId;
    });
    const cuxFlag = remote
      ? await remote?.process('cuxEvalPlanCreation', true, {
          history,
          ds,
          handleCheckIsNewStrategy,
          TabsTableList,
          activeTabKey,
        })
      : true;
    if (!cuxFlag) {
      return;
    }
    const result = await handleCheckIsNewStrategy({ evalPlanLineIds });
    const res = getResponse(result);
    if (res) {
      const { sameFlag, newStrategyId, oldStrategyId, evalHeaderId } = res;
      if (sameFlag) {
        history.push({
          pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
          search: querystring.stringify({
            evalHeaderId,
          }),
        });
        return true;
      } else {
        return Modal.open({
          title: intl.get('hzero.common.message.confirm.title').d('提示'),
          okText: intl.get(`sslm.purchaserEvaluation.strategyModal.confirm.ok`).d('最新版本'),
          cancelText: intl
            .get('sslm.purchaserEvaluation.strategyModal.confirm.cancel')
            .d('当前版本'),
          onOk: () => {
            return handleEvalPlanCreate({ evalPlanLineIds, strategyId: newStrategyId }).then(
              resp => {
                const response = getResponse(resp);
                if (response) {
                  history.push({
                    pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                    search: querystring.stringify({
                      evalHeaderId: response.evalHeaderId,
                    }),
                  });
                  return true;
                } else {
                  return false;
                }
              }
            );
          },
          onCancel: () => {
            return handleEvalPlanCreate({ evalPlanLineIds, strategyId: oldStrategyId }).then(
              resp => {
                const response = getResponse(resp);
                if (response) {
                  history.push({
                    pathname: `/sslm/purchaser-evaluation-workbench/details/edit`,
                    search: querystring.stringify({
                      evalHeaderId: response.evalHeaderId,
                    }),
                  });
                  return true;
                } else {
                  return false;
                }
              }
            );
          },
          children: intl
            .get('sslm.purchaserEvaluation.strategyModal.tooltip')
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
    } else {
      return false;
    }
  };

  /**
   * @description: 引用评估计划创建  - 打开弹窗
   * @return {*}
   */
  const handleReferenceEvaluationPlanCreation = () => {
    const planDs = new DataSet(getEvalPlanDs());
    Modal.open({
      title: intl
        .get('sslm.purchaserEvaluation.modal.header.title.referenceEvaluationPlanCreation')
        .d('引用评估计划创建'),
      drawer: true,
      style: { width: '1090px' },
      okText: intl.get(`hzero.common.button.create`).d('新建'),
      cancelText: intl.get('hzero.common.button.cance').d('取消'),
      onOk: () => handleEvalPlanCreation(planDs),
      closable: true,
      children: <EvalPlanDrawer dataSet={planDs} customizeTable={customizeTable} />,
    });
  };

  /**
   * @description: 删除
   * @return {*}
   */
  const handleDelete = useCallback(() => {
    const params = TabsTableList[activeTabKey]?.selected.map(i => {
      return i.data.evalHeaderId;
    });
    const flag =
      TabsTableList[activeTabKey]?.selected.filter(i => i.data.reportStatus !== 'NEW').length > 0;
    if (flag) {
      notification.warning({
        placement: 'bottomRight',
        message: intl
          .get('sslm.purchaserEvaluation.view.message.deleteTooltip')
          .d('只有【新建】状态的单据才允许删除'),
      });
    } else {
      Modal.confirm({
        title: intl.get('hzero.common.message.confirm.title').d('提示'),
        children: intl
          .get('sslm.purchaserEvaluation.modal.confirm.deleteRecord')
          .d('确定要删除所选行吗？'),
        onOk: () => {
          return handleBatchDeleteRecord({ params }).then(res => {
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
    }
  }, [activeTabKey, TabsTableList]);

  // 导出参数
  const handleParams = useCallback(() => {
    const queryData = TabsTableList.tabPaneManageAll.queryDataSet?.current?.toData();

    const queryParams = filterNullValueObject(queryData);
    const { __dirty, ...others } = queryParams;
    const evalHeaderIds = (TabsTableList.tabPaneManageAll.selected || []).map(r =>
      r.get('evalHeaderId')
    );
    return {
      ...others,
      evalHeaderIds,
    };
  }, []);

  /**
   * @description: 废弃
   * @return {*}
   */
  const handleDiscard = useCallback(() => {
    const params = TabsTableList[activeTabKey]?.selected.map(i => {
      return i.data.evalHeaderId;
    });
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.purchaserEvaluation.modal.confirm.discardRecord')
        .d('确定要废弃所选行吗？'),
      onOk: () => {
        return handleBatchDiscardRecord({ params }).then(res => {
          const result = getResponse(res);
          if (result) {
            if (remote && remote.event) {
              remote.event.fireEvent('cuxWorkBenChHandleAfterDiscard', {
                tableRecords: TabsTableList[activeTabKey].selected,
              });
            }
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

  // 批量发布
  const handleBatchPublish = () => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.purchaserEvaluationDetail.view.message.publishMsg')
        .d('该操作将向供应商发布评估报告，确定发布吗？'),
      onOk: () => {
        const manageAllDs = TabsTableList.tabPaneManageAll;
        if (manageAllDs) {
          const evalHeaderIds = manageAllDs.selected.map(record => record.get('evalHeaderId'));
          return new Promise(resolve => {
            batchRelease(evalHeaderIds)
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  resolve();
                  notification.success();
                  handleQueryCount();
                  manageAllDs.query(manageAllDs.currentPage, null, false);
                }
              })
              .finally(() => {
                resolve(false);
              });
          });
        }
      },
    });
  };

  /**
   * @description: 查询标签页各个页签数据量
   * @return {*}
   */
  const handleQueryCount = async () => {
    const res = getResponse(await getManageCount()) || {};
    const detailRes = getResponse(await getScoreCount()) || {};
    setTabCount({
      tabPaneAssessmentReserve: res?.EVAL_PREPARE,
      tabPaneUnderEvaluation: res?.EVAL_PROGRESSING,
      tabPaneEvaluationCompleted: res?.EVAL_COMPLETE,
      tabPaneManageAll: res?.ALL,
      tabPaneWaitScore: detailRes.UN_COMPLETE,
      tabPaneScoreAll: detailRes.ALL,
    });
  };

  // 导出评估报告附件
  const exportReportAttachment = () => {
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      title: intl.get('sslm.purchaserEvaluation.view.title.exportReportAttachment').d('导出评估'),
      children: <ExportReportAttachment ref={exportReportAttRef} />,
      onOk: () => {
        return new Promise(async resolve => {
          const exportReportAttData = await exportReportAttRef.current?.getSaveParams();
          if (exportReportAttData) {
            const dataSet = TabsTableList.tabPaneManageAll;
            const evalHeaderIds = dataSet.selected.map(record => record.get('evalHeaderId'));
            batchExportAttachment({
              evalHeaderIds,
              ...exportReportAttData,
            })
              .then(response => {
                const res = getResponse(response);
                if (res) {
                  resolve();
                  dataSet.unSelectAll();
                  dataSet.clearCachedSelected();
                  notification.success();
                }
              })
              .finally(() => {
                resolve(false);
              });
          } else {
            resolve(false);
          }
        });
      },
    });
  };

  const getStepList = useCallback(() => {
    handleGetSteps().then(response => {
      const res = getResponse(response);
      if (res) {
        const newList = remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_PROGRESS_LIST', res);
        setProgressList(newList);
      }
    });
  }, []);

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback((_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiSelectReqNums"
        placeholder={intl
          .get('sslm.purchaserEvaluation.view.message.multiSelectReqNums')
          .d('请输入评估报告编号')}
      />
    );
  }, []);

  const getFieldProps = () => {
    const { supplierCompanyName, ...rest } = routerParams;
    const fieldProps = {};
    const { supplierCompanyName: supplierCompanyNameOld } =
      TabsTableList[activeTabKey]?.queryDataSet?.current?.toData() || {};
    // 切换供应商进行刷新
    if (
      supplierCompanyNameOld &&
      supplierCompanyName &&
      supplierCompanyNameOld !== supplierCompanyName
    ) {
      if (searchBarRef) {
        searchBarRef.queryDs.current.set({ supplierCompanyName });
      }
      return fieldProps;
    } else {
      // 供应商名称
      fieldProps.supplierCompanyName = {
        defaultValue: () => supplierCompanyName,
      };
    }
    forIn(fieldProps, (value, key) => {
      const { defaultValue } = value || {};
      if (defaultValue && isFunction(defaultValue)) {
        // 只处理默认值是对象的，如果是其他的类型标准会失效
        const filterNullDefaultValue = filterNullValueObject(defaultValue());
        if (isEmpty(filterNullDefaultValue) && fieldProps[key]) {
          delete fieldProps[key].defaultValue;
        }
      }
    });
    // 兼容个性化字段
    forIn(rest, (value, key) => {
      if (!isEmpty(key)) {
        fieldProps[key] = {
          defaultValue: () => value,
        };
      }
    });
    return fieldProps;
  };

  useEffect(() => {
    handleQueryCount();
    getStepList();
  }, [activeTabKey]);
  return (
    <Fragment>
      <Header title={intl.get('sslm.purchaserEvaluation.view.header.Title').d('采购方评估工作台')}>
        <HeaderBtns
          activeTabKey={activeTabKey}
          dataSet={TabsTableList[activeTabKey]}
          handleManualCreation={handleManualCreation}
          handleReferenceEvaluationPlanCreation={handleReferenceEvaluationPlanCreation}
          handleDelete={handleDelete}
          handleDiscard={handleDiscard}
          handleParams={handleParams}
          onBatchPublish={handleBatchPublish}
          buttonShow={buttonShow}
          customizeBtnGroup={customizeBtnGroup}
          handleQueryList={handleQueryList}
          handleQueryCount={handleQueryCount}
          exportReportAttachment={exportReportAttachment}
          remote={remote}
        />
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM.PURCHASER_EVALUATIONIS_LIST.TAB',
            cascade: true,
            custDefaultActive: key => {
              // 获取个性化配置的默认激活key，没配置的值为undefined
              const currentKey = key;
              // 解决个性化配置加载顺序 快于 useEffect 问题，将个性化默认激活页签保存下来，在useEffect中进行设置
              cuzDefaultTabIndex = currentKey;
            },
          },
          <Tabs
            // animated={false}
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
                                tabPaneKey,
                                history,
                                dataSet: TabsTableList[tabPaneKey],
                                queryList,
                                handleQueryCount,
                                progressList,
                                customizeTable,
                                remote,
                                state,
                              })}
                              custLoading={custLoading}
                              searchCode={searchBarCode}
                              searchBarRef={ref => {
                                searchBarRef = ref;
                              }}
                              searchBarConfig={{
                                onQuery: handleQueryList,
                                // autoQuery: false,
                                left: {
                                  render: renderLeftSearchBar,
                                },
                                fieldProps: getFieldProps(),
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
      'sslm.purchaserEvaluation',
      'sslm.purchaserEvaluationDetail',
      'sslm.evaluationStrategy',
      'sslm.evaluationStrategyDetail',
      'sslm.common',
      'sslm.commonApplication',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.PURCHASER_EVALUATIONIS_LIST.TAB',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_RESERVE_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_COMPLETED_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ALL_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.SCORE.WAIT_SCORE_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.SCORE.ALL_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.BUTTON',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.REF_EVA_PLAN_TABLE',
      'SSLM.PURCHASER_ASSESS_LIST.MANAGE.QUALITY_RECTIFICATION',
    ],
  }),
  remotes(
    {
      code: 'SSLM.PURCHASER_EVALUATION_WORKBENCH',
      name: 'remote',
    },
    {
      cuxWorkBenChHandleAfterDiscard() {}, // 二开行废弃之后的逻辑
    }
  ),
  withProps(
    props => {
      const { remote } = props || {};
      const activeTabObj = {
        activeTabKey: 'tabPaneAssessmentReserve',
        tabPermission: null,
      };
      // 评估准备 - 管理
      const abPaneAssessmentReserve = getTableDs({
        selection: 'multiple',
        filterCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_RESERVE',
        tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_RESERVE_TABLE',
        currentTab: 'tabPaneAssessmentReserve',
      });
      const remoteAbPaneAssessmentReserve = remote
        ? remote.process(
            'SSLM.PURCHASER_EVALUATION_WORKBENCH_CODE_ASSESSMENT_RESERVE',
            abPaneAssessmentReserve
          )
        : abPaneAssessmentReserve;
      const tabPaneAssessmentReserveDs = new DataSet(remoteAbPaneAssessmentReserve);

      // 评估中 - 管理
      const tabPaneUnderEvaluations = getTableDs({
        selection: 'multiple',
        filterCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.UNDER_EVALUATION',
        tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.TABLE',
        currentTab: 'tabPaneUnderEvaluation',
      });
      const remoteTabPaneUnderEvaluations = remote
        ? remote.process(
            'SSLM.PURCHASER_EVALUATION_WORKBENCH_CODE_EVALUATION',
            tabPaneUnderEvaluations
          )
        : tabPaneUnderEvaluations;
      const tabPaneUnderEvaluationDs = new DataSet(remoteTabPaneUnderEvaluations);

      // 评估完成 - 管理
      const tabPaneEvaluationCompleted = getTableDs({
        selection: 'multiple',
        filterCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_COMPLETED',
        tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ASSESS_COMPLETED_TABLE',
        currentTab: 'tabPaneEvaluationCompleted',
      });

      const remoteTabPaneEvaluationCompleted = remote
        ? remote.process(
            'SSLM.PURCHASER_EVALUATION_WORKBENCH_CODE_COMOLETE',
            tabPaneEvaluationCompleted
          )
        : tabPaneEvaluationCompleted;
      const tabPaneEvaluationCompletedDs = new DataSet(remoteTabPaneEvaluationCompleted);

      //  全部- 管理
      const tabPaneManageAlls = getTableDs({
        selection: 'multiple',
        filterCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ALL',
        tableCode: 'SSLM.PURCHASER_ASSESS_LIST.MANAGE.ALL_TABLE',
        currentTab: 'tabPaneManageAll',
      });
      const remoteTabPaneManageAlls = remote
        ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_CODE_MANAGE_ALL', tabPaneManageAlls)
        : tabPaneManageAlls;
      const tabPaneManageAllDs = new DataSet(remoteTabPaneManageAlls);

      // 待评分 - 评分
      const tabPaneWaitScores = getTableDs({
        filterCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.WAIT_SCORE',
        tableCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.WAIT_SCORE_TABLE',
        currentTab: 'tabPaneWaitScore',
      });
      const remoteTabPaneWaitScores = remote
        ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_CODE_WAITSCORE', tabPaneWaitScores)
        : tabPaneWaitScores;
      const tabPaneWaitScoreDs = new DataSet(remoteTabPaneWaitScores);

      //  全部 - 评分
      const tabPaneScoreAlls = getTableDs({
        filterCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.ALL',
        tableCode: 'SSLM.PURCHASER_ASSESS_LIST.SCORE.ALL_TABLE',
        currentTab: 'tabPaneScoreAll',
      });
      const remoteTabPaneScoreAlls = remote
        ? remote.process('SSLM.PURCHASER_EVALUATION_WORKBENCH_CODE_NEW', tabPaneScoreAlls)
        : tabPaneScoreAlls;
      const tabPaneScoreAllDs = new DataSet(remoteTabPaneScoreAlls);
      return {
        TabsTableList: {
          tabPaneAssessmentReserve: tabPaneAssessmentReserveDs,
          tabPaneUnderEvaluation: tabPaneUnderEvaluationDs,
          tabPaneEvaluationCompleted: tabPaneEvaluationCompletedDs,
          tabPaneManageAll: tabPaneManageAllDs,
          tabPaneWaitScore: tabPaneWaitScoreDs,
          tabPaneScoreAll: tabPaneScoreAllDs,
        },
        activeTabObj,
      };
    },
    { cacheState: true }
  )
)(PurchaserEvaluationWorkbench);
