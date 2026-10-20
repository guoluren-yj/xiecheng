/**
 * AsignUser - 分配用户
 * @date: 2020-09-23
 * @author: LXM <xiaomei.lv@hand-china.com>
 * @version: 0.0.1
 * @copyright Copyright (c) 2020, Hand
 */
import intl from 'utils/intl';
import { Bind } from 'lodash-decorators';
import React, { Component } from 'react';
import { Button, Form, Input, Row, Col, Spin } from 'hzero-ui';

import Lov from 'components/Lov';
import { getCurrentOrganizationId } from 'utils/utils';
import EditTable from 'srm-front-boot/lib/components/EditTable';

const FormItem = Form.Item;
const tenantId = getCurrentOrganizationId();
const formItemLayout = {
  labelCol: { span: 10 },
  wrapperCol: { span: 14 },
};

@Form.create({ fieldNameProp: null })
export default class AsignUser extends Component {
  constructor(props) {
    super(props);
    const { onRef } = props;
    onRef(this);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
    };
  }

  /**
   * 重置
   */
  @Bind()
  handleReset() {
    this.props.form.resetFields();
  }

  /**
   * 选中项发生改变时的回调
   */
  @Bind()
  handleChange(selectedRowKeys, selectedRows) {
    this.setState({ selectedRowKeys, selectedRows });
  }

  render() {
    const { selectedRowKeys, selectedRows } = this.state;
    const {
      form: { getFieldDecorator },
      dataSource,
      pagination,
      onSearch,
      onAdd,
      onUserDelete,
      queryLoading,
    } = this.props;
    const columns = [
      {
        title: intl.get('sslm.riskMonitoring.view.message.userAccount').d('用户账号'),
        dataIndex: 'loginName',
        width: 150,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('userId', {
                initialValue: record.userId,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get('sslm.riskMonitoring.view.message.userAccount').d('用户账号'),
                    }),
                  },
                ],
              })(
                <Lov
                  code="SSLM.KPI_USER"
                  queryParams={{ tenantId }}
                  onChange={(_, lovRecord) => {
                    record.$form.setFieldsValue({ userName: lovRecord.userName });
                  }}
                />
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get('sslm.riskMonitoring.view.message.userName').d('用户名'),
        dataIndex: 'userName',
        width: 200,
        render: (val, record) =>
          ['create', 'update'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('userName', {
                initialValue: record.userName,
              })(<Input disabled />)}
            </FormItem>
          ) : (
            val
          ),
      },
    ];

    const rowSelection = {
      selectedRows,
      selectedRowKeys,
      onChange: this.handleChange,
    };

    return (
      <Spin spinning={queryLoading}>
        <Form layout="inline" className="more-fields-form">
          <Row gutter={24}>
            <Col span={12}>
              <Row>
                <Col>
                  <FormItem
                    {...formItemLayout}
                    label={intl.get('sslm.riskMonitoring.view.message.userName').d('用户名')}
                  >
                    {getFieldDecorator('userName')(<Input />)}
                  </FormItem>
                </Col>
              </Row>
            </Col>
            <Col span={12} className="search-btn-more">
              <FormItem>
                <Button data-code="reset" onClick={this.handleReset}>
                  {intl.get('hzero.common.button.reset').d('重置')}
                </Button>
                <Button data-code="search" type="primary" htmlType="submit" onClick={onSearch}>
                  {intl.get('hzero.common.button.search').d('查询')}
                </Button>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <div style={{ textAlign: 'right', marginTop: 24, marginBottom: 24 }}>
          <Button
            style={{ marginRight: 8 }}
            onClick={() => onUserDelete(selectedRowKeys, selectedRows)}
          >
            {intl.get('hzero.common.button.delete').d('删除')}
          </Button>
          <Button type="primary" onClick={onAdd}>
            {intl.get('hzero.common.button.add').d('新增')}
          </Button>
        </div>
        <EditTable
          bordered
          columns={columns}
          dataSource={dataSource}
          pagination={pagination}
          rowKey="monitorGroupUserId"
          rowSelection={rowSelection}
          onChange={onSearch}
        />
      </Spin>
    );
  }
}
