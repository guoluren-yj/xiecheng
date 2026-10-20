/**
 * 8D - 审批意见
 * @date: 2018-11-29
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Table, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

const prefix = `sqam.common.view.message.title`;

export default class ApprovalOpinionModal extends PureComponent {
  onCell() {
    return {
      style: {
        overflow: 'hidden',
        maxWidth: 250,
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap',
      },
      onDoubleClick: (e) => {
        const { target } = e;
        if (target.style.whiteSpace === 'normal') {
          target.style.whiteSpace = 'nowrap';
        } else {
          target.style.whiteSpace = 'normal';
        }
      },
    };
  }

  render() {
    const { visible, dataSource, onCancel, loading } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.approver`).d('审批人'),
        dataIndex: 'createdName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.date`).d('审批时间'),
        dataIndex: 'operatedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.version`).d('版本号'),
        dataIndex: 'problemVersionNum',
        width: 80,
      },
      {
        title: intl.get(`${prefix}.action`).d('审批动作'),
        dataIndex: 'operationActionCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.approvalOpinion`).d('审批意见'),
        dataIndex: 'operatedRemark',
        width: 200,
        onCell: this.onCell.bind(this),
      },
      {
        title: intl.get(`sqam.common.model.qualityRectification.status`).d('状态'),
        dataIndex: 'problemStatusMeaning',
        width: 120,
      },
    ];
    return (
      <Modal
        width={800}
        visible={visible}
        title={intl.get(`${prefix}.approvalOpinion`).d('审批意见')}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
      >
        <Table
          bordered
          // resizable={false}
          rowKey="operationHistoryId"
          loading={loading}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Modal>
    );
  }
}
