/**
 * MultiSelectModal -lov多选框 邀请方
 * @date: 2020-4-29
 * @author: yanglin <lin.yang05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Table, Modal, Row, Button, Col, List, Icon } from 'hzero-ui';
import { createPagination } from 'utils/utils';

import intl from 'utils/intl';

const FormItem = Form.Item;
const ListItem = List.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

@Form.create({ fieldNameProp: null })
export default class CostCenterModal extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectRowKey, selectedChildRows) {
    const { handleRowSelect } = this.props;
    handleRowSelect(selectRowKey, selectedChildRows);
  }

  @Bind()
  handleCurrentRowSelect(record) {
    const { selectedRowKeys = [], selectedChildRows = [], handleRowSelect } = this.props;
    handleRowSelect(
      JSON.parse(JSON.stringify(selectedRowKeys)),
      JSON.parse(JSON.stringify(selectedChildRows)),
      record
    );
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  cancelModal() {
    const { handleCancelModal } = this.props;
    handleCancelModal();
  }

  /**
   * 弹窗确定
   */
  @Bind()
  handleSaveRecord() {
    const { onSaveRecord } = this.props;
    // if (selectedChildRows.length < 1) {
    //   this.cancelModal();
    // } else {
    onSaveRecord();
    // this.cancelModal();
    // }
  }

  @Bind()
  resetSearchDate() {
    const { form } = this.props;
    form.resetFields();
  }

  @Bind()
  renderItem(item) {
    const { displayField, readOnly = false } = this.props;
    return (
      <ListItem style={{ height: '35px', display: 'inline-block', border: 'none' }}>
        <span
          style={{
            padding: '5px',
            paddingTop: 0,
            paddingButton: 0,
            overflow: 'hidden',
          }}
        >
          {item[displayField]}
          <Icon
            type="close-circle"
            theme="filled"
            onClick={() => this.handleCurrentRowSelect(item)}
            style={{ display: readOnly ? 'none' : 'inline-block' }}
          />
        </span>
      </ListItem>
    );
  }

  render() {
    const {
      visable,
      data = {},
      form: { getFieldDecorator },
      handleSearch,
      selectedChildRows = [],
      selectedRowKeys,
      loading = false,
      valueField,
      readOnly = false,
    } = this.props;
    const queryFields = [
      {
        field: 'costCode',
        label: intl.get(`hpfm.department.model.department.costCode`).d('成本中心编码'),
      },
      {
        field: 'costName',
        label: intl.get(`hpfm.department.model.department.costName`).d('成本中心名称'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get(`hpfm.department.model.department.costCode`).d('成本中心编码'),
        dataIndex: 'costCode',
        width: 150,
      },
      {
        title: intl.get(`hpfm.department.model.department.costName`).d('成本中心名称'),
        dataIndex: 'costName',
        width: 150,
      },
    ];
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={handleSearch} />)}
          </FormItem>
        </Col>
      );
    });

    return (
      <Modal
        destroyOnClose
        width={720}
        visible={visable}
        onCancel={this.cancelModal}
        onOk={this.handleSaveRecord}
        title={intl.get('hpfm.department.model.department.ownerCostCentral').d('成本中心')}
        footer={readOnly ? null : undefined}
        wrapClassName="lov-modal"
      >
        <React.Fragment>
          <div style={{ display: 'flex', marginBottom: '5px', marginTop: '5px' }}>
            <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
            <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
              <Button onClick={this.resetSearchDate}>
                {intl.get('hzero.common.button.reset').d('重置')}
              </Button>
            </div>
            <div style={{ width: '80px', padding: '5px 0 0 15px' }}>
              <Button type="primary" onClick={() => handleSearch()}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <p style={{ minHeight: '40px', margin: 0 }}>
            <span style={{ display: 'inline-block', height: '40px', paddingTop: '12px' }}>
              {intl.get('hzero.common.button.selected').d('已选择')}:
            </span>
            {selectedChildRows.length > 0 && (
              <List
                dataSource={selectedChildRows}
                renderItem={(item) => this.renderItem(item)}
                style={{ display: 'inline-block', height: '30px', padding: 0 }}
              />
            )}
          </p>
          <Table
            dataSource={data.content}
            pagination={createPagination(data)}
            columns={fieldsColumn}
            loading={loading}
            onChange={handleSearch}
            rowKey={valueField}
            rowSelection={{
              selectedRowKeys,
              onChange: this.handleRowSelect,
              getCheckboxProps: () => {
                return {
                  disabled: readOnly,
                };
              },
            }}
            onRow={(record) => ({
              onClick: () => this.handleCurrentRowSelect(record),
            })}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
