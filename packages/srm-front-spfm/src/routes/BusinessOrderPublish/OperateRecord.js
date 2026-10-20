/**
 * OperateRecord -操作记录
 * @date: 2020-2-24
 * @author zjx <jingxi.zhang@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Modal, Table, Tabs } from 'hzero-ui';
import { Bind } from 'lodash-decorators';
import { connect } from 'dva';
import { isFunction } from 'lodash';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

const { TabPane } = Tabs;
@connect(({ businessOrderPublish, loading }) => ({
  businessOrderPublish,
  fetchOperateLoading: loading.effects['businessOrderPublish/fetchOperate'],
  fetchApproveRecordLoading: loading.effects['businessOrderPublish/fetchApproveRecord'],
}))
/**
 * 使用操作记录
 * @extends {Component} - React.Component
 * @return React.element
 */
export default class OperateRecord extends Component {
  constructor(props) {
    super(props);
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
    this.state = {
      operateVisible: false,
    };
  }

  /**
   * 操作记录modal
   */
  @Bind()
  handleOperatedModal() {
    this.setState(
      {
        operateVisible: true,
      },
      () => {
        this.fetchOperateRecord();
      }
    );
  }

  /**
   * 关闭操作记录
   */
  @Bind()
  handleCloseOperate() {
    this.setState({
      operateVisible: false,
    });
  }

  /**
   * 查询操作记录
   */
  @Bind()
  fetchOperateRecord(page = {}) {
    const { dispatch, notificationId } = this.props;
    dispatch({
      type: 'businessOrderPublish/fetchOperate',
      payload: {
        page,
        notificationId,
      },
    });
    dispatch({
      type: 'businessOrderPublish/fetchApproveRecord',
      payload: {
        notificationId,
      },
    });
  }

  approveColumns = [
    {
      title: intl.get('spfm.notice.model.actionDetail.processDate').d('操作时间'),
      width: 150,
      dataIndex: 'approveTime',
      render: dateTimeRender,
    },
    {
      title: intl.get('hwfp.common.model.approval.action').d('审批动作'),
      dataIndex: 'approveActionMeaning',
      width: 120,
    },
    {
      title: intl.get('hwfp.common.model.approval.step').d('审批环节'),
      dataIndex: 'approveMethodMeaning',
      width: 150,
    },
    {
      title: intl.get('hwfp.common.model.approval.owner').d('审批人'),
      dataIndex: 'processUserName',
      width: 150,
    },
    {
      title: intl.get('hwfp.common.model.approval.opinion').d('审批意见'),
      dataIndex: 'approveComment',
      width: 150,
    },
    {
      title: intl.get('hwfp.common.model.approval.file').d('附件'),
      dataIndex: 'attachmentUuid',
      width: 100,
      render: (val, record) => {
        if (record.attachmentUuid) {
          return <UploadModal attachmentUUID={val} bucketName={PRIVATE_BUCKET} viewOnly />;
        }
      },
    },
  ];

  render() {
    const { operateVisible } = this.state;
    const {
      fetchOperateLoading = false,
      fetchApproveRecordLoading = false,
      businessOrderPublish: { operateRecord = [], operatePagination = {}, approveData = [] },
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.roles.operator').d('操作人'),
        dataIndex: 'processUserName',
        width: 150,
      },
      {
        title: intl.get('spfm.businessOrder.model.businessOrder.processDate').d('操作日期'),
        dataIndex: 'processDate',
        width: 120,
        render: dateTimeRender,
      },
      {
        title: intl.get(`hzero.common.action`).d('操作'),
        dataIndex: 'processOperationMeaning',
        width: 100,
      },
      {
        title: intl.get(`hzero.common.model.remark`).d('备注'),
        dataIndex: 'processRemark',
        width: 100,
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get(`hzero.common.button.operating`).d('操作记录')}
        visible={operateVisible}
        footer={null}
        width={800}
        onCancel={this.handleCloseOperate}
      >
        <Tabs animated={false}>
          <TabPane tab={intl.get('hzero.common.button.operatRecord').d('操作记录')} key="operation">
            <Table
              bordered
              loading={fetchOperateLoading}
              rowKey="productHistoryId"
              dataSource={operateRecord}
              columns={columns}
              pagination={operatePagination}
              onChange={(page) => this.fetchOperateRecord(page)}
            />
          </TabPane>
          <TabPane tab={intl.get(`hzero.common.button.approveHistory`).d('审批记录')} key="approve">
            <Table
              columns={this.approveColumns}
              loading={fetchApproveRecordLoading}
              dataSource={approveData}
              bordered
              pagination={false}
              rowKey={(_, index) => `approve_${index}`}
            />
          </TabPane>
        </Tabs>
      </Modal>
    );
  }
}
