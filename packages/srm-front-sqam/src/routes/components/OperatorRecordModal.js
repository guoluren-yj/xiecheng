/**
 * 8D - 操作记录
 * @date: 2018-11-29
 * @author: WH <heng.wei@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Table, Button } from 'hzero-ui';
import intl from 'utils/intl';
import { dateTimeRender } from 'utils/renderer';

const prefix = `sqam.common.model.qualityRectification`;

export default class OperatorRecordModal extends PureComponent {
  render() {
    const { visible, dataSource, loading, onCancel, addRemark = false } = this.props;
    const columns = [
      {
        title: intl.get(`${prefix}.version`).d('版本号'),
        dataIndex: 'problemVersionNum',
        width: 80,
      },
      {
        title: intl.get(`entity.roles.operator`).d('操作人'),
        dataIndex: 'createdName',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.operationTime`).d('操作时间'),
        dataIndex: 'operatedDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${prefix}.action`).d('动作'),
        dataIndex: 'operationActionCodeMeaning',
        width: 100,
      },
      {
        title: intl.get(`${prefix}.status`).d('状态'),
        dataIndex: 'problemStatusMeaning',
        width: 120,
      },
    ];
    if (addRemark) {
      columns.push({
        title: intl.get(`${prefix}.operatedRemark`).d('操作备注'),
        dataIndex: 'operatedRemark',
        width: 150,
      });
    }
    return (
      <Modal
        visible={visible}
        title={intl.get(`hzero.common.button.operating`).d('操作记录')}
        onCancel={onCancel}
        footer={[
          <Button key="cancel" onClick={onCancel}>
            {intl.get('hzero.common.button.close').d('关闭')}
          </Button>,
        ]}
        width={800}
      >
        <Table
          bordered
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
