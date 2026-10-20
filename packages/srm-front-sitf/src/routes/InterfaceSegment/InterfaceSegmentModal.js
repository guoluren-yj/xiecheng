/**
 * InterfaceSegmentModal -接口表结构定义-modal 编辑
 * @date: 2018-9-20
 * @author DTM <tingmin.deng@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Modal, Form, Table } from 'hzero-ui';
import { connect } from 'dva';
import { Bind } from 'lodash-decorators';

import intl from 'utils/intl';

/**
 * 编辑模态框数据展示
 * @extends {PureComponent} - React.PureComponent
 * @reactProps {Function} onCancel - 取消模态框
 * @reactProps {Object} modalVisible - 控制模态框显影
 * @reactProps {String} anchor - 模态框弹出方向
 * @return React.element
 */
@Form.create({ fieldNameProp: null })
@connect(({ interfaceSegment }) => ({
  interfaceSegment,
}))
export default class InterfaceSegmentModal extends PureComponent {
  @Bind()
  showInterfaceTable(params = {}) {
    const { segmentId, onShowInterfaceTable } = this.props;
    onShowInterfaceTable({
      segmentId,
      ...params,
    });
  }

  render() {
    const {
      modalVisible,
      onCancel,
      anchor,
      modelLoading,
      fieldsList = {},
      fieldPagination,
    } = this.props;
    const columns = [
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.fieldName`).d('字段名称'),
        dataIndex: 'fieldName',
        width: 100,
      },
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.fieldDesc`).d('字段描述'),
        dataIndex: 'fieldDesc',
        align: 'left',
      },
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.fieldType`).d('字段类型'),
        dataIndex: 'fieldType',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.length`).d('字段长度'),
        dataIndex: 'length',
        width: 100,
        align: 'left',
      },
      {
        title: intl.get(`sitf.interfaceSegment.model.interfaceSegment.indexFlag`).d('索引标识'),
        dataIndex: 'indexFlag',
        width: 100,
        align: 'left',
      },
    ];
    return (
      <Modal
        destroyOnClose
        title={intl.get(`sitf.interfaceSegment.view.interfaceSegment.modelTitle`).d('接口字段表')}
        width={1000}
        onCancel={onCancel}
        onOk={onCancel}
        visible={modalVisible}
        wrapClassName={`ant-modal-sidebar-${anchor}`}
        transitionName={`move-${anchor}`}
      >
        <Table
          pagination={fieldPagination}
          dataSource={fieldsList.content || []}
          rowKey="fieldId"
          columns={columns}
          loading={modelLoading}
          bordered
          onChange={page => this.showInterfaceTable(page)}
        />
      </Modal>
    );
  }
}
