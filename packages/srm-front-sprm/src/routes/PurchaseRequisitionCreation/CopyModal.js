import React, { Component } from 'react';
import { Form, Input, Button, Row, Col, Modal, Table } from 'hzero-ui';
import { connect } from 'dva';
import { sum, isFunction, isEmpty } from 'lodash';
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import { dateTimeRender } from 'utils/renderer';
import { SEARCH_COL_CLASSNAME, SEARCH_FORM_ROW_LAYOUT, FORM_COL_4_LAYOUT } from 'utils/constants';

const FormItem = Form.Item;
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

const commonPrompt = 'sprm.common.model.common';

@connect(({ loading = {}, purchaseRequisitionCreation = {} }) => ({
  confirmLoading: loading.effects['purchaseRequisitionCreation/saveCopyLine'],
  purchaseRequisitionCreation,
}))
@Form.create({ fieldNameProp: null })
export default class CopyModal extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    if (isFunction(onRef)) {
      onRef(this);
    }
    this.state = {
      selectedRow: [],
    };
  }

  @Bind()
  onClick() {
    const { searchList } = this.props;
    if (isFunction(searchList)) {
      searchList();
    }
  }

  @Bind()
  getColumns() {
    const columns = [
      {
        title: intl.get(`hzero.common.status`).d('状态'),
        dataIndex: 'prStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${commonPrompt}.prNum`).d('采购申请编号'),
        dataIndex: 'displayPrNum',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.prTitle`).d('申请标题'),
        dataIndex: 'title',
        width: 180,
      },
      {
        title: intl.get(`entity.company.tag`).d('公司'),
        dataIndex: 'companyName',
        width: 180,
      },
      {
        title: intl.get(`entity.business.tag`).d('业务实体'),
        dataIndex: 'ouName',
        width: 180,
      },
      {
        title: intl.get(`entity.organization.class.purchase`).d('采购组织'),
        dataIndex: 'purchaseOrgName',
        width: 180,
      },
      {
        title: intl.get(`${commonPrompt}.purchaseAgentName`).d('采购员'),
        dataIndex: 'purchaseAgentName',
        width: 150,
      },
      {
        title: intl.get(`entity.roles.creator`).d('创建人'),
        dataIndex: 'prRequestedName',
        width: 150,
      },
      {
        title: intl.get(`${commonPrompt}.creationTime`).d('创建时间'),
        dataIndex: 'creationDate',
        width: 150,
        render: dateTimeRender,
      },
      {
        title: intl.get(`${commonPrompt}.unitName`).d('所属部门'),
        dataIndex: 'unitName',
        width: 120,
      },
    ];
    return columns;
  }

  // 确认复制
  @Bind()
  confirmCopy() {
    const { selectedRow } = this.state;
    const { onConfirmCopy } = this.props;
    if (isFunction(onConfirmCopy)) {
      onConfirmCopy(...selectedRow);
    }
  }

  @Bind()
  handleSelectChange(_, row) {
    this.setState({
      selectedRow: row,
    });
  }

  @Bind()
  handleCloseModal() {
    const { onCloseModal } = this.props;
    this.setState({
      selectedRow: [],
    });
    this.props.form.resetFields();
    if (isFunction(onCloseModal)) {
      onCloseModal();
    }
  }

  render() {
    const {
      form: { getFieldDecorator },
      dataSource,
      modalVisible = false,
      onChange,
      pagination,
      confirmCopyLoading = false,
      queryLoading = false,
    } = this.props;
    const { selectedRow } = this.state;
    const tableProps = {
      dataSource,
      columns: this.getColumns(),
      bordered: true,
      loading: confirmCopyLoading || queryLoading,
      onChange: page => onChange(page),
      pagination,
      rowKey: 'prHeaderId',
      rowSelection: {
        type: 'radio',
        selectedRowKeys: selectedRow?.map(n => n.prHeaderId),
        onChange: (key, row) => this.handleSelectChange(key, row),
      },
      onRow: record => {
        return {
          onClick: event => {
            this.handleSelectChange(event, [record]);
          },
        };
      },
    };
    tableProps.scroll = { x: sum(tableProps.columns?.map(n => n.width)) + 300 };
    return (
      <Modal
        title={intl.get(`${commonPrompt}.prList`).d('申请单列表')}
        width={1200}
        visible={modalVisible}
        onOk={this.confirmCopy}
        onCancel={this.handleCloseModal}
        // confirmLoading={confirmLoading}
        // loading={queryLoading || confirmLoading || false}
        okButtonProps={{ disabled: isEmpty(selectedRow) }}
        okText={intl.get('hzero.common.button.ok').d('确定')}
        cancelText={intl.get('hzero.common.status.cancel').d('取消')}
      >
        <Form layout="inline" className="more-fields-form">
          <Row {...SEARCH_FORM_ROW_LAYOUT}>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${commonPrompt}.prNum`).d('采购申请编号')}
              >
                {getFieldDecorator('displayPrNum')(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT}>
              <FormItem
                {...formItemLayout}
                label={intl.get(`${commonPrompt}.prTitle`).d('申请标题')}
              >
                {getFieldDecorator('title')(<Input />)}
              </FormItem>
            </Col>
            <Col {...FORM_COL_4_LAYOUT} className={SEARCH_COL_CLASSNAME}>
              <FormItem>
                <Button onClick={() => this.props.form.resetFields()}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button type="primary" htmlType="submit" onClick={this.onClick}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <Table style={{ marginTop: '10px' }} {...tableProps} />
      </Modal>
    );
  }
}
