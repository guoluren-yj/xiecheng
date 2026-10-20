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
import styles from '../index.less';

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
export default class InviterModal extends PureComponent {
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
          {item.companyName}
          <Icon
            type="close-circle"
            theme="filled"
            className={styles.close}
            onClick={() => this.handleCurrentRowSelect(item)}
          />
        </span>
      </ListItem>
    );
  }

  render() {
    const {
      inviterVisble,
      inviterData = {},
      form: { getFieldDecorator },
      fetchInviterData,
      selectedChildRows = [],
      selectedRowKeys,
      loading = false,
    } = this.props;
    const queryFields = [
      {
        field: 'companyNum',
        label: intl.get(`entity.company.companyCode`).d('公司编码'),
      },
      {
        field: 'companyName',
        label: intl.get('entity.company.companyName').d('公司名称'),
      },
    ];
    const fieldsColumn = [
      {
        title: intl.get(`entity.company.companyCode`).d('公司编码'),
        dataIndex: 'companyNum',
        width: 150,
      },
      {
        title: intl.get('entity.company.companyName').d('公司名称'),
        dataIndex: 'companyName',
        width: 150,
      },
    ];
    // 查询条件
    const span = queryFields.length <= 1 ? 24 : 12;
    const queryCondition = queryFields.map((queryItem) => {
      return (
        <Col span={span} key={queryItem.field}>
          <FormItem {...formItemLayout} label={queryItem.label}>
            {getFieldDecorator(queryItem.field)(<Input onPressEnter={fetchInviterData} />)}
          </FormItem>
        </Col>
      );
    });

    return (
      <Modal
        destroyOnClose
        width={720}
        visible={inviterVisble}
        onCancel={this.cancelModal}
        onOk={this.handleSaveRecord}
        title={intl.get('spfm.invitationRegister.model.invitation.inviter.company').d('公司')}
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
              <Button type="primary" onClick={() => fetchInviterData()}>
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
            dataSource={inviterData.content}
            pagination={createPagination(inviterData)}
            columns={fieldsColumn}
            loading={loading}
            onChange={fetchInviterData}
            rowKey="companyId"
            rowSelection={{
              selectedRowKeys,
              onChange: this.handleRowSelect,
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
