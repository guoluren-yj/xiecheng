/**
 * bidHall - 寻源服务/招标维护 - 资格预审表单
 * @date: 2019-06-27
 * @author: zoukang <kang.zou@hand-china.com>
 * @version: 1.0.0
 * @copyright Copyright (c) 2018, Hand
 */

import React, { Component } from 'react';
import { Form, Input, Select, Modal, Popover, Button } from 'hzero-ui';
import { sum, isNumber } from 'lodash';
import Lov from 'components/Lov';
import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';
import formatterCollections from 'utils/intl/formatterCollections';
import intl from 'utils/intl';

import { phoneRender } from '@/utils/renderer';

const { Option } = Select;
const FormItem = Form.Item;

@Form.create({ fieldNameProp: null })
@formatterCollections({ code: ['ssrc.bidHall'] })
export default class BidMemberForm extends Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  render() {
    const {
      header,
      bidRoles,
      organizationId,
      editBidMembersFlag,
      bidMemberRowSelection,
      bidMembersList,
      bidMemberSelectedRowKeys,
      loading,
      saveBidMembersLoading,
      handleMembersDelete,
      handleMembersCreate,
      handleMembersCancel,
      changeLoginName,
      handleMembersSave,
      customizeTable,
    } = this.props;

    const columnsBidMember = [
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.bidRole`).d('招标角色'),
        dataIndex: 'bidRole',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              {record.$form.getFieldDecorator('bidRole', {
                initialValue: val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`ssrc.bidHall.model.bidHall.bidRole`).d('招标角色'),
                    }),
                  },
                ],
              })(
                <Select allowClear style={{ width: '100%' }} disabled={record.defaultFlag}>
                  {bidRoles &&
                    bidRoles.map((item) => (
                      <Option
                        key={item.value}
                        value={item.value}
                        disabled={
                          item.value === 'TENDER' ||
                          item.value === 'SCALER' ||
                          item.value === 'ALTER'
                        }
                      >
                        {item.meaning}
                      </Option>
                    ))}
                </Select>
              )}
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.userName`).d('用户名'),
        dataIndex: 'loginName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <FormItem>
                <Popover content={record.loginName}>
                  {record.$form.getFieldDecorator('loginName', {
                    initialValue: header.loginName || val,
                    rules: [
                      {
                        required: true,
                        message: intl.get('hzero.common.validation.notNull', {
                          name: intl.get(`ssrc.bidHall.model.bidHall.userName`).d('用户名'),
                        }),
                      },
                    ],
                  })(
                    <Lov
                      code="HIAM.TENANT.USER"
                      queryParams={{
                        organizationId,
                      }}
                      textValue={record.loginName}
                      onChange={(value, dataList) => changeLoginName(value, dataList, record)}
                    />
                  )}
                </Popover>
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('userId', {
                  initialValue: record.userId,
                })(<div />)}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('objectVersionNumber', {
                  initialValue: record.objectVersionNumber,
                })(<div />)}
              </FormItem>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.names`).d('名称'),
        dataIndex: 'userName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              <Popover content={record.userName}>
                {record.$form.getFieldDecorator('userName', {
                  initialValue: header.tenderName || val,
                })(<Input disabled />)}
              </Popover>
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.email`).d('邮箱'),
        dataIndex: 'email',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <FormItem>
              <Popover content={record.email}>
                {record.$form.getFieldDecorator('email', {
                  initialValue: header.tenderName || val,
                })(<Input disabled />)}
              </Popover>
            </FormItem>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`hzero.common.phone`).d('电话'),
        dataIndex: 'phone',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <React.Fragment>
              <FormItem>
                {record.$form.getFieldDecorator('phone', {
                  initialValue: header.tenderName || val,
                })(
                  <div>
                    {phoneRender(
                      record.$form.getFieldValue('internationalTelCodeMeaning'),
                      record.$form.getFieldValue('phone')
                    )}
                  </div>
                )}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCode', {
                  initialValue: record.internationalTelCode,
                })(<div />)}
              </FormItem>
              <FormItem style={{ display: 'none' }}>
                {record.$form.getFieldDecorator('internationalTelCodeMeaning', {
                  initialValue: record.internationalTelCodeMeaning,
                })(<div />)}
              </FormItem>
            </React.Fragment>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`ssrc.bidHall.model.bidHall.openbidPassword`).d('启用开标密码'),
        dataIndex: 'passwordFlag',
        width: 120,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) &&
          record.$form.getFieldValue('bidRole') === 'OPENER' ? (
            <FormItem>
              {record.$form.getFieldDecorator('passwordFlag', {
                initialValue: record.passwordFlag,
              })(
                <Checkbox
                  disabled={record.$form.getFieldValue('bidRole') !== 'OPENER'}
                  checkedValue={1}
                  unCheckedValue={0}
                />
              )}
            </FormItem>
          ) : (
            ''
          ),
      },
    ];

    const scrollX = sum(columnsBidMember.map((n) => (isNumber(n.width) ? n.width : 0)));

    return (
      <Modal
        width="68%"
        visible={editBidMembersFlag}
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{intl.get(`ssrc.bidHall.view.message.modal.bidMembers`).d('招标小组')}</span>
            <div style={{ paddingRight: '20px' }}>
              <Button
                key="delete"
                style={{ marginRight: '6px' }}
                onClick={handleMembersDelete}
                disabled={!bidMemberSelectedRowKeys.length}
              >
                {intl.get('hzero.common.button.delete').d('删除')}
              </Button>
              <Button
                key="save"
                loading={saveBidMembersLoading}
                style={{ marginRight: '6px' }}
                onClick={handleMembersSave}
              >
                {intl.get('hzero.common.button.save').d('保存')}
              </Button>
              <Button key="create" type="primary" onClick={handleMembersCreate}>
                {intl.get('hzero.common.button.create').d('新建')}
              </Button>
            </div>
          </div>
        }
        footer={null}
        onCancel={handleMembersCancel}
      >
        {customizeTable(
          {
            code: 'SSRC.BID_HALL_EDIT.BIDDING_GROUP',
            dataSource: bidMembersList,
          },
          <EditTable
            bordered
            rowKey="bidMemberId"
            loading={loading}
            columns={columnsBidMember}
            rowSelection={bidMemberRowSelection}
            scroll={{ x: scrollX }}
            dataSource={bidMembersList}
            pagination={false}
          />
        )}
      </Modal>
    );
  }
}
