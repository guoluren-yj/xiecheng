/**
 * 8D - 历史版本
 * @date: 2018-11-29
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Table, Button } from 'hzero-ui';
import intl from 'utils/intl';

const prefix = `sqam.common.model.qualityRectification`;

export default class HistoryVersionModal extends PureComponent {
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
    const { visible, dataSource, loading, onCancel, onDetail } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.version`).d('版本号'),
        dataIndex: 'versionNum',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.code`).d('整改报告编号'),
        dataIndex: 'problemNum',
        width: 100,
        render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
      },
      {
        title: intl.get(`${prefix}.title`).d('整改报告标题'),
        dataIndex: 'problemTitle',
        width: 180,
        onCell: this.onCell.bind(this),
      },
      {
        title: intl.get(`sqam.common.view.message.title.approvalOpinion`).d('审批意见'),
        dataIndex: 'approvedRemark',
        width: 200,
        onCell: this.onCell.bind(this),
      },
    ];
    return (
      <Modal
        width={800}
        visible={visible}
        title={intl.get(`sqam.common.view.message.title.historyVersion`).d('历史版本')}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
      >
        <Table
          bordered
          rowKey="problemHeaderHisId"
          loading={loading}
          resizable={false}
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Modal>
    );
  }
}
