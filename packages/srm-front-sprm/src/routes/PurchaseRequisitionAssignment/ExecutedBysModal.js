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
  state = { selectRowKey: null };

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 单选框
   */
  @Bind()
  handleRowSelect(selectRowKey, selectedRows) {
    const { form } = this.props;
    if (selectRowKey) {
      const { purchaseAgentName, purchaseAgentId } = selectedRows;
      form.registerField('purchaseAgentCurrentName');
      form.registerField('purchaseAgentId');
      form.setFieldsValue({
        purchaseAgentId,
        purchaseAgentCurrentName: purchaseAgentName,
      });
      this.setState({ selectRowKey });
    }
  }

  /**
   * 弹窗确定
   */
  @Bind()
  handleSaveRecord() {
    const { form, handleRowSelect } = this.props;
    if (!form.getFieldValue('purchaseAgentId')) {
      Modal.warning({
        title: intl.get('hzero.common.message.confirm.selected.atLeast').d('请至少选择一行数据'),
      });
    } else {
      const { purchaseAgentId, purchaseAgentCurrentName } = form.getFieldsValue();
      handleRowSelect({ purchaseAgentId, purchaseAgentCurrentName });
    }
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
      queryBuyerLoading,
      executedBysPagination = {},
      executedBysDataSource = [],
      form: { getFieldDecorator },
      fetchLovData,
      // selectedChildRows,
      // selectedRowKeys,
    } = this.props;
    const { selectRowKey } = this.state;
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
        // title={intl.get('sprm.common.model.common.handlePerson').d('需求执行人')}
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
            loading={queryBuyerLoading}
            columns={fieldsColumn}
            onChange={fetchLovData}
            rowKey="purchaseAgentId"
            rowSelection={{
              type: 'radio',
              onChange: (val, [currentRecord]) => this.handleRowSelect(val, currentRecord),
              selectedRowKeys: [selectRowKey],
            }}
            onRow={record => {
              return {
                onClick: () => this.handleRowSelect(record.purchaseAgentId, record),
                onDoubleClick: () => {
                  this.handleRowSelect(record.purchaseAgentId, record);
                  this.handleSaveRecord();
                },
              };
            }}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
