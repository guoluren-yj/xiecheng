/**
 * OperationsRecordModal - 供应商生命周期单据 - 操作记录弹窗
 * @date: 2021-6-3
 * @author: 杨一昊 <yihao.yang@going-link.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2021, Hand
 */
import React, { useEffect, useState } from 'react';
import { Modal, Table, Tabs, Tag } from 'hzero-ui';
import { compose } from 'lodash';
import { approveNameRender, dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import { connect } from 'dva';
import remotes from 'utils/remote';

const { TabPane } = Tabs;

const OperationsRecordModal = ({
  info,
  remote,
  visible,
  onClose,
  processType,
  requisitionId,
  recordsData,
  reviewData,
  dispatch,
  isShowReviewRecord = true,
}) => {
  const { historicTaskExtList = [] } = (reviewData && reviewData[0]) || {};

  const { targetStageDescription = ''} = info || {};

  const [recordsLoading, setRecordsLoading] = useState(false);
  const [reviewLoading, setReviewLoading] = useState(false);


  const columns = [
    {
      key: 'realName',
      title: intl.get('sslm.commonApplication.modal.table.operationRecords').d('操作人'),
      dataIndex: 'realName',
    },
    {
      key: 'processDate',
      title: intl.get('sslm.commonApplication.modal.table.operationRecordDate').d('操作时间'),
      dataIndex: 'processDate',
      render: dateTimeRender,
    },
    {
      key: 'processStatusMeaning',
      title: intl.get('sslm.commonApplication.modal.table.operations').d('操作'),
      dataIndex: 'processStatusMeaning',
    },
    {
      key: 'processRemark',
      title: intl.get('sslm.commonApplication.modal.table.processRemark').d('审批意见'),
      dataIndex: 'processRemark',
    },
  ];

  const actionType = {
    startEvent: intl.get('hzero.common.text.startEvent').d('开始'),
    userTask: intl.get('hzero.common.text.userTask').d('审批中'),
    endEvent: intl.get('hzero.common.text.endEvent').d('结束'),
  };


  const reviewColumns = () => {
    const lineColumns = [
      {
        key: 'name',
        title: intl.get('sslm.operatingRecord.model.approveHistory.approvalNode').d('审批节点'),
        dataIndex: 'name',
        render: (val, { actType }) => val || actionType[actType],
      },
      {
        key: 'action',
        title: intl.get('sslm.operatingRecord.model.approveHistory.action').d('审批动作'),
        dataIndex: 'action',
        render: (action, { actType }) => {
          if (action) {
            return approveNameRender(action);
          } else if (actType === 'startEvent') {
            return <Tag color="green">{intl.get('hwfp.common.status.start').d('开始')}</Tag>;
          } else if (actType === 'endEvent') {
            return <Tag>{intl.get('hwfp.common.status.end').d('结束')}</Tag>;
          } else if (actType) {
            return <Tag>{intl.get('hwfp.common.view.message.approvaling').d('审批中')}</Tag>;
          } else {
            return '';
          }
        },
      },
      {
        key: 'assigneeName',
        title: intl.get('sslm.operatingRecord.model.approveHistory.assigneeName').d('审批人'),
        dataIndex: 'assigneeName',
      },
      {
        key: 'comment',
        title: intl.get('sslm.operatingRecord.model.approveHistory.comment').d('审批意见'),
        dataIndex: 'comment',
      },
      {
        key: 'startTime',
        title: intl.get('sslm.operatingRecord.model.approveHistory.assigneeDate').d('审批时间'),
        dataIndex: 'startTime',
        render: (val, { actType, endTime }) => {
          if (actType === 'startEvent') {
            return dateTimeRender(val);
          } else {
            return dateTimeRender(endTime);
          }
        },
      }
    ];
    return remote?.process('processHistoryColumns', lineColumns, {targetStageDescription});
  };

  useEffect(() => {
    if (processType && requisitionId && visible) {
      setRecordsLoading(true);
      setReviewLoading(true);
      dispatch({
        type: 'commonApplication/getReviewRecord',
        payload: { requisitionId },
      }).finally(() => {
        setReviewLoading(false);
      });
      dispatch({
        type: 'commonApplication/getOperationsRecord',
        payload: { processType, requisitionId },
      }).finally(() => {
        setRecordsLoading(false);
      });
    }
    return () => {
      dispatch({
        type: 'commonApplication/clearOperationsRecord',
      });
    };
  }, [processType, requisitionId, visible]);

  return (
    <Modal width={650} visible={visible} onCancel={onClose} footer={null}>
      <Tabs animated={false} defaultActiveKey="operationRecord">
        <TabPane
          tab={intl.get('sslm.operatingRecord.view.operatingRecord.record').d('操作记录')}
          key="operationRecord"
        >
          <Table
            bordered
            loading={recordsLoading}
            dataSource={recordsData}
            pagination={false}
            columns={columns}
          />
        </TabPane>
        {isShowReviewRecord && (
          <TabPane
            tab={intl.get('sslm.operatingRecord.view.reviewRecord.record').d('审批记录')}
            key="reviewRecord"
          >
            <Table
              loading={reviewLoading}
              dataSource={historicTaskExtList}
              pagination={null}
              columns={reviewColumns()}
              bordered
            />
          </TabPane>
        )}
      </Tabs>
    </Modal>
  );
};

export default compose(
  connect(({ commonApplication }) => {
    return {
      recordsData: commonApplication.operationsRecord,
      reviewData: commonApplication.reviewRecord,
    };
  }),
  formatterCollections({
    code: ['sslm.commonApplication', 'sslm.operatingRecord', 'hwfp.common', 'hzero.common'],
  }),
  remotes(
    { code: 'SSLM_SUPPLIERLIFE_OPERATING_RECORD_MODAL' },
    {
      process: {
        processHistoryColumns: (columns) => columns,
      },
    },
  ),
)(OperationsRecordModal);