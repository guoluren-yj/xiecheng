/**
 * ExecutedBysModal - 需求执行人多选LOV
 * @date: 2020-2-18
 * @author: maojiaqi <mao.jiaqi@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
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
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectRowKey, selectedRows) {
    const { handleRowSelect } = this.props;
    handleRowSelect(selectRowKey, selectedRows);
  }

  /**
   * 弹窗确定
   */
  @Bind()
  handleSaveRecord() {
    const { onSaveRecord } = this.props;
    onSaveRecord();
  }

  /**
   * 表单重置
   */
  @Bind()
  resetSearchDate() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      queryFields = [],
      handleModal,
      executedBysVisible,
      fieldsColumn = [],
      queryExecutedBysLoading,
      executedBysPagination = {},
      executedBysDataSource = [],
      form: { getFieldDecorator },
      fetchLovData,
      // selectedChildRows,
      selectedRowKeys,
    } = this.props;
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields?.map(queryItem => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={fetchLovData} />)}
          </FormItem>
        </Col>
      );
    });

    return (
      <Modal
        destroyOnClose
        width={720}
        visible={executedBysVisible}
        onCancel={() => handleModal(false)}
        onOk={this.handleSaveRecord}
        title={intl.get('sprm.common.model.common.handlePerson').d('需求执行人')}
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
              <Button type="primary" onClick={fetchLovData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <Table
            dataSource={executedBysDataSource}
            pagination={executedBysPagination}
            loading={queryExecutedBysLoading}
            columns={fieldsColumn}
            onChange={fetchLovData}
            rowKey="userId"
            rowSelection={{
              selectedRowKeys,
              onChange: this.handleRowSelect,
            }}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
