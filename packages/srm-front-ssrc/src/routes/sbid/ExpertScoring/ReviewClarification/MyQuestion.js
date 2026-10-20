import React, { Component } from 'react';
import { isEmpty } from 'lodash';
import { Bind } from 'lodash-decorators';
import { Drawer, Button, Table, Tooltip, Form, Row, Col, Input, Select } from 'hzero-ui';

import intl from 'utils/intl';
import Upload from 'srm-front-boot/lib/components/Upload';
import { PRIVATE_BUCKET } from '_utils/config';

import styles from './index.less';

const FormItem = Form.Item;
const PROMPT_CODE = 'ssrc.expertScoring';
const formLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};
const { Option } = Select;
@Form.create()
class MyQuestion extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
  }

  /**
   * 渲染表格
   */
  @Bind()
  renderColumns() {
    const columns = [
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.clarifyIssueNum`).d('问题编号'),
        dataIndex: 'clarifyIssueNum',
        width: 150,
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.description`).d('问题描述'),
        dataIndex: 'description',
        render: (val) => <Tooltip title={val}>{val}</Tooltip>,
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.clarifyIssueStatus`).d('状态'),
        dataIndex: 'clarifyIssueStatusMeaning',
        width: 100,
      },
      {
        title: intl.get(`${PROMPT_CODE}.model.expertScoring.attachment`).d('附件'),
        width: 150,
        render: (val) => {
          return (
            <Upload
              bucketName={PRIVATE_BUCKET}
              bucketDirectory="ssrc-rfx-quotationheader"
              attachmentUUID={val.attachmentUuid}
              viewOnly
              filePreview
            />
          );
        },
      },
    ];

    return columns;
  }

  /**
   * 问题维护跳转
   */
  @Bind()
  jumpTo() {
    const { jumpTo, dispatch, selectedRowKeys, modelName = 'expertScoring' } = this.props;
    dispatch({
      type: `${modelName}/updateState`,
      payload: {
        selectedRowKeys,
      },
    });
    jumpTo(1);
  }

  /**
   * 重置表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleFormReset() {
    this.props.form.resetFields();
  }

  /**
   * 提交查询表单
   *
   * @memberof QueryForm
   */
  @Bind()
  handleSearch() {
    const { form, onSearchMyQuestion } = this.props;
    form.validateFields((err) => {
      if (isEmpty(err)) {
        onSearchMyQuestion();
      }
    });
  }

  /**
   * 控制表格多选框的禁用
   * @param {} record
   */
  @Bind()
  getCheckboxProps(record) {
    return {
      disabled: record.clarifyIssueStatus !== 'NEW',
      defaultFlag: record.clarifyIssueStatus,
    };
  }

  render() {
    const {
      onDelete,
      onChange,
      dataSource,
      pagination,
      showAsideMsg,
      questionStatus,
      selectedRows,
      loadingDelete,
      showMyQuestion,
      onCheckedChange,
      selectedRowKeys,
      loadingMyQuestion,
      form: { getFieldDecorator },
    } = this.props;
    const drawerProps = {
      destroyOnClose: true,
      visible: showMyQuestion,
      onClose: showAsideMsg,
      maskClosable: true,
      width: 900,
      title: intl.get(`${PROMPT_CODE}.model.expertScoring.askQuestion`).d('我提出的问题'),
    };
    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: onCheckedChange,
      getCheckboxProps: this.getCheckboxProps,
    };
    const tableProps = {
      bordered: true,
      onChange,
      dataSource,
      pagination,
      rowSelection,
      rowKey: 'clarifyIssueId',
      loading: loadingMyQuestion,
      columns: this.renderColumns(),
    };
    return (
      <React.Fragment>
        <Drawer {...drawerProps}>
          <div className={styles.searchBar}>
            <Form layout="inline" className="more-fields-form">
              <Row gutter={12}>
                <Col span={18}>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${PROMPT_CODE}.model.expertScoring.questionNum`)
                        .d('问题编号')}
                      {...formLayout}
                    >
                      {getFieldDecorator('clarifyIssueNum')(<Input maxLength={40} />)}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${PROMPT_CODE}.model.expertScoring.clarifyIssueStatus`)
                        .d('状态')}
                      {...formLayout}
                    >
                      {getFieldDecorator('clarifyIssueStatus')(
                        <Select allowClear>
                          {questionStatus.map((item) => (
                            <Option key={item.meaning} value={item.value}>
                              {item.meaning}
                            </Option>
                          ))}
                        </Select>
                      )}
                    </FormItem>
                  </Col>
                  <Col span={8}>
                    <FormItem
                      label={intl
                        .get(`${PROMPT_CODE}.model.expertScoring.description`)
                        .d('问题描述')}
                      {...formLayout}
                    >
                      {getFieldDecorator('description')(<Input />)}
                    </FormItem>
                  </Col>
                </Col>
                <Col span={6} style={{ paddingLeft: '24px', paddingTop: '8px' }}>
                  <Button
                    data-code="reset"
                    onClick={this.handleFormReset}
                    style={{ marginRight: '8px' }}
                  >
                    {intl.get('hzero.common.button.reset').d('重置')}
                  </Button>
                  <Button
                    data-code="search"
                    type="primary"
                    htmlType="submit"
                    onClick={this.handleSearch}
                    loading={loadingMyQuestion}
                  >
                    {intl.get('hzero.common.button.search').d('查询')}
                  </Button>
                </Col>
              </Row>
            </Form>
          </div>
          <div className={styles.myQuestionTopBar}>
            <Button type="primary" disabled={selectedRows.length === 0} onClick={this.jumpTo}>
              {intl.get(`${PROMPT_CODE}.model.expertScoring.questionMatain`).d('问题维护')}
            </Button>
            <Button
              type="default"
              onClick={onDelete}
              disabled={selectedRows.length === 0}
              loading={loadingDelete}
              style={{ marginRight: '8px' }}
            >
              {intl.get('hzero.common.button.delete').d('删除')}
            </Button>
          </div>
          <Table {...tableProps} style={{ zIndex: '-1' }} />
        </Drawer>
      </React.Fragment>
    );
  }
}

export default MyQuestion;
