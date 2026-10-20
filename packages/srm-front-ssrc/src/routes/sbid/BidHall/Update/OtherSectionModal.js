/**
 * OtherSectionModal - 招标大厅-移到其它标段Modal
 * @date: 2019 9/16
 * @author: jing.chen05@hand-china.com
 * @version: 0.0.1
 * @copyright Copyright (c) 2019, Hand
 */

import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Modal, Form, Table } from 'hzero-ui';

import intl from 'utils/intl';

import styles from '@/routes/ssrc/common.less';

@Form.create({ fieldNameProp: null })
export default class OtherSectionModal extends Component {
  state = {
    selectedRows: [], // 选中项
  };

  /**
   * 选中项发生变化时的回调
   */
  @Bind()
  handleSelectChange(_, selectedRows) {
    this.setState({ selectedRows });
  }

  /**
   * 单击某行时的回调
   */
  @Bind()
  handleRowClick(record) {
    this.setState({
      selectedRows: [record],
    });
  }

  /**
   * 移到其它标段操作
   */
  @Bind()
  onOk() {
    const { selectedRows } = this.state;
    const { onMove } = this.props;

    if (!isEmpty(selectedRows)) {
      onMove(selectedRows);
    } else {
      Modal.warning({
        title: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
    }
  }

  render() {
    const { onCancel, onChange, saveLoading, loading, moveModelVisible, dataSource } = this.props;
    const { selectedRows } = this.state;
    const rowSelection = {
      type: 'radio',
      selectedRowKeys: selectedRows.map((n) => n.bidLineItemId),
      onChange: this.handleSelectChange,
    };
    const columns = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionNum`).d('标段编号'),
        dataIndex: 'sectionNum',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.sectionName`).d('标段名称'),
        dataIndex: 'sectionName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.demandDate`).d('需求日期'),
        dataIndex: 'demandDate',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.businessUnit`).d('业务实体'),
        dataIndex: 'ouName',
        width: 120,
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.inventoryOrg`).d('库存组织'),
        dataIndex: 'invOrganizationName',
        width: 120,
      },
    ];
    return (
      <Modal
        width={720}
        onCancel={onCancel}
        onOk={this.onOk}
        confirmLoading={saveLoading}
        wrapClassName={styles['category-modal']}
        visible={moveModelVisible}
        title={intl.get(`ssrc.bidHall.view.message.title.selectSection`).d('选择标段')}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        cancelText={intl.get('hzero.common.button.cancel').d('取消')}
      >
        <Table
          bordered
          columns={columns}
          rowKey="bidLineItemId"
          loading={loading}
          dataSource={dataSource}
          onChange={onChange}
          rowSelection={rowSelection}
          pagination={false}
          onRow={(record, index) => {
            return {
              onClick: () => this.handleRowClick(record, index),
            };
          }}
        />
      </Modal>
    );
  }
}
