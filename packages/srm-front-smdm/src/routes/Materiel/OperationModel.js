import React, { PureComponent, Fragment } from 'react';
import UploadModal from 'srm-front-boot/lib/components/Upload';
import { Modal, Tabs, Table, Spin } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';
import { PRIVATE_BUCKET } from '_utils/config';

const { TabPane } = Tabs;
const commonPrompt = 'sprm.common.model.common';

const onCell = () => {
  return {
    style: {
      overflow: 'hidden',
      maxWidth: 300,
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
    },
    onClick: (e) => {
      const { target } = e;
      if (target.style.whiteSpace === 'normal') {
        target.style.whiteSpace = 'nowrap';
      } else {
        target.style.whiteSpace = 'normal';
      }
    },
  };
};
const operationColumns = (isReq) => {
  return [
    {
      title: intl.get('entity.roles.operator').d('操作人'),
      dataIndex: 'processUserName',
      width: 100,
    },
    {
      title: intl.get(`${commonPrompt}.handleDate`).d('操作时间'),
      width: 150,
      dataIndex: 'creationDate',
      render: dateTimeRender,
    },
    {
      title: intl.get(`${commonPrompt}.motion`).d('动作'),
      width: 100,
      dataIndex: isReq ? 'processStatusMeaning' : 'actionCodeMeaning',
    },
    {
      title: intl.get(`${commonPrompt}.changeField`).d('修改内容'),
      width: 100,
      dataIndex: isReq ? 'changeFieldMeaning' : 'changeTabMeaning',
    },
    {
      title: intl.get(`${commonPrompt}.beforeModify`).d('修改前'),
      dataIndex: 'oldValue',
      onCell,
      width: 250,
    },
    {
      title: intl.get(`${commonPrompt}.afterModify`).d('修改后'),
      dataIndex: 'newValue',
      onCell,
      width: 250,
    },
  ];
};

const approveColumns = () => {
  return [
    {
      title: intl.get(`${commonPrompt}.handleDate`).d('操作时间'),
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
};
export default class OperationModel extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      visible,
      onClose,
      onlyOperation = false,
      operationData,
      approveData = [],
      dataLoading = false,
      isReq = false,
      pagination,
      handleOperationModel,
    } = this.props;

    const OperationTable = () => (
      <Table
        columns={operationColumns(isReq)}
        dataSource={operationData}
        bordered
        pagination={pagination}
        rowKey={(_, index) => `operation_${index}`}
        onChange={handleOperationModel}
      />
    );

    return (
      <Fragment>
        <Modal
          width={800}
          title={intl
            .get('smdm.materialApplication.model.materialApplication.operationRecords')
            .d('操作记录')}
          // placement="right"
          destroyOnClose
          visible={visible}
          closable
          footer={null}
          onCancel={() => onClose()}
        >
          <Spin spinning={dataLoading}>
            {onlyOperation ? (
              <OperationTable />
            ) : (
              <Tabs animated={false}>
                <TabPane
                  tab={intl
                    .get('smdm.materialApplication.model.materialApplication.operationRecords')
                    .d('操作记录')}
                  key="operation"
                >
                  <OperationTable />
                </TabPane>
                <TabPane
                  tab={intl.get(`sprm.common.model.common.approvalOperating`).d('审批记录')}
                  key="approve"
                >
                  <Table
                    columns={approveColumns()}
                    dataSource={approveData}
                    bordered
                    rowKey={(_, index) => `approve_${index}`}
                  />
                </TabPane>
              </Tabs>
            )}
          </Spin>
        </Modal>
      </Fragment>
    );
  }
}
