/**
 * OperationRecord  - 操作记录通用组件
 * @date: 2019-1-25
 * @author: guochaochao <chaochao.guo@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import { Modal, Tabs, Table, Tooltip } from 'hzero-ui';
import { sum } from 'lodash';
import { Bind } from 'lodash-decorators';
import moment from 'moment';

import { dateTimeRender } from 'utils/renderer';
import intl from 'utils/intl';
import formatterCollections from 'utils/intl/formatterCollections';
import UploadModal from 'components/Upload';
import { approveNameRender } from '@/utils/utils';

const prefix = 'sprm.purchaseRequisitionApproval.model.common';
const prefix1 = 'sqam.common.model.qualityRectification';
const { TabPane } = Tabs;

@formatterCollections({
  code: ['entity.roles', 'sprm.purchaseRequisitionApproval'],
})
@withRouter
export default class OperationRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  // getSnapshotBeforeUpdate(preProps) {
  //   const { visible } = preProps;
  //   if (!visible && visible !== this.props.visible) {
  //     return true;
  //   }
  //   return false;
  // }

  // componentDidUpdate(props, state, snap) {
  //   if (snap) {
  //     const { handleOperationRecordSearch, handleApprovalRecordSearch } = this.props;
  //     if (isFunction(handleOperationRecordSearch)) {
  //       handleOperationRecordSearch();
  //     }
  //     if (isFunction(handleApprovalRecordSearch)) {
  //       handleApprovalRecordSearch();
  //     }
  //   }
  // }

  /**
   * onCell - 设置表格单元格属性函数
   */
  @Bind()
  onCell() {
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
  }

  @Bind()
  handleChange = (_, i, { order }) => {
    const { approvalDataSource = [] } = this.props;
    approvalDataSource.sort(({ endTime: a }, { endTime: b }) =>
      order === 'ascend'
        ? moment(a).valueOf() - moment(b).valueOf()
        : moment(b).valueOf() - moment(a).valueOf()
    );
  };

  render() {
    const {
      loading,
      visible,
      hideModal,
      pagination,
      dataSource,
      handleOperationRecordSearch,
      // approvalPagination,
      approvalDataSource,
      // handleApprovalRecordSearch,
      approvalLoading,
      activeKey,
      handleTabKey,
      isWorkFlow = true,
    } = this.props;
    const columns = [
      {
        title: intl.get('entity.roles.operator').d('操作人'),
        dataIndex: 'processUserName',
        width: 70,
      },
      {
        title: intl.get(`${prefix}.handleDate`).d('操作时间'),
        width: 100,
        dataIndex: 'creationDate',
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.motion`).d('动作'),
        width: 70,
        dataIndex: 'processTypeName',
      },
      {
        title: intl.get(`${prefix}.processRemark`).d('操作备注'),
        width: 150,
        dataIndex: 'processRemark',
      },
    ];
    const approvalColumns = [
      {
        title: intl.get(`${prefix1}.approvalName`).d('审批人'),
        dataIndex: 'assigneeName',
        width: 150,
      },
      {
        title: intl.get(`${prefix1}.approvalAction`).d('审批操作'),
        dataIndex: 'action',
        width: 150,
        render: approveNameRender,
      },
      {
        title: intl.get(`${prefix1}.approvalTime`).d('时间'),
        dataIndex: 'endTime',
        width: 150,
        render: dateTimeRender,
        sorter: true,
      },
      {
        title: intl.get(`${prefix1}.approvalRemark`).d('审批说明'),
        dataIndex: 'comment',
        width: 150,
        render: (val) => <Tooltip title={val}>{val}</Tooltip>,
      },
      {
        title: intl.get(`${prefix1}.attachment`).d('附件'),
        dataIndex: 'attachmentUuid',
        width: 150,
        render: (val, record) => {
          if (record.attachmentUuid) {
            return (
              <UploadModal
                attachmentUUID={val}
                bucketName={window.$$env.PRIVATE_BUCKET || 'private-bucket'}
                viewOnly
              />
            );
          }
        },
        fixed: 'right',
      },
    ];
    const modalProps = {
      visible,
      width: 750,
      footer: null,
      onCancel: hideModal,
      bodyStyle: { maxHeight: '600px', overflow: 'auto' },
      title: !isWorkFlow ? intl.get(`hzero.common.button.operating`).d('操作记录') : '',
    };
    const tableProps = {
      loading,
      columns,
      dataSource,
      pagination,
      bordered: true,
      rowKey: (record, index) => index,
      onChange: handleOperationRecordSearch,
    };
    const approvalTableProps = {
      loading: approvalLoading,
      columns: approvalColumns,
      dataSource: approvalDataSource,
      // pagination: approvalPagination,
      bordered: true,
      rowKey: (record, index) => index,
      onChange: this.handleChange,
    };
    tableProps.scroll = { x: sum(tableProps.columns.map((n) => n.width)) + 300 };
    return (
      <Modal {...modalProps}>
        {isWorkFlow ? (
          <Tabs animated={false} activeKey={activeKey} onChange={(key) => handleTabKey(key)}>
            <TabPane
              tab={intl.get(`hzero.common.view.message.operateHistory`).d('操作记录')}
              key="operator"
            >
              <Table {...tableProps} />
            </TabPane>
            <TabPane
              tab={intl.get(`sqam.common.model.qualityRectification.approvalRecord`).d('审批记录')}
              key="approval"
            >
              <Table {...approvalTableProps} />
            </TabPane>
          </Tabs>
        ) : (
          <Table {...tableProps} />
        )}
      </Modal>
    );
  }
}
