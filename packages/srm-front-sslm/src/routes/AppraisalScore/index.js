/*
 * @Date: 2023-10-20 14:55:03
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { compose, isEmpty } from 'lodash';
import { routerRedux } from 'dva/router';
import { Tabs, DataSet, Button, Modal, Spin } from 'choerodon-ui/pro';
import React, { Fragment, useState, useCallback, useMemo, useEffect } from 'react';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';

import { rangeDateRender, getPermissionList } from '@/routes/components/utils/utils';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { revokeScore, queryListCount } from '@/services/appraisalScoreService';
import { tableMaxHeight, tableHeight, renderStatus } from '@/routes/components/utils';
import {
  queryAllApprovalData,
  renderApprovaBtn,
  renderApproveProgress,
} from '@/routes/components/WorkFlowApproval';

import { getTabPaneList } from './utils';
import { getIndexDs } from './stores/getIndexDS';

const { TabPane } = Tabs;

let searchBarRef; // 筛选器ref

const Index = ({ allDs, mixObj, dispatch, waitScoreDs, customizeTable }) => {
  const [spinning, setSpinning] = useState(false);
  const [activeKey, setActiveKey] = useState(mixObj.activeKey);
  const [documentCount, setDocumentCount] = useState({});
  const [pageChacheFlag, setPageChacheFlag] = useState(true);
  const [approvalInfo, setApprovalInfo] = useState({});

  const tabPaneList = useMemo(() => getTabPaneList(), []);
  const dsObj = {
    UN_COMPLETE: waitScoreDs,
    ALL: allDs,
  };

  useEffect(() => {
    initQuery();
  }, [activeKey]);

  useEffect(() => {
    allDs.addEventListener('load', handleDsLoadAfter);
    return () => {
      allDs.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet } = dataSetProps;
    const businessKeys = dataSet.filter(r => r.get('businessKey')).map(r => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then(response => {
      if (response) {
        const timestamp = new Date().getTime();
        // 取时间戳，每次查询完成重新渲染筛选器列
        allDs.setState('timestamp', timestamp);
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setApprovalInfo({
          approvalDataMap,
          revokeDataMap,
          approvalHistoryMap,
        });
      }
    });
  };

  // 初始化查询
  const initQuery = () => {
    queryListCount().then(response => {
      const res = getResponse(response);
      if (res) {
        setDocumentCount(res);
      }
    });
    const currentDs = dsObj[activeKey];
    if (currentDs.getState('queryStatus') === 'ready') {
      currentDs.query(currentDs.currentPage);
    }
  };

  const handleTabsChange = useCallback(key => {
    // eslint-disable-next-line no-param-reassign
    mixObj.activeKey = key;
    setActiveKey(key);
  }, []);

  // 跳转详情
  const jumpToDetail = useCallback((type, record) => {
    const { evalHeaderId, evalGranularity } = record.get(['evalHeaderId', 'evalGranularity']);
    dispatch(
      routerRedux.push({
        pathname: `/sslm/appraisal-score/detail/${evalHeaderId}/${evalGranularity}/${type}`,
      })
    );
  }, []);

  // 筛选器左侧渲染
  const renderLeftSearchBar = (_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiCombineNumOrNames"
        placeholder={intl
          .get('sslm.common.modal.placeholder.appraisalCodeOrName')
          .d('请输入档案编码、描述查询')}
      />
    );
  };

  // 清除筛选器字段
  const clearFieldsValues = dataSet => {
    if (dataSet.queryDataSet && dataSet.queryDataSet.current) {
      dataSet.queryDataSet.current.reset();
    }
  };

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

  // 撤回评分
  const handleScoreCancel = record => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.appraisalScore.view.message.ScoreCancelConfirm')
        .d('将撤回已提交的所有指标评分，撤回后可以在待评分页面修改指标评分后重新提交'),
      onOk: () => {
        return new Promise(resolve => {
          setSpinning(true);
          revokeScore({
            ...(record.toData() || {}),
            customizeUnitCode: 'SSLM.SCORING_WORKBENCH_LIST.ALL_LIST',
          })
            .then(response => {
              const res = getResponse(response);
              if (res) {
                resolve();
                notification.success();
                allDs.query(allDs.currentPage);
              }
            })
            .finally(() => {
              resolve(false);
              setSpinning(false);
            });
        });
      },
    });
  };

  // 查询条件参数
  const getFieldProps = useCallback(
    () => ({
      evalTplCode: {
        lovPara: { evalFlag: 1 },
      },
    }),
    []
  );

  const getPermissionCode = () => {
    const permissionCodeList = {
      approvaPermission: {
        code: 'srm.partner.evaluation-manage.scoring-workbench.button.all-list.approval',
        type: 'approva',
      },
      revokePermission: {
        code: 'srm.partner.evaluation-manage.scoring-workbench.button.all-list.repeal-approval',
        type: 'revoke',
      },
    };
    return getPermissionList(permissionCodeList);
  };

  const columns = useMemo(
    () => [
      {
        name: 'scoreStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'action',
        width: 80,
        hidden: activeKey !== 'ALL',
        renderer: ({ dataSet, record }) => {
          const { scoreStatus, evalStatus } = record.get(['scoreStatus', 'evalStatus']);
          const approvalProps = {
            onSuccess: () => dataSet.query(),
            processDataMap: approvalInfo,
            record,
            permissionListMap: getPermissionCode(),
          };
          if (
            ['UNSCORE', 'SCORE_REJECTED'].includes(scoreStatus) &&
            evalStatus === 'MANUAL_EVALUATING'
          ) {
            return (
              <>
                <Button funcType="link" onClick={() => jumpToDetail('edit', record)}>
                  {intl.get('sslm.common.model.field.score').d('评分')}
                </Button>
                {renderApprovaBtn(approvalProps)}
              </>
            );
          } else if (
            scoreStatus === 'SCORED' &&
            ['MANUAL_EVALUATING', 'MANUAL_COMPLETE', 'FINAL_COLLECTED', 'REJECTED'].includes(
              evalStatus
            )
          ) {
            return (
              <>
                <Button funcType="link" onClick={() => handleScoreCancel(record)}>
                  {intl.get(`sslm.common.button.scoreCancel`).d('撤回评分')}
                </Button>
                {renderApprovaBtn(approvalProps)}
              </>
            );
          } else {
            return renderApprovaBtn(approvalProps) || '-';
          }
        },
      },
      {
        name: 'evalNum',
        width: 120,
        renderer: ({ value, record }) => {
          const type = activeKey === 'ALL' ? 'view' : 'edit';
          return <a onClick={() => jumpToDetail(type, record)}> {value}</a>;
        },
      },
      {
        name: 'evalStatusMeaning',
        width: 120,
        hidden: activeKey !== 'ALL',
        renderer: renderStatus,
      },
      {
        name: 'evalName',
        width: 200,
      },
      {
        name: 'evalTplName',
        width: 200,
      },
      {
        name: 'evalTplTypeMeaning',
        width: 120,
      },
      {
        name: 'kpiMethodMeaning',
        width: 120,
      },
      {
        name: 'evalCycleMeaning',
        width: 100,
      },
      {
        name: 'evalDate',
        width: 180,
        renderer: ({ record }) => {
          const { evalDateFrom, evalDateTo } = record.get(['evalDateFrom', 'evalDateTo']);
          return rangeDateRender(evalDateFrom, evalDateTo, DEFAULT_DATE_FORMAT);
        },
      },
      {
        name: 'evalDimensionMeaning',
        width: 100,
      },
      {
        name: 'evalDimensionValueMeaning',
        width: 200,
      },
      {
        name: 'createdUserName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 150,
      },
      {
        hidden: activeKey !== 'ALL',
        name: 'approvalProgress',
        width: 160,
        title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
        renderer: ({ record }) => {
          const { approvalHistoryMap } = approvalInfo || {};
          return renderApproveProgress({ approvalHistoryMap, record });
        },
      },
    ],
    [activeKey, allDs.getState('timestamp')]
  );

  return (
    <Fragment>
      <Header title={intl.get('sslm.appraisalScore.view.title.scoreWorkbench').d('评分工作台')} />
      <Content>
        <Spin spinning={spinning}>
          <Tabs activeKey={activeKey} onChange={handleTabsChange}>
            {tabPaneList.map(pane => {
              const { key } = pane;
              const curDataSet = dsObj[key];
              const customizeUnitCode = [pane.searchCode, pane.customizeCode];
              return (
                <TabPane key={key} tab={pane.tab} count={documentCount[key]}>
                  <div style={{ height: tableHeight.hasTab }}>
                    {customizeTable(
                      {
                        code: pane.customizeCode,
                      },
                      <SearchBarTable
                        key={key}
                        cacheState
                        columns={columns}
                        dataSet={curDataSet}
                        searchCode={pane.searchCode}
                        searchBarRef={ref => {
                          searchBarRef = ref;
                        }}
                        style={{ maxHeight: tableMaxHeight.hasTab }}
                        searchBarConfig={{
                          left: {
                            render: renderLeftSearchBar,
                          },
                          fieldProps: getFieldProps(),
                          onQuery: ({ params }) =>
                            handleQuery(params, curDataSet, customizeUnitCode),
                          onClear: () => clearFieldsValues(curDataSet),
                          onReset: () => clearFieldsValues(curDataSet),
                          onFieldChange: () => {
                            setPageChacheFlag(false);
                          },
                        }}
                      />
                    )}
                  </div>
                </TabPane>
              );
            })}
          </Tabs>
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.appraisalScore', 'sslm.common', 'sslm.supplierDocManage'],
  }),
  withCustomize({
    unitCode: [
      'SSLM.SCORING_WORKBENCH_LIST.WAIT_SCORE_LIST',
      'SSLM.SCORING_WORKBENCH_LIST.ALL_LIST',
    ],
  }),
  withProps(
    () => {
      const waitScoreDs = new DataSet(getIndexDs('UN_COMPLETE'));
      const allDs = new DataSet(getIndexDs('ALL'));
      const mixObj = { activeKey: 'UN_COMPLETE' };
      return {
        allDs,
        waitScoreDs,
        mixObj,
      };
    },
    { cacheState: true }
  )
)(Index);
