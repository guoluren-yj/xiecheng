import React, { Component, Fragment } from 'react';
import { Form, Input, Button, Row, Col, Spin, Select, Popover } from 'hzero-ui';
import intl from 'utils/intl';
import { isEmpty, throttle } from 'lodash';
import Lov from 'components/Lov';
import { PHONE, NOT_CHINA_PHONE } from 'utils/regExp';
import { yesOrNoRender } from 'utils/renderer';
import withCustomize from 'srm-front-cuz/lib/h0Customize';

import EditTable from 'components/EditTable';
import Checkbox from 'components/Checkbox';

const prefix = `sqam.common.model.qualityRectification`;

export default class TeamMembers extends Component {
  phoneBefore = (record, idd, preName, name) => {
    const { getFieldDecorator, setFields, getFieldValue } = record.$form;
    return getFieldDecorator(preName, {
      initialValue: record[preName] || (idd[0] && idd[0].value) || '+86',
    })(
      <Select
        onChange={(value) => {
          const testReg = value === '+86' ? PHONE : NOT_CHINA_PHONE;
          setFields({
            [name]: {
              value: getFieldValue(name),
              errors: !testReg.test(getFieldValue(name))
                ? [new Error(intl.get('hzero.common.validation.phone').d('手机号码格式不正确'))]
                : null,
            },
          });
        }}
      >
        {idd.map((item) => (
          <Select.Option value={item.value}>{item.meaning}</Select.Option>
        ))}
      </Select>
    );
  };

  render() {
    const {
      idd,
      camp,
      fetchLineLoading = false,
      selectedRowKeys = [],
      participantNode,
      handleAdd = (e) => e,
      teamMembersList,
      onRowSelectedChange = (e) => e,
      deleteTeamMembers = (e) => e,
      onResetLeader,
      form,
      detail,
      customizeTable,
      deleteMemberLoading,
      remoteProps,
    } = this.props;

    const supplierCompanyId = form.getFieldValue('supplierCompanyId') || detail.supplierCompanyId;

    const companyId = form.getFieldValue('companyId');
    const columns = [
      {
        title: intl.get(`${prefix}.representor`).d('代表方'),
        dataIndex: 'camp',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('camp', {
                initialValue: record._status === 'create' ? 'PURCHASER' : val,
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.representor`).d('代表方'),
                    }),
                  },
                ],
              })(
                <Select
                  style={{ width: '100%' }}
                  onChange={(value) => {
                    const { setFieldsValue, getFieldValue } = record.$form;
                    setFieldsValue({
                      emailFlag: value === 'SUPPLIER' ? 1 : 0,
                      visibleFlag: value === 'PURCHASER' ? getFieldValue('visibleFlag') : 0,
                      memberName: null,
                      phone: null,
                      email: null,
                      memberLoginName: null,
                      supplierContactId: null,
                      memberUserId: null,
                    });
                    if (remoteProps && remoteProps?.event && remoteProps?.event?.fireEvent) {
                      remoteProps.event.fireEvent('onCampChangeAfterCux', {
                        record,
                        value,
                      });
                    }
                  }}
                >
                  {camp.map((item) => (
                    <Select.Option value={item.value}>{item.meaning}</Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.account`).d('账号'),
        dataIndex: 'memberLoginName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('memberUserId', {
                initialValue: record.memberUserId,
              })(
                <Lov
                  code="SQAM.TENANT_USER"
                  textValue={val}
                  disabled={record.$form.getFieldValue('camp') === 'SUPPLIER'}
                  onChange={(value, lovRecord = {}) => {
                    const { setFieldsValue } = record.$form;
                    if (value) {
                      setFieldsValue({
                        memberName: lovRecord?.realName,
                        phone: lovRecord?.phone,
                        email: lovRecord?.email,
                        camp: 'PURCHASER',
                      });
                    } else {
                      setFieldsValue({
                        memberName: null,
                        phone: null,
                        email: null,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },

      {
        title: intl.get(`${prefix}.supplierContactId`).d('供应商联系人'),
        dataIndex: 'supplierContactName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('supplierContactId', {
                initialValue: record.supplierContactId,
              })(
                <Lov
                  code="SSLM.SUPPLIER_MAIN_DATA_CONTACT"
                  textValue={val}
                  queryParams={{ partnerCompanyId: supplierCompanyId, companyId }}
                  disabled={
                    record.$form.getFieldValue('camp') === 'PURCHASER' ||
                    !supplierCompanyId ||
                    !companyId
                  }
                  onChange={(value, lovRecord = {}) => {
                    const { setFieldsValue } = record.$form;
                    if (value) {
                      setFieldsValue({
                        memberName: lovRecord?.name,
                        phone: lovRecord?.mobilephone,
                        email: lovRecord?.mail,
                        camp: 'SUPPLIER',
                      });
                    } else {
                      setFieldsValue({
                        memberName: null,
                        phone: null,
                        email: null,
                      });
                    }
                  }}
                />
              )}
            </Form.Item>
          ) : (
            val
          ),
      },

      {
        title: intl.get(`${prefix}.name`).d('姓名'),
        dataIndex: 'memberName',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('memberName', {
                rules: [
                  {
                    required: true,
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.name`).d('姓名'),
                    }),
                  },
                ],
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.leader`).d('组长'),
        dataIndex: 'leaderFlag',
        align: 'center',
        width: 80,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`leaderFlag`, {
                initialValue: val,
              })(<Checkbox onChange={(e) => onResetLeader(e.target.checked, record)} />)}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${prefix}.responsibility`).d('职责'),
        dataIndex: 'memberResp',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('memberResp', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.participantNode`).d('参与节点'),
        dataIndex: 'participantNodeMeaning',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('participantNode', {
                initialValue: record.participantNode,
              })(
                <Select allowClear style={{ width: '100%' }}>
                  {participantNode.map((item, index) => (
                    <Select.Option value={item.value} key={String(index)}>
                      {item.meaning}
                    </Select.Option>
                  ))}
                </Select>
              )}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.phone`).d('电话'),
        dataIndex: 'phone',
        width: 300,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('phone', {
                initialValue: val,
                rules: [
                  {
                    pattern:
                      record.$form.getFieldValue('internationalTelCode') === '+86'
                        ? PHONE
                        : NOT_CHINA_PHONE,
                    message: intl.get('hzero.common.validation.phone').d('手机号码格式不正确'),
                  },
                ],
              })(
                <Input
                  addonBefore={this.phoneBefore(record, idd, 'internationalTelCode', 'phone')}
                />
              )}
            </Form.Item>
          ) : record.internationalTelCodeMeaning && val ? (
            `${record.internationalTelCodeMeaning} | ${val}`
          ) : null,
      },
      {
        title: intl.get(`${prefix}.email`).d('邮箱'),
        dataIndex: 'email',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('email', {
                initialValue: val,
                rules: [
                  {
                    required: !!record.$form.getFieldValue('emailFlag'),
                    message: intl.get('hzero.common.validation.notNull', {
                      name: intl.get(`${prefix}.email`).d('邮箱'),
                    }),
                  },
                ],
                getValueFromEvent: (event) => {
                  return event.target.value.replace(/^ +| +$/g, '');
                },
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
      {
        title: intl.get(`${prefix}.emailFlag`).d('邮件提醒'),
        dataIndex: 'emailFlag',
        width: 150,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              <Popover
                content={intl
                  .get(`sqam.common.view.message.willSendEmail`)
                  .d(
                    '勾选后，整改过程中，发送至采购方/供应商方的邮件类型消息提醒也会分别按阵营发送至勾选成员邮箱'
                  )}
              >
                {record.$form.getFieldDecorator(`emailFlag`, {
                  initialValue: val,
                })(
                  <Checkbox
                    disabled={
                      !['PURCHASER', 'SUPPLIER'].includes(record.$form.getFieldValue('camp'))
                    }
                    onChange={(e) => {
                      const { getFieldValue, setFields } = record.$form;
                      if (e.target.checked === 0 && getFieldValue('email') === '') {
                        setFields({ email: { value: null, errors: null } });
                      }
                    }}
                  />
                )}
              </Popover>
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${prefix}.visibleFlag`).d('供应商不可见'),
        dataIndex: 'visibleFlag',
        width: 150,
        align: 'center',
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator(`visibleFlag`, {
                initialValue: val,
              })(
                <Checkbox
                  disabled={
                    record.$form.getFieldValue('camp') === 'SUPPLIER' ||
                    record.$form.getFieldValue('leaderFlag')
                  }
                />
              )}
            </Form.Item>
          ) : (
            yesOrNoRender(val)
          ),
      },
      {
        title: intl.get(`${prefix}.explain`).d('说明'),
        dataIndex: 'remark',
        width: 150,
        render: (val, record) =>
          ['update', 'create'].includes(record._status) ? (
            <Form.Item>
              {record.$form.getFieldDecorator('remark', {
                initialValue: val,
              })(<Input />)}
            </Form.Item>
          ) : (
            val
          ),
      },
    ];
    const rowSelection = {
      selectedRowKeys,
      onChange: onRowSelectedChange,
    };
    const tableProps = {
      columns,
      rowSelection,
      rowKey: 'rowKey',
      bordered: true,
      pagination: false,
      loading: fetchLineLoading,
      dataSource: teamMembersList,
    };
    return (
      <Fragment>
        <Spin spinning={fetchLineLoading}>
          <Row>
            <Col>
              <div
                className="table-groupMember-operator"
                style={{ display: 'block', marginBottom: 16 }}
              >
                <Button loading={deleteMemberLoading} icon="plus" onClick={handleAdd}>
                  {intl.get(`hzero.common.button.create`).d('新建')}
                </Button>
                <Button
                  icon="delete"
                  onClick={throttle(deleteTeamMembers, 1500, { trailing: false })}
                  disabled={isEmpty(selectedRowKeys)}
                  style={{ marginLeft: 16 }}
                  loading={deleteMemberLoading}
                >
                  {intl.get(`hzero.common.button.delete`).d('删除')}
                </Button>
              </div>
              {customizeTable(
                {
                  code: 'SQAM.CREATE_8D_DETAIL.GROUPMEMBER',
                },
                <EditTable {...tableProps} />
              )}
            </Col>
          </Row>
        </Spin>
      </Fragment>
    );
  }
}
