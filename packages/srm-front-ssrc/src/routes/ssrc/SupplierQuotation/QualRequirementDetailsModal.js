/**
 * QualRequirementDetailsModal - 资质要求细项modal
 * @date: 2020-05-18
 * @author: Goku<xu.pan01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import React, { Component } from 'react';
import { Modal, Table } from 'hzero-ui';

import intl from 'utils/intl';
import { yesOrNoRender } from 'utils/renderer';

const promptCode = 'ssrc.supplierQuotation';

/**
 * QualRequirementDetailsModal - 展示型组件
 * @extends {Component} - React.Component
 * @reactProps {!boolean} [visible=false] - modal显隐控制
 * @reactProps {!boolean} [loading=false] - 数据加载loading
 * @reactProps {!Array} [dataSource=[]] - 数据源
 * @reactProps {!Function} [onCancel=e => {}] - 关闭弹窗回调函数
 * @returns React.element
 */

export default class QualRequirementDetailsModal extends Component {
  render() {
    const { onCancel, visible = false, loading = false, dataSource = [] } = this.props;
    const columns = [
      {
        title: intl.get(`${promptCode}.model.supQuo.indicateCode`).d('要素编码'),
        dataIndex: 'indicateCode',
        width: 120,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.indicateName`).d('要素名称'),
        dataIndex: 'indicateName',
        width: 150,
      },
      {
        title: intl.get(`${promptCode}.model.supQuo.mustApproved`).d('是否必须合格/通过'),
        dataIndex: 'mustApprovedFlag',
        align: 'center',
        width: 120,
        render: yesOrNoRender,
      },
    ];
    return (
      <Modal
        maskClosable
        width={750}
        visible={visible}
        onCancel={onCancel}
        title={intl.get(`${promptCode}.view.title.qRDetails`).d('资质要求细项')}
        footer={null}
      >
        <Table
          bordered
          loading={loading}
          rowKey="indicateId"
          dataSource={dataSource}
          columns={columns}
          pagination={false}
        />
      </Modal>
    );
  }
}
