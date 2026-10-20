/**
 * MultiSelectModal 用于供应商多选框
 * @date: 2019-4-03
 * @author yw <wei.yang01@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */

import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Table, Modal, Row, Button, Col } from 'hzero-ui';

import intl from 'utils/intl';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

@Form.create({ fieldNameProp: null })
export default class MultiSelectModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedChildRows: [],
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(_, selectedChildRows) {
    this.setState({
      selectedChildRows,
    });
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  cancelModal() {
    const { onChange } = this.props;
    this.setState({
      selectedChildRows: [],
    });
    onChange();
  }

  /**
   * 弹窗确定
   */
  @Bind()
  handleSaveRecord() {
    const { onSaveRecord } = this.props;
    const { selectedChildRows } = this.state;
    if (selectedChildRows.length < 1) {
      this.cancelModal();
    } else {
      onSaveRecord(selectedChildRows);
      this.setState({ selectedChildRows: [] });
    }
  }

  render() {
    const {
      queryFields = [],
      supplierVisible,
      fieldsColumn = [],
      supplierPagination = {},
      supplierList = {},
      form: { getFieldDecorator },
      fetchSupplierData,
    } = this.props;
    const { selectedChildRows } = this.state;
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map(queryItem => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={fetchSupplierData} />)}
          </FormItem>
        </Col>
      );
    });
    return (
      <Modal
        destroyOnClose
        width={520}
        visible={supplierVisible}
        onCancel={this.cancelModal}
        onOk={this.handleSaveRecord}
      >
        <React.Fragment>
          <div style={{ display: 'flex', marginBottom: '5px', marginTop: '20px' }}>
            <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
            <div style={{ width: '110px', padding: '5px 0 0 15px' }}>
              <Button type="primary" onClick={fetchSupplierData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <Table
            dataSource={supplierList.content}
            pagination={supplierPagination}
            columns={fieldsColumn}
            onChange={fetchSupplierData}
            rowKey="supplierCompanyId"
            rowSelection={{
              selectedRowKeys: selectedChildRows.map(n => n.supplierCompanyId),
              onChange: this.handleRowSelect,
            }}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
