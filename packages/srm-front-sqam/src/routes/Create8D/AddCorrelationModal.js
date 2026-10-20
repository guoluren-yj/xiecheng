import React, { Component } from 'react';
import { Table, Modal, Button, Row, Col, Form, Input } from 'hzero-ui';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { isFunction } from 'lodash';
import { connect } from 'dva';
import { filterNullValueObject, getCurrentOrganizationId } from 'utils/utils';
import {
  SEARCH_FORM_ITEM_LAYOUT,
  SEARCH_FORM_ROW_LAYOUT,
  FORM_COL_3_LAYOUT,
} from 'utils/constants';
import notification from 'utils/notification';

import styles from './index.less';

@connect(({ create8D, loading }) => ({
  create8D,
  fetchAddRelation8DLoading: loading.effects['create8D/fetchAddRelation8D'],
  tenantId: getCurrentOrganizationId(),
}))
@Form.create({ fieldNameProp: null })
export default class AddCorrelation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRows: [],
    };
    if (isFunction(props.onRef)) {
      props.onRef(this);
    }
  }

  // 保存新增关联8D
  @Bind()
  handleSave() {
    const { id, dispatch, tenantId, onSearch, addCorrelationModal = (e) => e } = this.props;
    const { selectedRows } = this.state;
    dispatch({
      type: 'create8D/saveRelation8D',
      payload: {
        tenantId,
        problemHeaderId: id,
        list: selectedRows,
      },
    }).then((res) => {
      if (res) {
        onSearch();
        // fetchCorrelation(id);
        addCorrelationModal(false);
        notification.success();
      }
    });
  }

  // 表单重置事件
  @Bind()
  reset() {
    this.props.form.resetFields();
  }

  /**
   * 设置选中行
   */
  @Bind()
  handleChangeSelectRowKeys(selectedRowKeys, selectedRows) {
    this.setState({ selectedRows });
  }

  // 查询可新增关联的8D
  @Bind()
  searchAddRelation8D() {
    const { form, fetchAddRelation8D, addCorrelationPagination = {} } = this.props;
    const formValue = filterNullValueObject(form.getFieldsValue());
    fetchAddRelation8D(addCorrelationPagination, formValue);
  }

  render() {
    const { selectedRows } = this.state;
    const {
      form,
      onDetail,
      visible = false,
      fetchAddRelation8D,
      addCorrelationList,
      addCorrelationModal,
      addCorrelationPagination,
      fetchAddRelation8DLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('sqam.common.model.qualityRectification.code').d('整改报告编号'),
        dataIndex: 'problemNum',
        render: (val, record) => <a onClick={() => onDetail(record)}>{val}</a>,
      },
      {
        title: intl.get('sqam.common.model.qualityRectification.title').d('整改报告标题'),
        dataIndex: 'problemTitle',
      },
      {
        title: intl.get('entity.roles.creator').d('创建人'),
        dataIndex: 'createdName',
      },
    ];
    const rowSelection = {
      selectedRowKeys: selectedRows.map((item) => item.problemHeaderId),
      onChange: this.handleChangeSelectRowKeys,
    };
    const modalProps = {
      visible,
      width: 800,
      onOk: this.handleSave,
      className: styles.addCorrelation,
      title: intl
        .get(`sqam.common.model.common.addCorrelationRectification`)
        .d('新增关联质量整改单'),
      onCancel: () => addCorrelationModal(false),
    };
    const tableProps = {
      columns,
      bordered: true,
      rowSelection,
      rowKey: 'problemHeaderId',
      loading: fetchAddRelation8DLoading,
      onChange: fetchAddRelation8D,
      dataSource: addCorrelationList,
      pagination: addCorrelationPagination,
    };
    return (
      <Modal {...modalProps}>
        <Row {...SEARCH_FORM_ROW_LAYOUT}>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.qualityRectification.code`).d('整改报告编号')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('problemNum')(
                <Input trim inputChinese={false} typeCase="upper" />
              )}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT}>
            <Form.Item
              label={intl.get(`sqam.common.model.qualityRectification.title`).d('整改报告标题')}
              {...SEARCH_FORM_ITEM_LAYOUT}
            >
              {form.getFieldDecorator('problemTitle')(<Input trim typeCase="upper" />)}
            </Form.Item>
          </Col>
          <Col {...FORM_COL_3_LAYOUT} className="search-btn-more">
            <Form.Item>
              <Button onClick={this.reset}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
              <Button type="primary" onClick={this.searchAddRelation8D}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </Form.Item>
          </Col>
        </Row>
        <Table {...tableProps} />
      </Modal>
    );
  }
}
