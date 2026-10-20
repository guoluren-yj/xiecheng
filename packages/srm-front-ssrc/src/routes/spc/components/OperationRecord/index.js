import React, { useState, useCallback, useEffect } from 'react';
import intl from 'utils/intl';
import { Tabs, Spin } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';
// import classnames from 'classnames';

import ApproveRecord from '_components/ApproveRecord';
// import ApproveRecordGroup from '_components/ApproveRecordGroup';
import { getResponse } from 'utils/utils';
import {
  fetchHistoryInfo,
  fetchOperationRecords,
} from '@/services/priceAdjustmentWorkbenchService';
import { approvedList, rejectionList } from './utils';
import OperationList from './OperationList';
import styles from './index.less';
import { getSearchDs } from './getSearchDS';

const { TabPane } = Tabs;

const OperationRecord = (props) => {
  const {
    onRef,
    showFlag,
    operateParams,
    operationRecors,
    approvalRecords,
    title,
    businessKey,
    fieldParam = {},
    onlyOperation,
  } = props;
  const [operationList, setOperationList] = useState([]);
  const [activeKey, setActiveKey] = useState('operation');
  const [approvalList, setApprovalList] = useState([]);
  const [fetchOperationLoading, setOperationLoading] = useState(false);
  const [fetchApprovalLoading, setFetchApprovalLoading] = useState(false);
  const { actionCode = 'actionCode' } = fieldParam;
  const { docId, docType } = operateParams || {};

  useEffect(() => {
    fetchOperationRecord();
    fetchApprovalRecord();
  }, []);

  // tab页切换
  const handleChangeTab = useCallback(
    (tabKey) => {
      if (tabKey === activeKey) return;
      setActiveKey(tabKey);
    },
    [activeKey]
  );

  // 操作记录
  const fetchOperationRecord = async (params = {}) => {
    setOperationLoading(true);
    const res = operationRecors || (await fetchOperationRecords({ ...operateParams, ...params }));
    if (res) {
      if (getResponse(res)) {
        setOperationList(res.length ? res : res?.content);
      }
    }
    setOperationLoading(false);
  };

  // 审批记录
  const fetchApprovalRecord = async () => {
    if (onlyOperation) {
      return false;
    }
    setFetchApprovalLoading(true);
    const res = approvalRecords || (await fetchHistoryInfo(businessKey));
    if (getResponse(res)) {
      const list = [].concat(...res.map((item) => item.historicTaskExtList || []));
      setApprovalList(list.reverse());
    }
    setFetchApprovalLoading(false);
  };

  // 工作流点击切换
  const handleViewDetail = (item) => {
    if ([...approvedList, ...rejectionList].includes(item[actionCode])) {
      setActiveKey('approval');
    }
  };

  // 筛选器ds
  const searchDs = useDataSet(() => getSearchDs(docId, docType), [docId, docType]);

  // 筛选器查询
  const handleQuery = ({ params = {} } = {}) => {
    const { operateTime, ...others } = params;
    const newOperateTime = operateTime?.split(',') || [];
    fetchOperationRecord({
      ...others,
      operateTimeFrom: newOperateTime[0],
      operateTimeTo: newOperateTime[1],
    });
  };

  const operateProps = {
    onRef,
    showFlag,
    searchDs,
    fieldParam,
    initTitle: title,
    dataSource: operationList,
    onQuery: handleQuery,
    onViewDetail: handleViewDetail,
  };

  return (
    <Spin spinning={fetchOperationLoading}>
      {approvalList.length ? (
        <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
          <TabPane
            key="operation"
            tab={intl.get('ssrc.common.view.title.operationRecord').d('操作记录')}
          >
            <OperationList {...operateProps} />
          </TabPane>
          <TabPane
            key="approval"
            tab={intl.get('ssrc.common.view.title.approvalRecord').d('审批记录')}
          >
            <Spin spinning={fetchApprovalLoading}>
              {approvalList.length ? (
                <ApproveRecord data={approvalList} />
              ) : (
                <div className={styles['empty-wrapper']}>
                  <span>{intl.get('ssrc.common.view.message.emptyData').d('暂无数据')}</span>
                </div>
              )}
            </Spin>
          </TabPane>
        </Tabs>
      ) : (
        <OperationList {...operateProps} />
      )}
    </Spin>
  );
};

export default OperationRecord;
