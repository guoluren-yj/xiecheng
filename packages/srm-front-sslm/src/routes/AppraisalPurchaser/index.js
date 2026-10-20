/*
 * @Date: 2023-11-03 14:05:20
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import querystring from 'querystring';
import { routerRedux } from 'dva/router';
import { compose, isEmpty, toUpper } from 'lodash';
import { Tabs, DataSet, Modal, Spin, Table, Button } from 'choerodon-ui/pro';
import React, { Fragment, useMemo, useState, useCallback, useEffect } from 'react';

import intl from 'utils/intl';
import withProps from 'utils/withProps';
import { getResponse } from 'utils/utils';
import notification from 'utils/notification';
import { Header, Content } from 'components/Page';
import { DEFAULT_DATE_FORMAT } from 'utils/constants';
import SearchBarTable from '_components/SearchBarTable';
import withCustomize from 'srm-front-cuz/lib/c7nCustomize';
import formatterCollections from 'utils/intl/formatterCollections';
import hocRemote from 'utils/remote';

import { rangeDateRender, getNotPermissionBtns } from '@/routes/components/utils/utils';
import MultipleTextField from '@/routes/components/MultipleTextField';
import { tableMaxHeight, tableHeight, renderStatus } from '@/routes/components/utils';
import {
  queryCount,
  deleteAppraisal,
  listRecalculate,
  dealCopy,
} from '@/services/appraisalPurchaserService';
import { queryAllApprovalData, renderApproveProgress } from '@/routes/components/WorkFlowApproval';

import { getTabPaneList } from './utils';
import HeaderBtns from './HeaderBtns';
import OperationBtns from './OperationBtns';
import { getListDs } from './stores/getIndexDS';
import ViewScoreResult from './components/ViewScoreResult';
import { handleExecutionDocument } from './components/utils';
import { getUnratedPersonDs, getUnratedPersonColumns } from './stores/getUnratedPersonDS';

const { TabPane, TabGroup } = Tabs;
let searchBarRef; // 筛选器ref

const Index = ({
  mixObj,
  allDs,
  createDs,
  scoreDs,
  dispatch,
  location,
  detailAllDs,
  custLoading,
  scoreCompletedDs,
  resultReleaseDs,
  customizeTable,
  customizeTabPane,
  remote,
}) => {
  const routerParams = useMemo(() => querystring.parse(location.search.substr(1)), [
    location.search,
  ]);
  const { activeKey: routerActiveKey } = routerParams;

  const [tabCount, setTabCount] = useState({});
  const [loading, setLoading] = useState(false);
  const [pageChacheFlag, setPageChacheFlag] = useState(true);
  const [approvalInfo, setApprovalInfo] = useState({});
  const [notPermissionBtns, setNotPermissionBtns] = useState([]);
  const [activeKey, setActiveKey] = useState(routerActiveKey || mixObj.activeKey);

  const newMixObj = mixObj;
  const tabPaneList = useMemo(() => getTabPaneList(), []);
  const dsList = {
    new: createDs,
    scoring: scoreDs,
    scored: scoreCompletedDs,
    publish: resultReleaseDs,
    all: allDs,
    detailAll: detailAllDs,
  };

  // tab改变的回调
  const handleTabsChange = key => {
    setActiveKey(key);
    newMixObj.activeKey = key;
    newMixObj.initActiveKey = false; // 触发改变后，初次初始化置为false
  };

  useEffect(() => {
    handleTabsChange(routerActiveKey || activeKey);
  }, [routerActiveKey]);

  // 初始化查询
  const initQuery = () => {
    queryCount().then(response => {
      const res = getResponse(response);
      if (res) {
        setTabCount(res);
      }
    });
    if (dsList[activeKey].getState('queryStatus') === 'ready') {
      dsList[activeKey].query(dsList[activeKey].currentPage);
    }
  };

  useEffect(() => {
    initQuery();
  }, [activeKey]);

  useEffect(() => {
    allDs.addEventListener('load', handleDsLoadAfter);
    handleBtnPermissionBtn();
    return () => {
      allDs.removeEventListener('load', handleDsLoadAfter);
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
        code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.all-list.approval',
        name: 'approval',
      },
      {
        code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.all-list.repeal-approval',
        name: 'revokeApproval',
      },
      {
        code: 'srm.partner.evaluation-manage.appraisal-purchaser.button.eval_manage_copy',
        name: 'copy',
      },
    ];
    const notPermissionBtnList = await getNotPermissionBtns(codeList);
    if (notPermissionBtnList) {
      setNotPermissionBtns(notPermissionBtnList);
    }
  };

  // 新建
  const handleCreate = () => {
    dispatch(
      routerRedux.push({
        pathname: '/sslm/appraisal-purchaser/create',
      })
    );
  };

  // 跳转明细
  const jumpDetail = (record, type) => {
    const { evalTplId, evalHeaderId, evalGranularity } = record.get([
      'evalTplId',
      'evalHeaderId',
      'evalGranularity',
    ]);
    dispatch(
      routerRedux.push({
        pathname: `/sslm/appraisal-purchaser/detail/${evalTplId}/${evalHeaderId}/${evalGranularity}/${type}`,
      })
    );
  };

  // 重新计算
  const handleRecalculate = useCallback((record, dataSet) => {
    const evalHeaderId = record.get('evalHeaderId');
    Modal.confirm({
      title: intl.get(`sslm.supplierDocManage.view.modal.confirmRecalculate`).d('确认重新计算'),
      children: intl
        .get('sslm.supplierDocManage.view.modal.recalculatePartContent')
        .d('将重新计算系统计算失败指标的得分，确认执行评分？'),
      onOk: () => {
        setLoading(true);
        return listRecalculate({ evalHeaderId, createPage: 'ASSESS' })
          .then(async response => {
            const res = getResponse(response);
            if (res) {
              notification.success();
              await dataSet.query(dataSet.currentPage);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }, []);

  // 查看未评分人
  const handleUnratedPerson = useCallback(record => {
    const evalHeaderId = record.get('evalHeaderId');
    const dataSet = new DataSet(getUnratedPersonDs({ evalHeaderId }));
    Modal.open({
      key: Modal.key(),
      drawer: true,
      style: { width: 742 },
      okText: intl.get('sslm.common.button.urge').d('催办'),
      title: intl.get(`sslm.supplierDocManage.model.evalDocManage.peopleNotScore`).d('未评分人'),
      children: (
        <Table
          dataSet={dataSet}
          columns={getUnratedPersonColumns}
          style={{ maxHeight: 'calc(100vh - 300px)' }}
          customizedCode="SSLM.APPRAISAL_PURCHASER.UNRATED_PERSON"
        />
      ),
      onOk: () => {
        setLoading(true);
        return dataSet.submit().finally(() => {
          setLoading(false);
        });
      },
    });
  }, []);

  // 废弃
  const handleDiscard = useCallback((record, dataSet) => {
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.supplierDocManage.model.evalDocManage.destroyConfirm')
        .d('确认废弃档案?'),
      onOk: () => {
        setLoading(true);
        const evalHeaderId = record.get('evalHeaderId');
        return deleteAppraisal([evalHeaderId])
          .then(async response => {
            const res = getResponse(response);
            if (res) {
              if (remote && remote.event) {
                remote.event.fireEvent('cuxWorkBenChHandleAfterDiscard', {
                  record,
                });
              }
              notification.success();
              await dataSet.query(dataSet.currentPage);
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }, []);

  // 复制
  const handleCopy = useCallback(record => {
    const evalHeaderId = record.get('evalHeaderId');
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get('sslm.supplierDocManage.view.message.copyConfirm')
        .d('是否复制此单据生成一张新单据？'),
      onOk: () => {
        setLoading(true);
        return dealCopy({ evalHeaderId })
          .then(respose => {
            const res = getResponse(respose);
            if (res) {
              const { evalTplId, evalGranularity, evalHeaderId: newEvalHeaderId } = res;
              notification.success();
              dispatch(
                routerRedux.push({
                  pathname: `/sslm/appraisal-purchaser/detail/${evalTplId}/${newEvalHeaderId}/${evalGranularity}/edit`,
                })
              );
            }
          })
          .finally(() => {
            setLoading(false);
          });
      },
    });
  }, []);

  // 【汇总得分】明细
  const handleLineScore = record => {
    Modal.open({
      drawer: true,
      key: Modal.key(),
      cancelButton: false,
      style: { width: 1090 },
      okText: intl.get('hzero.common.button.close').d('关闭'),
      title: intl.get('sslm.common.view.field.viewScoreResult').d('查看评分结果'),
      children: <ViewScoreResult record={record} />,
    });
  };

  const getEditorProps = () => ({
    evalStatus: {
      optionsFilter: record => !['MANUAL_EVALUATING_COMPLETE'].includes(record.get('value')),
    },
  });

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback((_, queryDataSet) => {
    return (
      <MultipleTextField
        dataSet={queryDataSet}
        name="multiCombineNumOrNames"
        placeholder={intl
          .get('sslm.common.modal.placeholder.appraisalCodeOrName')
          .d('请输入档案编码、描述查询')}
      />
    );
  }, []);

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

  const getColumns = () => {
    const columns = [
      {
        name: 'evalStatus',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'option',
        hidden: ['new', 'scored', 'publish', 'detailAll'].includes(activeKey),
        width: activeKey === 'scoring' ? 120 : 200,
        renderer: ({ record, dataSet }) => (
          <OperationBtns
            record={record}
            remote={remote}
            activeKey={activeKey}
            approvalInfo={approvalInfo}
            notPermissionBtns={notPermissionBtns}
            dataSet={dataSet}
            onCopy={() => handleCopy(record)}
            onEdit={() => jumpDetail(record, 'edit')}
            onDiscard={() => handleDiscard(record, dataSet)}
            onRecalculate={() => handleRecalculate(record, dataSet)}
            onUnratedPerson={() => handleUnratedPerson(record)}
          />
        ),
      },
      {
        name: 'evalNum',
        width: 120,
        renderer: ({ value, record }) => {
          const type = activeKey === 'all' ? 'read' : 'edit';
          return <a onClick={() => jumpDetail(record, type)}>{value}</a>;
        },
      },
      {
        name: 'evalName',
        width: 150,
      },
      {
        name: 'evalTplName',
        width: 150,
      },
      {
        name: 'evalTplTypeMeaning',
        width: 120,
      },
      {
        name: 'kpiMethod',
        width: 120,
        renderer: ({ record }) => record.get('kpiMethodMeaning'),
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
        width: 140,
      },
      {
        name: 'createdUserName',
        width: 120,
      },
      {
        name: 'creationDate',
        width: 140,
      },
      {
        hidden: activeKey !== 'all',
        name: 'approvalProgress',
        width: 160,
        title: intl.get('sslm.common.view.title.approvalProgress').d('审批进度'),
        renderer: ({ record }) => {
          const { approvalHistoryMap } = approvalInfo || {};
          return renderApproveProgress({ approvalHistoryMap, record });
        },
      },
    ];
    const extraColumns = [
      {
        name: 'lineStatusMeaning',
        width: 120,
        renderer: renderStatus,
      },
      {
        name: 'supplierNum',
        width: 120,
      },
      {
        name: 'supplierName',
        width: 200,
      },
      {
        name: 'categoryName',
        width: 150,
      },
      {
        name: 'itemName',
        width: 150,
      },
      {
        name: 'lineScore',
        width: 80,
        renderer: ({ value, record }) =>
          value ? (
            <Button funcType="link" onClick={() => handleLineScore(record)}>
              {value}
            </Button>
          ) : (
            '-'
          ),
      },
      {
        name: 'checkCollectScore',
        width: 80,
      },
      {
        name: 'rankNum',
        width: 100,
      },
      {
        name: 'levelCode',
        width: 80,
      },
      {
        name: 'checkLevelDesc',
        width: 100,
      },
      {
        name: 'executeAction',
        width: 180,
      },
      {
        name: 'executeTotalCount',
        width: 100,
        renderer: ({ record, value }) => (
          <Button funcType="link" onClick={() => handleExecutionDocument(record)}>
            {intl
              .get('sslm.common.model.check.num', {
                num: `(${value || 0})`,
              })
              .d(`查看(${value || 0})`)}
          </Button>
        ),
      },
      {
        name: 'publishDate',
        width: 140,
      },
    ];
    if (activeKey === 'detailAll') {
      columns.splice(2, 0, ...extraColumns);
    }
    return columns.filter(col => !col.hidden);
  };

  const renderTabPane = ({ key, tab, dataSet, tableCode, searchCode, customizeUnitCode }) => {
    return (
      <TabPane key={key} tab={tab} count={tabCount[toUpper(key)]}>
        <div style={{ height: tableHeight.hasGroupTab }}>
          {customizeTable(
            {
              code: tableCode,
            },
            <SearchBarTable
              key={key}
              cacheState
              dataSet={dataSet}
              columns={getColumns()}
              searchCode={searchCode}
              searchBarRef={ref => {
                searchBarRef = ref;
              }}
              style={{ maxHeight: tableMaxHeight.hasGroupTab }}
              searchBarConfig={{
                left: {
                  render: renderLeftSearchBar,
                },
                editorProps: getEditorProps(),
                onFieldChange: () => {
                  setPageChacheFlag(false);
                },
                onQuery: ({ params }) => handleQuery(params, dataSet, customizeUnitCode),
              }}
            />
          )}
        </div>
      </TabPane>
    );
  };

  return (
    <Fragment>
      <Header
        title={intl
          .get('sslm.appraisalPurchaser.view.title.purchaserWorkbench')
          .d('采购方绩效考评工作台')}
      >
        <HeaderBtns
          remoteProps={remote}
          onCreate={handleCreate}
          activeKey={activeKey}
          dataSet={dsList[activeKey]}
        />
      </Header>
      <Content>
        <Spin spinning={loading}>
          {customizeTabPane(
            {
              code: 'SSLM.APPRAISAL_PURCHASER_LIST.TABS',
              cascade: true,
              custDefaultActive: key => {
                if (mixObj.initActiveKey) {
                  handleTabsChange(routerActiveKey || key || activeKey);
                }
              },
            },
            <Tabs activeKey={activeKey} custLoading={custLoading} onChange={handleTabsChange}>
              <TabGroup
                key="wholeOrder"
                tab={intl.get('sslm.common.view.field.wholeOrder').d('整单')}
              >
                {tabPaneList.map(pane => {
                  const { key, tab } = pane;
                  const dataSet = dsList[key];
                  const customizeUnitCode = [pane.searchCode, pane.customizeCode];
                  return renderTabPane({
                    key,
                    tab,
                    dataSet,
                    customizeUnitCode,
                    searchCode: pane.searchCode,
                    tableCode: pane.customizeCode,
                  });
                })}
              </TabGroup>
              <TabGroup key="detail" tab={intl.get('sslm.common.view.field.detail').d('明细')}>
                {renderTabPane({
                  key: 'detailAll',
                  dataSet: dsList.detailAll,
                  tab: intl.get('sslm.common.view.message.all').d('全部'),
                  searchCode: 'SSLM.APPRAISAL_PURCHASER_LIST.WDETAIL_ALL_SEARCH',
                  tableCode: 'SSLM.APPRAISAL_PURCHASER_LIST.WDETAIL_ALL',
                  customizeUnitCode: [
                    'SSLM.APPRAISAL_PURCHASER_LIST.WDETAIL_ALL_SEARCH',
                    'SSLM.APPRAISAL_PURCHASER_LIST.WDETAIL_ALL',
                  ],
                })}
              </TabGroup>
            </Tabs>
          )}
        </Spin>
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: [
      'sslm.common',
      'sslm.scoreLevel',
      'sslm.evaluationQuery',
      'sslm.supplierDocManage',
      'sslm.commonApplication',
      'sslm.indicatorTemplate',
      'sslm.appraisalPurchaser',
      'sslm.supplierKpiIndicator',
      'spfm.supplierKpiIndicator',
      'sslm.siteInvestigateReport',
    ],
  }),
  withCustomize({
    unitCode: [
      'SSLM.APPRAISAL_PURCHASER_LIST.TABS',
      'SSLM.APPRAISAL_PURCHASER_LIST.NEW',
      'SSLM.APPRAISAL_PURCHASER_LIST.SCORING',
      'SSLM.APPRAISAL_PURCHASER_LIST.SCORE_COMPLETED',
      'SSLM.APPRAISAL_PURCHASER_LIST.RESULT_RELEASE',
      'SSLM.APPRAISAL_PURCHASER_LIST.ALL',
      'SSLM.APPRAISAL_PURCHASER_LIST.WDETAIL_ALL',
    ],
  }),
  hocRemote(
    {
      code: 'SSLM_APPRAISAL_PURCHASER_LIST',
      name: 'remote',
    },
    {
      events: {
        cuxWorkBenChHandleAfterDiscard() {}, // 二开废弃之后的逻辑
      },
    }
  ),
  withProps(
    props => {
      const { remote } = props || {};
      const createDs = new DataSet(
        remote
          ? remote.process('SSLM_APPRAISAL_PURCHASER_LIST_PROCESS_CODE_NEW', getListDs('NEW'))
          : getListDs('NEW')
      );
      const scoreDs = new DataSet(
        remote
          ? remote.process(
              'SSLM_APPRAISAL_PURCHASER_LIST_PROCESS_CODE_SCORING',
              getListDs('SCORING')
            )
          : getListDs('SCORING')
      );
      const scoreCompletedDs = new DataSet(
        remote
          ? remote.process('SSLM_APPRAISAL_PURCHASER_LIST_PROCESS_CODE_SCORED', getListDs('SCORED'))
          : getListDs('SCORED')
      );
      const resultReleaseDs = new DataSet(
        remote
          ? remote.process(
              'SSLM_APPRAISAL_PURCHASER_LIST_PROCESS_CODE_PUBLISH',
              getListDs('PUBLISH')
            )
          : getListDs('PUBLISH')
      );
      const allDs = new DataSet(
        remote
          ? remote.process('SSLM_APPRAISAL_PURCHASER_LIST_PROCESS_CODE_ALL', getListDs('ALL'))
          : getListDs('ALL')
      );
      const detailAllDs = new DataSet(
        remote
          ? remote.process(
              'SSLM_APPRAISAL_PURCHASER_LIST_PROCESS_CODE_DETAIL_ALL',
              getListDs('DETAIL_ALL')
            )
          : getListDs('DETAIL_ALL')
      );
      const mixObj = {
        activeKey: 'new',
        initActiveKey: true, // 是否初始化activeKey
      };
      return {
        mixObj,
        allDs,
        createDs,
        scoreDs,
        scoreCompletedDs,
        resultReleaseDs,
        detailAllDs,
      };
    },
    { cacheState: true }
  )
)(Index);
