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
import { connect } from 'dva';

import intl from 'utils/intl';
import { getCurrentOrganizationId, createPagination } from 'utils/utils';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    sm: { span: 8 },
  },
  wrapperCol: {
    sm: { span: 14 },
  },
};

@connect(({ loading, configServer }) => ({
  configServer,
  tenantId: getCurrentOrganizationId(),
  fetching: loading.effects['configServer/fetchSupplierMulti'],
}))
@Form.create({ fieldNameProp: null })
export default class SupplierAddMulti extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedChildRows: [],
      dataSource: [],
      pagination: {},
    };
  }

  componentDidMount() {
    this.handleSearch();
  }

  @Bind()
  handleSearch(page = {}) {
    const {
      dispatch,
      tenantId,
      invoiceRuleId,
      form: { getFieldsValue },
    } = this.props;
    dispatch({
      type: 'configServer/fetchSupplierMulti',
      payload: { tenantId, invoiceRuleId, ...getFieldsValue(), page },
    }).then((res) => {
      if (res) {
        this.setState({
          dataSource: res.content,
          pagination: createPagination(res),
        });
      }
    });
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
    const { onState } = this.props;
    // this.setState({
    //   selectedChildRows: [],
    // });
    onState('supplierModalVisible', false);
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
      this.cancelModal();
      // this.setState({ selectedChildRows: [] });
    }
  }

  render() {
    const {
      visible,
      fetching,
      form: { getFieldDecorator },
    } = this.props;
    const { selectedChildRows, dataSource, pagination } = this.state;
    // 查询条件
    const queryFields = [
      {
        field: 'supplierCompanyCode',
        label: intl.get('entity.supplier.code').d('供应商编码'),
      },
      {
        field: 'supplierCompanyName',
        label: intl.get('entity.supplier.name').d('供应商名称'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get('entity.supplier.code').d('供应商编码'),
        dataIndex: 'supplierCompanyCode',
        align: 'left',
        width: 150,
      },
      {
        title: intl.get('entity.supplier.name').d('供应商名称'),
        dataIndex: 'supplierCompanyName',
        align: 'left',
        width: 150,
      },
    ];
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={this.handleSearch} />)}
          </FormItem>
        </Col>
      );
    });
    return (
      <Modal
        destroyOnClose
        width={600}
        visible={visible}
        onCancel={this.cancelModal}
        onOk={this.handleSaveRecord}
      >
        <React.Fragment>
          <div style={{ display: 'flex', marginBottom: '5px', marginTop: '20px' }}>
            <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
            <div style={{ width: '110px', padding: '5px 0 0 15px' }}>
              <Button type="primary" onClick={this.handleSearch} loading={fetching}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <Table
            dataSource={dataSource}
            pagination={pagination}
            columns={fieldsColumn}
            loading={fetching}
            onChange={this.handleSearch}
            rowKey="supplierCompanyId"
            rowSelection={{
              selectedRowKeys: selectedChildRows.map((n) => n.supplierCompanyId),
              onChange: this.handleRowSelect,
            }}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
