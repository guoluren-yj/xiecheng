/*
 * @Date: 2022-03-10 09:55:41
 * @Author: LXM <xiaomei.lv@going-link.com>
 * @Version: 0.0.1
 * @Copyright: Copyright (c) 2021, Hand
 */
import { isEmpty } from 'lodash';
import React, { useState, useEffect } from 'react';
import { Spin, Tabs } from 'choerodon-ui';
import { useDataSet } from 'choerodon-ui/pro';
import intl from 'utils/intl';
import { getResponse } from 'utils/utils';

import { queryOperationRecord } from '@/services/commonService';
import OperateContent from './OperateContent';
import ApproveContent from './ApproveContent';
import { getSearchDs } from './stores/getSearchDS';

const { TabPane } = Tabs;

const Content = ({ remote, modal, showFlag, onRef, ...rest }) => {
  const {
    documentId = '',
    documentType = '',
    approveDocumentType = '',
    isSupplier = false,
    commentRecordFlag = true,
    commentStartFlag = true,
  } = rest;
  const [dataSource, setDataSource] = useState([]);
  const [isWorkFlow, setWorkFlow] = useState(false);
  const [spinning, setSpinning] = useState(false);
  const [activeKey, setActiveKey] = useState('operate');
  // 是否有数据，区分首次查询暂无数据和查询条件导致的无数据
  const [hasData, setHasData] = useState(false);

  const newDocumentId =
    documentType === 'ENTERPRISE_TENANT_CONFIRM' ? rest.changeReqId : documentId;
  const searchDs = useDataSet(() => getSearchDs({ documentId: newDocumentId, documentType }), [
    newDocumentId,
    documentType,
  ]);

  const handleQuery = ({ params = {}, firstQuery } = {}) => {
    const { operateTime, ...others } = params;
    const newOperateTime = operateTime?.split(',') || [];
    setSpinning(true);
    // 查询操作记录
    queryOperationRecord({
      ...rest,
      ...others,
      operateTimeFrom: newOperateTime[0],
      operateTimeTo: newOperateTime[1],
    })
      .then(response => {
        const res = getResponse(response);
        if (res) {
          if (firstQuery) {
            const approvalMethodList = (res.content || res || []).map(n => n.approvalMethod);
            const workFlowFlag =
              approvalMethodList.includes('WFL') ||
              approvalMethodList.includes('WFL_ONLY') ||
              approvalMethodList.includes('SUPPLIER_SUBMIT') ||
              approvalMethodList.includes('SUPPLIER_WFL') ||
              approvalMethodList.includes('PURCHASE_WFL') ||
              approvalMethodList.includes('WORKFLOW_APPROVAL');
            setWorkFlow(workFlowFlag);
            setHasData(!isEmpty(res.content || res));
          }
          setDataSource(res.content || res);
        }
      })
      .finally(() => setSpinning(false));
  };

  useEffect(() => {
    handleQuery({ firstQuery: true });
  }, [documentId]);

  const handleTabChange = key => {
    setActiveKey(key);
  };

  const operateProps = {
    onRef,
    remote,
    hasData,
    searchDs,
    showFlag,
    dataSource,
    documentType,
    handleTabChange,
    onQuery: handleQuery,
  };

  return (
    <Spin spinning={spinning}>
      {!isWorkFlow || isSupplier ? (
        <OperateContent {...operateProps} />
      ) : (
        <Tabs animated={false} activeKey={activeKey} onChange={handleTabChange}>
          <TabPane tab={intl.get('hzero.common.button.operated').d('操作记录')} key="operate">
            <OperateContent {...operateProps} />
          </TabPane>
          <TabPane tab={intl.get('sslm.common.button.approveRecords').d('审批记录')} key="approve">
            <ApproveContent
              documentType={approveDocumentType || documentType}
              documentId={documentId}
              commentRecordFlag={commentRecordFlag} // 是否展示评论信息
              commentStartFlag={commentStartFlag} // 是否展示评论按钮
            />
          </TabPane>
        </Tabs>
      )}
    </Spin>
  );
};

export default Content;
