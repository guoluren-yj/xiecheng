import React, { Component } from 'react';
import { Table, Modal } from 'hzero-ui';
import { dateTimeRender } from 'utils/renderer';

import intl from 'utils/intl';

const otherProps = {
  wrapClassName: 'ant-modal-sidebar-right',
  transitionName: 'move-right',
};

export default class HistoryModal extends Component {
  render() {
    const {
      visible,
      loading,
      onCancel,
      pagination,
      dataSource,
      onChange,
      history,
      rowKey,
    } = this.props;
    const historyColumns = [
      {
        title: intl.get('smodr.common.model.creationDate').d('日期时间'),
        width: 200,
        dataIndex: 'operationTime',
        render: dateTimeRender,
      },
      {
        title: intl.get('smodr.common.model.operatorName').d('操作人'),
        width: 200,
        dataIndex: 'userName',
      },
      {
        title: intl.get('smodr.common.model.description').d('内容'),
        width: 200,
        dataIndex: 'description',
      },
      {
        title: intl.get('smodr.common.model.sourceSystem').d('操作系统'),
        width: 200,
        dataIndex: 'sourceSystemMeaning',
      },
    ];
    const additionColumns = [
      {
        title: intl.get('smodr.common.model.time').d('单据名称'),
        width: 200,
        dataIndex: 'time',
        render: dateTimeRender,
      },
      {
        title: intl.get('smodr.common.model.remarkq').d('单据编码'),
        width: 100,
        dataIndex: 'remarkq',
      },
      {
        title: intl.get('smodr.common.model.remark').d('来源系统'),
        width: 200,
        dataIndex: 'remark',
      },
    ];
    return (
      <Modal
        destroyOnClose
        width={520}
        footer={null}
        title={
          history
            ? intl.get('smodr.common.title.historyRecord').d('操作记录')
            : intl.get('smodr.common.title.addInfo').d('附加信息')
        }
        visible={visible}
        onCancel={onCancel}
        {...otherProps}
      >
        <Table
          bordered
          columns={history ? historyColumns : additionColumns}
          loading={loading}
          rowKey={rowKey}
          dataSource={dataSource}
          pagination={history ? pagination : false}
          onChange={(page) => onChange(page)}
        />
      </Modal>
    );
  }
}
