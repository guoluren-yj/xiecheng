/**
 * Index - 配额申请单
 * @date: 2024-01-02
 * @author: zlh
 * @version: 0.0.1
 * @copyright Copyright (c) 2023, Hand
 */
import { compose, isEmpty, isArray } from 'lodash';
import querystring from 'querystring';
import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Tabs, DataSet, Modal } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import remote from 'utils/remote';
import { getResponse, filterNullValueObject } from 'utils/utils';
import withProps from 'utils/withProps';
import { Header, Content } from 'components/Page';
import SearchBarTable from '_components/SearchBarTable';
import MultipleTextField from '@/routes/components/MultipleTextField';
import WithCustomize from 'srm-front-cuz/lib/c7nCustomize';
import notification from 'utils/notification';
import formatterCollections from 'utils/intl/formatterCollections';
import {
  dealCopy,
  linePublish,
  handleBatchRelease,
  queryCounts,
} from '@/services/supplierQuotaService';
import { tableMaxHeight, tableHeight, useSetState } from '@/routes/components/utils';
import { queryAllApprovalData } from '@/routes/components/WorkFlowApproval';

import { OperationButtons, getTabsConfig, getColumns } from './utils';
import { getSupplierQuotaDS } from './stores/indexDS';

const { TabPane } = Tabs;
let searchBarRef; // 筛选器ref
const source = 'application'; // 跳转详情页来源页面

const customizeUnitCodeList = [
  'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TO_SUBMITTED_TABLE',
  'SSLM.SUP_QUOTA_APPLICATIONS_LIST.APPROVAL_TABLE',
  'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_TABLE',
];

const Index = ({
  history,
  custLoading,
  customizeTable,
  customizeTabPane,
  customizeBtnGroup,
  activeTabObj,
  tabsTableList,
  quotaAppListRemote,
}) => {
  const tabs = getTabsConfig();

  // 当前选中的Tabs的key
  const [activeTabKey, setActiveTabKey] = useState(activeTabObj.activeTabKey || 'toSubmitted');
  const [countList, setCountList] = useState({});
  const [loading, setLoading] = useState(false);
  const [approvalBtnInfo, setApprovalBtnInfo] = useSetState({
    approvalInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {}, // 审批进度
    },
    allInfo: {
      approvalDataMap: {},
      revokeDataMap: {},
      approvalHistoryMap: {}, // 审批进度
    },
  });

  useEffect(() => {
    handleDocumentCount();
    tabsTableList[activeTabKey].query(tabsTableList[activeTabKey].currentPage);
  }, [activeTabKey]);

  useEffect(() => {
    tabsTableList.all.setState('dsKey', 'allInfo');
    tabsTableList.approval.setState('dsKey', 'approvalInfo');
    tabsTableList.all.addEventListener('load', handleDsLoadAfter);
    tabsTableList.approval.addEventListener('load', handleDsLoadAfter);
    return () => {
      tabsTableList.all.removeEventListener('load', handleDsLoadAfter);
      tabsTableList.approval.removeEventListener('load', handleDsLoadAfter);
    };
  }, []);

  const handleDsLoadAfter = (dataSetProps = {}) => {
    const { dataSet } = dataSetProps;
    const dsKey = dataSet.getState('dsKey');
    const businessKeys = dataSet
      .filter((r) => r.get('businessKey'))
      .map((r) => r.get('businessKey'));
    queryAllApprovalData({ businessKeys }).then((response) => {
      if (response) {
        const { approvalDataMap, revokeDataMap, approvalHistoryMap } = response;
        setApprovalBtnInfo({
          [dsKey]: {
            approvalDataMap,
            revokeDataMap,
            approvalHistoryMap,
          },
        });
      }
    });
  };

  // 切换tab回调
  const handleTabChange = useCallback((newKey) => {
    setActiveTabKey(newKey);
    // eslint-disable-next-line no-param-reassign
    activeTabObj.activeTabKey = newKey;
    // eslint-disable-next-line no-param-reassign
    activeTabObj.initActiveKey = false;
  }, []);

  // 查询单据数量
  const handleDocumentCount = useCallback(() => {
    queryCounts().then((response) => {
      const res = getResponse(response);
      if (res) {
        setCountList(res);
      }
    });
  }, []);

  /**
   * 带参数列表查询
   * 列表页：提交操作后，查询带个性化筛选参数
   * @param {*} params 查询参数
   * @param operationType: 查询配额单类型 待提交：WAIT_SUBMIT; 审批中：APPROVING; 全部：ALL
   */
  const handleParamsQuery = () => {
    const params = tabsTableList[activeTabKey]?.queryDataSet?.current.toData() || {};
    handleQuery({ params });
  };

  // 获取导出参数
  const getQueryParams = () => {
    const queryParams = tabsTableList[activeTabKey]?.queryDataSet?.current?.toData() || {};
    return filterNullValueObject({
      ...queryParams,
      customizeUnitCode: [
        'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_SEARCH',
        'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_TABLE',
      ].join(),
    });
  };

  /**
   * 列表查询
   * @param {*} params 查询参数
   * @param operationType: 查询配额单类型 待提交：WAIT_SUBMIT; 审批中：APPROVING; 全部：ALL
   */
  const handleQuery = ({ params = {} } = {}) => {
    if (tabsTableList[activeTabKey]?.queryDataSet?.current) {
      const clearParams = {}; // 清理
      const convertParams = {}; // 转换参数
      const dataObj = tabsTableList[activeTabKey].queryDataSet.current.toData();
      if (dataObj) {
        for (const key in dataObj) {
          if (!['multiSelectReqNums', 'evalStatus', 'combinationEvalStatus'].includes(key)) {
            // 排除掉自定义的查询条件
            if (!Object.prototype.hasOwnProperty?.call(params, key)) {
              clearParams[key] = undefined;
            }
          }
        }
      }
      /**
       * 后端无法拦截状态个性化筛选字段进行处理，需要前端拦截，并进行转化
       * 将evalStatus字段的值，赋值给combinationEvalStatus字段
       */
      if (!isEmpty(params.evalStatus)) {
        clearParams.evalStatus = undefined;
        convertParams.combinationEvalStatus = params.evalStatus;
      } else {
        clearParams.evalStatus = undefined;
        clearParams.combinationEvalStatus = undefined;
      }
      const reqList = params.multiSelectReqNums;
      clearParams.multiSelectReqNums = isEmpty(reqList)
        ? null
        : isArray(reqList)
        ? reqList.join(',')
        : reqList;
      // eslint-disable-next-line no-unused-expressions
      tabsTableList[activeTabKey]?.queryDataSet?.current?.set({
        ...params,
        ...convertParams,
        ...clearParams,
      });
      tabsTableList[activeTabKey].query();
    } else if (searchBarRef) {
      // 解决初次查询不传个性化参数问题
      searchBarRef.handleQuery(true);
    } else {
      tabsTableList[activeTabKey].query();
    }
  };

  /**
   * 跳转到详情页
   * @params {object} record - 行数据
   * @params {object} 跳转类型 - edit：编辑｜view：查看
   */
  const handleGoDetail = useCallback(
    (record, type) => {
      let curQuotaHeaderId = null;
      if (!isEmpty(record)) {
        if (isEmpty(record.data)) {
          const { quotaHeaderId } = record || {};
          curQuotaHeaderId = quotaHeaderId;
        } else {
          const { quotaHeaderId } = record.data || {};
          curQuotaHeaderId = quotaHeaderId;
        }
      }
      if (curQuotaHeaderId) {
        history.push({
          pathname: `/sslm/supplier-quota-application/detail/${curQuotaHeaderId}`,
          search: querystring.stringify({
            type,
            source,
          }),
        });
      } else {
        history.push({
          pathname: `/sslm/supplier-quota-application/detail/create`,
          search: querystring.stringify({
            type,
            source,
          }),
        });
      }
    },
    [activeTabKey]
  );

  /**
   * 复制回调
   * @params {object} record - 行数据
   */
  const handleCopy = (record) => {
    const { quotaHeaderId } = record.get(['quotaHeaderId']);
    Modal.confirm({
      title: intl.get('hzero.common.message.confirm.title').d('提示'),
      children: intl
        .get(`sslm.supplierQuotaManage.view.message.copyConfirm`)
        .d('是否复制此单据生成一张新单据？'),
      onOk: () =>
        new Promise(() => {
          dealCopy({ quotaHeaderId }).then((respose) => {
            const res = getResponse(respose);
            if (res) {
              notification.success();
              handleQuery();
              handleGoDetail(res, 'edit');
            }
          });
        }),
    });
  };

  /**
   * 提交回调
   * @params {object} record - 行数据
   */
  const handleSumbit = (record) => {
    const { quotaHeaderId } = record.get(['quotaHeaderId']);
    const params = {
      quotaHeaderId,
    };
    linePublish(params).then((res) => {
      if (getResponse(res)) {
        notification.success();
        tabsTableList[activeTabKey].unSelectAll();
        tabsTableList[activeTabKey].clearCachedSelected();
        handleParamsQuery();
      }
    });
  };

  /**
   * 批量提交回调
   * @params {object} record - 行数据
   */
  const handleBatchSumbit = () => {
    const selectDataList = tabsTableList[activeTabKey].toJSONData();
    const params = {
      selectedRows: selectDataList,
      customizeUnitCode: customizeUnitCodeList.join(','),
    };
    setLoading(true);
    handleBatchRelease(params)
      .then((res) => {
        if (getResponse(res)) {
          notification.success();
          tabsTableList[activeTabKey].unSelectAll();
          tabsTableList[activeTabKey].clearCachedSelected();
          handleParamsQuery();
        }
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // 批量删除回调
  const handleDelete = () => {
    const curDataSet = tabsTableList[activeTabKey];
    const selectedRows = curDataSet.selected;
    curDataSet.delete(selectedRows);
  };

  // 筛选器左侧渲染
  const renderLeftSearchBar = useCallback(
    (_, queryDataSet) => {
      return (
        <MultipleTextField
          dataSet={queryDataSet}
          name="multiSelectReqNums"
          placeholder={intl.get('sslm.common.modal.sample.multiSelectReqNums').d('请输入申请单号')}
        />
      );
    },
    [activeTabKey]
  );

  const headerBtnRemoteProps = {
    loading,
    setLoading,
    activeTabKey,
    dataSet: tabsTableList[activeTabKey],
  };

  return (
    <Fragment>
      <Header
        title={intl.get('sslm.supplierQuotaApplication.view.title.quotaManage').d('配额申请单')}
      >
        <OperationButtons
          currentKey={activeTabKey}
          customizeBtnGroup={customizeBtnGroup}
          customizeBtnGroupCode="SSLM.SUP_QUOTA_APPLICATIONS_LIST.BTNS"
          onDelete={handleDelete}
          handleGoDetail={handleGoDetail}
          handleBatchSumbit={handleBatchSumbit}
          dataSet={tabsTableList[activeTabKey]}
          onExportParams={getQueryParams}
          loading={loading}
        />
        {quotaAppListRemote.render('SSLM_QUOTA_APP_LIST_HEADER_BTNS', null, headerBtnRemoteProps)}
      </Header>
      <Content>
        {customizeTabPane(
          {
            code: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TABS',
            custDefaultActive: (key) => {
              if (activeTabObj.initActiveKey) {
                handleTabChange(key || activeTabKey);
              }
            },
          },
          <Tabs activeKey={activeTabKey} onChange={handleTabChange}>
            {tabs.map(({ tabPane, key, countKey, searchBarCode, customizeUnitCode }) => (
              <TabPane tab={tabPane} key={key} count={countList[countKey]}>
                <div style={{ height: tableHeight.hasTab }}>
                  {customizeTable(
                    {
                      code: customizeUnitCode,
                    },
                    <SearchBarTable
                      key={key}
                      cacheState
                      dataSet={tabsTableList[key]}
                      columns={getColumns({
                        tabPaneKey: key,
                        handleGoDetail,
                        handleCopy,
                        handleSumbit,
                        approvalBtnInfo,
                      })}
                      custLoading={custLoading}
                      searchCode={searchBarCode}
                      searchBarRef={(ref) => {
                        searchBarRef = ref;
                      }}
                      searchBarConfig={{
                        left: {
                          render: renderLeftSearchBar,
                        },
                        onQuery: handleQuery,
                        autoQuery: false,
                      }}
                      style={{
                        maxHeight: tableMaxHeight.hasGroupTab,
                      }}
                    />
                  )}
                </div>
              </TabPane>
            ))}
          </Tabs>
        )}
      </Content>
    </Fragment>
  );
};

export default compose(
  formatterCollections({
    code: ['sslm.common', 'sslm.supplierQuotaApplication', 'sslm.supplierQuotaManage'],
  }),
  WithCustomize({
    unitCode: [
      'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TO_SUBMITTED_TABLE',
      'SSLM.SUP_QUOTA_APPLICATIONS_LIST.APPROVAL_TABLE',
      'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_TABLE',
      'SSLM.SUP_QUOTA_APPLICATIONS_LIST.BTNS',
      'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TABS',
    ],
  }),
  remote({
    code: 'SSLM_QUOTA_APP_LIST',
    name: 'quotaAppListRemote',
  }),
  withProps(
    (props) => {
      const { quotaAppListRemote } = props || {};
      const approvalDsProps = getSupplierQuotaDS({ tabKey: 'approval' });
      const remoteApprovalDsProps = quotaAppListRemote
        ? quotaAppListRemote.process('SSLM_QUOTA_APP_LIST_APPROVAL_DS_PROPS', approvalDsProps)
        : approvalDsProps;
      const toSubmittedDS = new DataSet(getSupplierQuotaDS({ tabKey: 'toSubmitted' })); // 待提交
      const approvalDS = new DataSet(remoteApprovalDsProps); // 审批中
      const allDS = new DataSet(getSupplierQuotaDS({ tabKey: 'all' })); // 全部
      toSubmittedDS.setQueryParameter('queryParam', {
        searchBarCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TO_SUBMITTED_SEARCH',
        tableCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.TO_SUBMITTED_TABLE',
        operationType: 'WAIT_SUBMIT',
      });
      approvalDS.setQueryParameter('queryParam', {
        searchBarCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.APPROVAL_SEARCH',
        tableCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.APPROVAL_TABLE',
        operationType: 'APPROVING',
      });
      allDS.setQueryParameter('queryParam', {
        searchBarCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_SEARCH',
        tableCode: 'SSLM.SUP_QUOTA_APPLICATIONS_LIST.ALL_TABLE',
        operationType: 'ALL',
      });

      const activeTabObj = {
        activeTabKey: 'toSubmitted',
        initActiveKey: true, // 是否初始化activeKey
      };
      return {
        tabsTableList: {
          toSubmitted: toSubmittedDS,
          approval: approvalDS,
          all: allDS,
        },
        activeTabObj,
      };
    },
    { cacheState: true }
  )
)(Index);
