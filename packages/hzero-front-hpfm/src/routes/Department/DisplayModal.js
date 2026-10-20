/**
 * DisplayModal -展示数据
 * @date: 2020-4-29
 * @author: yanglin <lin.yang05@hand-china.com>
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
export default class DisplayModal extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  cancelModal() {
    const { handleCancelModal } = this.props;
    handleCancelModal();
  }

  @Bind()
  resetSearchDate() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      visable,
      data = [],
      form: { getFieldDecorator },
      handleSearch,
      loading = false,
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
        title={intl.get('hpfm.department.model.department.ownerCostCentral').d('成本中心')}
        footer={null}
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
          <Table
            dataSource={data}
            columns={fieldsColumn}
            loading={loading}
            onChange={handleSearch}
            rowKey="costId"
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
