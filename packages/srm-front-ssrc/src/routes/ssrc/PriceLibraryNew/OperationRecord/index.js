import React, { useState, useCallback, useEffect } from 'react';
import { isEmpty } from 'lodash';
import { Tabs, Spin } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';
import classnames from 'classnames';

import intl from 'utils/intl';
import ApproveRecord from '_components/ApproveRecord';
import ApproveRecordGroup from '_components/ApproveRecordGroup';
import { getResponse } from 'utils/utils';
import { getSearchDs } from '@/routes/spc/components/OperationRecord/getSearchDS';
import { fetchApprovalRecords, fetchOperationRecords } from '@/services/priceLibraryNewService';
import OperationList from './OperationList';
import styles from './index.less';

const { TabPane } = Tabs;

const OperationRecord = (props) => {
  const { onRef, docType, docId, priceLibId, approvalRecords, title, remote } = props;
  const [operationList, setOperationList] = useState([]);
  const [activeKey, setActiveKey] = useState('operation');
  const [approvalList, setApprovalList] = useState([]);
  const [fetchOperationLoading, setOperationLoading] = useState(false);
  const [fetchApprovalLoading, setFetchApprovalLoading] = useState(false);
  // 是否有数据，区分首次查询暂无数据和查询条件导致的无数据
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    fetchOperationRecord({ firstQuery: true });
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
  const fetchOperationRecord = async ({ params = {}, firstQuery = false } = {}) => {
    const { operateTime, ...others } = params;
    const newOperateTime = operateTime?.split(',') || [];
    setOperationLoading(true);
    const res = await fetchOperationRecords({
      docType,
      docId: docId || priceLibId,
      ...others,
      operateTimeFrom: newOperateTime[0],
      operateTimeTo: newOperateTime[1],
    });
    if (res) {
      if (getResponse(res)) {
        if (firstQuery) {
          setHasData(!isEmpty(res?.content));
        }
        setOperationList(res?.content);
      }
    }
    setOperationLoading(false);
  };

  // 审批记录
  const fetchApprovalRecord = async () => {
    setFetchApprovalLoading(true);
    const res = approvalRecords || (await fetchApprovalRecords({ docType, priceLibId }));
    if (getResponse(res)) {
      const list = res.map((item) => {
        return {
          children: [].concat(
            ...(item.approvalHistories
              ? item.approvalHistories.map((hisItem) => hisItem.historicTaskExtList) || []
              : (item?.historicTaskExtList || []).reverse())
          ),
          processType: item.processType,
          title: item.processTypeMeaning,
        };
      });
      setApprovalList(list);
    }
    setFetchApprovalLoading(false);
  };

  // 工作流点击切换
  const handleViewDetail = (item) => {
    if (
      ['APPROVE_SUCCESS', 'EXT_APPROVE_SUCCESS', 'APPROVE_REJECT', 'EXT_APPROVE_REJECT'].includes(
        item.actionCode
      )
    ) {
      setActiveKey('approval');
    }
  };

  const searchDs = useDataSet(() => getSearchDs(docId, docType), [docId, docType]);

  const operateProps = {
    onRef,
    remote,
    hasData,
    searchDs,
    initTitle: title,
    dataSource: operationList,
    onViewDetail: handleViewDetail,
    onQuery: fetchOperationRecord,
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
                approvalList?.[0].title ? (
                  <ApproveRecordGroup
                    className={classnames(styles['approval-list-wrap'])}
                    group={approvalList}
                  />
                ) : (
                  <ApproveRecord data={approvalList[0]?.children} />
                )
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
