/**
 * 主容器组件
 */
import React, { useState, useCallback, useEffect } from 'react';
import { Tabs, Spin } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';

import { getResponse } from 'utils/utils';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { isEmpty } from 'lodash';

import { fetchOperationRecords, fetchApprovalRecords } from './service';
// import DynamicComponent from '@/routes/components/DynamicComponent';
import OperationList from './OperationList';
import NewApprovalList from './NewApprovalList';
import { getSearchDs } from './stores/getSearchDS';

const { TabPane } = Tabs;

function Container({ remote, showFlag, onRef, documentId, documentType, ...props }) {
  const [activeKey, setActiveKey] = useState('operation');
  const [operationList, setOperationList] = useState([]);
  const [detailFlag, setDetailFlag] = useState(false); // 是否是从审批记录通过或者拒绝点进去的
  const [currentNodeId, setCurrentNodeId] = useState('');
  const [approveRecordData, setApproveRecordData] = useState();
  const [allApproveKey, setAllApproveKey] = useState([]);
  const [fetchApprovalLoading, setApprovalLoading] = useState(false);
  // 是否有数据，区分首次查询暂无数据和查询条件导致的无数据
  const [hasData, setHasData] = useState(false);

  const [fetchOperationLoading, setOperationLoading] = useState(false);

  const searchDs = useDataSet(() => getSearchDs({ documentId, documentType }), [
    documentId,
    documentType,
  ]);

  const getOperationRecords = ({ params = {}, firstQuery } = {}) => {
    const { operateTime, ...others } = params;
    const newOperateTime = operateTime?.split(',') || [];
    setOperationLoading(true);
    fetchOperationRecords({
      ...others,
      pcHeaderId: props.pcHeaderId || documentId,
      operateTimeFrom: newOperateTime[0],
      operateTimeTo: newOperateTime[1],
      page: 0,
      size: 10000,
    })
      .then((res) => {
        if (getResponse(res)) {
          if (firstQuery) {
            setHasData(!isEmpty(res.content));
          }
          setOperationList(res.content);
        }
      })
      .finally(() => setOperationLoading(false));
  };

  // 获取审批记录数据
  const getApprovalRecords = async (params) => {
    if (remote?.event) {
      const res = await remote.event.fireEvent('handleCuxGetApprovalRecords', {
        props,
        setAllApproveKey,
        setApproveRecordData,
        setApprovalLoading,
        params,
      });
      if (!res) {
        return;
      }
    }
    setApprovalLoading(true);
    fetchApprovalRecords(params)
      .then((res) => {
        const activeKeyArr = [];
        const result = getResponse(res);
        if (result) {
          // 按需对接口返回的审批记录数据进行处理
          const approveRecordDataResult = [].concat(
            result.map((item) => {
              activeKeyArr.push(item.processType);
              return {
                children: [].concat(
                  ...(item.approvalHistories.map(
                    (hisItem, index) =>
                      item.approvalHistories[item.approvalHistories.length - index - 1]
                        .historicTaskExtList
                  ) || [])
                ),
                title: item.processTypeMeaning,
              };
            })
          );
          setAllApproveKey(activeKeyArr);
          setApproveRecordData(approveRecordDataResult);
        }
      })
      .finally(() => {
        setApprovalLoading(false);
      });
  };

  useEffect(() => {
    getApprovalRecords(props);
    getOperationRecords({ firstQuery: true });
  }, [documentId]);

  const handleChangeTab = useCallback(
    (tabKey) => {
      if (activeKey === tabKey) return;
      setActiveKey(tabKey);
      if (tabKey !== 'approval') setDetailFlag(false);
    },
    [activeKey]
  );

  const handleViewDetail = useCallback((currentId) => {
    setDetailFlag(true);
    setCurrentNodeId(currentId);
    setActiveKey('approval');
  }, []);

  const operationProps = {
    onRef,
    remote,
    hasData,
    searchDs,
    showFlag,
    dataSource: operationList,
    hasTab: !isEmpty(approveRecordData),
    onViewDetail: handleViewDetail,
    onQuery: getOperationRecords,
  };

  return (
    <Spin spinning={fetchOperationLoading || fetchApprovalLoading}>
      {isEmpty(approveRecordData) ? (
        <OperationList {...operationProps} />
      ) : (
        <Tabs defaultActiveKey={activeKey} activeKey={activeKey} onChange={handleChangeTab}>
          <TabPane key="operation" tab={intl.get(`hzero.common.button.operating`).d('操作记录')}>
            <OperationList {...operationProps} />
          </TabPane>
          <TabPane
            key="approval"
            tab={intl.get(`hzero.common.button.approveHistory`).d('审批记录')}
          >
            <NewApprovalList
              allApproveKey={allApproveKey}
              approveRecordData={approveRecordData}
              pageData={{ detailFlag, currentNodeId, ...props }}
            />
          </TabPane>
        </Tabs>
      )}
    </Spin>
  );
}

export default formatterCollections({
  code: ['spcm.common'],
})(Container);
