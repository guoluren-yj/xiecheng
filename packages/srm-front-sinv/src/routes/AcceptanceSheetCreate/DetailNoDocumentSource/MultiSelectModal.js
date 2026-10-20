/**
 * MultiSelectModal - 用于多选项目采购负责人
 * @date: 2019-4-17
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { Form, Input, Table, Modal, Row, Button, Col } from 'hzero-ui';
import withCustomize from 'srm-front-cuz';
// import { isEmpty } from 'lodash';

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
@withCustomize({
  unitCode: ['SINV.ACCEPTANCE_CREATE_DETAIL.ACCEPTOR_MODAL'],
})
@Form.create({ fieldNameProp: null })
export default class MultiSelectModal extends PureComponent {
  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectRowKey, selectedChildRows) {
    const { handleRowSelect } = this.props;
    // this.setState({
    //   selectedChildRows,
    // });
    handleRowSelect(selectRowKey, selectedChildRows);
  }

  /**
   * 关闭弹窗
   */
  @Bind()
  cancelModal() {
    const { onChange } = this.props;
    onChange();
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
    this.cancelModal();
    // }
  }

  // @Bind()
  // saveDate() {
  //   const { fetchPurAgentData, onSaveRecord, selectedChildRows } = this.props;
  //   onSaveRecord(selectedChildRows);
  //   fetchPurAgentData();
  // }
  @Bind()
  resetSearchDate() {
    const { form } = this.props;
    form.resetFields();
  }

  render() {
    const {
      queryFields = [],
      purAgentVisible,
      fieldsColumn = [],
      purAgentPagination = {},
      purAgentList = {},
      form: { getFieldDecorator },
      fetchPurAgentData,
      // selectedChildRows,
      selectedRowKeys,
      customizeTable,
    } = this.props;
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={fetchPurAgentData} />)}
          </FormItem>
        </Col>
      );
    });

    return (
      <Modal
        destroyOnClose
        width={720}
        visible={purAgentVisible}
        onCancel={this.cancelModal}
        onOk={this.handleSaveRecord}
        title={intl.get('sinv.acceptanceSheetCreate.model.checkMan').d('验收人')}
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
              <Button type="primary" onClick={fetchPurAgentData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          {customizeTable(
            { code: 'SINV.ACCEPTANCE_CREATE_DETAIL.ACCEPTOR_MODAL' },
            <Table
              dataSource={purAgentList.content}
              pagination={purAgentPagination}
              columns={fieldsColumn}
              onChange={fetchPurAgentData}
              rowKey="userId"
              rowSelection={{
                selectedRowKeys,
                onChange: this.handleRowSelect,
              }}
              bordered
            />
          )}
        </React.Fragment>
      </Modal>
    );
  }
}
