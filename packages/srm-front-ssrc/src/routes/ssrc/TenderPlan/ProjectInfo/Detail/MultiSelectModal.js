/**
 * MultiSelectModal - 用于多选项目采购负责人
 * @date: 2019-4-17
 * @author: chenjing <jing.chen05@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2018, Hand
 */
import React, { PureComponent } from 'react';
import { Bind } from 'lodash-decorators';
import { uniqBy } from 'lodash';
import { Form, Input, Table, Modal, Row, Button, Col, List, Icon } from 'hzero-ui';

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
export default class MultiSelectModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedChildRows: this.props.projectPurAgents || [],
    };
  }

  componentDidMount() {
    this.props.onRef(this);
  }

  /**
   * 多选框
   */
  @Bind()
  handleRowSelect(selectedRowKeys, selectedRows) {
    // this.setState({
    //   selectedChildRows,
    // });

    const { selectedChildRows } = this.state;

    const newAddRows = selectedChildRows.filter((ele) => selectedRowKeys.includes(ele.id));
    this.setState({
      selectedChildRows: uniqBy(newAddRows.concat(selectedRows), 'id'),
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

  @Bind()
  renderItem(item) {
    return (
      <ListItem
        style={{
          display: 'inline-block',
          border: 'none',
          padding: 0,
          marginLeft: '10px',
        }}
      >
        <span
          style={{
            overflow: 'hidden',
          }}
        >
          {item.realName}
          <Icon
            type="close-circle"
            theme="filled"
            style={{ marginLeft: '3px' }}
            onClick={() => this.handleRowClick(item)}
          />
        </span>
      </ListItem>
    );
  }

  @Bind()
  handleRowClick(current) {
    const { selectedChildRows } = this.state;
    if (selectedChildRows.some((ele) => ele.id === current.id)) {
      const updateRows = selectedChildRows.filter((ele) => ele.id !== current.id);
      this.setState({ selectedChildRows: updateRows }, () => {});
    } else {
      this.setState({ selectedChildRows: [...selectedChildRows, current] }, () => {});
    }
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
    } = this.props;
    const { selectedChildRows } = this.state;
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
        title={intl.get('ssrc.tenderPlan.view.message.title.projectPurAgents').d('项目采购负责人')}
        wrapClassName="lov-modal"
      >
        <React.Fragment>
          <div style={{ display: 'flex', marginBottom: '5px', marginTop: '5px' }}>
            <Row style={{ flex: 'auto' }}>{queryCondition}</Row>
            <div style={{ width: '110px', padding: '5px 0 0 15px' }}>
              <Button type="primary" onClick={fetchPurAgentData}>
                {intl.get('hzero.common.button.search').d('查询')}
              </Button>
            </div>
          </div>
          <p style={{ minHeight: '20px', margin: 0, padding: 0, display: 'flex' }}>
            <span style={{ height: '20px', padding: 0, width: '50px', flexShrink: 0 }}>
              {intl.get('hzero.common.components.standardTable.select').d('已选择')}
            </span>
            {selectedChildRows.length > 0 && (
              <List
                dataSource={selectedChildRows}
                renderItem={(item) => this.renderItem(item)}
                style={{ padding: 0 }}
              />
            )}
          </p>
          <Table
            dataSource={purAgentList.content}
            pagination={purAgentPagination}
            columns={fieldsColumn}
            onChange={fetchPurAgentData}
            rowKey="id"
            rowSelection={{
              type: 'checkbox',
              selectedRowKeys: selectedChildRows.map((n) => n.id),
              onChange: this.handleRowSelect,
            }}
            onRow={(record, index) => {
              return {
                onClick: () => this.handleRowClick(record, index),
              };
            }}
            bordered
          />
        </React.Fragment>
      </Modal>
    );
  }
}
